import { useAuth } from "@/contexts/AuthContext";

const MemberDashboardHome = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-orbitron font-bold mb-4">Welcome, {user?.name}!</h1>
      <p className="text-muted-foreground mb-8">This is your member dashboard. Here you can manage your event bookings and view your certificates.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="cosmic-card p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>You booked a spot for "Rocketry Bootcamp 2024".</li>
            <li>Your certificate for "Embedded Systems Workshop" is available.</li>
          </ul>
        </div>
        <div className="cosmic-card p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="/events" className="text-primary hover:underline">Browse Upcoming Events</a></li>
            <li><a href="/blog" className="text-primary hover:underline">Read the Latest Blog Posts</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboardHome;
