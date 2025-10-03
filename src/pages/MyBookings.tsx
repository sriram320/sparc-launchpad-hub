import { useEffect, useState } from "react";
import { useEvents } from "@/contexts/EventContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQRCode } from "@/contexts/QRCodeContext";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, QrCode } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SimpleQRCode from "@/components/SimpleQRCode";
import api from "@/lib/api";

const MyBookings = () => {
  const { events } = useEvents();
  const { user, isAuthenticated } = useAuth();
  const { registrations: qrContextRegistrations } = useQRCode();
  const [loading, setLoading] = useState(true);
  const [myRegisteredEvents, setMyRegisteredEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Filter registrations from the context for the current user
    const userRegistrations = qrContextRegistrations.filter(
      (reg) => reg.participantId === user.id
    );

    // Map these registrations to the full event details from the EventContext
    const registeredEvents = userRegistrations
      .map((reg) => {
        const eventDetail = events.find((e) => e.id === reg.eventId);
        if (eventDetail) {
          return {
            ...eventDetail,
            // Add registration-specific data to the event object
            registrationId: reg.registrationId,
            qrCodeValue: `sparc-registration:${user.id}:${reg.eventId}`,
          };
        }
        // If event details are not in the main context, create a placeholder
        return {
          id: reg.eventId,
          title: `Event ID: ${reg.eventId}`,
          description: "Details for this event are not currently available.",
          date: "Date TBD",
          time: "Time TBD",
          venue: "Venue TBD",
          category: "Registered Event",
          registrationId: reg.registrationId,
          qrCodeValue: `sparc-registration:${user.id}:${reg.eventId}`,
        };
      })
      .filter(Boolean); // Ensure no nulls

    setMyRegisteredEvents(registeredEvents as any[]);
    setLoading(false);

  }, [user, isAuthenticated, qrContextRegistrations, events]);

  const handleViewQr = (event: any) => {
    setSelectedEvent(event);
    setIsQrModalOpen(true);
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <>
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>My Booked Events</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myRegisteredEvents.length === 0 ? (
            <Alert>
              <AlertDescription>
                You haven't booked any events yet.{" "}
                <Link to="/events" className="font-bold text-primary hover:underline">
                  Explore events now!
                </Link>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {myRegisteredEvents.map((event) => (
                <Card key={event.id} className="cosmic-card-nested overflow-hidden flex flex-col md:flex-row">
                  <div className="md:w-1/3">
                    <img 
                      src={event.coverImage || '/placeholder.svg'} 
                      alt={event.title} 
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Badge variant="secondary" className="mb-2">{event.category}</Badge>
                      <h3 className="text-xl font-bold font-orbitron">{event.title}</h3>
                      <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{event.venue}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <Button onClick={() => handleViewQr(event)} className="w-full sm:w-auto">
                        <QrCode className="w-4 h-4 mr-2" />
                        View QR Code
                      </Button>
                      <Link to={`/events/${event.id}`} className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full">View Event Details</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEvent && (
        <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Your QR Code for {selectedEvent.title}</DialogTitle>
            </DialogHeader>
            <div className="p-4 flex flex-col items-center">
              <SimpleQRCode value={selectedEvent.qrCodeValue} />
              <p className="mt-4 text-center text-muted-foreground">
                Present this QR code at the event for check-in.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default MyBookings;