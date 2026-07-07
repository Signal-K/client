"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Mail, Shield, UserPlus, Loader2 } from "lucide-react";
import { useAuthUser } from "@/src/hooks/useAuthUser";

interface ConvertAnonymousAccountProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Converts a guest (Clerk user created with publicMetadata.guest === true, see
 * src/lib/server/guestAuth.ts) into a permanent account, in place — same Clerk
 * user id, so existing gameplay data stays attached. Two steps: verify a real
 * email address, then set a password; a server call flips publicMetadata.guest
 * to false once both are done.
 */
export default function ConvertAnonymousAccount({ onSuccess, onCancel }: ConvertAnonymousAccountProps) {
  const { user: clerkUser } = useUser();
  const { user } = useAuthUser();
  const [step, setStep] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pendingEmailId, setPendingEmailId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAnonymousUser = Boolean((user as any)?.is_anonymous);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerkUser) return;
    setError(null);
    setIsLoading(true);

    try {
      const emailAddress = await clerkUser.createEmailAddress({ email });
      await emailAddress.prepareVerification({ strategy: "email_code" });
      setPendingEmailId(emailAddress.id);
      setStep("verify");
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || err?.message || "Could not send verification email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerkUser || !pendingEmailId) return;
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const emailAddress = clerkUser.emailAddresses.find((e) => e.id === pendingEmailId);
      if (!emailAddress) {
        throw new Error("Verification email not found — please try again.");
      }

      await emailAddress.attemptVerification({ code });
      await clerkUser.update({ primaryEmailAddressId: emailAddress.id });
      await clerkUser.updatePassword({ newPassword: password });

      const response = await fetch("/api/auth/complete-guest-conversion", { method: "POST" });
      if (!response.ok) {
        throw new Error("Could not finalize account conversion");
      }

      setSuccess("Your account is now permanent — your progress is saved!");
      onSuccess?.();
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || err?.message || "An unexpected error occurred");
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

        {step === "email" ? (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Create Your Free Account</h3>
            <form onSubmit={handleSendCode} className="space-y-4">
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

              <Button type="submit" disabled={isLoading || !email} className="w-full">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Code...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Send Verification Code
                  </div>
                )}
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Verify Your Email & Set a Password</h3>
            <form onSubmit={handleCompleteConversion} className="space-y-4">
              <div>
                <label htmlFor="code" className="text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Check your email"
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
                  minLength={8}
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
                  minLength={8}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !code || !password || !confirmPassword}
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
        )}

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
