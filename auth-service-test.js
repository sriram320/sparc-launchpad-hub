import { AuthService } from './src/services/auth-service';

// Mock console.log for testing
const originalConsoleLog = console.log;
const logMessages = [];
console.log = (...args) => {
  logMessages.push(args.join(' '));
  originalConsoleLog(...args);
};

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: jest.fn(key => localStorageMock.store[key]),
  setItem: jest.fn((key, value) => {
    localStorageMock.store[key] = value;
  }),
  clear: jest.fn(() => {
    localStorageMock.store = {};
  })
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock fetch to simulate API responses
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, authorizationUrl: 'http://localhost:8081/auth/mock-callback' }),
  })
);

// Test social login initiation
async function testSocialLoginInitiation() {
  console.log('--- Testing Social Login Initiation ---');
  
  try {
    const googleUrl = await AuthService.initiateGoogleLogin();
    console.log('Google login URL:', googleUrl);
    
    const microsoftUrl = await AuthService.initiateMicrosoftLogin();
    console.log('Microsoft login URL:', microsoftUrl);
    
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Test social login callback
async function testSocialLoginCallback() {
  console.log('--- Testing Social Login Callback ---');
  
  try {
    const googleResult = await AuthService.handleSocialLoginCallback('google', 'test-code');
    console.log('Google callback result:', googleResult.success);
    
    const microsoftResult = await AuthService.handleSocialLoginCallback('microsoft', 'test-code');
    console.log('Microsoft callback result:', microsoftResult.success);
    
    return googleResult.success && microsoftResult.success;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Test verification
async function testVerification() {
  console.log('--- Testing Verification ---');
  
  try {
    const sendEmailResult = await AuthService.sendVerificationCode('email', 'test@example.com');
    console.log('Send email code result:', sendEmailResult.success);
    
    const sendPhoneResult = await AuthService.sendVerificationCode('phone', '+15551234567');
    console.log('Send phone code result:', sendPhoneResult.success);
    
    const verifyEmailResult = await AuthService.verifyCode('email', 'test@example.com', '123456');
    console.log('Verify email code result:', verifyEmailResult.success);
    
    const verifyPhoneResult = await AuthService.verifyCode('phone', '+15551234567', '123456');
    console.log('Verify phone code result:', verifyPhoneResult.success);
    
    return sendEmailResult.success && sendPhoneResult.success && 
           verifyEmailResult.success && verifyPhoneResult.success;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Run all tests
async function runTests() {
  let allPassed = true;
  
  console.log('=== Starting Auth Service Tests ===');
  
  const initiation = await testSocialLoginInitiation();
  console.log('Social login initiation test ' + (initiation ? 'PASSED' : 'FAILED'));
  allPassed = allPassed && initiation;
  
  const callback = await testSocialLoginCallback();
  console.log('Social login callback test ' + (callback ? 'PASSED' : 'FAILED'));
  allPassed = allPassed && callback;
  
  const verification = await testVerification();
  console.log('Verification test ' + (verification ? 'PASSED' : 'FAILED'));
  allPassed = allPassed && verification;
  
  console.log('=== Test Summary ===');
  console.log('All tests ' + (allPassed ? 'PASSED' : 'FAILED'));
}

// Execute tests
runTests().catch(err => console.error('Error running tests:', err));