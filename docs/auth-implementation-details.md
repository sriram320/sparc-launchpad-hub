# Authentication System Implementation

This document explains the implementation details of the authentication system in the SPARC Club application, focusing on the development mode functionality.

## Overview

The authentication system in development mode uses browser localStorage to simulate user registration and authentication without requiring a backend server. This allows developers to test the complete registration and login flow locally.

## Key Components

### 1. AuthContext (src/contexts/AuthContext.tsx)

The `AuthContext` provides authentication state and functions to the entire application:

```typescript
// Main authentication context with state and functions
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => Promise.resolve(),
  logout: () => {},
  updateUser: () => {},
  setLoading: () => {},
  completeUserProfile: () => Promise.resolve(),
});
```

#### Authentication Workflow

1. **Login Function:**
   - Checks credentials against multiple sources:
     - Hardcoded demo credentials (`root`/`root`)
     - Secondary demo account (`sriram@gmail.com`/`root`)
     - Registered user credentials in localStorage

```typescript
// From AuthContext.tsx
const login = async (email: string, password: string, role: UserRole = 'member') => {
  setLoading(true);

  try {
    // Development mode authentication
    // Check if this is a registered user from localStorage
    const storedEmail = localStorage.getItem('devEmail');
    const storedPassword = localStorage.getItem('devPassword');
    const storedUsername = localStorage.getItem('devUsername');

    // Allow login with either hardcoded demo credentials or newly registered user
    if ((email === 'root' && password === 'root') || 
        (email === 'sriram@gmail.com' && password === 'root') || 
        (email === storedEmail && password === storedPassword)) {
      
      // Create user object with appropriate name
      const newUser = {
        id: '1',
        email,
        name: email === storedEmail ? storedUsername || 'Registered User' : 'Demo User',
        role,
        hasProfile: true,
        profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
      };
      
      // Store authentication token and user info
      localStorage.setItem('authToken', 'dev-token-123');
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      setUser(newUser);
      return true;
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  } finally {
    setLoading(false);
  }
};
```

2. **User Registration:**
   - Stores user credentials in localStorage during registration
   - Sets up the user for future logins

```typescript
// From CompleteSetup.tsx
const handleComplete = async () => {
  try {
    setIsSubmitting(true);
    
    // Store credentials in localStorage for development mode
    localStorage.setItem('devEmail', formData.email);
    localStorage.setItem('devPassword', formData.password);
    localStorage.setItem('devUsername', formData.name);
    
    // Complete user profile in auth context
    await completeUserProfile();
    
    // Navigate to dashboard
    navigate('/member-dashboard');
  } catch (error) {
    console.error("Error completing setup:", error);
    toast({
      title: "Error",
      description: "Failed to complete setup. Please try again.",
      variant: "destructive"
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

### 2. Login Component (src/pages/Login.tsx)

The Login component handles credential validation and user authentication:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!email || !password) {
    setError("All fields are required");
    return;
  }
  
  try {
    setIsLoading(true);
    await login(email, password, selectedRole);
    navigate(selectedRole === 'host' ? '/host-dashboard' : '/member-dashboard');
  } catch (error) {
    console.error("Login error:", error);
    setError("Invalid email or password");
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Empty State Implementation (src/components/MyBookings.tsx)

The `MyBookings` component implements different behavior based on user type:

```typescript
useEffect(() => {
  const fetchRegistrations = async () => {
    setIsLoading(true);
    
    try {
      // Check if this is a new registered user
      const isNewRegisteredUser = localStorage.getItem('devEmail') === user?.email;
      
      if (isNewRegisteredUser) {
        // For new registered users, show empty state
        console.log('New registered user - showing empty state');
        setMyRegisteredEvents([]);
      } else {
        // For demo users, show sample event data
        console.log('Demo user - showing sample event');
        setMyRegisteredEvents([{
          id: '1',
          title: 'Introduction to AI',
          date: '2023-10-15',
          time: '3:00 PM - 5:00 PM',
          location: 'Tech Building, Room 302',
          status: 'confirmed'
        }]);
      }
    } catch (error) {
      console.error("Error getting participant registrations:", error);
      setMyRegisteredEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    fetchRegistrations();
  }
}, [user]);
```

## Empty State UI

The empty state UI provides guidance for new users:

```tsx
{myRegisteredEvents.length === 0 && !isLoading && (
  <div className="text-center py-10 border rounded-lg bg-muted/20">
    <h3 className="text-xl font-medium mb-2">Welcome to SPARC Club!</h3>
    <p className="text-muted-foreground mb-2">You haven't registered for any events yet.</p>
    <p className="text-sm text-muted-foreground mb-6">
      Explore our upcoming events and join activities that interest you.
    </p>
    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
      <Button asChild>
        <Link to="/events">Browse All Events</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link to="/">Return to Home</Link>
      </Button>
    </div>
  </div>
)}
```

## Security Considerations

**Important:** The localStorage-based authentication is for development purposes only and should never be used in production.

In production:
- User credentials should never be stored in localStorage
- Passwords should be securely hashed and stored on the server side
- Authentication should use secure HTTP-only cookies or tokens with proper expiration
- API endpoints should implement proper rate limiting and security measures

## Future Improvements

1. **Backend Integration:**
   - Replace localStorage authentication with proper backend API calls
   - Implement secure token-based authentication
   - Add proper error handling for API responses

2. **Security Enhancements:**
   - Add two-factor authentication
   - Implement password strength enforcement
   - Add account recovery flow

3. **User Management:**
   - Add email verification
   - Implement password reset functionality
   - Add account settings and profile management