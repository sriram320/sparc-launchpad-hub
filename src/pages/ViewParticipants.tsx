import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Mail, Download, CheckCircle, XCircle, User, Calendar, QrCode } from "lucide-react";
import { useEvents } from "@/contexts/EventContext";
import { useQRCode } from "@/contexts/QRCodeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { useToast } from "@/components/ui/use-toast";

const ViewParticipants = () => {
  const { events, loading: eventsLoading } = useEvents();
  const { registrations, getEventRegistrations, fetchAllRegistrations, loading: regLoading } = useQRCode();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<number | "all">("all");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<{
    id: number;
    name: string;
    qrCode: string | null;
  } | null>(null);
  
  // Fetch registrations on component mount and when selected event changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchAllRegistrations();
        
        if (selectedEvent !== "all") {
          await getEventRegistrations(Number(selectedEvent));
        }
      } catch (error) {
        console.error("Failed to load participant data:", error);
        toast({
          title: "Error",
          description: "Failed to load participant data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [selectedEvent]);

  // Sample data for UI presentation - replace with actual implementation
  const participants = useMemo(() => {
    // For demo, create sample data
    return Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      name: `Participant ${i + 1}`,
      email: `participant${i + 1}@example.com`,
      phone: `123-456-${7890 + i}`,
      department: ["Computer Science", "Electrical Engineering", "Mechanical Engineering"][i % 3],
      year: ["First Year", "Second Year", "Third Year", "Final Year"][i % 4],
      avatar: "👤",
      registrationDate: "Oct 1, 2025",
      registeredEvents: [1, 2, 3].slice(0, (i % 3) + 1),
      attendance: { 1: i % 2 === 0, 2: i % 3 === 0, 3: i % 2 === 1 },
      paymentStatus: i % 3 === 0 ? "Pending" : "Paid"
    }));
  }, []);

  // Filter participants based on search query, selected event, and active tab
  const filteredParticipants = participants.filter(participant => {
    // Search filter
    const matchesSearch = 
      participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Event filter
    const matchesEvent = 
      selectedEvent === "all" || 
      participant.registeredEvents.some(eventId => eventId === Number(selectedEvent));
    
    // Tab filter
    let matchesTab = true;
    if (activeTab === "attended") {
      matchesTab = selectedEvent !== "all" ? 
        participant.attendance[Number(selectedEvent)] : 
        Object.values(participant.attendance).some(status => status);
    } else if (activeTab === "not-attended") {
      matchesTab = selectedEvent !== "all" ? 
        !participant.attendance[Number(selectedEvent)] : 
        Object.values(participant.attendance).some(status => !status);
    }
    
    return matchesSearch && matchesEvent && matchesTab;
  });

  const handleViewQRCode = async (participant: any) => {
    try {
      const eventId = selectedEvent === "all" ? participant.registeredEvents[0] : Number(selectedEvent);
      
      // Simulating QR code retrieval
      setSelectedParticipant({
        id: participant.id,
        name: participant.name,
        qrCode: `REG-${participant.id}-${eventId}`
      });
    } catch (error) {
      console.error("Failed to get QR code:", error);
      toast({
        title: "Error",
        description: "Failed to retrieve QR code.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-orbitron font-bold mb-6">Participants</h1>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search participants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedEvent.toString()}
            onChange={(e) => setSelectedEvent(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="bg-input border border-border rounded-lg px-3 py-2 text-foreground"
          >
            <option value="all">All Events</option>
            {events.map(event => (
              <option key={event.id} value={event.id.toString()}>
                {event.title}
              </option>
            ))}
          </select>
          <Button variant="outline" className="flex gap-2">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          <Button variant="outline" className="flex gap-2">
            <Mail className="w-4 h-4" />
            <span>Email All</span>
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-2">
          <TabsTrigger value="all">All Participants</TabsTrigger>
          <TabsTrigger value="attended">Attended</TabsTrigger>
          <TabsTrigger value="not-attended">Not Attended</TabsTrigger>
        </TabsList>
        
        <div className="bg-muted/30 p-2 rounded text-sm text-muted-foreground mb-4">
          Showing {filteredParticipants.length} participants out of {participants.length} total
        </div>
        
        <TabsContent value={activeTab} className="mt-0">
          <div className="cosmic-card p-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-border">
                <tr>
                  <th className="py-3 px-4 font-medium">Participant</th>
                  <th className="py-3 px-4 font-medium">Contact</th>
                  <th className="py-3 px-4 font-medium">Department</th>
                  <th className="py-3 px-4 font-medium">Registration</th>
                  <th className="py-3 px-4 font-medium">Payment</th>
                  <th className="py-3 px-4 font-medium">Attendance</th>
                  <th className="py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredParticipants.length > 0 ? (
                  filteredParticipants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="mr-3 text-2xl">{participant.avatar}</div>
                          <div>
                            <div className="font-medium">{participant.name}</div>
                            <div className="text-xs text-muted-foreground">ID: SPARC-{participant.id.toString().padStart(4, '0')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{participant.email}</div>
                        <div className="text-xs text-muted-foreground">{participant.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{participant.department}</div>
                        <div className="text-xs text-muted-foreground">{participant.year}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{participant.registrationDate}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {participant.registeredEvents.length} event(s)
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={participant.paymentStatus === "Paid" ? "default" : "outline"}>
                          {participant.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {selectedEvent === "all" ? (
                          <div>
                            {participant.registeredEvents.map(eventId => {
                              const event = events.find(e => e.id === eventId);
                              return event ? (
                                <div key={eventId} className="flex items-center mb-1">
                                  {participant.attendance[eventId] ? 
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> : 
                                    <XCircle className="w-4 h-4 mr-2 text-red-500" />
                                  }
                                  <span className="text-xs">{event.title}</span>
                                </div>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <div>
                            {participant.attendance[Number(selectedEvent)] ? 
                              <Badge className="bg-green-500">Present</Badge> : 
                              <Badge variant="outline" className="text-red-500">Absent</Badge>
                            }
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon">
                            <User className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Mail className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewQRCode(participant)}
                          >
                            <QrCode className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No participants found. Try adjusting your search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* QR Code Display Modal */}
      {selectedParticipant && (
        <QRCodeDisplay
          open={!!selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
          registrationId={selectedParticipant.qrCode || "No QR Code Found"}
          eventTitle={
            selectedEvent === "all" 
              ? "Multiple Events" 
              : (events.find(e => e.id === Number(selectedEvent))?.title || "Unknown Event")
          }
          userName={selectedParticipant.name}
        />
      )}
    </div>
  );
};

export default ViewParticipants;