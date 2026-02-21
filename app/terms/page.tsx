"use client";

import { Scale, Users, Shield, CheckCircle, Globe } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
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
            <Scale className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Terms of Service</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Welcome to the Star Sailors community! These terms help us maintain a respectful, 
            scientific environment where everyone can contribute to real space exploration and discovery.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Effective: February 19, 2026
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Applies to all users
            </span>
          </div>
        </div>

        {/* Quick Overview */}
        <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <h2 className="text-xl font-semibold text-primary">Community Guidelines Summary</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-card/50 rounded-lg border border-green-200/30">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">Be Respectful</h3>
              <p className="text-xs text-muted-foreground">
                Treat fellow explorers with kindness and scientific curiosity
              </p>
            </div>
            <div className="text-center p-4 bg-card/50 rounded-lg border border-blue-200/30">
              <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">Stay Scientific</h3>
              <p className="text-xs text-muted-foreground">
                Keep content factual, educational, and research-focused
              </p>
            </div>
            <div className="text-center p-4 bg-card/50 rounded-lg border border-purple-200/30">
              <Globe className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">Follow Laws</h3>
              <p className="text-xs text-muted-foreground">
                Comply with applicable laws and platform policies
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Acceptance */}
          <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">🤝 Agreement to Terms</h2>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                By creating an account or using Star Sailors, you agree to these Terms of Service and our 
                Privacy Policy. If you don't agree with any part of these terms, please don't use our platform.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🔬 Our Mission</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Star Sailors is a citizen science platform that connects space enthusiasts with real 
                  astronomical research. Your contributions help scientists discover new planets, asteroids, 
                  and cosmic phenomena. These terms ensure our community remains focused on this important work.
                </p>
              </div>
            </div>
          </div>

          {/* Code of Conduct */}
          <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">👥 Community Code of Conduct</h2>
            
            <div className="space-y-6">
              {/* What We Encourage */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">✅ We Encourage</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• <strong>Scientific discussion</strong> about your discoveries</p>
                    <p>• <strong>Helpful comments</strong> that improve data quality</p>
                    <p>• <strong>Educational content</strong> about astronomy and space</p>
                    <p>• <strong>Constructive questions</strong> about observations</p>
                    <p>• <strong>Collaborative research</strong> with other users</p>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• <strong>Sharing knowledge</strong> and learning from others</p>
                    <p>• <strong>Reporting bugs</strong> or suggesting improvements</p>
                    <p>• <strong>Celebrating discoveries</strong> made by community members</p>
                    <p>• <strong>Following scientific methods</strong> in classifications</p>
                    <p>• <strong>Respectful disagreement</strong> backed by evidence</p>
                  </div>
                </div>
              </div>

              {/* What We Don't Allow */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3">❌ Prohibited Content & Behavior</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• <strong>Harassment or bullying</strong> of any kind</p>
                    <p>• <strong>Hate speech</strong> based on identity or beliefs</p>
                    <p>• <strong>Spam or irrelevant content</strong> unrelated to astronomy</p>
                    <p>• <strong>False or misleading</strong> scientific information</p>
                    <p>• <strong>Personal attacks</strong> on other users</p>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• <strong>Inappropriate sexual content</strong> or imagery</p>
                    <p>• <strong>Violent or threatening</strong> language</p>
                    <p>• <strong>Copyright infringement</strong> or plagiarism</p>
                    <p>• <strong>Deliberate misinformation</strong> or conspiracy theories</p>
                    <p>• <strong>Commercial advertising</strong> without permission</p>
                  </div>
                </div>
              </div>

              {/* Consequences */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Enforcement</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  We reserve the right to remove content or suspend accounts that violate these guidelines. 
                  Our approach is always educational first:
                </p>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <p>1. <strong>First offense:</strong> Warning and education about community standards</p>
                  <p>2. <strong>Repeated issues:</strong> Temporary suspension with explanation</p>
                  <p>3. <strong>Severe violations:</strong> Permanent account suspension</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Content & Rights */}
          <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">📝 Your Content & Our Rights</h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-foreground mb-2">Content You Create</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• You retain ownership of comments, classifications, and other content you create</li>
                  <li>• You're responsible for ensuring your content is accurate and appropriate</li>
                  <li>• You grant us permission to display, store, and use your content within the platform</li>
                  <li>• Your scientific contributions may be included in research datasets (anonymized)</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-foreground mb-2">Platform Rights</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• We can moderate, edit, or remove content that violates these terms</li>
                  <li>• We may use your contributions for scientific research and publication</li>
                  <li>• We can improve our algorithms using anonymized user interaction data</li>
                  <li>• We reserve the right to suspend accounts for terms violations</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">🌟 Research Contributions</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your discoveries and classifications contribute to real scientific research! When your work 
                  is included in research papers or datasets, you'll be credited as part of the Star Sailors 
                  community. Individual contributors may be acknowledged in major discoveries.
                </p>
              </div>
            </div>
          </div>

          {/* Platform Usage */}
          <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">🛠️ Platform Usage & Restrictions</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-card/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    Acceptable Use
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Use the platform for its intended scientific purpose</li>
                    <li>• Make good faith efforts to classify accurately</li>
                    <li>• Respect other users and their contributions</li>
                    <li>• Report bugs and technical issues responsibly</li>
                    <li>• Follow all applicable laws and regulations</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-card/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="text-lg">❌</span>
                    Prohibited Activities
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Attempting to hack, exploit, or break the platform</li>
                    <li>• Creating multiple accounts to manipulate results</li>
                    <li>• Automated classification without explicit permission</li>
                    <li>• Selling or transferring your account to others</li>
                    <li>• Interfering with other users' ability to use the platform</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Requirements */}
          <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">⚖️ Legal Requirements & Disclaimers</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3">🌍 Compliance with Laws</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  By using Star Sailors, you agree to comply with all applicable laws, including:
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p>• International copyright and intellectual property laws</p>
                    <p>• Local data protection and privacy regulations</p>
                    <p>• Content moderation and community standards</p>
                  </div>
                  <div>
                    <p>• Export control and scientific data sharing rules</p>
                    <p>• Terms of service for third-party integrations</p>
                    <p>• Platform-specific policies (Google Cloud Platform, etc.)</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">⚠️ Service Disclaimers</h3>
                <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                  <p>• Star Sailors is provided "as is" without warranties of any kind</p>
                  <p>• We don't guarantee the accuracy of astronomical data or user classifications</p>
                  <p>• The platform may experience downtime, data loss, or technical issues</p>
                  <p>• Scientific results are subject to peer review and may change over time</p>
                  <p>• We're not liable for decisions made based on platform data</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📋 Google Cloud Platform Compliance</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Star Sailors operates on Google Cloud Platform and complies with their Acceptable Use Policy. 
                  This includes restrictions on illegal content, harassment, and technical abuse. Content that 
                  violates Google's policies may result in service suspension.
                </p>
              </div>
            </div>
          </div>

          {/* Account Termination */}
          <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">🚪 Account Termination</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Your Right to Leave</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• You can delete your account at any time through your profile settings</p>
                  <p>• Account deletion removes or anonymizes personal information from our systems</p>
                  <p>• Your scientific contributions may remain in anonymized research datasets</p>
                  <p>• We'll process deletion requests within a reasonable timeframe, typically within 30 days</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">When We May Suspend Accounts</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Repeated violations of community guidelines</p>
                  <p>• Attempts to harm the platform or other users</p>
                  <p>• Legal requirements or law enforcement requests</p>
                  <p>• Technical security concerns or abuse</p>
                </div>
              </div>
            </div>
          </div>

          {/* Changes & Contact */}
          <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">📞 Questions & Updates</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Have Questions?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  If you have questions about these terms, need to report content, or want to discuss 
                  community guidelines, we're here to help.
                </p>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Email us at: </span>
                    <a href="mailto:liam@skinetics.tech" className="text-primary hover:underline">
                      liam@skinetics.tech
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Terms Updates</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We may update these terms as the platform evolves. We'll notify users of significant 
                  changes and give you time to review them before they take effect.
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

          {/* Footer */}
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                Together, we explore the cosmos responsibly and respectfully.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Link 
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-primary transition"
              >
                Privacy Policy
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
              >
                <span>🚀</span>
                Start Exploring
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
