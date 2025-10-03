import { Calendar, MapPin, Users, ArrowRight, Clock, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents } from "@/contexts/EventContext";
// Team preview aligned with /team page

const EventsSection = () => {
  // Get events from context
  const { events } = useEvents();
  
  // Featured team members mirrored from pages/Team.tsx
  const featuredTeamMembers = [
    { name: "SRIRAM KUNDAPUR", role: "CO-ORDINATOR", avatar: "/placeholder.svg" },
    { name: "RISHI TEJAS", role: "TECHNICAL HEAD", avatar: "/placeholder.svg" },
    { name: "SHIVA U", role: "TECHNICAL LEAD", avatar: "/placeholder.svg" },
    { name: "ROUNAK", role: "TECHNICAL LEAD", avatar: "/placeholder.svg" },
  ];

  return (
    <section id="events" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-foreground mb-6">
            Upcoming <span className="text-primary">Events</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join our workshops, hackathons, and launch events. Learn from experts, 
            collaborate with peers, and be part of groundbreaking aerospace innovations.
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {events.map((event, index) => (
            <div key={index} className="cosmic-card p-6 group">
              <div className="mb-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
                  {event.category}
                </div>
                <h3 className="text-xl font-orbitron font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {event.description}
                </p>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{event.date}</span>
                  <Clock className="w-4 h-4 ml-4 mr-2" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-muted-foreground text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{event.capacityText || `${event.capacity} participants`}</span>
                </div>
                <div className="flex items-center text-muted-foreground text-sm">
                  {event.isPaid ? <IndianRupee className="w-4 h-4 mr-2" /> : <span className="w-4 h-4 mr-2">🎁</span>}
                  <span>{event.price}</span>
                </div>
              </div>

              <Link 
                to={`/events/${event.id}`} 
                className={`w-full ${event.isPaid ? 'btn-mission' : 'btn-ai'} flex items-center justify-center space-x-2 cursor-pointer`}
              >
                <span>Register Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>

        {/* Team Members (synced with /team) */}
        <div className="cosmic-card p-8">
          <h3 className="text-2xl font-orbitron font-semibold text-foreground mb-6 text-center">
            Meet Our Team
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {featuredTeamMembers.map((member) => (
              <Link 
                key={member.name}
                to="/team"
                className="text-center p-4 border border-border rounded-lg bg-card/50 hover:bg-card transition-colors group"
              >
                <div className="w-20 h-20 mx-auto mb-3 relative">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{member.name}</h4>
                <div className="text-primary text-sm font-medium">{member.role}</div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/team" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium">
              <span>View All Team Members</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-6">
            Want to stay updated on all our upcoming events and workshops?
          </p>
          <a href="https://www.instagram.com/sparc_lab/" target="_blank" rel="noopener noreferrer" className="btn-ai">
            Join Our Community
          </a>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;