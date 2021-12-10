"use client";

import { Shield, Mail, Eye, Lock, Users, Globe } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen w-full relative flex justify-center pb-20">
      {/* Background gradient similar to main page */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background/95 to-background/90">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16" />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-primary">Star Sailors</h1>
          </Link>
          <Link 
            href="/"
            className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Back to Mission Control
          </Link>
        </div>
      </div>

      <div className="w-full max-w-4xl px-4 py-6 space-y-8 pt-24 relative z-10">
        {/* Hero Section */}
        <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Privacy & Data Protection</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your privacy is as important to us as protecting the cosmos. Here's exactly what we collect, 
            why we need it, and how we keep your data safe while you explore the universe.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              Last updated: February 19, 2026
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Effective for all Star Sailors
            </span>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <h2 className="text-xl font-semibold text-primary">The Short Version</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-card/50 rounded-lg border border-green-200/30">
              <Mail className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">Email Address</h3>
              <p className="text-xs text-muted-foreground">
                To create your account and send mission updates
              </p>
            </div>
            <div className="text-center p-4 bg-card/50 rounded-lg border border-blue-200/30">
              <Globe className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">Google Profile</h3>
              <p className="text-xs text-muted-foreground">
                Name and profile picture if you sign in with Google
              </p>
            </div>
            <div className="text-center p-4 bg-card/50 rounded-lg border border-purple-200/30">
              <Lock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">Research Data</h3>
              <p className="text-xs text-muted-foreground">
                Your discoveries and classifications to track progress
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* What We Collect */}
          <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">🔍 What Information We Collect</h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-foreground mb-2">Account Information</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Your email address (required for account creation)</li>
                  <li>• Username and display name (chosen by you)</li>
                  <li>• Profile picture (if you upload one or sign in with Google)</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-foreground mb-2">Google Sign-In Data</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  If you choose to sign in with Google, we receive:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Your Google account email address</li>
                  <li>• Your public profile name</li>
                  <li>• Your profile picture (if publicly available)</li>
                  <li>• A unique Google account identifier</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  We don't access your Google Drive, Gmail, or any other Google services.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-foreground mb-2">Research & Discovery Data</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Your planet and asteroid classifications</li>
                  <li>• Comments and measurements you add to discoveries</li>
                  <li>• Progress through research milestones</li>
                  <li>• Structures and equipment you deploy</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Why We Need It */}
          <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">🎯 Why We Need This Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-card/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="text-lg">🚀</span>
                    Core Mission Functions
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Create and maintain your explorer account</li>
                    <li>• Track your research progress and achievements</li>
                    <li>• Show you personalized mission recommendations</li>
                    <li>• Connect your discoveries with the broader research community</li>
                  </ul>
                </div>

                <div className="p-4 bg-card/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="text-lg">📡</span>
                    Communication & Updates
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Send you important mission updates</li>
                    <li>• Notify you about new discoveries in your research areas</li>
                    <li>• Share weekly progress reports (if you opt in)</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-card/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="text-lg">🔬</span>
                    Scientific Integrity
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Ensure all classifications are properly attributed</li>
                    <li>• Maintain data quality for real research contributions</li>
                    <li>• Prevent spam and maintain community standards</li>
                  </ul>
                </div>

                <div className="p-4 bg-card/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    Platform Improvements
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Understand which features are most valuable</li>
                    <li>• Optimize the discovery experience</li>
                    <li>• Debug technical issues you might encounter</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* How We Protect It */}
          <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">🛡️ How We Protect Your Data</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">🔒 Security Measures</h3>
                  <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                    <li>• All data encrypted in transit and at rest</li>
                    <li>• Secure authentication through Supabase</li>
                    <li>• Regular security audits and updates</li>
                    <li>• Access controls and monitoring</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">👥 Access Controls</h3>
                  <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    <li>• Only essential team members can access user data</li>
                    <li>• All access is logged and monitored</li>
                    <li>• No third-party access without your explicit consent</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">🌍 Data Storage</h3>
                  <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                    <li>• Hosted on secure, compliant cloud infrastructure</li>
                    <li>• Regular automated backups</li>
                    <li>• Geographic redundancy for reliability</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">📋 Data Minimization</h3>
                  <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
                    <li>• We only collect what's necessary for the service</li>
                    <li>• Automatic deletion of unnecessary logs</li>
                    <li>• You can delete your account and data anytime</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">🗃️ Data Retention & Deletion</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• We retain account and gameplay records while your account is active.</p>
              <p>• You can request account deletion at any time by contacting support.</p>
              <p>• After deletion requests, we remove or anonymize personal data where legally and technically feasible.</p>
              <p>• Some security logs and compliance records may be retained for a limited period.</p>
            </div>
          </div>

          <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">🔗 Third-Party Services</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Authentication and database infrastructure are provided through Supabase.</p>
              <p>• Optional sign-in may use Google OAuth, subject to Google's policies.</p>
              <p>• Analytics and error monitoring may be used to improve reliability and performance.</p>
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">⚖️ Your Rights & Choices</h2>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3">You have full control over your data:</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">📥 Access & Download</h4>
                    <p className="text-muted-foreground">Request a copy of all your data at any time</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">✏️ Correction</h4>
                    <p className="text-muted-foreground">Update your profile and account information</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">🗑️ Deletion</h4>
                    <p className="text-muted-foreground">Delete your account and all associated data</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">📧 Communication</h4>
                    <p className="text-muted-foreground">Opt out of non-essential emails anytime</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">📊 Public Research Data</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your classifications and discoveries contribute to real scientific research. While your personal 
                  information remains private, your research contributions may be included in anonymized datasets 
                  shared with the scientific community. This helps advance our understanding of the cosmos!
                </p>
              </div>
            </div>
          </div>

          {/* Contact & Changes */}
          <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">📞 Questions & Updates</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Have Questions?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We're here to help! If you have any questions about your privacy, your data, 
                  or how Star Sailors works, don't hesitate to reach out.
                </p>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>Contact us at: </span>
                    <a href="mailto:liam@skinetics.tech" className="text-primary hover:underline">
                      liam@skinetics.tech
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Policy Updates</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We'll notify you if we make significant changes to this privacy policy. 
                  We'll always be transparent about what data we collect and how we use it.
                </p>
                <div className="p-3 bg-card/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Current version:</strong> 1.1 (February 19, 2026)<br />
                    <strong>Next review:</strong> August 2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
