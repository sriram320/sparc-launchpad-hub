import { useState } from "react";
import { Calendar, MapPin, Users, Clock, IndianRupee, Filter, Search, ArrowRight, Trophy, Rocket, Brain, Zap, Play, Download } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useEvents } from "@/contexts/EventContext";

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { events: upcomingEvents } = useEvents();

  const categories = ["All", "Rocketry", "AI/ML", "Embedded Systems", "Workshops", "Competitions", "Launch Events"];

  const pastEvents = [
    {
      title: "Space Technology Symposium 2024",
      date: "October 2024",
      participants: 180,
      category: "Workshops",
      highlights: "Industry speakers from ISRO, SpaceX alumni",
      image: "🎯",
      recap: "Featured presentations on Mars mission technologies and private space industry trends."
    },
    {
      title: "Rocket Design Challenge",
      date: "September 2024",
      participants: 85,
      category: "Competitions",
      highlights: "Inter-college competition with ₹25,000 prizes",
      image: "🏆",
      recap: "Teams competed in altitude accuracy and payload delivery challenges."
    },
    {
      title: "AI Ethics in Aerospace Workshop",
      date: "August 2024",
      participants: 120,
      category: "AI/ML",
      highlights: "Ethics panel with industry leaders",
      image: "🤖",
      recap: "Explored responsible AI development in autonomous flight systems."
    },
    {
      title: "Summer Launch Festival",
      date: "July 2024",
      participants: 250,
      category: "Launch Events",
      highlights: "Multiple rocket launches and family event",
      image: "☀️",
      recap: "Successful launches of 5 rockets with public demonstration and STEM outreach."
    }
  ];

  const filteredEvents = upcomingEvents.filter(event => {
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="starfield py-20 bg-gradient-to-b from-background via-card/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-orbitron font-bold text-foreground mb-6">
            Upcoming <span className="text-primary hero-glow">Events</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join our workshops, hackathons, and launch events. Learn from experts, 
            collaborate with peers, and be part of groundbreaking aerospace innovations.
          </p>
          
          {/* Event Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="cosmic-card p-4">
              <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-orbitron font-bold text-foreground">{upcomingEvents.length}</div>
              <div className="text-muted-foreground text-sm">Upcoming Events</div>
            </div>
            <div className="cosmic-card p-4">
              <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
              <div className="text-2xl font-orbitron font-bold text-foreground">500+</div>
              <div className="text-muted-foreground text-sm">Total Registrations</div>
            </div>
            <div className="cosmic-card p-4">
              <Trophy className="w-6 h-6 text-accent mx-auto mb-2" />
              <div className="text-2xl font-orbitron font-bold text-foreground">12</div>
              <div className="text-muted-foreground text-sm">Events This Year</div>
            </div>
            <div className="cosmic-card p-4">
              <Rocket className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-orbitron font-bold text-foreground">8</div>
              <div className="text-muted-foreground text-sm">Live Launches</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-orbitron font-bold">Upcoming Events</h2>
            <a href="/create-event" className="btn-mission">Create New Event</a>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-background'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredEvents.map((event) => (
              <div key={event.id} className="cosmic-card p-8 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{event.image || "🚀"}</div>
                    <div>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
                        {event.category}
                      </div>
                      <h3 className="text-xl font-orbitron font-semibold text-foreground group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.isPaid 
                      ? 'bg-accent/10 text-accent' 
                      : 'bg-secondary/10 text-secondary'
                  }`}>
                    {event.price}
                  </div>
                </div>

                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{event.capacity}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className={`flex-1 ${event.isPaid ? 'btn-mission' : 'btn-ai'} flex items-center justify-center space-x-2`}>
                    <span>Register Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="px-4 py-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-orbitron font-semibold text-foreground mb-2">
                No Events Found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Past Events Section */}
      <section className="py-16 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-foreground mb-4">
              Past Event <span className="text-primary">Highlights</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Relive the excitement of our previous events and see what makes SPARC Club 
              events truly special.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pastEvents.map((event, index) => (
              <div key={index} className="cosmic-card p-6 text-center group cursor-pointer">
                <div className="text-4xl mb-3">{event.image}</div>
                <h3 className="font-orbitron font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                <div className="text-muted-foreground text-sm mb-2">{event.date}</div>
                <div className="text-primary font-medium text-sm mb-2">
                  {event.participants}+ participants
                </div>
                <div className="text-muted-foreground text-xs mb-3">
                  {event.highlights}
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {event.recap}
                </p>
                <div className="flex items-center justify-center space-x-2 mt-4 text-primary text-xs">
                  <Play className="w-3 h-3" />
                  <span>View Recap</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="cosmic-card p-12">
            <h2 className="text-3xl font-orbitron font-bold text-foreground mb-4">
              Ready to Join the Mission?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Don't miss out on our upcoming events. Join SPARC Club today and be part 
              of India's most innovative aerospace and AI community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-mission flex items-center space-x-2">
                <span>Become a Member</span>
                <Rocket className="w-4 h-4" />
              </button>
              <button className="btn-ai flex items-center space-x-2">
                <span>Download Event Calendar</span>
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;