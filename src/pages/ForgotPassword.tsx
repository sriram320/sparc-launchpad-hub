import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, Loader2, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { cognitoForgotPassword, cognitoConfirmForgotPassword } from "@/services/cognito";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentStep, setCurrentStep] = useState<"email" | "verification" | "reset" | "success">("email");
  const [error, setError] = useState("");
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await cognitoForgotPassword(email);
      setCurrentStep("verification");
      // set expiry 10 minutes ahead (Cognito default is typically 3 minutes for SMS, 24h for email; we use 10m UX)
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 10);
      setCodeExpiry(expiry);
      toast({
        title: "Check Your Email",
        description: "If an account with that email exists, a verification code has been sent.",
      });
    } catch (err) {
      console.error("Failed to send reset code", err);
      // Show generic message regardless (avoid email enumeration)
      setCurrentStep("verification");
      toast({
        title: "Check Your Email",
        description: "If an account with that email exists, a verification code has been sent.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      // With Cognito, verification of code happens during confirm step; here we proceed to reset form
      setCurrentStep("reset");
    } catch (err) {
      console.error("Invalid verification code", err);
      setError("Invalid verification code. Please try again.");
      
      // For development purposes only
      if (import.meta.env.DEV) {
        // Accept any 6-digit code in dev mode, or specifically "123456"
        if (verificationCode.length === 6 || verificationCode === "123456") {
          setCurrentStep("reset");
        } else {
          setError("Invalid verification code. Please try again.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate passwords
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await cognitoConfirmForgotPassword(email, verificationCode, newPassword);
      
      // Move to success step
      setCurrentStep("success");
    } catch (err) {
      console.error("Failed to reset password", err);
      setError("Failed to reset password. Please try again.");
      
      // For development purposes only
      if (import.meta.env.DEV) {
        // Move to success step anyway for testing
        setCurrentStep("success");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for showing remaining code validity time
  const formatTimeLeft = () => {
    if (!codeExpiry) return "";
    
    const now = new Date();
    const diffMs = codeExpiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Code expired";
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    return `${diffMins}:${diffSecs < 10 ? '0' : ''}${diffSecs}`;
  };

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

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <div className="w-full max-w-md">
          {/* Reset Password Card */}
          <div className="cosmic-card p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-orbitron font-bold text-foreground mb-2">
                Password <span className="text-primary">Reset</span>
              </h1>
              <p className="text-muted-foreground">
                {currentStep === "email" && "Enter your email to reset your password"}
                {currentStep === "verification" && "Enter the verification code sent to your email"}
                {currentStep === "reset" && "Create a new password"}
                {currentStep === "success" && "Your password has been reset successfully"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Email Form */}
            {currentStep === "email" && (
              <form onSubmit={handleSubmitEmail} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full btn-mission" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Code...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Send Reset Code
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            )}

            {/* Verification Form */}
            {currentStep === "verification" && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                  <p className="text-blue-400 text-sm text-center">
                    We've sent a verification code to {email}
                    {codeExpiry && (
                      <span className="block mt-1 text-xs">
                        Code expires in: {formatTimeLeft()}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <Label htmlFor="verification-code" className="text-foreground">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    className="text-center tracking-widest font-mono text-lg"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                <Button type="submit" className="w-full btn-mission" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Verify Code
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </span>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full text-muted-foreground"
                  onClick={() => setCurrentStep("email")}
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Email
                </Button>
              </form>
            )}

            {/* Reset Password Form */}
            {currentStep === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label htmlFor="new-password" className="text-foreground">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="pl-10"
                      placeholder="Enter new password"
                      minLength={8}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm-password" className="text-foreground">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full btn-mission" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting Password...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full text-muted-foreground"
                  onClick={() => setCurrentStep("verification")}
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Verification
                </Button>
              </form>
            )}

            {/* Success Message */}
            {currentStep === "success" && (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="bg-green-500/10 h-24 w-24 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </div>
                  <h2 className="text-xl font-medium text-foreground">Password Reset Complete</h2>
                  <p className="text-muted-foreground text-center mt-2">
                    Your password has been successfully reset. You can now log in with your new password.
                  </p>
                </div>
                <Button 
                  onClick={() => navigate("/login")} 
                  className="w-full btn-mission"
                >
                  Go to Login
                </Button>
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

export default ForgotPassword;