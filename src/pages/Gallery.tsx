import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { X, Play, Calendar, Tag } from "lucide-react";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Rocket Launches", "Workshops", "Hackathons", "Team Events", "Prototypes"];

  const galleryItems = [
    {
      id: 1,
      type: "image",
      src: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop",
      title: "2km Altitude Record Launch",
      category: "Rocket Launches",
      date: "March 2024",
      description: "Our breakthrough high-altitude launch achieving 2 kilometers with full telemetry recovery."
    },
    {
      id: 2,
      type: "video",
      src: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop",
      title: "AI Navigation System Demo",
      category: "Prototypes",
      date: "February 2024",
      description: "Live demonstration of our computer vision-based autonomous navigation system."
    },
    {
      id: 3,
      type: "image",
      src: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
      title: "Embedded Systems Workshop",
      category: "Workshops",
      date: "January 2024",
      description: "Students learning flight computer programming and sensor integration."
    },
    {
      id: 4,
      type: "image",
      src: "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=400&h=300&fit=crop",
      title: "Rocket Assembly Lab",
      category: "Team Events",
      date: "December 2023",
      description: "Team collaboration during the assembly of our multi-stage rocket system."
    },
    {
      id: 5,
      type: "video",
      src: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=400&h=300&fit=crop",
      title: "AI Hackathon 2023",
      category: "Hackathons",
      date: "November 2023",
      description: "48-hour hackathon focusing on AI applications in aerospace engineering."
    },
    {
      id: 6,
      type: "image",
      src: "https://images.unsplash.com/photo-1586438894852-84ad457e7c14?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1586438894852-84ad457e7c14?w=400&h=300&fit=crop",
      title: "Ground Control Station",
      category: "Prototypes",
      date: "October 2023",
      description: "Custom-built ground control station for real-time telemetry monitoring."
    },
    {
      id: 7,
      type: "image",
      src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
      title: "Propulsion System Testing",
      category: "Rocket Launches",
      date: "September 2023",
      description: "Static fire testing of our hybrid rocket motor design."
    },
    {
      id: 8,
      type: "video",
      src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
      title: "Club Foundation Day",
      category: "Team Events",
      date: "August 2023",
      description: "Celebrating our achievements and welcoming new members to the SPARC family."
    },
    {
      id: 9,
      type: "image",
      src: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop",
      title: "Drone Swarm Intelligence",
      category: "Prototypes",
      date: "July 2023",
      description: "Multi-agent AI system controlling coordinated drone formations."
    }
  ];

  const filteredItems = selectedCategory === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  const openModal = (item: any) => {
    setSelectedImage(item);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="starfield absolute inset-0"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-orbitron font-bold mb-6 hero-glow">
            Mission <span className="text-primary">Gallery</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Witness the journey of innovation, from first launches to groundbreaking AI prototypes.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="cosmic-card overflow-hidden cursor-pointer group"
                onClick={() => openModal(item)}
              >
                <div className="relative">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-orbitron font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {item.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {item.category}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-primary transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.title}
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
            <div className="bg-card/90 backdrop-blur-sm rounded-lg p-6 mt-4">
              <h3 className="text-2xl font-orbitron font-bold text-foreground mb-2">
                {selectedImage.title}
              </h3>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {selectedImage.date}
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {selectedImage.category}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {selectedImage.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Gallery;