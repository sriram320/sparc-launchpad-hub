import { Users, Target, Lightbulb, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AboutSection = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Interdisciplinary Team",
      description: "Uniting aerospace, electronics, computer science, mechanical, and AI/ML students for groundbreaking innovation."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Mission-Driven",
      description: "Focused on hands-on rocketry projects and cutting-edge AI systems that push engineering boundaries."
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Innovation Hub",
      description: "From rocket propulsion systems to autonomous navigation AI, we turn bold ideas into reality."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Excellence",
      description: "Recognized for our 2km rocket launches and award-winning AI prototypes at national competitions."
    }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-background via-card/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-foreground mb-6">
            About <span className="text-primary">SPARC Club</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Born from a passion for engineering excellence, SPARC Club has evolved from a small 
            interdisciplinary community into a premier innovation hub, where 
            rockets meet artificial intelligence.
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="cosmic-card p-8">
            <h3 className="text-2xl font-orbitron font-semibold text-foreground mb-4">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To foster a culture of innovation where students from diverse engineering backgrounds 
              collaborate to design, build, and launch advanced aerospace systems powered by 
              cutting-edge artificial intelligence and robotics.
            </p>
          </div>
          <div className="cosmic-card p-8">
            <h3 className="text-2xl font-orbitron font-semibold text-foreground mb-4">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              To become India's leading student-driven aerospace innovation hub, inspiring the 
              next generation of engineers to push the boundaries of space technology and 
              intelligent systems.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="cosmic-card p-6 text-center">
              <div className="text-primary mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-lg font-orbitron font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action removed per request */}
      </div>
    </section>
  );
};

export default AboutSection;