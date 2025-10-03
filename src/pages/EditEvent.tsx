import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, MapPin, Users, IndianRupee } from "lucide-react";
import { useEvents } from "@/contexts/EventContext";
import { useToast } from "@/components/ui/use-toast";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, updateEvent } = useEvents();
  const { toast } = useToast();
  const eventId = Number(id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [price, setPrice] = useState("0");
  const [category, setCategory] = useState("Rocketry");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const eventToEdit = events.find(e => e.id === eventId);
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description);
      setDate(eventToEdit.date);
      setTime(eventToEdit.time);
      setLocation(eventToEdit.location);
      setCapacity(eventToEdit.capacity.toString());
      setPrice(eventToEdit.price.startsWith('₹') ? eventToEdit.price.substring(1) : "0");
      setCategory(eventToEdit.category);
    }
  }, [eventId, events]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updatedEvent = {
      id: eventId,
      title,
      description,
      date,
      time,
      location,
      capacity: Number(capacity),
      price: price === "0" ? "Free" : `₹${price}`,
      isPaid: price !== "0",
      category,
      image: category === "AI" ? "🤖" : category === "Launch" ? "🛰️" : "🚀"
    };

    updateEvent(eventId, updatedEvent);

    toast({
      title: "Event Updated",
      description: "The event has been successfully updated.",
    });

    setTimeout(() => {
      navigate("/host-dashboard/manage-events");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-orbitron font-bold mb-8">Edit Event</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Form fields are similar to CreateEvent, pre-filled with event data */}
            <div className="cosmic-card p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-muted-foreground mb-2">
                    Event Title
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="bg-card border-border"
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-muted-foreground mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-md border border-border bg-card p-2 text-foreground"
                    required
                  >
                    <option value="Rocketry">Rocketry</option>
                    <option value="AI">AI & Machine Learning</option>
                    <option value="Launch">Launch Events</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-2">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={5}
                    className="bg-card border-border"
                  />
                </div>
              </div>
            </div>
            
            <div className="cosmic-card p-8">
              <h2 className="text-xl font-orbitron font-semibold mb-4">Event Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4 mr-2" /> Date
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="bg-card border-border"
                  />
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                    <Clock className="w-4 h-4 mr-2" /> Time
                  </label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="bg-card border-border"
                  />
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4 mr-2" /> Location
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="bg-card border-border"
                  />
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                    <Users className="w-4 h-4 mr-2" /> Capacity
                  </label>
                  <Input
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                    className="bg-card border-border"
                  />
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                    <IndianRupee className="w-4 h-4 mr-2" /> Price (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-card border-border"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="border-border text-muted-foreground"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="btn-mission"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Event"}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditEvent;
