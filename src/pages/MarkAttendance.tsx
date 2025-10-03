import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import api from "@/lib/api";

const MarkAttendance = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: 250 },
        false
      );
      scannerRef.current = scanner;

      const onScanSuccess = (decodedText: string) => {
        setScanResult(decodedText);
        try {
          const data = JSON.parse(decodedText);
          setScannedData(data);
          // Automatically stop scanning on success
          stopScanning();
        } catch (error) {
          console.error("Error parsing QR code data:", error);
          setAttendanceStatus("Error: Invalid QR code format.");
        }
      };

      const onScanError = (errorMessage: string) => {
        // handle scan error, maybe ignore it
        // console.warn(errorMessage);
      };

      scanner.render(onScanSuccess, onScanError);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear scanner.", error);
        });
      }
    };
  }, [isScanning]);

  const startScanning = () => {
    setIsScanning(true);
    setScanResult(null);
    setScannedData(null);
    setAttendanceStatus(null);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.error("Failed to clear scanner on stop.", error);
      });
    }
    setIsScanning(false);
  };

  const handleMarkAttendance = async () => {
    if (!scannedData || !scannedData.userId || !scannedData.eventId) {
      setAttendanceStatus("Error: Incomplete data in QR code.");
      return;
    }

    if (String(scannedData.eventId) !== eventId) {
        setAttendanceStatus("Error: This QR code is for a different event.");
        return;
    }

    try {
      // Try to mark attendance in the backend
      const response = await api.post(`/events/${eventId}/attendance`, {
        user_id: scannedData.userId,
        registration_id: scannedData.registrationId || null,
        event_id: eventId
      });
      setAttendanceStatus(`Success: Attendance marked for ${scannedData.userEmail || 'participant'}.`);
      console.log("Attendance marked:", response.data);
    } catch (error: any) {
      console.error("Failed to mark attendance:", error);
      // Try fallback to alternative endpoint format if the first one fails
      try {
        const fallbackResponse = await api.post(`/attendance`, {
          user_id: scannedData.userId,
          event_id: eventId,
          registration_id: scannedData.registrationId || null
        });
        setAttendanceStatus(`Success: Attendance marked for ${scannedData.userEmail || 'participant'}.`);
        console.log("Attendance marked with fallback:", fallbackResponse.data);
      } catch (fallbackError: any) {
        console.error("Failed with fallback attendance marking too:", fallbackError);
        const errorMessage = error.response?.data?.detail || fallbackError.response?.data?.detail || "An unknown error occurred.";
        setAttendanceStatus(`Error: ${errorMessage}`);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance for Event ID: {eventId}</CardTitle>
        </CardHeader>
        <CardContent>
          {!isScanning && (
            <Button onClick={startScanning}>Start QR Code Scanner</Button>
          )}
          {isScanning && (
            <Button onClick={stopScanning} variant="destructive">Stop Scanner</Button>
          )}
          
          <div id="qr-reader" className="mt-4 w-full md:w-1/2"></div>

          {scanResult && scannedData && (
            <div className="mt-6">
              <Alert>
                <AlertTitle>Scan Successful!</AlertTitle>
                <AlertDescription>
                  <p><strong>Event:</strong> {scannedData.eventName}</p>
                  <p><strong>User:</strong> {scannedData.userEmail}</p>
                </AlertDescription>
              </Alert>
              <Button onClick={handleMarkAttendance} className="mt-4">
                Confirm and Mark Attendance
              </Button>
            </div>
          )}

          {attendanceStatus && (
            <div className="mt-4">
              <Alert variant={attendanceStatus.startsWith("Success") ? "default" : "destructive"}>
                <AlertTitle>{attendanceStatus.startsWith("Success") ? "Status" : "Error"}</AlertTitle>
                <AlertDescription>{attendanceStatus}</AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MarkAttendance;