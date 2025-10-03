import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, IndianRupee, ArrowLeft, User, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useEvents } from "@/contexts/EventContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQRCode } from "@/contexts/QRCodeContext";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events } = useEvents();
  const { isAuthenticated } = useAuth();
  const { isUserRegisteredForEvent } = useQRCode();
  const [isRegistered, setIsRegistered] = useState(false);
  
  // Find the event by ID from our context
  const foundEvent = events.find(e => e.id.toString() === id);
  
  // Check if user is registered for this event
  useEffect(() => {
    if (isAuthenticated && id) {
      const registered = isUserRegisteredForEvent(Number(id));
      setIsRegistered(registered);
    }
  }, [isAuthenticated, id, isUserRegisteredForEvent]);
  
  // Fallback if event not found
  const event = foundEvent || {
    id: id || "1",
    title: "Advanced AI Workshop: Neural Networks & Deep Learning",
    description: `Join us for an intensive hands-on workshop exploring the fascinating world of artificial intelligence and deep learning. This workshop is designed for students with basic programming knowledge who want to dive deeper into AI.

What you'll learn:
• Fundamentals of neural networks and deep learning
• Building your first AI model using Python and TensorFlow
• Real-world applications in computer vision and NLP
• Best practices for model training and optimization
• Project showcase and networking opportunities

Prerequisites:
• Basic Python programming knowledge
• Understanding of mathematics (linear algebra basics)
• Laptop with minimum 8GB RAM

What's included:
• Workshop materials and datasets
• Certificate of completion
• Networking lunch
• Access to our AI community Discord`,
    date: "2024-12-20",
    time: "09:00 AM - 05:00 PM",
    venue: "SPARC Lab, TOB",
    capacity: 50,
    registered: 32,
    price: 299,
    isPaid: true,
    category: "AI",
    instructor: "Dr. Priya Sharma",
    level: "Intermediate",
    coverImage: "/api/placeholder/800/400"
  };

  const handleRegister = () => {
    navigate(`/event-booking/${id}`);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            <div className="cosmic-card overflow-hidden">
              <div 
                className="h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🤖</div>
                  <p className="text-muted-foreground">Event Cover Image</p>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <Card className="cosmic-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-2">{event.category}</Badge>
                  <h1 className="text-3xl font-orbitron font-bold text-foreground mb-2">
                    {event.title}
                  </h1>
                  <p className="text-muted-foreground">Instructor: {event.instructor}</p>
                </div>
                <Badge variant={event.level === "Beginner" ? "default" : event.level === "Intermediate" ? "secondary" : "destructive"}>
                  {event.level}
                </Badge>
              </div>

              {/* Event Meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{event.registered}/{event.capacity} registered</span>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-line text-muted-foreground">
                  {event.description}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="cosmic-card p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-orbitron font-bold text-foreground mb-2">
                  {event.isPaid ? (
                    <div className="flex items-center justify-center">
                      <IndianRupee className="w-8 h-8" />
                      <span>{event.price}</span>
                    </div>
                  ) : (
                    <span className="text-primary">FREE</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {event.isPaid ? "Per participant" : "No registration fee"}
                </p>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Availability</span>
                  <span className="text-sm font-medium">
                    {event.capacity - event.registered} spots left
                  </span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Register Button - Only show if user is not already registered */}
              {isAuthenticated && isRegistered ? (
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <UserCheck className="w-6 h-6 mx-auto text-green-600 mb-2" />
                  <p className="text-green-700 font-medium">Already Registered</p>
                  <p className="text-green-600 text-sm">Check your dashboard for QR code</p>
                </div>
              ) : (
                <Button 
                  onClick={handleRegister}
                  className="w-full btn-mission"
                  disabled={event.registered >= event.capacity}
                >
                  {event.registered >= event.capacity ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Event Full
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 mr-2" />
                      Register Now
                    </>
                  )}
                </Button>
              )}
            </Card>

            {/* Event Info */}
            <Card className="cosmic-card p-6">
              <h3 className="font-semibold mb-4">Event Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="outline">{event.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span>8 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <span>English</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certificate</span>
                  <span className="text-primary">Included</span>
                </div>
              </div>
            </Card>

            {/* Contact */}
            <Card className="cosmic-card p-6">
              <h3 className="font-semibold mb-4">Questions?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Need help with registration or have questions about the event?
              </p>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetail;