import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AdminSidebar from "@/components/AdminSidebar";
import { Calendar, Clock, MapPin, Users, Search, Edit, Trash2, Eye, Filter } from "lucide-react";
import { useEvents } from "@/contexts/EventContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const ManageEvents = () => {
  const { events, updateEvent, deleteEvent } = useEvents();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const categories = ["All", "Rocketry", "AI", "Launch", "Workshop", "Hackathon"];
  
  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDeleteEvent = (id: number) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      deleteEvent(id);
      toast({
        title: "Event Deleted",
        description: "The event has been successfully removed.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex">
        <AdminSidebar />
        {/* Main content with left margin to account for sidebar */}
        <main className="flex-1 ml-80 p-6">
          <div className="container mx-auto">
            <h1 className="text-3xl font-orbitron font-bold mb-6">Manage Events</h1>
            
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-input border border-border rounded-lg px-3 py-2 text-foreground"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <Button variant="default">
                  <a href="/create-event">Create Event</a>
                </Button>
              </div>
            </div>
            
            {/* Events Table */}
            <div className="cosmic-card p-4 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-border">
                  <tr>
                    <th className="py-3 px-4 font-medium">Event</th>
                    <th className="py-3 px-4 font-medium">Date & Time</th>
                    <th className="py-3 px-4 font-medium">Location</th>
                    <th className="py-3 px-4 font-medium">Capacity</th>
                    <th className="py-3 px-4 font-medium">Category</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="mr-3 text-2xl">{event.image || "🚀"}</div>
                            <div>
                              <div className="font-medium">{event.title}</div>
                              <div className="text-xs text-muted-foreground">{event.isPaid ? event.price : "Free"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{event.time}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>{event.location}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>
                              {event.registered || 0}/{event.capacity}
                              <span className="text-xs text-muted-foreground ml-1">
                                ({Math.round(((event.registered || 0) / event.capacity) * 100)}%)
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {event.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon">
                              <a href={`/events/${event.id}`} title="View">
                                <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                              </a>
                            </Button>
                            <Button variant="ghost" size="icon">
                              <a href={`/host-dashboard/edit-event/${event.id}`} title="Edit">
                                <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                              </a>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteEvent(event.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-destructive hover:text-destructive/80" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No events found. Try adjusting your search or filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ManageEvents;