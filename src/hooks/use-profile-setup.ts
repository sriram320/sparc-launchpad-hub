import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '@/services/auth-service';
import { cognitoSignUp, cognitoResendCode, cognitoConfirmSignUp } from '@/services/cognito';
import api from '@/lib/api';

export type UserFormData = {
  fullName: string;
  phone: string;
  email: string;
  profileImage: File | null;
  college: string;
  studentId: string;
  branch: string;
  year: string;
  password?: string;
  confirmPassword?: string;
  verificationMethod: "email" | "phone";
  verificationCode: string;
  isVerified: boolean;
};

export type VerificationStatus = {
  loading: boolean;
  error: string | null;
  success: boolean;
  codeExpiry: Date | null;
};

export const useProfileSetup = () => {
  const navigate = useNavigate();
  const [codeSent, setCodeSent] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    loading: false,
    error: null,
    success: false,
    codeExpiry: null
  });

  /**
   * Send verification code to the user's email or phone
   */
  const sendVerificationCode = async (
    verificationMethod: "email" | "phone",
    contactInfo: string,
    options?: { email?: string; password?: string; fullName?: string; phone?: string }
  ) => {
    try {
      setVerificationStatus({
        ...verificationStatus,
        loading: true,
        error: null
      });

      // Prefer Cognito directly. We need the email as Username for both methods.
      const email = options?.email || (verificationMethod === 'email' ? contactInfo : undefined);
      if (!email) {
        setVerificationStatus({
          ...verificationStatus,
          loading: false,
          error: 'Email is required to send verification code.'
        });
        return false;
      }

      const normalizePhone = (raw?: string) => {
        if (!raw) return undefined;
        const trimmed = raw.trim();
        if (trimmed.startsWith('+')) return trimmed;
        const digits = trimmed.replace(/\D/g, '');
        if (digits.length === 10) return `+91${digits}`;
        return undefined;
      };

      const phone_number = verificationMethod === 'phone'
        ? normalizePhone(options?.phone || contactInfo)
        : undefined;

      // For signUp we need a password; if missing, try resend path directly
      const password = options?.password;

      try {
        if (password) {
          await cognitoSignUp({
            email,
            password,
            phone_number,
            given_name: options?.fullName?.split(' ')?.[0] || undefined,
            family_name: options?.fullName?.split(' ')?.slice(1).join(' ') || undefined,
          });
        } else {
          throw new Error('NO_PASSWORD_TRY_RESEND');
        }
      } catch (e) {
        // If username exists or we skipped signUp, try resend
        await cognitoResendCode(email);
      }

      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 10);
      setCodeSent(true);
      setVerificationStatus({
        loading: false,
        error: null,
        success: true,
        codeExpiry: expiryTime
      });
      return true;
    } catch (error: any) {
      setVerificationStatus({
        ...verificationStatus,
        loading: false,
        error: `Failed to send verification code to your ${verificationMethod}. ${error.message || 'Please try again.'}`
      });
      console.error("Error sending verification code:", error);
      return false;
    }
  };

  /**
   * Verify the code sent to the user
   */
  const verifyCode = async (
    code: string,
    verificationMethod: "email" | "phone",
    contactInfo: string,
    options?: { email?: string }
  ) => {
    try {
      setVerificationStatus({
        ...verificationStatus,
        loading: true,
        error: null
      });

      const email = options?.email || (verificationMethod === 'email' ? contactInfo : undefined);
      if (!email) throw new Error('Email is required to confirm sign up');

      await cognitoConfirmSignUp(email, code);
      setVerificationStatus({
        loading: false,
        error: null,
        success: true,
        codeExpiry: null
      });
      return true;
    } catch (error: any) {
      setVerificationStatus({
        ...verificationStatus,
        loading: false,
        error: `Verification failed. ${error.message || 'Please check the code and try again.'}`
      });
      console.error("Error verifying code:", error);
      return false;
    }
  };

  /**
   * Save the user's profile data
   */
  const saveUserProfile = async (formData: UserFormData) => {
    try {
      // 0) Attempt Cognito sign-up to trigger verification code via email/phone
      try {
        const phone_number = (() => {
          if (formData.verificationMethod === 'phone') {
            const raw = (formData.phone || '').trim();
            if (!raw) return undefined;
            if (raw.startsWith('+')) return raw; // assume already E.164
            // simple normalization: if 10 digits, assume India
            const digits = raw.replace(/\D/g, '');
            if (digits.length === 10) return `+91${digits}`;
            return undefined; // don't send if unsure
          }
          return undefined;
        })();
        if (formData.email && formData.password) {
          await cognitoSignUp({
            email: formData.email,
            password: formData.password,
            phone_number,
            given_name: formData.fullName?.split(' ')?.[0] || undefined,
            family_name: formData.fullName?.split(' ')?.slice(1).join(' ') || undefined,
          });
        }
      } catch (e) {
        // If user already exists or other client-side issue, continue to backend save
        console.warn('Cognito signUp skipped/failed (continuing):', e);
      }

      const data = new FormData();
      
      // Append all form fields to the FormData object
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === 'profileImage' && value instanceof File) {
            data.append(key, value, value.name);
          } else if (typeof value === 'string') {
            data.append(key, value);
          }
        }
      });

      // Use the API instance to post the data
      const response = await api.post('/users/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201 || response.status === 200) {
        // On successful registration, navigate to the verification page
        navigate('/verify-email', { state: { email: formData.email } });
        return { success: true, error: null };
      } else {
        return { success: false, error: 'An unexpected error occurred.' };
      }
    } catch (error: any) {
      console.error("Error saving user profile:", error);
      const errorMessage = error.response?.data?.detail || 'Failed to save profile. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  return {
    codeSent,
    setCodeSent,
    verificationStatus,
    setVerificationStatus,
    sendVerificationCode,
    verifyCode,
    saveUserProfile
  };
};