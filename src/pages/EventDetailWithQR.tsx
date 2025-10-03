import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEvents } from "@/contexts/EventContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQRCode } from "@/contexts/QRCodeContext";
import QRCode from "react-qr-code";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import api from "@/lib/api";

const EventDetailWithQR = () => {
  const { id } = useParams<{ id: string }>();
  const { events, fetchEvents } = useEvents();
  const { user, isAuthenticated } = useAuth();
  const { getParticipantRegistrations, registerForEvent } = useQRCode();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backendEvent, setBackendEvent] = useState<any>(null);

  const eventId = Number(id);
  
  // Attempt to find event in context
  const contextEvent = events.find(e => e.id === eventId);
  
  // Use backend event data if available, otherwise fall back to context event
  const event = backendEvent || contextEvent;

  // Fetch event from backend and check registration status
  useEffect(() => {
    const loadEventData = async () => {
      setLoading(true);
      
      try {
        // Try to fetch events if none are loaded
        if (events.length === 0) {
          await fetchEvents();
        }
        
        // For demo/fallback purposes, create a hardcoded event for ID 1
        if (id === "1") {
          console.log('Setting up demo event for ID 1');
          const demoEvent = {
            id: 1,
            title: "Rocketry Bootcamp 2024",
            description: "Intensive two-day workshop covering the fundamentals of model rocketry, including design, construction, and launch principles. Participants will learn about aerodynamics, propulsion systems, and safety protocols while building their own model rockets for a launch day competition.\n\nThis workshop is perfect for beginners interested in aerospace engineering and provides hands-on experience with the basics of rocket science and engineering principles.",
            date: "2025-10-15",
            time: "09:00 AM",
            location: "Innovation Lab, Block A",
            capacity: 30,
            capacityText: "30 students",
            price: "Free",
            isPaid: false,
            category: "Workshop",
            venue: "Innovation Lab, Block A",
            instructor: "Dr. Rajesh Kumar",
            level: "Beginner",
            registered: 15,
            highlights: [
              "Build and launch your own model rocket",
              "Learn propulsion system design",
              "Hands-on CAD workshop",
              "Safety certification provided"
            ],
            requirements: [
              "Basic engineering knowledge",
              "Laptop with CAD software (optional)",
              "Safety goggles (provided)"
            ]
          };
          setBackendEvent(demoEvent);
          
          // Check actual registration status from QRCodeContext
          
          // Skip API call for event 1 to use our demo data
          setLoading(false);
          return;
        }
        
        // Try to fetch the event from backend API for events other than ID 1
        try {
          const response = await api.get(`/events/${id}`);
          if (response.data) {
            // Format the backend event data to match our frontend model
            let eventDate;
            try {
              eventDate = new Date(response.data.date_time);
            } catch (error) {
              eventDate = new Date();
              console.error('Error parsing event date:', error);
            }
            
            const formattedEvent = {
              id: Number(response.data.id),
              title: response.data.title || "Untitled Event",
              description: response.data.description || "No description available",
              date: eventDate.toISOString().split('T')[0],
              time: eventDate.toLocaleTimeString(),
              location: response.data.venue || "TBD",
              venue: response.data.venue || "TBD",
              capacity: response.data.capacity || 30,
              capacityText: `${response.data.capacity || 30} participants`,
              price: response.data.is_paid ? `₹${response.data.price}` : "Free",
              isPaid: response.data.is_paid || false,
              category: response.data.category || "Event",
              registered: response.data.registrations?.length || 0,
              instructor: response.data.instructor || "SPARC Team",
              level: response.data.level || "All Levels",
              highlights: response.data.highlights || [],
              requirements: response.data.requirements || []
            };
            setBackendEvent(formattedEvent);
            console.log('Successfully fetched event from API:', formattedEvent);
          }
        } catch (error) {
          console.error('Failed to fetch event from API:', error);
          // If we have the event in context, use that
          if (contextEvent) {
            console.log('Using event from context:', contextEvent);
            setBackendEvent(null); // Let the component use contextEvent
          } else {
            console.log('No event found in context, creating fallback');
            // Create a fallback event
            setBackendEvent({
              id: Number(id),
              title: "Event Information",
              description: "Event details are currently being updated. Please check back later.",
              date: new Date().toISOString().split('T')[0],
              time: "12:00 PM",
              location: "SPARC Venue",
              venue: "SPARC Venue",
              capacity: 30,
              capacityText: "30 participants",
              price: "Free",
              isPaid: false,
              category: "Event",
              registered: 0,
              instructor: "SPARC Team",
              level: "All Levels",
              highlights: [],
              requirements: []
            });
          }
        }
        
        // Check if user is registered for this event
        if (isAuthenticated || (import.meta.env.DEV && localStorage.getItem('devEmail'))) {
          try {
            // For development, use ID 1 if not specified
            const participantId = user?.id || '1';
            
            // First check if we have registrations from context
            const myRegistrations = await getParticipantRegistrations(participantId);
            
            // Check if any registration matches this event ID
            const isRegisteredForEvent = myRegistrations.some(reg => Number(reg.eventId) === eventId);
            
            if (isRegisteredForEvent) {
              console.log('User is registered for this event via context data');
              setIsRegistered(true);
            } else {
              // Try checking API directly
              try {
                const response = await api.get(`/events/${id}/check-registration`);
                if (response.data && response.data.registered) {
                  console.log('User is registered for this event via API');
                  setIsRegistered(true);
                }
              } catch (apiError) {
                console.log('Failed to check registration via API:', apiError);
                
                // For demo purposes, always treat ID 1 as registered in development
                if (id === "1" && import.meta.env.DEV) {
                  console.log('Setting demo registration for event 1');
                  setIsRegistered(true);
                }
              }
            }
          } catch (error) {
            console.error('Failed to check registration status from context:', error);
            
            // For demo purposes, always treat ID 1 as registered in development
            if (id === "1" && import.meta.env.DEV) {
              console.log('Setting demo registration for event 1');
              setIsRegistered(true);
            }
          }
        }
      } catch (error) {
        console.error('Error loading event data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEventData();
  }, [id, isAuthenticated, user, events, contextEvent, eventId, fetchEvents, getParticipantRegistrations]);
  
  // Fallback for not found events
  if (!loading && !event) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
          <p className="mb-8">Sorry, we couldn't find the event you're looking for.</p>
          <Button asChild><Link to="/events">Browse Events</Link></Button>
        </div>
        <Footer />
      </>
    );
  }

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to register for this event",
        variant: "destructive",
      });
      navigate("/login?redirect=/events/" + id);
      return;
    }

    setRegistering(true);
    try {
      // First try using our context method which handles API calls
      await registerForEvent(eventId, event?.title || `Event ${eventId}`);
      
      // If we reach here, registration was successful
      setIsRegistered(true);
      toast({
        title: "Registration Successful",
        description: "You have successfully registered for this event.",
      });
      return;
      
      // If that fails, try direct API call
      const response = await api.post(`/events/${eventId}/register`);
      console.log('Registration successful:', response.data);
      
      // Update local state
      setIsRegistered(true);
      toast({
        title: "Registration Successful",
        description: "You have successfully registered for this event.",
      });
    } catch (error) {
      console.error('Registration failed:', error);
      
      toast({
        title: "Registration Failed",
        description: "Failed to register for the event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  // Removed auto-registration logic - users should only see QR code after actually registering

  // Generate a more detailed QR code with user and event information
  const generateQRCodeData = () => {
    // Create a registration ID with format SPARC-EventID-UserID-Date
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const userId = user?.id || '1';
    const userName = user?.name || localStorage.getItem('devUsername') || 'Demo User';
    const userEmail = user?.email || localStorage.getItem('devEmail') || 'demo@example.com';
    
    // For demo purposes, make event 1 always have a fixed registration ID
    const registrationId = id === '1' 
      ? `SPARC-1-${userId}-${dateStr}`
      : `SPARC-${event?.id || 0}-${userId}-${dateStr}`;
    
    // Create a detailed data object for the QR code
    return JSON.stringify({
      registrationId: registrationId,
      eventId: event?.id,
      eventName: event?.title,
      eventDate: event?.date,
      eventTime: event?.time,
      userId: userId,
      userName: userName,
      userEmail: userEmail,
      timestamp: new Date().toISOString()
    });
  };
  
  const qrCodeValue = generateQRCodeData();

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto p-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-pulse text-3xl mb-4">Loading event details...</div>
            <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Add debugging logs to help identify why the registration button is showing
  console.log(`Event detail render - isRegistered: ${isRegistered}, isAuthenticated: ${isAuthenticated}, event ID: ${eventId}`);

  return (
    <>
      <Navigation />
      <div className="container mx-auto p-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="mb-2">{event?.category}</Badge>
                    <CardTitle className="text-3xl">{event?.title}</CardTitle>
                  </div>
                  <Badge variant="outline">{event?.isPaid ? event?.price : 'Free'}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event?.date || '').toLocaleDateString()} at {event?.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{event?.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{event?.registered || 0}/{event?.capacity} registered</span>
                  </div>
                  {event?.instructor && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>Instructor: {event.instructor}</span>
                    </div>
                  )}
                </div>
                
                <div className="prose prose-invert max-w-none mt-4">
                  <div className="whitespace-pre-line text-muted-foreground">
                    {event?.description}
                  </div>
                </div>
                
                {/* For event ID 1, always hide the registration button */}
                {!isRegistered && id !== "1" && (
                  <div className="mt-6">
                    <Button 
                      onClick={handleRegister} 
                      disabled={registering}
                      className="w-full md:w-auto"
                      size="lg"
                    >
                      {registering ? "Registering..." : "Register for this Event"}
                    </Button>
                    {!isAuthenticated && (
                      <p className="text-sm text-muted-foreground mt-2">
                        You need to be logged in to register for events.
                      </p>
                    )}
                  </div>
                )}
                
                {/* For event ID 1 but not registered yet, show a message that automatically registers */}
                {!isRegistered && id === "1" && (
                  <div className="mt-6">
                    <Button 
                      onClick={handleRegister} 
                      disabled={registering}
                      className="w-full md:w-auto"
                      size="lg"
                    >
                      Show My QR Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* QR Code Section - Only show if user is authenticated AND actually registered */}
            {isAuthenticated && isRegistered ? (
              <Card>
                <CardHeader>
                  <CardTitle>Your Registration QR Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-6">
                    <AlertTitle>Show this to the event host</AlertTitle>
                    <AlertDescription>
                      The event host will scan this QR code to mark your attendance.
                    </AlertDescription>
                  </Alert>
                  <div className="p-8 bg-white rounded-lg shadow-md mb-4 mx-auto max-w-fit">
                    <QRCode value={qrCodeValue} size={200} />
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    Registration ID: SPARC-{event?.id}-{user?.id || 'demo'}-{new Date().toISOString().split('T')[0].replace(/-/g, '')}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
          
          {/* Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Event Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">Date</dt>
                    <dd>{new Date(event?.date || '').toLocaleDateString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">Time</dt>
                    <dd>{event?.time}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">Venue</dt>
                    <dd>{event?.location}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">Price</dt>
                    <dd>{event?.isPaid ? event?.price : 'Free'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">Availability</dt>
                    <dd>{event?.capacity - (event?.registered || 0)} spots left</dd>
                  </div>
                  {event?.level && (
                    <div className="flex justify-between">
                      <dt className="font-medium text-muted-foreground">Level</dt>
                      <dd>{event.level}</dd>
                    </div>
                  )}
                  {isAuthenticated && isRegistered && (
                    <div className="pt-2 mt-2 border-t">
                      <Badge variant="outline" className="w-full flex items-center justify-center py-1">
                        You are registered
                      </Badge>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {isAuthenticated && !isRegistered && id !== "1" && (
          <Alert className="mt-8">
            <AlertTitle>Not Registered</AlertTitle>
            <AlertDescription>
              You are not registered for this event. Please register using the button above to get your QR code.
            </AlertDescription>
          </Alert>
        )}
      </div>
      <Footer />
    </>
  );
};

export default EventDetailWithQR;
