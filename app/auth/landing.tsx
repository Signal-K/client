import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Microscope, Users, Book, Menu, Github, Linkedin, Instagram, Twitter, PaintBucket } from "lucide-react";

const teamMembers = [
    {
      img: "Eric.jpg",
      name: "L. R. Arbuckle",
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
  
  const partners = [
    {
      logo: "/d.jpg",
      name: "DeSci Labs",
      description: "Star Sailors is proud to use and contribute to the DeSci Nodes platform for publishing scientific data.",
      url: "https://descilabs.com",
    },
    {
      logo: "/orc.webp",
      name: "ORCID",
      description: "Star Sailors allows users to link their discoveries with their ORCID profile.",
      url: "https://ORCID.com",
    },
    // {
    //   logo: "https://rsv.org.au/wp-content/uploads/%E2%80%A2RSV-Logo-Final-Type-Small.jpg",
    //   name: "Royal Society of Victoria",
    //   description: "Star Sailors is proudly supported by the RSV",
    //   url: "https://rsv.org.au",
    // },
  ];

export default function LandingSS() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <header className="border-b-4 border-black bg-[#FDFBF7] py-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-400 p-2 rounded-md border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Microscope className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold">Star Sailors</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              {["Open-Source"].map((item) => (
                <Link
                  key={item}
                  href="https://github.com/signal-k"
                  className="text-sm font-medium bg-blue-500 px-4 py-2 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[2px] hover:shadow-none transition-all"
                >
                  {item}
                </Link>
              ))}
            </nav>
            <Button
              variant="outline"
              className="md:hidden border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[2px] transition-all hover:shadow-none"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#FDFBF7] py-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute h-64 w-64 border-4 border-aqua-400 rounded-full -left-12 -top-12 opacity-10" />
          <div className="absolute h-96 w-96 border-4 border-yellow-400 rounded-full right-0 bottom-0 opacity-10" />
          <div className="absolute h-32 w-32 bg-aqua-200 rotate-45 right-1/4 top-1/4" />
        </div>
        <div className="container relative z-10 mx-auto px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block rotate-2">
                <Badge className="bg-yellow-400 text-black hover:bg-yellow-500 text-md px-6 py-2 rounded-md transform -rotate-2 transition-transform hover:rotate-0">
                  New content every week
                </Badge>
              </div>
              <h1 className="text-5xl font-bold tracking-tight lg:text-7xl text-gray-900 [text-shadow:_2px_2px_0_rgb(0_0_0_/_20%)]">
                Actively contribute to science
              </h1>
              <p className="text-xl text-gray-600">
                Discover the world around you and contribute to real scientific research in Star Sailors
              </p>
              <div className="flex flex-wrap gap-6">
                <Link href="https://starsailors.space/auth">
                    <Button
                        size="lg"
                        className="bg-blue-300 text-white hover:bg-aqua-400 hover:translate-y-[-2px] hover:translate-x-[2px] text-lg px-8 py-6 rounded-md border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-none"
                    >   
                        Login
                    </Button>
                </Link>
                {/* <Button
                  size="lg"
                  variant="outline"
                  className="bg-[#FDFBF7] text-black hover:bg-[#FDFBF7] hover:translate-y-[-2px] hover:translate-x-[2px] text-lg px-8 py-6 rounded-md border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-none"
                >
                  View Discoveries
                </Button> */}
              </div>
            </div>
            <div className="relative aspect-square">
              <div className="absolute inset-0 rounded-2xl bg-white/50 backdrop-blur-sm border-4" />
              <Image
                src="/Planet.png"
                alt="Game Screenshot"
                width={800}
                height={1000}
                className="rounded-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>



      {/* About Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-bold">About Star Sailors</h2>
              <p className="mt-6 text-xl text-gray-600">
                The ability to contribute to science shouldn't require a university degree and a JSTOR account. Star Sailors works with partners like DeSci Labs, 
                ORCID, and the Royal Society of Victoria to give our users opportunities to meaningfully impact the scientific industry. It's 100% free & open-source. And it always will be.
              </p>
              <div className="mt-8 grid gap-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-aqua-100 p-3">
                    <Users className="h-6 w-6 text-aqua-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">In active development</h3>
                    <p className="mt-2 text-gray-600">We've provided weekly updates to SS since 2022.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-aqua-100 p-3">
                    <Book className="h-6 w-6 text-aqua-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Sandbox gameplay</h3>
                    <p className="mt-2 text-gray-600">Contribute to any projects, in any order, at any time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <h3 className="text-2xl font-bold text-center">Technical Team</h3>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 justify-center">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-gray-100 p-6 rounded-lg flex flex-col items-center text-center shadow-md">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-black">
                <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-semibold mt-4">{member.name}</h3>
              <p className="text-gray-500">{member.role}</p>
              <p className="text-sm text-gray-700 mt-2">{member.bio}</p>
              <div className="mt-3 flex space-x-3">
                {member.social.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50 text-gray-900">
  <h3 className="text-2xl font-bold text-center">Our Partners</h3>
  <div className="mt-8 flex flex-wrap justify-center gap-8">
    {partners.map((partner, index) => (
      <Card
        key={index}
        className="max-w-xs p-6 flex flex-col items-center text-center border border-gray-300 shadow-md bg-white rounded-lg"
      >
        <Image
          src={partner.logo}
          alt={partner.name}
          width={100}
          height={100}
          className="rounded-lg"
        />
        <h3 className="text-lg font-semibold mt-4 text-gray-900">{partner.name}</h3>
        <p className="text-sm text-gray-700 mt-2">{partner.description}</p>
        {/* <Link href={partner.url} className="mt-4 text-blue-500 hover:underline">
          Learn More
        </Link> */}
      </Card>
    ))}
  </div>
