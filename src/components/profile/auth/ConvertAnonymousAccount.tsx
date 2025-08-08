"use client";

import { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Mail, Shield, UserPlus, Loader2 } from "lucide-react";

interface ConvertAnonymousAccountProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ConvertAnonymousAccount({ onSuccess, onCancel }: ConvertAnonymousAccountProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAnonymousUser = session?.user?.is_anonymous;

  const handleEmailConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Update user with email
      const { error: emailError } = await supabase.auth.updateUser({
        email: email,
      });

      if (emailError) {
        if (emailError.message.includes("already registered")) {
          setError("This email is already registered. Please use a different email or sign in to your existing account.");
        } else {
          setError(emailError.message);
        }
        setIsLoading(false);
        return;
      }

      // Step 2: Show success message for email verification
      setSuccess("Please check your email and click the verification link. After verification, you can set your password.");
      
      // Note: The password will need to be set after email verification
      // The user will need to use the "forgot password" flow or we can guide them through it

    } catch (err: any) {
      setError("An unexpected error occurred");
      console.error("Email conversion error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLinking = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Successfully linked your Google account!");
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError("An unexpected error occurred");
      console.error("Google linking error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAnonymousUser) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You already have a permanent account! No conversion needed.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-2 bg-blue-100 rounded-full w-fit">
          <UserPlus className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle>Save Your Account</CardTitle>
        <CardDescription>
          Convert your temporary account to a permanent one to keep your progress forever - completely free!
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <Mail className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Google Account Linking */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Link with Google (Recommended & Free)</h3>
          <p className="text-sm text-gray-600">
            Link your Google account for instant access from any device
          </p>
          <Button
            onClick={handleGoogleLinking}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Linking...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Link with Google
              </div>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 border-t"></div>
          <span className="text-xs text-gray-500 px-2">OR</span>
          <div className="flex-1 border-t"></div>
        </div>

        {/* Email/Password Conversion */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Create Free Account with Email</h3>
          <form onSubmit={handleEmailConversion} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong password"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email || !password || !confirmPassword}
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Create Free Permanent Account
                </div>
              )}
            </Button>
          </form>
        </div>

        {/* Benefits reminder */}
        <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 text-sm mb-2">Benefits of saving your account:</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li className="text-xl">✓ <strong>Always Free - No Hidden Costs!</strong></li>
            <li>✓ Access from multiple devices</li>
            <li>✓ Never lose your progress</li>
            <li>✓ Get email updates on discoveries</li>
            <li>✓ Join community leaderboards</li>
            <li>✓ Contribute to real scientific research</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Maybe Later
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
