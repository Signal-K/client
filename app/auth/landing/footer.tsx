import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 mb-10 lg:grid-cols-4 mt-16">
          {/* Social Links */}
          <div>
            <h3 className="font-bold text-xl text-gray-300">Connect with us</h3>
            <div className="mt-4 flex space-x-4">
              <a href="#" aria-label="Twitter" className="hover:text-blue-400">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69A4.31 4.31 0 0021.54 4c-.87.52-1.82.89-2.83 1.1a4.28 4.28 0 00-7.29 3.9A12.15 12.15 0 013 5.14a4.28 4.28 0 001.33 5.7c-.68-.02-1.33-.2-1.9-.5v.05a4.29 4.29 0 003.44 4.2c-.6.16-1.23.18-1.86.07a4.29 4.29 0 004 3 8.6 8.6 0 01-5.34 1.84A8.7 8.7 0 013 19.77 12.12 12.12 0 009.3 22c7.44 0 11.5-6.18 11.5-11.5 0-.18 0-.37-.02-.55A8.17 8.17 0 0022.46 6z"/>
                </svg>
              </a>
              <a href="#" aria-label="Discord" className="hover:text-blue-400">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4.58a18.67 18.67 0 00-4.65-1.58 13.2 13.2 0 00-.6 1.18 17.23 17.23 0 00-5.5 0c-.17-.41-.39-.8-.6-1.18A18.67 18.67 0 004 4.58C1.67 8.33.8 12 .8 15.66A11.91 11.91 0 006.9 21.9c.3-.4.56-.83.79-1.26a8.68 8.68 0 01-3.35-1.6 7.1 7.1 0 002.5 1.12 8.82 8.82 0 003.62.3 8.83 8.83 0 003.62-.3 7.1 7.1 0 002.5-1.12 8.67 8.67 0 01-3.35 1.6c.23.43.49.86.79 1.26A11.91 11.91 0 0023.2 15.66c0-3.66-.87-7.33-3.2-11.08z"/>
                </svg>
              </a>
                  {/* GitHub */}
            <a href="https://github.com/your-profile" aria-label="GitHub" className="hover:text-gray-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.744.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.775.418-1.305.76-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.467-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.52 11.52 0 013.003-.404c1.02.005 2.045.138 3.003.404 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.62-5.475 5.92.435.375.81 1.102.81 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            </a>
            {/* Threads */}
            {/* <a href="https://threads.net/your-profile" aria-label="Threads" className="hover:text-gray-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.08c-5.573 0-10.08-4.507-10.08-10.08S6.427 1.92 12 1.92s10.08 4.507 10.08 10.08-4.507 10.08-10.08 10.08z"/>
                <path d="M16.32 12.96c-.48-.24-1.08-.36-1.8-.36-.6 0-1.08.06-1.44.18-.36.12-.66.3-.9.54-.24.24-.42.54-.54.9-.12.36-.18.78-.18 1.26v.54c0 .48.06.9.18 1.26.12.36.3.66.54.9.24.24.54.42.9.54.36.12.78.18 1.26.18.72 0 1.32-.12 1.8-.36v-1.44c-.24.12-.54.18-.9.18-.36 0-.66-.06-.9-.18-.24-.12-.42-.3-.54-.54-.12-.24-.18-.54-.18-.9v-.54c0-.36.06-.66.18-.9.12-.24.3-.42.54-.54.24-.12.54-.18.9-.18.36 0 .66.06.9.18v-1.44z"/>
            </svg>
            </a>
            {/* Bluesky
            <a href="https://bsky.app/profile/your-profile" aria-label="Bluesky" className="hover:text-gray-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.08c-5.573 0-10.08-4.507-10.08-10.08S6.427 1.92 12 1.92s10.08 4.507 10.08 10.08-4.507 10.08-10.08 10.08z"/>
                <path d="M15.6 12c0-.84-.18-1.56-.54-2.16-.36-.6-.84-1.08-1.44-1.44-.6-.36-1.32-.54-2.16-.54-.84 0-1.56.18-2.16.54-.6.36-1.08.84-1.44 1.44-.36.6-.54 1.32-.54 2.16 0 .84.18 1.56.54 2.16.36.6.84 1.08 1.44 1.44.6.36 1.32.54 2.16.54.84 0 1.56-.18 2.16-.54.6-.36 1.08-.84 1.44-1.44.36-.6.54-1.32.54-2.16z"/>
            </svg>
            </a> */}
            </div>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="font-bold text-xl text-gray-300">Stay Updated</h3>
            <div className="mt-4 flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-l-md"
              />
              <button className="px-4 py-2 bg-blue-500 rounded-r-md hover:bg-blue-600">
                Subscribe
              </button>
            </div>
          </div>

          {/* Signup/Login */}
          <div>
            <h3 className="font-bold text-xl text-gray-300">Account</h3>
            <ul className="mt-4 space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-blue-400">Sign Up</Link></li>
              <li><Link href="#" className="hover:text-blue-400">Login</Link></li>
            </ul>
          </div>

          {/* Data Submission */}
          <div>
            <h3 className="font-bold text-xl text-gray-300">Submit Data</h3>
            <p className="mt-4 text-gray-400">
              Contribute datasets and help expand our research.
            </p>
            <button className="mt-4 px-4 py-2 bg-green-500 rounded-md hover:bg-green-600">
              Submit
            </button>
          </div>
        </div>

        {/* Top Section */}

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Branding & About */}
          <div>
            <h2 className="text-2xl font-bold">Star Sailors</h2>
            <p className="mt-4 text-gray-400">
              Making scientific discovery & contribution accessible to everyone.
            </p>
          </div>

          {/* Sitemap */}
          <div>
            <h3 className="font-bold text-xl text-gray-300">Resources</h3>
            <ul className="mt-4 space-y-2 text-gray-400">
              <li>
                <Link href="#" className="hover:text-blue-400">Documentation</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">API Reference</Link>
              </li>
              <li>
                <Link href="https://zooniverse.org" className="hover:text-blue-400">Data Sources</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-xl text-gray-300">Community</h3>
            <ul className="mt-4 space-y-2 text-gray-400">
              <li>
                <Link href="#" className="hover:text-blue-400">Forums</Link>
              </li>
              <li>
                <Link href="https://github.com/signal-k/client" className="hover:text-blue-400">GitHub</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">Contributors</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-xl text-gray-300">Meta</h3>
            <ul className="mt-4 space-y-2 text-gray-400">
              <li>
                <Link href="#" className="hover:text-blue-400">Release history</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">Development log</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">Suggestions</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>© 2021 - {new Date().getFullYear()}. Star Sailors - built in Melbourne</p>
        </div>
      </div>
    </footer>
  );
};