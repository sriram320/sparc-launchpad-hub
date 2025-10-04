import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cognitoConfirmSignUp, cognitoResendCode } from '@/services/cognito';

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Extract email from navigation state
  const email = location.state?.email;

  if (!email) {
    // Redirect to registration if email is not present
    navigate('/complete-setup');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await cognitoConfirmSignUp(email, verificationCode);

      toast({
        title: 'Verification Successful',
        description: 'Your email has been verified. Please log in.',
      });

      // Redirect to the login page on success
      navigate('/login?tab=member');
    } catch (error) {
      setIsLoading(false);
      toast({
        title: 'Verification Failed',
        description: 'The verification code is incorrect. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleResendCode = async () => {
  try {
    await cognitoResendCode(email);
        toast({
            title: 'Code Resent',
            description: 'A new verification code has been sent to your email.',
        });
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to resend verification code. Please try again later.',
            variant: 'destructive',
        });
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            A verification code has been sent to <strong>{email}</strong>. Please enter it below to activate your account.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              className="text-center"
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Account'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button variant="link" onClick={handleResendCode}>
                Didn't receive a code? Resend
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
