import { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, IndianRupee, CreditCard, QrCode, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQRCode } from "@/contexts/QRCodeContext";
import { useEvents } from "@/contexts/EventContext";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { QRCodeSVG } from 'qrcode.react';
import SimpleQRCode from "@/components/SimpleQRCode";
// Using public folder logo path
import { useAuth } from "@/contexts/AuthContext";

const EventBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { generateQRCode, registerForEvent } = useQRCode();
  const { user } = useAuth();
  const { events } = useEvents();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registrationId, setRegistrationId] = useState<string>("");
  const [showQRModal, setShowQRModal] = useState(false);
  
  // Check if we're being redirected from MyBookings with a registration ID
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectedRegistrationId = searchParams.get('registration');
  
  useEffect(() => {
    // If we have a registration ID from the URL, show the QR code modal
    if (redirectedRegistrationId) {
      console.log('Registration ID found in URL:', redirectedRegistrationId);
      setRegistrationId(redirectedRegistrationId);
      setShowQRModal(true);
      setShowSuccess(true);
      
      // Display a toast to show we're loading the QR code
      toast({
        title: "Loading Registration QR Code",
        description: "Your QR code for this event is ready to view.",
      });
    }
  }, [redirectedRegistrationId, toast]);
  
  // Find the actual event by ID from context
  const foundEvent = events.find(e => e.id.toString() === id);
  
  // Debug logging
  console.log('EventBooking - Event ID from URL:', id);
  console.log('EventBooking - Available events:', events);
  console.log('EventBooking - Found event:', foundEvent);
  
  // Use found event or fallback data
  const event = foundEvent || {
    id: id || "1",
    title: "Advanced AI Workshop: Neural Networks & Deep Learning",
    date: "2024-12-20",
    time: "09:00 AM - 05:00 PM",
    venue: "SPARC Lab, TOB",
    location: "SPARC Lab, TOB",
    price: 299,
    isPaid: true,
    category: "AI"
  };

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    college: "",
    branch: "",
    year: "",
    notes: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Show loading if events are not loaded yet
  if (events.length === 0) {
    return (
      <div className="min-h-screen starfield flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }
  
  // Show error if specific event not found
  if (!foundEvent && events.length > 0) {
    return (
      <div className="min-h-screen starfield flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-4">The event you're trying to register for could not be found.</p>
          <Button onClick={() => navigate('/events')}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate user authentication
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to register for an event.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      // Step 1: Register the user for this event using the QRCodeContext
      console.log("Starting registration process for event:", event.id);
      await registerForEvent(Number(event.id), event.title);
      
      // Step 2: Generate QR code for the registration
      const qrCodeData = generateQRCode(
        Number(event.id), 
        user.id,
        formData.name || user.name,
        formData.email || user.email
      );
      setRegistrationId(qrCodeData);
      
      // Step 3: Show success message
      toast({
        title: "Registration Successful!",
        description: `You have been registered for ${event.title}`,
        variant: "default",
      });
      
      // Step 4: Show success screen
      if (event.isPaid) {
        // For paid events, simulate payment process
        toast({
          title: "Processing Payment",
          description: "Simulating payment gateway...",
        });
        
        setTimeout(() => {
          setShowSuccess(true);
          toast({
            title: "Payment Complete",
            description: "Your registration is confirmed!",
          });
        }, 2000);
      } else {
        // For free events, show success immediately
        setShowSuccess(true);
      }
      
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed", 
        description: "Unable to complete registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen starfield flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/90"></div>
        
        <div className="relative z-10 w-full max-w-md">
          <Card className="cosmic-card p-8 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-8 h-8 text-primary" />
            </div>
            
            <h1 className="text-2xl font-orbitron font-bold text-foreground mb-4">
              Registration Successful! 🎉
            </h1>
            
            <p className="text-muted-foreground mb-6">
              You've successfully registered for "{event.title}". Your QR code has been generated.
            </p>

            <div className="bg-card/50 border border-border rounded-lg p-4 mb-6">
              <Button 
                variant="ghost" 
                className="w-full h-auto p-0 hover:bg-transparent" 
                onClick={() => setShowQRModal(true)}
              >
                <div className="w-32 h-32 mx-auto mb-4 rounded-lg flex items-center justify-center">
                  {registrationId ? (
                    <SimpleQRCode value={registrationId} size={128} />
                  ) : (
                    <div className="w-32 h-32 bg-foreground flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-background opacity-70" />
                    </div>
                  )}
                </div>
              </Button>
              <p className="text-xs text-muted-foreground">
                Booking ID: {registrationId}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click on QR code to view or download
              </p>
            </div>

            <div className="space-y-2 mb-6">
              <Button onClick={() => setShowQRModal(true)} className="w-full flex items-center justify-center gap-2">
                <QrCode className="w-4 h-4" />
                <span>Show QR Code</span>
              </Button>
              <Button asChild className="w-full">
                <Link to="/member-dashboard/my-bookings">View All Bookings</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/events">Browse More Events</Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              A confirmation email with your QR code has been sent to {user.email}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen starfield">
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/90"></div>
      
      {/* Navigation Header */}
      <nav className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/sparc_logo_main.png" 
              alt="SPARC Club Logo" 
              className="h-10 w-auto"
            />
          </Link>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <Card className="cosmic-card p-6">
              <h1 className="text-2xl font-orbitron font-bold text-foreground mb-6">
                Event Registration
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Academic Information</h3>
                  
                  <div>
                    <Label htmlFor="college">College Name *</Label>
                    <Input
                      id="college"
                      type="text"
                      value={formData.college}
                      onChange={(e) => handleInputChange("college", e.target.value)}
                      placeholder="Enter your college name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="branch">Branch *</Label>
                      <Select onValueChange={(value) => handleInputChange("branch", value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your branch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cse">Computer Science Engineering</SelectItem>
                          <SelectItem value="ece">Electronics & Communication</SelectItem>
                          <SelectItem value="mech">Mechanical Engineering</SelectItem>
                          <SelectItem value="aero">Aerospace Engineering</SelectItem>
                          <SelectItem value="eee">Electrical & Electronics</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="year">Year of Study *</Label>
                      <Select onValueChange={(value) => handleInputChange("year", value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                          <SelectItem value="pg">Post Graduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>
                  <div>
                    <Label htmlFor="notes">Special Notes / Accommodations</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Any special requirements, dietary restrictions, or accessibility needs?"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full btn-mission"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Processing Registration..."
                  ) : event.isPaid ? (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Proceed to Payment
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Event Summary */}
          <div className="space-y-6">
            <Card className="cosmic-card p-6">
              <h3 className="font-semibold mb-4">Event Summary</h3>
              
              <div className="space-y-4">
                <div>
                  <Badge variant="secondary" className="mb-2">{event.category}</Badge>
                  <h4 className="font-medium text-foreground">{event.title}</h4>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{event.venue || event.location}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="cosmic-card p-6">
              <h3 className="font-semibold mb-4">Registration Fee</h3>
              
              <div className="text-2xl font-orbitron font-bold text-foreground mb-2">
                {event.isPaid ? (
                  <div className="flex items-center">
                    <IndianRupee className="w-6 h-6" />
                    <span>{event.price}</span>
                  </div>
                ) : (
                  <span className="text-primary">FREE</span>
                )}
              </div>
              
              {event.isPaid && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Workshop materials included</p>
                  <p>• Certificate of completion</p>
                  <p>• Networking lunch</p>
                  <p>• Community access</p>
                </div>
              )}
                        </Card>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && registrationId && (
        <Dialog open={showQRModal} onOpenChange={() => setShowQRModal(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Your Registration QR Code</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-4">
              <SimpleQRCode value={registrationId} size={200} className="mb-4" />
              <p className="text-sm text-center font-medium mb-2">
                {event.title}
              </p>
              <p className="text-sm text-center text-muted-foreground mb-2">
                Attendee: {user?.name || 'Registered User'}
              </p>
              <p className="text-xs text-center text-muted-foreground">
                Present this QR code at the event for check-in
              </p>
              <div className="mt-2 text-xs text-center text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
                {registrationId.substring(0, 20)}...
              </div>
            </div>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={() => setShowQRModal(false)}>Close</Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download QR Code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
```
      
      {/* QR Code Modal */}
      <QRCodeDisplay
        open={showQRModal}
        onClose={() => setShowQRModal(false)}
        registrationId={registrationId}
        eventTitle={event.title}
        userName={formData.name}
      />
    </div>
  );
};

export default EventBooking;