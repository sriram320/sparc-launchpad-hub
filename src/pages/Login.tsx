import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
// Using public folder logo path

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const initialTab = (searchParams.get("tab") === "host" ? "host" : "member") as "member" | "host";
  const [activeTab, setActiveTab] = useState<"member" | "host">(initialTab);
  const [memberFormData, setMemberFormData] = useState({
    email: "",
    password: ""
  });
  const [hostFormData, setHostFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMemberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMemberFormData({
      ...memberFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleHostInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHostFormData({
      ...hostFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const success = await login(memberFormData.email, memberFormData.password, "member");
      if (success) {
        const redirect = searchParams.get("redirect");
        navigate(redirect || "/member-dashboard");
      } else {
        setError("Invalid credentials. Use root/root for demo.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const success = await login(hostFormData.email, hostFormData.password, "host");
      if (success) {
        navigate("/host-dashboard");
      } else {
        setError("Invalid credentials. Use root/root for demo.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Social sign-in removed as per requirements; using email/password only

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="starfield absolute inset-0"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80"></div>
      
      {/* Navigation Header */}
      <nav className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/sparc_logo_main.png" 
              alt="SPARC Club Logo" 
              className="h-10 w-auto"
            />
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Login Section */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="cosmic-card p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-orbitron font-bold text-foreground mb-2">
                Mission <span className="text-primary">Access</span>
              </h1>
              <p className="text-muted-foreground">
                Choose your access level to continue
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex mb-8 bg-card/50 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("member")}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === "member"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Member Login
              </button>
              <button
                onClick={() => setActiveTab("host")}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === "host"
                    ? "bg-secondary text-secondary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserCog className="w-4 h-4 mr-2" />
                Host Login
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Member Login */}
            {activeTab === "member" && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-foreground mb-2">Welcome Back, Member!</h2>
                </div>

                <form onSubmit={handleMemberSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="member-email" className="text-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="member-email"
                        name="email"
                        type="email"
                        value={memberFormData.email}
                        onChange={handleMemberInputChange}
                        required
                        className="pl-10"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="member-password" className="text-foreground">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="member-password"
                        name="password"
                        type="password"
                        value={memberFormData.password}
                        onChange={handleMemberInputChange}
                        required
                        className="pl-10"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full btn-mission" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In as Member"}
                  </Button>
                </form>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Don't have an account? </span>
                  <Link to="/complete-setup" className="text-primary hover:underline">Join SPARC Club</Link>
                </div>
                <div className="text-center text-sm mt-2">
                  <Link to="/forgot-password" className="text-primary hover:underline">Forgot your password?</Link>
                </div>
              </div>
            )}

            {/* Host Login */}
            {activeTab === "host" && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-foreground mb-2">Host Access Portal</h2>
                  <p className="text-sm text-muted-foreground">
                    Event organizers and administrators sign in here
                  </p>
                </div>

                <form onSubmit={handleHostSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="host-email" className="text-foreground">Host Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="host-email"
                        name="email"
                        type="email"
                        value={hostFormData.email}
                        onChange={handleHostInputChange}
                        required
                        className="pl-10"
                        placeholder="Enter host email"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="host-password" className="text-foreground">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="host-password"
                        name="password"
                        type="password"
                        value={hostFormData.password}
                        onChange={handleHostInputChange}
                        required
                        className="pl-10"
                        placeholder="Enter password"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full btn-ai" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In as Host"}
                  </Button>
                </form>

                <div className="text-center text-sm">
                  <Link to="/forgot-password" className="text-secondary hover:underline">Forgot your password?</Link>
                </div>

                <div className="bg-card/30 border border-border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Host Privileges:</h3>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Create and manage events</li>
                    <li>• Access participant data</li>
                    <li>• Monitor registrations</li>
                    <li>• Generate reports</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;