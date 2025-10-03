import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// Define QR code registration interface
export interface QRCodeRegistration {
  registrationId: string;
  eventId: number;
  participantId: string; // Changed from number to string
  participantName: string;
  participantEmail: string;
  timestamp: string;
  scanned: boolean;
  scanTimestamp?: string;
}

interface QRCodeContextType {
  registrations: QRCodeRegistration[];
  generateQRCode: (eventId: number, participantId: string, participantName: string, participantEmail: string) => string; // Changed participantId to string
  validateQRCode: (code: string) => QRCodeRegistration | null;
  markQRCodeAsScanned: (registrationId: string) => Promise<boolean>;
  getEventRegistrations: (eventId: number) => Promise<QRCodeRegistration[]>;
  getParticipantRegistrations: (participantId: string) => Promise<QRCodeRegistration[]>; // Changed participantId to string
  fetchAllRegistrations: () => Promise<void>;
  loading: boolean;
  registerForEvent: (eventId: number, eventName: string) => Promise<void>; // Added eventName
  isUserRegisteredForEvent: (eventId: number) => boolean; // Simplified signature
}

const QRCodeContext = createContext<QRCodeContextType | null>(null);

// Sample QR code registrations for fallback
const sampleRegistrations: QRCodeRegistration[] = [
  {
    registrationId: "SPARC-1-001-20240928",
    eventId: 1,
    participantId: "1", // Changed to string to match demo user ID
    participantName: "Demo User",
    participantEmail: "demo@example.com",
    timestamp: "2024-09-20T10:30:00Z",
    scanned: true,
    scanTimestamp: "2024-09-28T09:15:00Z"
  }
];

export const QRCodeProvider = ({ children }: { children: ReactNode }) => {
  const [registrations, setRegistrations] = useState<QRCodeRegistration[]>(() => {
    try {
      const saved = localStorage.getItem('qrcode-registrations');
      return saved ? JSON.parse(saved) : sampleRegistrations;
    } catch (e) {
      console.error('Error loading saved registrations:', e);
      return sampleRegistrations;
    }
  });
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    try {
      localStorage.setItem('qrcode-registrations', JSON.stringify(registrations));
    } catch (e) {
      console.error('Error saving registrations:', e);
    }
  }, [registrations]);

  const fetchAllRegistrations = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.get('/registrations');
      if (response.data) {
        const formattedRegistrations = response.data.map((reg: any) => ({
          registrationId: reg.id.toString(),
          eventId: reg.event_id,
          participantId: reg.user_id.toString(), // Ensure participantId is a string
          participantName: reg.user_name || 'Unknown',
          participantEmail: reg.user_email || 'Unknown',
          timestamp: reg.created_at,
          scanned: reg.attended || false,
          scanTimestamp: reg.attendance_time || null
        }));
        setRegistrations(formattedRegistrations);
      }
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // No initial fetch, rely on localStorage
  }, []);

  const generateQRCode = (eventId: number, participantId: string, participantName: string, participantEmail: string): string => {
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const registrationId = `SPARC-${eventId}-${participantId}-${timestamp}`;
    
    const qrData = JSON.stringify({
      registrationId,
      eventId,
      userId: participantId,
      userEmail: participantEmail,
      timestamp: new Date().toISOString()
    });
    
    return qrData;
  };

  const validateQRCode = (code: string): QRCodeRegistration | null => {
    try {
      const data = JSON.parse(code);
      const registration = registrations.find(r => r.registrationId === data.registrationId);
      
      if (registration) {
        return registration;
      }
      
      if (data.eventId && data.userId) {
        return {
          registrationId: data.registrationId || `SPARC-${data.eventId}-${data.userId}-${Date.now()}`,
          eventId: data.eventId,
          participantId: data.userId.toString(), // Ensure it's a string
          participantName: data.userName || 'Unknown',
          participantEmail: data.userEmail || 'Unknown',
          timestamp: data.timestamp || new Date().toISOString(),
          scanned: false
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error validating QR code:', error);
      return null;
    }
  };

  const markQRCodeAsScanned = async (registrationId: string): Promise<boolean> => {
    try {
      const registration = registrations.find(r => r.registrationId === registrationId);
      if (!registration) return false;
      
      await api.post(`/events/${registration.eventId}/attendance`, {
        registration_id: registrationId,
        user_id: registration.participantId
      });
      
      const updatedRegistrations = registrations.map(r => 
        r.registrationId === registrationId 
          ? { ...r, scanned: true, scanTimestamp: new Date().toISOString() } 
          : r
      );
      setRegistrations(updatedRegistrations);
      return true;
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      return false;
    }
  };

  const getEventRegistrations = async (eventId: number): Promise<QRCodeRegistration[]> => {
    return registrations.filter(r => r.eventId === eventId);
  };

  const getParticipantRegistrations = async (participantId: string): Promise<QRCodeRegistration[]> => {
    return registrations.filter(r => r.participantId === participantId);
  };

  const isUserRegisteredForEvent = (eventId: number): boolean => {
    if (!user) return false;
    return registrations.some(reg => reg.eventId === eventId && reg.participantId === user.id);
  };

  const registerForEvent = async (eventId: number, eventName: string): Promise<void> => {
    if (!user) {
      console.error("User not logged in");
      return;
    }

    const isAlreadyRegistered = registrations.some(
      reg => reg.eventId === eventId && reg.participantId === user.id
    );

    if (isAlreadyRegistered) {
      console.log("User already registered for this event.");
      return;
    }

    const newRegistration: QRCodeRegistration = {
      registrationId: `SPARC-${eventId}-${user.id}-${Date.now()}`,
      eventId: eventId,
      participantId: user.id,
      participantName: user.name,
      participantEmail: user.email,
      timestamp: new Date().toISOString(),
      scanned: false,
    };

    // Always update the UI optimistically first.
    setRegistrations(prev => [...prev, newRegistration]);

    try {
      // Attempt to register with backend, but don't let it block the user.
      await api.post(`/events/${eventId}/register`, { user_id: user.id });
      console.log("Successfully synced registration with the backend.");
      
    } catch (error) {
      console.error('Failed to sync registration with backend. The registration is saved locally.', error);
      // The UI is already updated, so we don't revert on failure.
      // The registration will persist in localStorage.
    }
  };

  const value = {
    registrations,
    generateQRCode,
    validateQRCode,
    markQRCodeAsScanned,
    getEventRegistrations,
    getParticipantRegistrations,
    fetchAllRegistrations,
    loading,
    registerForEvent,
    isUserRegisteredForEvent,
  };

  return <QRCodeContext.Provider value={value}>{children}</QRCodeContext.Provider>;
};

export const useQRCode = () => {
  const context = useContext(QRCodeContext);
  if (!context) {
    throw new Error('useQRCode must be used within a QRCodeProvider');
  }
  return context;
};