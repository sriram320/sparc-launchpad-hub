import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, Brain, Zap, Users, Target, Eye } from "lucide-react";

const About = () => {
  const focusAreas = [
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Rocketry & Propulsion",
      description: "Design and launch high-altitude rockets with custom propulsion systems, achieving record altitudes with precision telemetry."
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI & Machine Learning",
      description: "Develop autonomous control systems, computer vision applications, and machine learning algorithms for aerospace applications."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Embedded Systems",
      description: "Create sophisticated flight computers, sensor arrays, and real-time control systems for our aerospace projects."
    }
  ];

  const teamMembers = [
    {
      name: "UDAY KIRAN REDDY",
      role: "FOUNDER OF SPARC AEROTECH PVT LTD & TECHNICAL ADVISOR AND MENTOR",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
      bio: "Leading researcher in hybrid rocket propulsion with 5+ years in aerospace innovation."
    },
    {
      name: "SRIRAM KUNDAPUR",
      role: "CO-ORDINATOR",
      department: "COMPUTING AND INFORMATION TECHNOLOGY",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    },
    {
      name: "RISHI TEJAS",
      role: "TECHNICAL HEAD",
      department: "COMPUTING AND INFORMATION TECHNOLOGY",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    },
    {
      name: "SHIVA U",
      role: "TECHNICAL LEAD",
      department: "COMPUTING AND INFORMATION TECHNOLOGY",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="starfield absolute inset-0"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-orbitron font-bold mb-6 hero-glow">
            About <span className="text-primary">SPARC</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Where interdisciplinary engineering meets innovation. We are the future of aerospace technology at REVA University.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-orbitron font-bold text-foreground mb-6">
                Our <span className="text-secondary">Journey</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                SPARC Club began as a small group of passionate engineering students who shared a vision: to push the boundaries of what's possible in aerospace engineering and artificial intelligence.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Founded in 2019 at REVA University, we've grown from launching model rockets in the campus field to achieving 2-kilometer high-altitude flights with AI-guided control systems. Our interdisciplinary approach brings together students from aerospace, computer science, electronics, and mechanical engineering.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Today, we're recognized as one of India's leading student aerospace organizations, with our innovations catching the attention of industry leaders and research institutions worldwide.
              </p>
            </div>
            <div className="relative">
              <div className="cosmic-card p-8">
                <img 
                  src="https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=500&h=300&fit=crop" 
                  alt="Rocket launch" 
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <div className="text-center">
                  <h3 className="text-xl font-orbitron font-semibold text-primary mb-2">First Successful Launch</h3>
                  <p className="text-muted-foreground">March 2020 - 500m altitude achieved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="cosmic-card p-8 text-center">
              <Target className="w-12 h-12 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-orbitron font-bold text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To foster innovation in aerospace engineering and artificial intelligence by providing students with hands-on experience in designing, building, and launching advanced rocket systems while developing cutting-edge AI applications.
              </p>
            </div>
            <div className="cosmic-card p-8 text-center">
              <Eye className="w-12 h-12 text-secondary mx-auto mb-6" />
              <h3 className="text-2xl font-orbitron font-bold text-foreground mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become a globally recognized hub for student-led aerospace innovation, bridging the gap between academic learning and real-world engineering challenges while inspiring the next generation of space pioneers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="py-20 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-foreground mb-6">
              Key Focus <span className="text-accent">Areas</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our multidisciplinary approach combines traditional aerospace engineering with modern AI and embedded systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {focusAreas.map((area, index) => (
              <div key={index} className="cosmic-card p-8 text-center group cursor-pointer">
                <div className="text-primary mb-6 flex justify-center">
                  {area.icon}
                </div>
                <h3 className="text-xl font-orbitron font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {area.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-foreground mb-6">
              Our <span className="text-primary">Team</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meet the passionate individuals who drive SPARC Club's mission forward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="cosmic-card p-6 text-center group cursor-pointer">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-orbitron font-semibold text-foreground mb-1">
                  {member.name}
                </h3>
                <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground mb-3">{member.department}</p>
                <p className="text-sm text-muted-foreground leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/team">
              <Button variant="outline">View All Team Members</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-20 bg-card/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Users className="w-16 h-16 text-accent mx-auto mb-6" />
          <h2 className="text-4xl font-orbitron font-bold text-foreground mb-6">
            Join the <span className="text-accent">Mission</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ready to push the boundaries of aerospace engineering? Whether you're a beginner or experienced, there's a place for you in SPARC Club.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-mission">
              Become a Member
            </button>
            <button className="btn-ai">
              Attend a Workshop
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;