import Link from 'next/link';

export function Landing() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-nord-surface text-nord-frost dark:bg-nord-surface dark:text-nord-frost">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b border-nord-2 dark:border-nord-3">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <RocketIcon className="h-6 w-6 text-nord-4 dark:text-nord-5" />
          <span className="sr-only">Star Sailors</span>
        </Link>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 md:px-6 py-12 md:py-24 lg:py-32">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter text-nord-4 dark:text-nord-6 sm:text-5xl md:text-6xl">
            Star Sailors
          </h1>
          <p className="text-nord-3 dark:text-nord-5 md:text-xl">
            Explore the cosmos & catalogue discoveries in different scientific disciplines
          </p>
          <div className='py-5'><img src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/media/garden.png" alt="App screenshot" width="2432" height="1442" className="rounded-md shadow-2xl ring-1 ring-gray-900/10" /></div>
          <Link
            href="/auth"
            className="inline-flex h-10 items-center justify-center rounded-md bg-nord-4 px-8 text-sm font-medium shadow transition-colors hover:bg-nord-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nord-5 disabled:pointer-events-none disabled:opacity-50"
            prefetch={false}
          >
            Login & Signup
          </Link>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-nord-4 dark:text-nord-6">Connect</h3>
            <Link href="https://threads.net/droidology" className="flex items-center gap-2 hover:underline text-nord-3 dark:text-nord-5" prefetch={false}>
              <MicroscopeIcon className="h-5 w-5 text-nord-3 dark:text-nord-5" />
              Threads
            </Link>
            <Link href="https://github.com/signal-k" className="flex items-center gap-2 hover:underline text-nord-3 dark:text-nord-5" prefetch={false}>
              <CodeIcon className="h-5 w-5 text-nord-3 dark:text-nord-5" />
              Github
            </Link>
            <Link href="https://github.com/signal-k/manuscript" className="flex items-center gap-2 hover:underline text-nord-3 dark:text-nord-5" prefetch={false}>
              <FilesIcon className="h-5 w-5 text-nord-3 dark:text-nord-5" />
              Documentation
            </Link>
          </div>
        </div>
        
      </main>
      {/* <section className="w-full py-12 md:py-24 lg:py-32 bg-nord-1 dark:bg-nord-2">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-nord-3 text-nord-5 px-3 py-1 text-sm dark:bg-nord-4 dark:text-nord-surface">
                Citizen Science
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-nord-4 dark:text-nord-6">
                Explore the Cosmos, Contribute to Science
              </h2>
              <p className="text-nord-3 dark:text-nord-5 md:text-xl">
                Our game allows you to explore the wonders of the universe while contributing to real scientific
                research. Help astronomers classify galaxies, discover exoplanets, and more.
              </p>
            </div>
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-nord-3 text-nord-5 px-3 py-1 text-sm dark:bg-nord-4 dark:text-nord-surface">
                Game Features
              </div>
              <ul className="grid gap-4">
                <li className="flex items-start gap-3">
                  <TelescopeIcon className="h-6 w-6 text-nord-4 dark:text-nord-5" />
                  <div>
                    <h3 className="text-lg font-bold">Explore the Universe</h3>
                    <p className="text-nord-3 dark:text-nord-5">
                      Discover new galaxies, exoplanets, and other celestial wonders.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MicroscopeIcon className="h-6 w-6 text-nord-4 dark:text-nord-5" />
                  <div>
                    <h3 className="text-lg font-bold">Contribute to Science</h3>
                    <p className="text-nord-3 dark:text-nord-5">
                      Help scientists by classifying galaxies, identifying exoplanets, and more.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <BadgeIcon className="h-6 w-6 text-nord-4 dark:text-nord-5" />
                  <div>
                    <h3 className="text-lg font-bold">Compete and Earn</h3>
                    <p className="text-nord-3 dark:text-nord-5">
                      Climb the leaderboard and earn rewards for your contributions.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section> */}
      {/* <footer className="w-full py-12 md:py-24 lg:py-32 border-t border-nord-2 dark:border-nord-3">
        <div className="container px-4 md:px-6 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-nord-4 dark:text-nord-6">Connect</h3>
            <Link href="https://twitter.com/TheMrScrooby" className="flex items-center gap-2 hover:underline text-nord-3 dark:text-nord-5" prefetch={false}>
              <TwitterIcon className="h-5 w-5 text-nord-3 dark:text-nord-5" />
              Twitter
            </Link>
            <Link href="https://github.com/signal-k" className="flex items-center gap-2 hover:underline text-nord-3 dark:text-nord-5" prefetch={false}>
              <CodeIcon className="h-5 w-5 text-nord-3 dark:text-nord-5" />
              Github
            </Link>
            <Link href="https://github.com/signal-k/manuscript" className="flex items-center gap-2 hover:underline text-nord-3 dark:text-nord-5" prefetch={false}>
              <FilesIcon className="h-5 w-5 text-nord-3 dark:text-nord-5" />
              Documentation
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-nord-4 dark:text-nord-6">Contribute</h3>
            <Link href="#" className="flex items-center gap-2 hover:underline text-nord-3 dark:text-nord-5" prefetch={false}>
              
              GitHub
            </Link>
            <Link href="#" className="flex items-center gap-2 hover:underline text-nord-3 dark:text-nord-5" prefetch={false}>
              <FilesIcon className="h-5 w-5 text-nord-3 dark:text-nord-5" />
              Documentation
            </Link>
            <Link href="#" className="flex items-center gap-2 hover:underline text-nord-3 dark:text-nord-5" prefetch={false}>
              <CodeIcon className="h-5 w-5 text-nord-3 dark:text-nord-5" />
              Source Code
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-nord-4 dark:text-nord-6">Company</h3>
            <Link href="#" className="text-nord-3 dark:text-nord-5 hover:underline" prefetch={false}>
              About Us
            </Link>
            <Link href="#" className="text-nord-3 dark:text-nord-5 hover:underline" prefetch={false}>
              Careers
            </Link>
            <Link href="#" className="text-nord-3 dark:text-nord-5 hover:underline" prefetch={false}>
              Privacy Policy
            </Link>
            <Link href="#" className="text-nord-3 dark:text-nord-5 hover:underline" prefetch={false}>
              Terms of Service
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-nord-4 dark:text-nord-6">Support</h3>
            <Link href="#" className="text-nord-3 dark:text-nord-5 hover:underline" prefetch={false}>
              FAQ
            </Link>
            <Link href="#" className="text-nord-3 dark:text-nord-5 hover:underline" prefetch={false}>
              Contact Support
            </Link>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

function BadgeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    </svg>
  )
}


function BookIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}


function CodeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}


function DiscIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}


function FileQuestionIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 17h.01" />
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
      <path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3" />
    </svg>
  )
}


function FilesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 7h-3a2 2 0 0 1-2-2V2" />
      <path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z" />
      <path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8" />
    </svg>
  )
}


function GitlabIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 13.29-3.33-10a.42.42 0 0 0-.14-.18.38.38 0 0 0-.22-.11.39.39 0 0 0-.23.07.42.42 0 0 0-.14.18l-2.26 6.67H8.32L6.1 3.26a.42.42 0 0 0-.1-.18.38.38 0 0 0-.26-.08.39.39 0 0 0-.23.07.42.42 0 0 0-.14.18L2 13.29a.74.74 0 0 0 .27.83L12 21l9.69-6.88a.71.71 0 0 0 .31-.83Z" />
    </svg>
  )
}


function MailIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}


function MapIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
      <path d="M15 5.764v15" />
      <path d="M9 3.236v15" />
    </svg>
  )
}


function MicroscopeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 18h8" />
      <path d="M3 22h18" />
      <path d="M14 22a7 7 0 1 0 0-14h-1" />
      <path d="M9 14h2" />
      <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
      <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
    </svg>
  )
}


function PhoneIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}


function RocketIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  )
}


function RssIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" />
    </svg>
  )
}


function TelescopeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44" />
      <path d="m13.56 11.747 4.332-.924" />
      <path d="m16 21-3.105-6.21" />
      <path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z" />
      <path d="m6.158 8.633 1.114 4.456" />
      <path d="m8 21 3.105-6.21" />
      <circle cx="12" cy="13" r="2" />
    </svg>
  )
}


function TwitterIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}
