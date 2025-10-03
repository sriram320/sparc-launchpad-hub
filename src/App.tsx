import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// Note: We keep react-oidc provider in main.tsx but rely on our own AuthContext for app routing

// Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { EventProvider } from "./contexts/EventContext";
import { QRCodeProvider } from "./contexts/QRCodeContext";
import { TeamProvider } from "./contexts/TeamContext";
import { BlogProvider } from "./contexts/BlogContext";

// Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Team from "./pages/Team";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import EventDetailWithQR from "./pages/EventDetailWithQR";
import EventBooking from "./pages/EventBooking";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import MemberDashboard from "./pages/MemberDashboard";
import HostDashboard from "./pages/HostDashboard";
import CompleteSetup from "./pages/CompleteSetup";
import Onboarding from "./pages/Onboarding";
import MyBookings from "./pages/MyBookings";
import MarkAttendance from "./pages/MarkAttendance";
import AttendanceManager from "./pages/AttendanceManager";
import NotFound from "./pages/NotFound";
import TestComponent from "./pages/TestComponent";
import Blog from "./pages/Blog";
import Profile from "./pages/Profile";
import CreateEvent from "./pages/CreateEvent";
import ManageEvents from "./pages/ManageEvents";
import GalleryUpload from "./pages/GalleryUpload";
import ViewParticipants from "./pages/ViewParticipants";
import AuthCallback from "./pages/AuthCallback";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail"; // Import the new component
import { useAuth as useAppAuth } from "./contexts/AuthContext";

// Create a new QueryClient instance
const queryClient = new QueryClient();


// Simple PrivateRoute that uses our app AuthContext
const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated } = useAppAuth();
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <EventProvider>
          <QRCodeProvider>
            <TeamProvider>
              <BlogProvider>
                <BrowserRouter>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/events/:id" element={<EventDetail />} />
                      <Route path="/events/:id/qr" element={<EventDetailWithQR />} />
                      <Route path="/event-booking/:id" element={<EventBooking />} />
                      <Route path="/gallery" element={<Gallery />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/complete-setup" element={<CompleteSetup />} />
                      <Route path="/auth-callback" element={<AuthCallback />} />
                      <Route path="/verify-email" element={<VerifyEmail />} /> {/* Add the new route */}

                      {/* Private routes (require AuthContext login) */}
                      <Route path="/member-dashboard/*" element={<PrivateRoute element={<MemberDashboard />} />} />
                      <Route path="/host-dashboard/*" element={<PrivateRoute element={<HostDashboard />} />} />
                      <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
                      <Route path="/onboarding" element={<PrivateRoute element={<Onboarding />} />} />
                      <Route path="/mark-attendance/:id" element={<PrivateRoute element={<MarkAttendance />} />} />
                      <Route path="/attendance-manager" element={<PrivateRoute element={<AttendanceManager />} />} />
                      <Route path="/create-event" element={<PrivateRoute element={<CreateEvent />} />} />
                      <Route path="/manage-events" element={<PrivateRoute element={<ManageEvents />} />} />
                      <Route path="/view-participants" element={<PrivateRoute element={<ViewParticipants />} />} />
                      <Route path="/gallery/upload" element={<PrivateRoute element={<GalleryUpload />} />} />
                      <Route path="/blog/new" element={<PrivateRoute element={<Blog />} />} />

                      {/* Utility/Test and 404 */}
                      <Route path="/test" element={<TestComponent />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </TooltipProvider>
                </BrowserRouter>
              </BlogProvider>
            </TeamProvider>
          </QRCodeProvider>
        </EventProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;