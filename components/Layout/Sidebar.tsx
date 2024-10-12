import Link from 'next/link';
import { Rocket, User, Globe, List } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 bg-card h-screen p-4 flex flex-col">
      <h1 className="text-2xl font-bold text-primary mb-8">CitizenScience</h1>
      <nav className="flex-1">
        <ul className="space-y-4">
          <li>
            <Link href="/" className="flex items-center text-primary hover:text-primary/80">
              <Rocket className="w-5 h-5 mr-2" />
              Home
            </Link>
          </li>
          <li>
            <Link href="/discoveries" className="flex items-center text-primary hover:text-primary/80">
              <Globe className="w-5 h-5 mr-2" />
              Discoveries
            </Link>
          </li>
          <li>
            <Link href="/missions" className="flex items-center text-primary hover:text-primary/80">
              <List className="w-5 h-5 mr-2" />
              Missions
            </Link>
          </li>
          <li>
            <Link href="/profile" className="flex items-center text-primary hover:text-primary/80">
              <User className="w-5 h-5 mr-2" />
              Profile
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};