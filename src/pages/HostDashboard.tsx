import { Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import EventsSection from "@/components/EventsSection";
import Footer from "@/components/Footer";
import AdminSidebar from "@/components/AdminSidebar";
import CreateEvent from "@/pages/CreateEvent";
import ManageEvents from "@/pages/ManageEvents";
import ViewParticipants from "@/pages/ViewParticipants";
import MarkAttendance from "@/pages/MarkAttendance";
import GalleryUpload from "@/pages/GalleryUpload";

const HostDashboardHome = () => {
  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-orbitron font-bold">Host Dashboard</h1>
        </div>
      </div>
      
      {/* Show homepage without auth buttons */}
      <HeroSection showAuthButtons={false} />
      <AboutSection />
      <EventsSection />
    </>
  );
};

const HostDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex">
        <AdminSidebar />
        {/* Main content with left margin to account for sidebar */}
        <main className="flex-1 ml-80">
          <Routes>
            <Route index element={<HostDashboardHome />} />
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="manage-events" element={<ManageEvents />} />
            <Route path="view-participants" element={<ViewParticipants />} />
            <Route path="mark-attendance" element={<MarkAttendance />} />
            <Route path="upload-gallery" element={<GalleryUpload />} />
            {/* Fallback for direct access */}
            <Route path="*" element={<HostDashboardHome />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default HostDashboard;