import { Calendar, MapPin, Clock, IndianRupee } from "lucide-react";

const MemberBookings = () => {
  // Mock data for bookings
  const bookings = [
    {
      id: 1,
      title: "Rocketry Bootcamp 2024",
      date: "Dec 15, 2024",
      time: "10:00 AM",
      location: "TOB",
      price: "₹299",
      status: "Confirmed",
    },
    {
      id: 3,
      title: "High-Altitude Launch Day",
      date: "Jan 8, 2025",
      time: "9:00 AM",
      location: "Off-Campus Launch Site",
      price: "₹150",
      status: "Confirmed",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-orbitron font-bold mb-8">My Bookings</h1>
      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="cosmic-card p-6">
              <h3 className="text-xl font-orbitron font-semibold text-foreground mb-4">{booking.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground text-sm">
                <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {booking.date}</div>
                <div className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {booking.time}</div>
                <div className="flex items-center col-span-2"><MapPin className="w-4 h-4 mr-2" /> {booking.location}</div>
                <div className="flex items-center"><IndianRupee className="w-4 h-4 mr-2" /> {booking.price}</div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === "Confirmed" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">You have no event bookings yet.</p>
      )}
    </div>
  );
};

export default MemberBookings;
