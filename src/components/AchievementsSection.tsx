import { Trophy, Rocket, Brain, Star, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const AchievementsSection = () => {
  const achievements = [
    {
      id: "2km-high-altitude-launch",
      icon: <Rocket className="w-8 h-8" />,
      title: "2km High-Altitude Launch",
      description: "Successfully launched and recovered our custom-built rocket, achieving a record altitude of 2 kilometers with precision telemetry tracking.",
      image: "🚀",
      color: "primary"
    },
    {
      id: "ai-vision-navigation",
      icon: <Brain className="w-8 h-8" />,
      title: "AI Vision Navigation",
      description: "Developed autonomous drone control systems using computer vision and machine learning for real-time obstacle avoidance and navigation.",
      image: "🧠",
      color: "secondary"
    },
    {
      id: "national-competition-winner",
      icon: <Trophy className="w-8 h-8" />,
      title: "National Competition Winner",
      description: "First place in the All-India Aerospace Innovation Challenge for our hybrid rocket propulsion system design.",
      image: "🏆",
      color: "accent"
    },
    {
      id: "research-publication",
      icon: <Star className="w-8 h-8" />,
      title: "Research Publication",
      description: "Published peer-reviewed paper on 'Hybrid AI-Guided Rocket Control Systems' in the International Journal of Aerospace Engineering.",
      image: "⭐",
      color: "primary"
    }
  ];

  return (
    <section id="achievements" className="py-20 bg-card/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-foreground mb-6">
            Mission <span className="text-primary">Accomplished</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From groundbreaking rocket launches to award-winning AI innovations, 
            SPARC Club continues to push the boundaries of what's possible in aerospace engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {achievements.map((achievement, index) => (
            <Link to={`/achievements/${achievement.id}`} key={index} className="cosmic-card p-8 group cursor-pointer">
              <div className="flex items-start space-x-4">
                <div className={`text-${achievement.color} flex-shrink-0 p-3 rounded-lg bg-${achievement.color}/10`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-orbitron font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {achievement.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {achievement.description}
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    <span>Learn more</span>
                    <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-primary mb-2">15+</div>
            <div className="text-muted-foreground">Successful Launches</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-secondary mb-2">8</div>
            <div className="text-muted-foreground">AI Prototypes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-accent mb-2">5</div>
            <div className="text-muted-foreground">Awards Won</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-primary mb-2">3</div>
            <div className="text-muted-foreground">Research Papers</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;