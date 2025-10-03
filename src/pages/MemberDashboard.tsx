import { Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MemberSidebar from "@/components/MemberSidebar";
import MemberDashboardHome from "@/pages/MemberDashboardHome";
import MemberBookings from "@/pages/MemberBookings";
import MemberCertificates from "@/pages/MemberCertificates";
import MyBookings from "@/pages/MyBookings";

const MemberDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex">
        <MemberSidebar />
        <main className="flex-1 ml-64 p-12">
          <Routes>
            <Route index element={<MemberDashboardHome />} />
            {/* Use MyBookings for both routes to avoid confusion */}
            <Route path="bookings" element={<MyBookings />} />
            <Route path="my-bookings" element={<MyBookings />} />
            <Route path="certificates" element={<MemberCertificates />} />
            {/* Fallback for direct access */}
            <Route path="*" element={<MemberDashboardHome />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MemberDashboard;