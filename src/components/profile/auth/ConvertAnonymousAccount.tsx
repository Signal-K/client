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

        {/* Email/Password Conversion */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Create Your Free Account</h3>
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
