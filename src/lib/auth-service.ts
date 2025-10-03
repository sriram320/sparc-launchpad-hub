import api from './api';

/**
 * Service for handling authentication with AWS Cognito
 */
class AuthService {
  /**
   * Send verification code to email
   * @param {string} email - Email to send verification code to
   * @returns {Promise} - Result of the API call
   */
  async sendEmailVerificationCode(email) {
    try {
      return await api.post('/auth/send-verification', {
        email,
        method: 'email'
      });
    } catch (error) {
      console.error('Failed to send email verification code', error);
      throw error;
    }
  }

  /**
   * Send verification code to phone
   * @param {string} phone - Phone number to send verification code to
   * @returns {Promise} - Result of the API call
   */
  async sendPhoneVerificationCode(phone) {
    try {
      return await api.post('/auth/send-verification', {
        phone,
        method: 'phone'
      });
    } catch (error) {
      console.error('Failed to send phone verification code', error);
      throw error;
    }
  }

  /**
   * Verify code sent to email
   * @param {string} email - Email to verify
   * @param {string} code - Verification code
   * @returns {Promise} - Result of the API call
   */
  async verifyEmailCode(email, code) {
    try {
      return await api.post('/auth/verify-code', {
        email,
        code,
        method: 'email'
      });
    } catch (error) {
      console.error('Failed to verify email code', error);
      throw error;
    }
  }

  /**
   * Verify code sent to phone
   * @param {string} phone - Phone number to verify
   * @param {string} code - Verification code
   * @returns {Promise} - Result of the API call
   */
  async verifyPhoneCode(phone, code) {
    try {
      return await api.post('/auth/verify-code', {
        phone,
        code,
        method: 'phone'
      });
    } catch (error) {
      console.error('Failed to verify phone code', error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Result of the API call
   */
  async login(email, password, role = 'member') {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        role
      });

      if (response.data && response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
        if (response.data.id_token) {
          localStorage.setItem('idToken', response.data.id_token);
        }
        if (response.data.refresh_token) {
          localStorage.setItem('refreshToken', response.data.refresh_token);
        }
      }

      return response;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  }

  /**
   * Sign out the user
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  /**
   * Start Google OAuth flow
   */
  loginWithGoogle() {
    window.location.href = `${api.defaults.baseURL}/auth/google/login`;
  }

  /**
   * Start Microsoft OAuth flow
   */
  loginWithMicrosoft() {
    window.location.href = `${api.defaults.baseURL}/auth/microsoft/login`;
  }
}

export default new AuthService();