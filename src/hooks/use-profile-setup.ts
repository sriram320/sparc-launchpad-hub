import { useState } from 'react';
import AuthService from '@/services/auth-service';
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
    contactInfo: string
  ) => {
    try {
      setVerificationStatus({
        ...verificationStatus,
        loading: true,
        error: null
      });

      // Use the AuthService to send verification code
      const result = await AuthService.sendVerificationCode(verificationMethod, contactInfo);
      
      if (result.success) {
        // Set expiry time for 10 minutes from now
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
      } else {
        setVerificationStatus({
          ...verificationStatus,
          loading: false,
          error: result.error || `Failed to send verification code to your ${verificationMethod}.`
        });
        
        return false;
      }
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
    contactInfo: string
  ) => {
    try {
      setVerificationStatus({
        ...verificationStatus,
        loading: true,
        error: null
      });
      
      const result = await AuthService.verifyCode(verificationMethod, contactInfo, code);
      
      if (result.success) {
        setVerificationStatus({
          loading: false,
          error: null,
          success: true,
          codeExpiry: null
        });
        
        return true;
      } else {
        setVerificationStatus({
          ...verificationStatus,
          loading: false,
          error: result.error || 'Invalid verification code'
        });
        
        return false;
      }
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
   * Save the user profile to the backend
   */
  const saveUserProfile = async (formData: UserFormData) => {
    try {
      // Format data for profile creation according to backend schema
      const profileData = {
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        branch: formData.branch,
        year: formData.year,
        college: formData.college,
        student_id: formData.studentId,
        ...(formData.password ? { password: formData.password } : {})
      };
      
      // Update user profile with basic information
      await api.patch('/users/me', profileData);
      
      // If there's a profile image, upload it separately
      if (formData.profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('avatar', formData.profileImage);
        
        await api.post('/users/me/avatar', imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      return true;
    } catch (error: any) {
      console.error("Error saving user profile:", error);
      throw new Error(error.response?.data?.detail || 'Failed to save profile data.');
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