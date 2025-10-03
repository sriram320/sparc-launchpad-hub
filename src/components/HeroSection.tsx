import { ArrowRight, Rocket, Brain, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-rocket-ai.jpg";

const HeroSection = ({ showAuthButtons = true }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleJoinMission = () => {
    if (isAuthenticated && user?.hasProfile) {
      navigate("/member-dashboard");
    } else if (isAuthenticated && !user?.hasProfile) {
      navigate("/onboarding");
    } else {
      navigate("/login?redirect=/member-dashboard");
    }
  };
  
  const handleBecomeMember = () => {
    navigate("/login?action=register");
  };

  const handleExploreAI = () => {
    navigate("/events?category=AI");
  };

  return (
    <section className="starfield min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      ></div>
      
      {/* Background cosmic elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-secondary rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-accent rounded-full animate-pulse delay-700"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-primary rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Content */}
        <div className="space-y-8">
          {/* Tagline */}
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-primary/30 bg-card/50 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm text-muted-foreground font-medium">
              A Premier Innovation Club
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-orbitron font-black tracking-tight">
            <span className="hero-glow text-primary">Igniting Innovation</span>
            <br />
            <span className="text-foreground">in Rocketry & AI</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join SPARC Club's mission to push the boundaries of aerospace engineering 
            and artificial intelligence. Build rockets that soar 2km high and AI systems 
            that think beyond limits.
          </p>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto my-12">
            <div className="cosmic-card p-6 text-center">
              <Rocket className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-orbitron font-bold text-foreground">2km</div>
              <div className="text-muted-foreground">Altitude Achieved</div>
            </div>
            <div className="cosmic-card p-6 text-center">
              <Brain className="w-8 h-8 text-secondary mx-auto mb-2" />
              <div className="text-2xl font-orbitron font-bold text-foreground">5+</div>
              <div className="text-muted-foreground">AI Projects</div>
            </div>
            <div className="cosmic-card p-6 text-center">
              <Zap className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-orbitron font-bold text-foreground">200+</div>
              <div className="text-muted-foreground">Active Members</div>
            </div>
          </div>

          {/* Call to Action Buttons */}
          {!isAuthenticated && showAuthButtons && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={handleJoinMission}
                className="btn-mission flex items-center space-x-2 group"
              >
                <span>Join the Mission</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={handleExploreAI}
                className="btn-ai"
              >
                Explore Our AI Projects
              </button>
            </div>
          )}

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
              <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2 animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;