import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, User, Phone, GraduationCap, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
// Using public folder logo path

const Onboarding = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    college: "",
    studentId: "",
    branch: "",
    year: "",
    interests: []
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Onboarding data:", formData);
    // Save to database here
    navigate("/member-dashboard");
  };

  const interestOptions = [
    { id: "rocketry", label: "Rocketry & Aerospace", icon: "🚀" },
    { id: "ai", label: "Artificial Intelligence", icon: "🤖" },
    { id: "embedded", label: "Embedded Systems", icon: "⚡" },
    { id: "web", label: "Web Development", icon: "💻" }
  ];

  return (
    <div className="min-h-screen starfield relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/90"></div>
      
      {/* Navigation Header */}
      <nav className="relative z-10 p-6">
        <Link to="/" className="flex items-center space-x-2">
            <img 
            src="/sparc_logo_main.png" 
            alt="SPARC Club Logo" 
            className="h-10 w-auto"
          />
        </Link>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <div className="w-full max-w-2xl">
          <Card className="cosmic-card p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-orbitron font-bold text-foreground mb-2">
                Welcome to <span className="text-primary">SPARC Club!</span>
              </h1>
              <p className="text-muted-foreground">
                Complete your profile to join our mission of innovation in rocketry and AI
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-secondary" />
                  Academic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="college">College Name *</Label>
                    <Input
                      id="college"
                      type="text"
                      value={formData.college}
                      onChange={(e) => handleInputChange("college", e.target.value)}
                      placeholder="Enter your college name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentId">Student ID / SRN</Label>
                    <Input
                      id="studentId"
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange("studentId", e.target.value)}
                      placeholder="Enter your student ID (optional)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="branch">Branch *</Label>
                    <Select onValueChange={(value) => handleInputChange("branch", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cse">Computer Science Engineering</SelectItem>
                        <SelectItem value="ece">Electronics & Communication</SelectItem>
                        <SelectItem value="mech">Mechanical Engineering</SelectItem>
                        <SelectItem value="aero">Aerospace Engineering</SelectItem>
                        <SelectItem value="eee">Electrical & Electronics</SelectItem>
                        <SelectItem value="civil">Civil Engineering</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="year">Year of Study *</Label>
                    <Select onValueChange={(value) => handleInputChange("year", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                        <SelectItem value="pg">Post Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Areas of Interest */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center">
                  <Building className="w-5 h-5 mr-2 text-accent" />
                  Areas of Interest (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {interestOptions.map((interest) => (
                    <div
                      key={interest.id}
                      onClick={() => handleInterestToggle(interest.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                        formData.interests.includes(interest.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-card/50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{interest.icon}</span>
                        <span className="font-medium">{interest.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full btn-mission">
                <span>Complete Setup & Join SPARC</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="text-center mt-6 text-sm text-muted-foreground">
              By completing setup, you agree to our community guidelines and terms of service.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;