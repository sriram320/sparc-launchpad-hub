import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { MapPin, Mail, Phone, Clock, Send, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    branch: "",
    year: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        branch: "",
        year: "",
        message: ""
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="starfield absolute inset-0"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-orbitron font-bold mb-6 hero-glow">
            Contact <span className="text-primary">Mission Control</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ready to join our aerospace adventure? Let's connect and launch your journey with SPARC Club.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-orbitron font-bold text-foreground mb-6">
                  Get In <span className="text-primary">Touch</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Whether you're a prospective member, industry partner, or fellow innovator, we'd love to hear from you. Join us in pushing the boundaries of aerospace engineering and AI.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Location</h3>
                    <p className="text-muted-foreground">
                      REVA University<br />
                      Rukmini Knowledge Park, Kattigenahalli<br />
                      Yelahanka, Bangalore - 560064<br />
                      Karnataka, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-muted-foreground">
                      info@sparcclub.reva.edu.in<br />
                      president@sparcclub.reva.edu.in
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Phone</h3>
                    <p className="text-muted-foreground">
                      +91 99999 88888<br />
                      +91 77777 66666
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Office Hours</h3>
                    <p className="text-muted-foreground">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* Embedded Map */}
              <div className="cosmic-card overflow-hidden">
                <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">Interactive Map Coming Soon</p>
                    <p className="text-sm text-muted-foreground">REVA University Campus</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="cosmic-card p-8">
              <h3 className="text-2xl font-orbitron font-bold text-foreground mb-6">
                Send Us a <span className="text-primary">Message</span>
              </h3>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-foreground mb-2">Message Sent Successfully!</h4>
                  <p className="text-muted-foreground">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-foreground">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-foreground">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="branch" className="text-foreground">Branch (Optional)</Label>
                      <select
                        id="branch"
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        className="mt-1 w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select your branch</option>
                        <option value="cse">Computer Science & Engineering</option>
                        <option value="ece">Electronics & Communication</option>
                        <option value="me">Mechanical Engineering</option>
                        <option value="ae">Aerospace Engineering</option>
                        <option value="ee">Electrical Engineering</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="year" className="text-foreground">Year of Study (Optional)</Label>
                      <select
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="mt-1 w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select year</option>
                        <option value="1st">1st Year</option>
                        <option value="2nd">2nd Year</option>
                        <option value="3rd">3rd Year</option>
                        <option value="4th">4th Year</option>
                        <option value="graduate">Graduate</option>
                        <option value="faculty">Faculty</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-foreground">Message *</Label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="mt-1 w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      placeholder="Tell us about your interest in SPARC Club, questions, or how we can help..."
                    />
                  </div>

                  <Button type="submit" className="w-full btn-mission">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 bg-card/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-orbitron font-bold text-foreground mb-8">
            Ready to <span className="text-primary">Join</span> the Mission?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="cosmic-card p-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Become a Member</h3>
              <p className="text-muted-foreground text-sm mb-4">Join our community of innovators and space enthusiasts</p>
              <Button className="btn-mission">Apply Now</Button>
            </div>
            <div className="cosmic-card p-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Attend Events</h3>
              <p className="text-muted-foreground text-sm mb-4">Participate in workshops, launches, and hackathons</p>
              <Button className="btn-ai">View Events</Button>
            </div>
            <div className="cosmic-card p-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Partner With Us</h3>
              <p className="text-muted-foreground text-sm mb-4">Collaborate on research and innovation projects</p>
              <Button variant="outline">Learn More</Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;