import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "@/lib/api";

// Define event type
export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  capacityText?: string;
  price: string;
  isPaid: boolean;
  category: string;
  image?: string;
  registered?: number;
  venue?: string;
  instructor?: string;
  level?: string;
  coverImage?: string;
  highlights?: string[];
  requirements?: string[];
}

interface EventContextType {
  events: Event[];
  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<Event, "id">) => Promise<number>;
  updateEvent: (id: number, updatedEvent: Partial<Event>) => Promise<boolean>;
  deleteEvent: (id: number) => Promise<boolean>;
  loading: boolean;
}

export const EventContext = createContext<EventContextType | null>(null);

// Sample initial events data (will be replaced with API data)
const initialEvents: Event[] = [
  {
    id: 1,
    title: "Rocketry Bootcamp 2024",
    description: "Intensive two-day workshop covering the fundamentals of model rocketry, including design, construction, and launch principles.",
    date: "2024-10-15",
    time: "09:00",
    location: "Innovation Lab, Block A",
    capacity: 30,
    capacityText: "30 students",
    price: "Free",
    isPaid: false,
    category: "Workshop",
    image: "🚀",
    registered: 15,
    venue: "Innovation Lab, Block A",
    instructor: "Dr. Rajesh Kumar",
    level: "Beginner",
    highlights: [
      "Build and launch your own model rocket",
      "Learn propulsion system design",
      "Hands-on CAD workshop"
    ],
    requirements: [
      "Basic engineering knowledge",
      "Laptop with CAD software"
    ]
  }
];

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch all events from API
  const fetchEvents = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.get('/events');
      if (response.data) {
        // Check response structure
        let eventsData = response.data;
        
        // Handle different response formats from the API
        if (response.data.value && Array.isArray(response.data.value)) {
          console.log('Using value array from response data');
          eventsData = response.data.value;
        }
        
        // Map backend data to our frontend event structure
        const formattedEvents = eventsData.map((event: any) => {
          try {
            // Extract date and time from ISO string or use default if format is invalid
            let dateStr = new Date().toISOString().split('T')[0];
            let timeStr = "12:00";
            
            if (event.date_time) {
              try {
                const eventDate = new Date(event.date_time);
                dateStr = eventDate.toISOString().split('T')[0];
                timeStr = eventDate.toTimeString().slice(0, 5);
              } catch (error) {
                console.error('Error parsing date:', error);
              }
            }
            
            return {
              id: Number(event.id) || Math.floor(Math.random() * 1000),
              title: event.title || "Untitled Event",
              description: event.description || "No description available",
              date: dateStr,
              time: timeStr,
              location: event.venue || "TBD",
              venue: event.venue || "TBD",
              capacity: event.capacity || 30,
              capacityText: `${event.capacity || 30} participants`,
              price: event.is_paid ? `₹${event.price}` : "Free",
              isPaid: event.is_paid || false,
              category: event.category || "Workshop",
              image: event.category === "AI" ? "🤖" : event.category === "Launch" ? "🛰️" : "🚀",
              registered: event.registered_count || event.registrations?.length || 0,
              instructor: event.instructor || "SPARC Team",
              level: event.level || "All Levels",
              coverImage: event.cover_image_url,
              highlights: event.highlights || [],
              requirements: event.requirements || []
            };
          } catch (error) {
            console.error('Error processing event:', error);
            return {
              id: Number(event.id) || Math.floor(Math.random() * 1000),
              title: "Error Processing Event",
              description: "There was an error processing this event data",
              date: new Date().toISOString().split('T')[0],
              time: "12:00",
              location: "Unknown",
              venue: "Unknown",
              capacity: 30,
              capacityText: "30 participants",
              price: "Free",
              isPaid: false,
              category: "Error",
              image: "⚠️",
              registered: 0,
              instructor: "Unknown",
              level: "All Levels",
              coverImage: undefined,
              highlights: [],
              requirements: []
            };
          }
        });
        
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      // Keep using demo data if API fails
    } finally {
      setLoading(false);
    }
  };

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Add new event
  const addEvent = async (event: Omit<Event, "id">): Promise<number> => {
    try {
      // Format the date and time for backend
      const dateTime = new Date(`${event.date}T${event.time}`).toISOString();
      
      // Create API request object for the backend
      const backendEvent = {
        title: event.title,
        description: event.description,
        date_time: dateTime,
        venue: event.location,
        is_paid: event.isPaid,
        price: event.isPaid ? event.price.replace('₹', '') : "0",
        capacity: event.capacity,
        cover_image_url: event.image || "🚀",
        category: event.category,
        instructor: event.instructor,
        level: event.level,
        highlights: event.highlights,
        requirements: event.requirements
      };
      
      // Call the backend API
      const response = await api.post('/events', backendEvent);
      const newEventId = response.data.id;
      
      // Add to local state
      const newEvent = { ...event, id: newEventId };
      setEvents([...events, newEvent]);
      
      return newEventId;
    } catch (error) {
      console.error('Error creating event:', error);
      
      // Fallback to local-only if API fails
      const id = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
      const newEvent = { ...event, id };
      setEvents([...events, newEvent]);
      
      return id;
    }
  };

  // Update existing event
  const updateEvent = async (id: number, updatedEvent: Partial<Event>): Promise<boolean> => {
    try {
      let backendEvent: any = {};
      
      if (updatedEvent.date && updatedEvent.time) {
        backendEvent.date_time = new Date(`${updatedEvent.date}T${updatedEvent.time}`).toISOString();
      }
      
      if (updatedEvent.title) backendEvent.title = updatedEvent.title;
      if (updatedEvent.description) backendEvent.description = updatedEvent.description;
      if (updatedEvent.location) backendEvent.venue = updatedEvent.location;
      if (updatedEvent.isPaid !== undefined) {
        backendEvent.is_paid = updatedEvent.isPaid;
        if (updatedEvent.price) {
          backendEvent.price = updatedEvent.isPaid ? updatedEvent.price.replace('₹', '') : "0";
        }
      }
      if (updatedEvent.capacity) backendEvent.capacity = updatedEvent.capacity;
      if (updatedEvent.image) backendEvent.cover_image_url = updatedEvent.image;
      if (updatedEvent.category) backendEvent.category = updatedEvent.category;
      
      // Call the backend API
      await api.put(`/events/${id}`, backendEvent);
      
      // Update local state
      setEvents(events.map(event => {
        if (event.id === id) {
          return { ...event, ...updatedEvent };
        }
        return event;
      }));
      
      return true;
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      
      // Update local state even if API fails
      setEvents(events.map(event => {
        if (event.id === id) {
          return { ...event, ...updatedEvent };
        }
        return event;
      }));
      
      return false;
    }
  };

  // Delete event
  const deleteEvent = async (id: number): Promise<boolean> => {
    try {
      // Call the backend API
      await api.delete(`/events/${id}`);
      
      // Update local state
      setEvents(events.filter(event => event.id !== id));
      return true;
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      
      // Update local state even if API fails
      setEvents(events.filter(event => event.id !== id));
      return false;
    }
  };

  return (
    <EventContext.Provider value={{ 
      events, 
      fetchEvents,
      addEvent, 
      updateEvent, 
      deleteEvent,
      loading 
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  
  return context;
};