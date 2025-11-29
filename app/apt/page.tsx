"use client"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Rocket, Users, Star, Globe, ExternalLink, Calendar, ArrowRight, Github, Linkedin, Instagram, Mail, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getRecentDiscoveries, getDiscoveryTypeLabel, getDiscoveryDescription, Classification } from "@/lib/discoveries"
import { usePostHog } from 'posthog-js/react'

const teamMembers = [
  { 
    img: "Eric.jpg",
    name: "Liam Arbuckle",
    role: "Technical Lead",
    bio: "Full stack engineer with a background in mathematics and decentralised science.",
    social: [
      { platform: "Github", url: "https://github.com/gizmotronn", icon: <Github /> },
      { platform: "Linkedin", url: "https://www.linkedin.com/in/l-arbuckle/", icon: <Linkedin /> },
    ],
  },
  {
    img: "Campbells.jpg",
    name: "Rhys Campbell",
    role: "Machine Learning Specialist",
    bio: "Passionate open-source contributor & the brains behind MATR AI.",
    social: [
      { platform: "Github", url: "https://github.com/Rhysmalcolm13", icon: <Github /> },
      { platform: "Linkedin", url: "https://www.linkedin.com/in/rhys-campbell-96a196294/", icon: <Linkedin /> },
    ],
  },
  {
    img: "Fred.webp",
    name: "Bruce Chooser",
    role: "UX Designer",
    bio: "Cybersecurity consultant and creator of all things audio-visual.",
    social: [
      { platform: "Instagram", url: "https://instagram.com/choose_bruce", icon: <Instagram /> },
    ],
  },
];

