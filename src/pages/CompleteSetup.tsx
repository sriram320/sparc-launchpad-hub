import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, User, Phone, GraduationCap, Building, Camera, Mail, Check, Loader2, RefreshCw, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Using public folder logo path
import { useAuth } from "@/contexts/AuthContext";
import { useProfileSetup } from "@/hooks/use-profile-setup";

// Helper component for verification code timer
const VerificationTimer = ({ expiryTime, onExpire }: { expiryTime: Date, onExpire: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = expiryTime.getTime() - now.getTime();
      
      if (difference <= 0) {
        onExpire();
        return 0;
      }
      
      return Math.floor(difference / 1000);
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime, onExpire]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <span className={timeLeft < 60 ? "text-red-500 font-medium" : ""}>
      Code expires in {formatTime(timeLeft)}
    </span>
  );
};

const CompleteSetup = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    phone: "",
    email: "",
    profileImage: null as File | null,
    
    // Educational Details
    college: "",
    studentId: "",
    branch: "",
    year: "",
    
    // Account Security
    password: "",
    confirmPassword: "",
    
    // Verification
    verificationMethod: "email" as "email" | "phone",
    verificationCode: "",
    isVerified: false
  });
  
  // Use our custom hook for profile setup logic
  const {
    codeSent,
    setCodeSent,
    verificationStatus,
    setVerificationStatus,
    sendVerificationCode: sendCode,
    verifyCode: verify,
    saveUserProfile
  } = useProfileSetup();

  const handleInputChange = (field: string, value: string) => {
    // Reset verification status when changing verification related fields
    if (field === "email" && value !== formData.email) {
      setCodeSent(false);
      setFormData(prev => ({ ...prev, [field]: value, isVerified: false }));
      setVerificationStatus({
        loading: false,
        error: null,
        success: false,
        codeExpiry: null
      });
    } else if (field === "phone" && value !== formData.phone) {
      setCodeSent(false);
      setFormData(prev => ({ ...prev, [field]: value, isVerified: false }));
      setVerificationStatus({
        loading: false,
        error: null,
        success: false,
        codeExpiry: null
      });
    } else if (field === "verificationMethod") {
      setCodeSent(false);
      setFormData(prev => ({ 
        ...prev, 
        verificationMethod: value as "email" | "phone", 
        isVerified: false,
        verificationCode: "" 
      }));
      setVerificationStatus({
        loading: false,
        error: null,
        success: false,
        codeExpiry: null
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }));
    }
  };

  const sendVerificationCode = async () => {
    // Validate based on selected verification method
    if (formData.verificationMethod === "email") {
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setVerificationStatus({
          ...verificationStatus,
          error: "Please enter a valid email address",
          loading: false
        });
        return;
      }
    } else { // phone verification
      if (!formData.phone || formData.phone.length < 10) {
        setVerificationStatus({
          ...verificationStatus,
          error: "Please enter a valid phone number",
          loading: false
        });
        return;
      }
    }

    const contactInfo = formData.verificationMethod === "email" ? formData.email : formData.phone;
    const success = await sendCode(formData.verificationMethod, contactInfo);
    
    // Store contact info in localStorage for dev mode
    if (success && import.meta.env.DEV) {
      if (formData.verificationMethod === "email") {
        localStorage.setItem('devEmail', formData.email);
      } else {
        localStorage.setItem('devPhone', formData.phone);
      }
    }
    
    // If backend fails in development mode, simulate success
    if (!success && import.meta.env.DEV) {
      // Set expiry time for 10 minutes from now
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 10);
      
      setCodeSent(true);
      setVerificationStatus({
        loading: false,
        error: null,
        success: true,
        codeExpiry: expiryTime
      });
      
      // Store contact info in localStorage for dev mode
      if (formData.verificationMethod === "email") {
        localStorage.setItem('devEmail', formData.email);
      } else {
        localStorage.setItem('devPhone', formData.phone);
      }
    }
  };

  const verifyCode = async () => {
    if (!formData.verificationCode || formData.verificationCode.length < 6) {
      setVerificationStatus({
        ...verificationStatus,
        error: "Please enter the 6-digit verification code"
      });
      return;
    }

    const contactInfo = formData.verificationMethod === "email" ? formData.email : formData.phone;
    const success = await verify(formData.verificationCode, formData.verificationMethod, contactInfo);
    
    if (success) {
      // Update form data to mark as verified
      setFormData(prev => ({ ...prev, isVerified: true }));
    }
    
    // If backend fails in development mode, simulate verification
    if (!success && import.meta.env.DEV) {
      // Accept any 6-digit code in dev mode, or specifically "123456"
      if (formData.verificationCode.length === 6 || formData.verificationCode === "123456") {
        setFormData(prev => ({ ...prev, isVerified: true }));
        setVerificationStatus({
          loading: false,
          error: null,
          success: true,
          codeExpiry: null
        });
      } else {
        setVerificationStatus({
          ...verificationStatus,
          loading: false,
          error: "Invalid verification code. Please try again."
        });
      }
    }
  };

  const handleNext = () => {
    // Clear any previous errors
    setVerificationStatus({
      ...verificationStatus,
      error: null
    });

    // Validation for the password step
    if (currentStep === 3) {
      // Validate passwords match and are at least 8 chars
      if (!formData.password) {
        setVerificationStatus({
          ...verificationStatus,
          error: "Please enter a password"
        });
        return;
      }
      
      if (formData.password.length < 8) {
        setVerificationStatus({
          ...verificationStatus,
          error: "Password must be at least 8 characters"
        });
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setVerificationStatus({
          ...verificationStatus,
          error: "Passwords do not match"
        });
        return;
      }

      console.log("Password validation passed, proceeding to next step");
    }
    
    // Increment the step
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Clear any validation errors
      setVerificationStatus({
        ...verificationStatus,
        error: null
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    if (!formData.isVerified) {
      setVerificationStatus({
        ...verificationStatus,
        error: `Please complete ${formData.verificationMethod} verification before proceeding.`
      });
      return;
    }
    
    // Validate password is set
    if (!formData.password || formData.password.length < 8) {
      setVerificationStatus({
        ...verificationStatus,
        error: "Please set a valid password (at least 8 characters)"
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setVerificationStatus({
        ...verificationStatus,
        error: "Passwords do not match"
      });
      return;
    }
    
    try {
      // Use our custom hook to save profile data to backend
      await saveUserProfile(formData);
      
      // Update local auth context
      updateProfile(true);
      
      // Store dev email for development mode (for testing purposes only)
      if (import.meta.env.DEV) {
        localStorage.setItem('devEmail', formData.email);
        localStorage.setItem('devUsername', formData.fullName);
        localStorage.setItem('devPassword', formData.password);
      }
      
      navigate("/member-dashboard");
    } catch (error: any) {
      console.log("Backend profile update failed, using demo mode");
      
      // In development/demo mode, proceed anyway
      if (import.meta.env.DEV) {
        console.log("Complete setup data:", formData);
        // Store dev info in localStorage for testing
        localStorage.setItem('devEmail', formData.email);
        localStorage.setItem('devUsername', formData.fullName);
        localStorage.setItem('devPassword', formData.password);
        
        // Update profile and navigate
        updateProfile(true);
        navigate("/member-dashboard");
      } else {
        console.error("Error completing profile setup:", error);
        // Show error to user
        alert("Failed to complete profile setup. Please try again.");
      }
    }

  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground"
              }`}
            >
              {step < currentStep ? <Check className="w-4 h-4" /> : step}
            </div>
            {step < 4 && (
              <div
                className={`w-12 h-0.5 mx-2 ${
                  step < currentStep ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

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
                Complete Your <span className="text-primary">SPARC Profile</span>
              </h1>
              <p className="text-muted-foreground">
                Set up your profile to unlock all SPARC Club features
              </p>
            </div>

            {renderStepIndicator()}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <User className="w-5 h-5 mr-2 text-primary" />
                    Personal Information
                  </h3>

                  {/* Profile Photo */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-24 h-24 bg-card border-2 border-dashed border-border rounded-full flex items-center justify-center overflow-hidden">
                        {formData.profileImage ? (
                          <img
                            src={URL.createObjectURL(formData.profileImage)}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Click to upload profile photo</p>
                  </div>
                  
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

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Educational Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-secondary" />
                    Educational Information
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
                        placeholder="Enter your student ID"
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
              )}

              {/* Step 3: Account Security */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-accent" />
                    Create Account Password
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          placeholder="Enter a secure password"
                          className="pl-10"
                          required
                          minLength={8}
                        />
                      </div>
                      <div className="text-xs mt-1 space-y-1">
                        <p className="font-medium text-muted-foreground">Password requirements:</p>
                        <ul className="list-disc pl-5 text-muted-foreground">
                          <li className={formData.password && formData.password.length >= 8 ? "text-green-500" : ""}>
                            At least 8 characters
                          </li>
                          <li className={formData.password && /[A-Z]/.test(formData.password) ? "text-green-500" : ""}>
                            At least one uppercase letter recommended
                          </li>
                          <li className={formData.password && /[0-9]/.test(formData.password) ? "text-green-500" : ""}>
                            At least one number recommended
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          placeholder="Confirm your password"
                          className="pl-10"
                          required
                        />
                      </div>
                      {formData.password && formData.confirmPassword && 
                        formData.password !== formData.confirmPassword && (
                          <p className="text-xs text-red-500 mt-1">
                            Passwords do not match
                          </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Email Verification */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    {formData.verificationMethod === 'email' ? (
                      <Mail className="w-5 h-5 mr-2 text-accent" />
                    ) : (
                      <Phone className="w-5 h-5 mr-2 text-accent" />
                    )}
                    {formData.verificationMethod === 'email' ? 'Email' : 'Phone'} Verification
                  </h3>
                  
                  {/* Timer for code expiration */}
                  {verificationStatus.codeExpiry && (
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      <VerificationTimer 
                        expiryTime={verificationStatus.codeExpiry} 
                        onExpire={() => {
                          setCodeSent(false);
                          setVerificationStatus({
                            loading: false,
                            error: "Verification code expired. Please request a new one.",
                            success: false,
                            codeExpiry: null
                          });
                        }}
                      />
                    </div>
                  )}
                  
                  {verificationStatus.error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>
                        {verificationStatus.error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="bg-card/30 border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      We'll send a verification code to your <strong>
                        {formData.verificationMethod === 'email' 
                          ? (formData.email || "email address") 
                          : (formData.phone || "phone number")}
                      </strong>
                    </p>

                    <div className="mb-4">
                      <Label htmlFor="verificationMethod">Verification Method</Label>
                      <Select 
                        value={formData.verificationMethod}
                        onValueChange={(value) => handleInputChange("verificationMethod", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Verify with Email</SelectItem>
                          <SelectItem value="phone">Verify with Phone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-2 mb-4">
                      <Button
                        type="button"
                        onClick={sendVerificationCode}
                        disabled={verificationStatus.loading || (codeSent && !verificationStatus.error)}
                        className="btn-mission"
                      >
                        {verificationStatus.loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : codeSent && !verificationStatus.error ? (
                          "Code Sent!"
                        ) : codeSent ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Resend Code
                          </>
                        ) : (
                          "Send Verification Code"
                        )}
                      </Button>
                    </div>

                    {codeSent && (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="verificationCode">Enter Verification Code</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="verificationCode"
                              type="text"
                              value={formData.verificationCode}
                              onChange={(e) => handleInputChange("verificationCode", e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="Enter 6-digit code"
                              maxLength={6}
                              className="font-mono text-lg tracking-widest"
                            />
                            <Button
                              type="button"
                              onClick={verifyCode}
                              disabled={verificationStatus.loading || formData.isVerified || formData.verificationCode.length < 6}
                              className={formData.isVerified ? "bg-green-600 hover:bg-green-700" : "btn-ai"}
                              size="sm"
                            >
                              {verificationStatus.loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : formData.isVerified ? (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Verified!
                                </>
                              ) : (
                                "Verify Code"
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formData.isVerified 
                              ? `Your ${formData.verificationMethod} has been verified successfully!` 
                              : `Enter the 6-digit verification code sent to your ${formData.verificationMethod}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                {currentStep > 1 && (
                  <Button type="button" onClick={handlePrevious} variant="outline">
                    Previous
                  </Button>
                )}
                <div className="flex-1"></div>
                {currentStep < 4 ? (
                  <Button type="button" onClick={handleNext} className="btn-mission">
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="btn-mission"
                    disabled={currentStep === 4 && !formData.isVerified}
                  >
                    Complete Setup
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>

            <div className="text-center mt-6 text-sm text-muted-foreground">
              Already have an account? 
              <Link to="/login" className="text-primary hover:underline ml-1">Sign in</Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompleteSetup;