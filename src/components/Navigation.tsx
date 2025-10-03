import { useState } from "react";
import { Menu, X, User, UserCog, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
// Using public folder logo path
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Team", href: "/team" },
    { name: "Events", href: "/events" },
    { name: "Gallery", href: "/gallery" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="nav-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={
              isAuthenticated
                ? user?.role === "host"
                  ? "/host-dashboard"
                  : "/member-dashboard"
                : "/"
            }
            className="flex items-center space-x-3 text-primary"
          >
            <img
              src="/sparc_logo_main.png"
              alt="SPARC Club Logo"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
                >
                  {item.name}
                </Link>
              ))}

              {/* Authentication Section */}
              {!isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login?tab=member"
                    className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
                  >
                    <User className="w-4 h-4" />
                    <span>Member Login</span>
                  </Link>
                  <span className="text-muted-foreground">|</span>
                  <Link
                    to="/login?tab=host"
                    className="flex items-center space-x-1 text-muted-foreground hover:text-secondary transition-colors text-sm font-medium"
                  >
                    <UserCog className="w-4 h-4" />
                    <span>Host Login</span>
                  </Link>
                </div>
              ) : (
                <div className="hidden lg:flex items-center space-x-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={user.profilePicture}
                            alt={user.name}
                          />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>Welcome, {user.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <Link to="/profile">
                          <DropdownMenuItem>Profile</DropdownMenuItem>
                        </Link>
                        <Link
                          to={
                            user.role === "host"
                              ? "/host-dashboard"
                              : "/member-dashboard"
                          }
                        >
                          <DropdownMenuItem>Dashboard</DropdownMenuItem>
                        </Link>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-muted-foreground hover:text-primary p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-muted-foreground hover:text-primary block px-3 py-2 text-base font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Authentication Section */}
              {!isAuthenticated ? (
                <div className="flex flex-col space-y-2 mt-4">
                  <Link
                    to="/login?tab=member"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Member Login</span>
                  </Link>
                  <Link
                    to="/login?tab=host"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-secondary px-3 py-2 text-sm font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCog className="w-4 h-4" />
                    <span>Host Login</span>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 mt-4">
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Welcome, {user?.name || "User"}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-muted-foreground hover:text-red-400 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;