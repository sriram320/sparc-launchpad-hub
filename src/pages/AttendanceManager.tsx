import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { 
  QrCode, 
  Users, 
  CheckCircle, 
  XCircle, 
  Download, 
  Camera,
  CameraOff,
  UserCheck,
  Clock,
  Calendar,
  AlertTriangle
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useEvents } from "@/contexts/EventContext";
import { useQRCode } from "@/contexts/QRCodeContext";
import { useAuth } from "@/contexts/AuthContext";

interface AttendanceRecord {
  participantId: string;
  participantName: string;
  participantEmail: string;
  registrationId: string;
  attended: boolean;
  scanTimestamp?: string;
  manuallyMarked?: boolean;
}

const AttendanceManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { events } = useEvents();
  const { registrations, markQRCodeAsScanned, validateQRCode } = useQRCode();

  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("manual");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Filter events to show only those created by the current host
  const hostEvents = events.filter(event => 
    user?.role === 'host' // In a real app, you'd check if event was created by this host
  );

  // Load attendance records when event is selected
  useEffect(() => {
    if (selectedEventId) {
      loadAttendanceRecords(selectedEventId);
    }
  }, [selectedEventId, registrations]);

  const loadAttendanceRecords = (eventId: string) => {
    // Get all registrations for this event
    const eventRegistrations = registrations.filter(reg => 
      reg.eventId.toString() === eventId
    );

    // Convert to attendance records
    const records: AttendanceRecord[] = eventRegistrations.map(reg => ({
      participantId: reg.participantId,
      participantName: reg.participantName,
      participantEmail: reg.participantEmail,
      registrationId: reg.registrationId,
      attended: reg.scanned || false,
      scanTimestamp: reg.scanTimestamp,
      manuallyMarked: false
    }));

    setAttendanceRecords(records);
  };

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    // Reset scanner state when switching events
    if (isScanning) {
      stopScanning();
    }
    setScanResult(null);
  };

  const startScanning = () => {
    if (!selectedEventId) {
      toast({
        title: "Select Event First",
        description: "Please select an event before scanning QR codes.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
    scannerRef.current = scanner;

    const onScanSuccess = async (decodedText: string) => {
      setScanResult(decodedText);
      try {
        // Validate the QR code
        const qrData = validateQRCode(decodedText);
        
        if (!qrData) {
          toast({
            title: "Invalid QR Code",
            description: "This QR code is not valid or not found in our system.",
            variant: "destructive",
          });
          return;
        }

        // Check if QR code is for the selected event
        if (qrData.eventId.toString() !== selectedEventId) {
          toast({
            title: "Wrong Event",
            description: `This QR code is for a different event. Current event ID: ${selectedEventId}, QR code event ID: ${qrData.eventId}`,
            variant: "destructive",
          });
          return;
        }

        // Mark attendance
        const success = await markQRCodeAsScanned(qrData.registrationId);
        
        if (success) {
          toast({
            title: "Attendance Marked",
            description: `Successfully marked attendance for ${qrData.participantName}`,
          });
          
          // Update local attendance records
          setAttendanceRecords(prev => 
            prev.map(record => 
              record.registrationId === qrData.registrationId
                ? { ...record, attended: true, scanTimestamp: new Date().toISOString() }
                : record
            )
          );
        } else {
          toast({
            title: "Failed to Mark Attendance",
            description: "There was an error marking attendance. Please try again.",
            variant: "destructive",
          });
        }

        // Stop scanning after successful scan
        stopScanning();
      } catch (error) {
        console.error("Error processing QR code:", error);
        toast({
          title: "QR Code Error",
          description: "Error processing the QR code. Please try again.",
          variant: "destructive",
        });
      }
    };

    const onScanError = (errorMessage: string) => {
      // Ignore scan errors to avoid spam
    };

    scanner.render(onScanSuccess, onScanError);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.error("Failed to clear scanner:", error);
      });
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const toggleManualAttendance = (participantId: string) => {
    const participant = attendanceRecords.find(r => r.participantId === participantId);
    const wasAttended = participant?.attended || false;
    
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.participantId === participantId
          ? { 
              ...record, 
              attended: !record.attended,
              manuallyMarked: true,
              scanTimestamp: !record.attended ? new Date().toISOString() : undefined
            }
          : record
      )
    );

    if (participant) {
      const action = wasAttended ? "Removed" : "Marked";
      const status = wasAttended ? "Absent" : "Present";
      
      toast({
        title: `Attendance ${action}`,
        description: `${participant.participantName} is now marked as ${status}`,
        variant: wasAttended ? "destructive" : "default",
      });
    }
  };

  const markAllPresent = () => {
    setAttendanceRecords(prev => 
      prev.map(record => ({
        ...record,
        attended: true,
        manuallyMarked: true,
        scanTimestamp: record.scanTimestamp || new Date().toISOString()
      }))
    );

    toast({
      title: "All Marked Present",
      description: `Marked all ${attendanceRecords.length} participants as present.`,
    });
  };

  const markAllAbsent = () => {
    setAttendanceRecords(prev => 
      prev.map(record => ({
        ...record,
        attended: false,
        manuallyMarked: true,
        scanTimestamp: undefined
      }))
    );

    toast({
      title: "All Marked Absent",
      description: `Marked all ${attendanceRecords.length} participants as absent.`,
      variant: "destructive",
    });
  };

  const resetAttendance = () => {
    loadAttendanceRecords(selectedEventId);
    
    toast({
      title: "Attendance Reset",
      description: "Restored attendance to original QR scan data.",
    });
  };

  const exportAttendanceCSV = () => {
    if (!selectedEventId || attendanceRecords.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Please select an event with registrations first.",
        variant: "destructive",
      });
      return;
    }

    const selectedEvent = events.find(e => e.id.toString() === selectedEventId);
    const csvHeaders = [
      "Participant Name",
      "Email",
      "Registration ID",
      "Attended",
      "Attendance Time",
      "Method"
    ];

    const csvData = attendanceRecords.map(record => [
      record.participantName,
      record.participantEmail,
      record.registrationId,
      record.attended ? "Yes" : "No",
      record.scanTimestamp ? new Date(record.scanTimestamp).toLocaleString() : "Not marked",
      record.manuallyMarked ? "Manual" : "QR Scan"
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_${selectedEvent?.title.replace(/\s+/g, "_")}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Attendance Exported",
      description: "Attendance list has been downloaded as CSV file.",
    });
  };

  const getAttendanceStats = () => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.attended).length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, percentage };
  };

  if (user?.role !== 'host') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Only hosts can access the attendance manager.</p>
          <Button onClick={() => navigate('/events')}>Back to Events</Button>
        </Card>
      </div>
    );
  }

  const stats = getAttendanceStats();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-orbitron mb-2">Attendance Manager</h1>
          <p className="text-muted-foreground">Manage attendance for your events using QR code scanning or manual marking</p>
        </div>

        {/* Event Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Select Event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedEventId} onValueChange={handleEventSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose an event to manage attendance" />
              </SelectTrigger>
              <SelectContent>
                {hostEvents.map(event => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{event.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedEventId && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Registered</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Present</p>
                      <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Absent</p>
                      <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Attendance %</p>
                      <p className="text-2xl font-bold">{stats.percentage}%</p>
                    </div>
                    <Clock className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Attendance</TabsTrigger>
                <TabsTrigger value="qr-scanner">QR Scanner</TabsTrigger>
              </TabsList>

              {/* Manual Attendance Tab */}
              <TabsContent value="manual" className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-lg font-semibold">Participant List</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={markAllPresent} 
                      variant="default" 
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={attendanceRecords.length === 0}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark All Present
                    </Button>
                    <Button 
                      onClick={markAllAbsent} 
                      variant="destructive" 
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={attendanceRecords.length === 0}
                    >
                      <XCircle className="w-4 h-4" />
                      Mark All Absent
                    </Button>
                    <Button 
                      onClick={resetAttendance} 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={attendanceRecords.length === 0}
                    >
                      <Clock className="w-4 h-4" />
                      Reset to QR Data
                    </Button>
                    <Button onClick={exportAttendanceCSV} variant="secondary" size="sm" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <Alert>
                  <UserCheck className="w-4 h-4" />
                  <AlertTitle>Attendance Editing</AlertTitle>
                  <AlertDescription>
                    Click checkboxes to toggle attendance status. You can mark participants present or absent, 
                    even if they were previously scanned with QR codes. Use bulk actions above for quick operations.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardContent className="p-0">
                    <div className="max-h-96 overflow-y-auto">
                      {attendanceRecords.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No participants registered for this event yet.</p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {attendanceRecords.map(record => (
                            <div key={record.registrationId} className={`p-4 flex items-center justify-between hover:bg-muted/50 transition-colors ${record.attended ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  <Checkbox
                                    checked={record.attended}
                                    onCheckedChange={() => toggleManualAttendance(record.participantId)}
                                    className="w-5 h-5"
                                  />
                                  {record.attended && (
                                    <CheckCircle className="w-3 h-3 text-green-600 absolute -top-1 -right-1 bg-white rounded-full" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{record.participantName}</p>
                                  <p className="text-sm text-muted-foreground">{record.participantEmail}</p>
                                  {record.scanTimestamp && (
                                    <p className="text-xs text-muted-foreground">
                                      {record.attended ? 'Marked Present' : 'Was Present'}: {new Date(record.scanTimestamp).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant={record.attended ? "destructive" : "default"}
                                  onClick={() => toggleManualAttendance(record.participantId)}
                                  className="min-w-[80px]"
                                >
                                  {record.attended ? "Mark Absent" : "Mark Present"}
                                </Button>
                                <div className="flex flex-col gap-1">
                                  {record.attended && (
                                    <Badge variant={record.manuallyMarked ? "secondary" : "default"} className="text-xs">
                                      {record.manuallyMarked ? "Manual" : "QR Scan"}
                                    </Badge>
                                  )}
                                  <Badge variant={record.attended ? "default" : "secondary"} className="text-xs">
                                    {record.attended ? "Present" : "Absent"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* QR Scanner Tab */}
              <TabsContent value="qr-scanner" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="w-5 h-5" />
                      QR Code Scanner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <Button 
                          onClick={startScanning} 
                          disabled={isScanning}
                          className="flex items-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          Start Scanning
                        </Button>
                        
                        <Button 
                          onClick={stopScanning} 
                          disabled={!isScanning}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <CameraOff className="w-4 h-4" />
                          Stop Scanning
                        </Button>
                      </div>

                      {isScanning && (
                        <Alert>
                          <AlertTitle>Scanner Active</AlertTitle>
                          <AlertDescription>
                            Point your camera at a participant's QR code to mark their attendance.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div id="qr-reader" className="w-full max-w-md mx-auto"></div>

                      {scanResult && (
                        <Alert>
                          <CheckCircle className="w-4 h-4" />
                          <AlertTitle>QR Code Scanned</AlertTitle>
                          <AlertDescription>
                            Last scanned code processed successfully.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AttendanceManager;