export default function Landing() {
  const posthog = usePostHog();
  const [discoveries, setDiscoveries] = useState<Classification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    posthog?.capture('landing_page_viewed');
  }, [posthog]);

  useEffect(() => {
    async function fetchDiscoveries() {
      try {
        const data = await getRecentDiscoveries()
        setDiscoveries(data)
      } catch (error) {
        console.error('Failed to fetch discoveries:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiscoveries()
  }, [])
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Star Sailors</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => posthog?.capture('nav_clicked', { section: 'about' })}>
              About
            </a>
            <a href="#media" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => posthog?.capture('nav_clicked', { section: 'media' })}>
              Media
            </a>
            <a href="#news" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => posthog?.capture('nav_clicked', { section: 'news' })}>
              News
            </a>
            <a href="#team" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => posthog?.capture('nav_clicked', { section: 'team' })}>
              Team
            </a>
          </nav>
          
          {/* Desktop CTA */}
          <Link href="/auth" className="hidden md:block">
            <Button size="default" className="font-semibold rounded-full" style={{ borderRadius: '9999px' }} onClick={() => posthog?.capture('cta_header_clicked', { button_text: 'Play Now' })}>
              Play Now
            </Button>
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              posthog?.capture('mobile_menu_toggled', { is_open: !mobileMenuOpen });
            }}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-lg">
            <nav className="flex flex-col px-6 py-4 space-y-4">
              <a 
                href="#about" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a 
                href="#media" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Media
              </a>
              <a 
                href="#news" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                News
              </a>
              <a 
                href="#team" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Team
              </a>
              <Link href="/auth" className="pt-2">
                <Button className="w-full font-semibold rounded-full" style={{ borderRadius: '9999px' }}>
                  Play Now
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Subtle radial gradient for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          {/* More prominent badge with eye-catching color */}
          <div className="inline-flex items-center justify-center mb-6">
            <Badge className="bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30 hover:bg-amber-400/30 transition-all px-4 py-1.5 text-sm font-medium shadow-sm">
              🚀 Browser-Based Citizen Science
            </Badge>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
            Explore the Universe,
            <br />
            <span className="text-foreground">Advance Science</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty leading-relaxed">
            Join citizen scientists discovering exoplanets, classifying galaxies, and advancing astronomy.
          </p>
          
          {/* More prominent CTA button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth">
              <Button 
                size="lg" 
                className="text-lg font-semibold group rounded-full"
                style={{ borderRadius: '9999px' }}
                onClick={() => posthog?.capture('cta_hero_clicked', { button_text: 'Start Exploring Now' })}
              >
                <Rocket className="w-5 h-5 mr-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                Start Exploring Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {/* Social proof / quick stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Weekly feature updates</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>100% browser-based</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Real scientific impact</span>
            </div>
          </div>
        </div>
      </section>

      {/* Media Section */}
      <section id="media" className="py-20 px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border border-primary/20">Featured Missions</Badge>
            <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Explore the Cosmos</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Interactive experiences that bring the universe to your screen.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group overflow-hidden bg-card border-border hover:shadow-lg transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                <img
                  src="/assets/Images/landing1.jpg"
                  alt="Solar Health & Sunspots"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <CardHeader>
                <CardTitle className="text-card-foreground">Solar Health & Sunspots</CardTitle>
                <CardDescription>Monitor solar activity and identify sunspots.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="group overflow-hidden bg-card border-border hover:shadow-lg transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-to-br from-secondary/20 to-accent/20 relative overflow-hidden">
                <img
                  src="/assets/Images/landing2.jpg"
                  alt="Finding Planets"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <CardHeader>
                <CardTitle className="text-card-foreground">Finding Planets</CardTitle>
                <CardDescription>Discover exoplanets in distant star systems.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="group overflow-hidden bg-card border-border hover:shadow-lg transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-to-br from-accent/20 to-primary/20 relative overflow-hidden">
                <img
                  src="/assets/Images/landing3.jpg"
                  alt="Finding Comets"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <CardHeader>
                <CardTitle className="text-card-foreground">Finding Comets</CardTitle>
                <CardDescription>Track and identify comets in our solar system.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="group overflow-hidden bg-card border-border hover:shadow-lg transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                <img
                  src="/assets/Images/landing4.jpg"
                  alt="Finding Asteroids"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <CardHeader>
                <CardTitle className="text-card-foreground">Finding Asteroids</CardTitle>
                <CardDescription>Detect and catalog near-Earth asteroids.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="group overflow-hidden bg-card border-border hover:shadow-lg transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-to-br from-secondary/20 to-accent/20 relative overflow-hidden">
                <img
                  src="/assets/Images/landing5.jpg"
                  alt="Mars Rover Training"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <CardHeader>
                <CardTitle className="text-card-foreground">Mars Rover Training</CardTitle>
                <CardDescription>Train rovers to navigate Martian terrain safely.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="group overflow-hidden bg-card border-border hover:shadow-lg transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-to-br from-accent/20 to-primary/20 relative overflow-hidden">
                <img
                  src="/assets/Images/landing6.jpg"
                  alt="Mars Dust Storms"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <CardHeader>
                <CardTitle className="text-card-foreground">Mars Dust Storms</CardTitle>
                <CardDescription>Track and analyze dust storms on Mars.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20">Community Highlights</Badge>
            <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Latest Discoveries</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Recent discoveries made by our community of citizen scientists
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeleton cards
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4" />
                      <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                    </div>
                    <div className="h-6 bg-muted rounded animate-pulse w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
                  </CardContent>
                </Card>
              ))
            ) : discoveries.length > 0 ? (
              discoveries.slice(0, 3).map((discovery) => (
                <Card key={discovery.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(discovery.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <CardTitle className="text-card-foreground">
                      {getDiscoveryTypeLabel(discovery.classificationtype)}
                    </CardTitle>
                    <CardDescription>
                      {getDiscoveryDescription(discovery.classificationtype, discovery.content)}
                    </CardDescription>
                    {discovery.profiles && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Discovered by {discovery.profiles.username || discovery.profiles.full_name || 'Anonymous'}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Link href={`/posts/${discovery.id}`}>
                      <Button 
                        variant="ghost" 
                        className="p-0 h-auto text-primary hover:text-primary/80"
                        onClick={() => posthog?.capture('discovery_card_clicked', {
                          discovery_id: discovery.id,
                          discovery_type: discovery.classificationtype,
                        })}
                      >
                        Read More <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback cards when no discoveries are found
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4" />
                    Coming Soon
                  </div>
                  <CardTitle className="text-card-foreground">New Discoveries Loading</CardTitle>
                  <CardDescription>Recent citizen science discoveries will appear here.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="p-0 h-auto text-primary hover:text-primary/80" disabled>
                    Coming Soon <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <section id="team" className="py-20 px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border border-primary/20">Meet the Crew</Badge>
            <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Technical Team</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The passionate individuals building the future of citizen science
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="bg-card border-border text-center">
                <CardHeader>
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <img
                      src={`/${member.img}`}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <CardTitle className="text-card-foreground">{member.name}</CardTitle>
                  <CardDescription className="mb-2">{member.role}</CardDescription>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center gap-2">
                    {member.social.map((social, socialIndex) => (
                      <Button
                        key={socialIndex}
                        variant="ghost"
                        size="sm"
                        className="p-2"
                        onClick={() => window.open(social.url, '_blank')}
                      >
                        {social.icon}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Links Section */}
      {/* <section id="links" className="py-16 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Join Our Community</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Connect with fellow scientists and access resources.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">Community Forum</CardTitle>
                <CardDescription>Discuss discoveries and get help.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                >
                  Visit Forum <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">Documentation</CardTitle>
                <CardDescription>Learn the science behind each task.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                >
                  Read Docs <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">Research Papers</CardTitle>
                <CardDescription>Published research from community work.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                >
                  View Papers <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">API Access</CardTitle>
                <CardDescription>Build complementary tools and apps.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                >
                  API Docs <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      {/* Final CTA Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30">
            Ready to Start?
          </Badge>
          <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Begin Your Journey Today
          </h3>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            No downloads, no waiting. Start contributing to real science in seconds.
          </p>
          <Link href="/auth">
            <Button 
              size="lg" 
              className="text-lg font-semibold group rounded-full"
              style={{ borderRadius: '9999px' }}
            >
              <Rocket className="w-5 h-5 mr-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              Launch Star Sailors
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/50 border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">Star Sailors</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Advancing astronomy through citizen science and community collaboration.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Game</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                    Play Now
                  </a>
                </li>
                <li>
                  <a href="https://github.com/signal-k/deepdock" className="text-muted-foreground hover:text-foreground transition-colors">
                    Upcoming features
                  </a>
                </li>
                {/* <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Leaderboard
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Achievements
                  </a>
                </li> */}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Community</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://github.com/signal-k" className="text-muted-foreground hover:text-foreground transition-colors">
                    Github
                  </a>
                </li>
                <li>
                  <a href="https://github.com/signal-k/client" className="text-muted-foreground hover:text-foreground transition-colors">
                    Codebase
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com/TheMrScrooby" className="text-muted-foreground hover:text-foreground transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Newsletter
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="https://github.com/signal-k/sytizen" className="text-muted-foreground hover:text-foreground transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="mailto:liam@skinetics.tech" className="text-muted-foreground hover:text-foreground transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Star Sailors. Designed in Melbourne, built for the world.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};