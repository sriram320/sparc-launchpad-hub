import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Award, User, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const MemberSidebar = () => {
  const location = useLocation();

  const navLinks = [
    { to: "/member-dashboard", icon: <Home className="w-5 h-5" />, text: "Dashboard" },
    { to: "/member-dashboard/my-bookings", icon: <Calendar className="w-5 h-5" />, text: "My Bookings" },
    { to: "/member-dashboard/certificates", icon: <Award className="w-5 h-5" />, text: "My Certificates" },
    { to: "/profile", icon: <User className="w-5 h-5" />, text: "My Profile" },
  ];

  return (
    <aside className="w-64 bg-card p-6 fixed h-full">
      <h2 className="text-2xl font-orbitron font-bold mb-8 text-foreground">Member Zone</h2>
      <nav className="mt-8">
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={cn(
                  "flex items-center p-2 rounded-lg transition-colors",
                  (location.pathname === link.to || 
                   (link.to !== "/member-dashboard" && location.pathname.startsWith(link.to)))
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                )}
              >
                {link.icon}
                <span className="ml-3 font-medium">{link.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default MemberSidebar;
