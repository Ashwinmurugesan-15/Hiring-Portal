'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from "next-auth/react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import LightRays from '@/components/ui/LightRays';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'unauthorized') {
      setErrorMsg('This Google account is not registered. Please contact the Super Admin.');
    } else if (error === 'inactive') {
      setErrorMsg('Your account is currently inactive. Please contact the administrator.');
    } else if (error) {
      setErrorMsg('An error occurred during sign in. Please try again.');
    }
  }, [searchParams]);

  const handleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // signIn will redirect the page, so we don't need to do much else on success
      const result = await signIn('google', { callbackUrl: '/dashboard' });
      if (result?.error) {
        setErrorMsg('Failed to initialize sign in. Check if Google OAuth is configured.');
        toast.error('Sign in failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setErrorMsg('An unexpected error occurred. Please check console.');
      toast.error('Unexpected error during sign in');
    } finally {
      // Only set loading false if we didn't redirect
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          className="custom-rays opacity-50"
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
        {/*
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        */}
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center gap-6">
        <img
          src="/guhatek.png"
          alt="GuhaTek"
          className="h-20 w-auto object-contain brightness-0 invert"
        />
        <Card className="w-full shadow-elevated border-0 bg-card/95 backdrop-blur">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-foreground">Welcome to HireFlow</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to access your recruitment portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2 mb-4">
              <p className="text-sm text-muted-foreground">
                Please use your authorized corporate Google account to continue.
              </p>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 gap-3 text-base border-border hover:bg-muted/50 hover:text-foreground transition-all duration-200"
              onClick={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full h-12 gap-3 text-base transition-all duration-200"
              onClick={() => signIn('credentials', { username: 'demo', callbackUrl: '/dashboard' })}
            >
              Demo Login
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-8">
              Only accounts registered by the Super Admin can access the portal.
            </p>
          </CardContent>
        </Card >
      </div >
    </div>
  );
};

export default Login;