</section>

      {/* Screenshots */}
      {/* <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center">Game Screenshots</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="overflow-hidden rounded-xl">
                <Image
                  src="/placeholder.svg?height=300&width=400"
                  alt={`Screenshot ${i}`}
                  width={400}
                  height={300}
                  className="hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2">
                <Microscope className="h-6 w-6" />
                <span className="text-lg font-bold">Star Sailors</span>
              </div>
              <p className="mt-4 text-gray-400">
                Making scientific discovery & contribution accessible to everyone.
              </p>
            </div>
            <div>
              <h3 className="font-bold">Resources</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="https://zooniverse.org" className="text-gray-400 hover:text-white">
                    Data Sources
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold">Community</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="https://github.com/signal-k/client" className="disabled text-gray-400 hover:text-white">
                    {/* Discord */}
                    <PaintBucket />
                  </Link>
                </li>
                <li>
                  <Link href="https://twitter.com/TheMrScrooby" className="text-gray-400 hover:text-white">
                    <Twitter />
                  </Link>
                </li>
                <li>
                  <Link href="https://github.com/gizmotronn" className="text-gray-400 hover:text-white">
                    <Github /> 
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold">Stay Updated</h3>
              <div className="mt-4 flex gap-2">
                <Input type="email" placeholder="Enter your email" className="bg-gray-800 border-gray-700" />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2021 - {new Date().getFullYear()}. Star Sailors - built in Melbourne</p>
          </div>
        </div>
      </footer>
    </div>
  );
};


{/* News Section */}
{/* <section className="py-20">
<div className="container mx-auto px-6">
    <div className="mb-12 text-center">
    <h2 className="text-4xl font-bold">Latest News</h2>
    <p className="mt-4 text-xl text-gray-600">
        Stay updated with our latest discoveries and community achievements
    </p>
    </div>
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3].map((i) => (
        <Card
        key={i}
        className="overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] hover:translate-x-[4px] hover:shadow-none transition-all"
        >
        <div className="aspect-video relative">
            <Image
            src="/placeholder.svg?height=300&width=400"
            alt="News Image"
            width={400}
            height={300}
            className="object-cover"
            />
        </div>
        <div className="p-6">
            <Badge>News</Badge>
            <h3 className="mt-4 text-xl font-bold">New Galaxy Cluster Discovered by Players</h3>
            <p className="mt-2 text-gray-600">
            Our community has identified a previously unknown galaxy cluster...
            </p>
            <Button variant="link" className="mt-4 p-0">
            Read More →
            </Button>
        </div>
        </Card>
    ))}
    </div>
</div>
</section> */}