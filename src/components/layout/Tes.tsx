"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"
import { Bell, ChevronDown, HammerIcon, LogOut, Settings, Star, Trophy, User, X, Zap } from "lucide-react"
import { formatDistanceToNow, startOfDay, addDays } from "date-fns"
import { Avatar, AvatarGenerator } from "../profile/setup/Avatar";
import { Moon, Sun } from "lucide-react"
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/src/components/ui/sheet"
import { Menu, Transition } from "@headlessui/react"
import TotalPoints from "../deployment/missions/structures/Stardust/Total"
import { MissionsPopover } from "./Navigation/MissionDropdown"
// import AlertsDropdown from "./Navigation/AlertsDropdown"
import { StardustDropdown } from "./Navigation/StardustDropdown"
import { LocationsDropdown } from "./Navigation/LocationsDropdown"
import TechnologyPopover, { TechnologySection } from "./Navigation/TechTreeDropdown"
import { useRouter } from "next/navigation"
import ResponsiveAlerts from "./Navigation/AlertsDropdown"

// Sample data - replace with actual data in your implementation
const techTree = [
  { id: 1, name: "Cameras", level: 1, maxLevel: 5, progress: 10 },
  { id: 2, name: "Navigation", level: 1, maxLevel: 3, progress: 10 },
  { id: 3, name: "Probe distance", level: 0, maxLevel: 4, progress: 10 },
  { id: 4, name: "Weather identification", level: 0, maxLevel: 4, progress: 10 },
];

export default function GameNavbar() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const router = useRouter();

  const { isDark, toggleDarkMode } = UseDarkMode();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [settlementsOpen, setSettlementsOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [milestones, setMilestones] = useState<any[]>([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [userProgress, setUserProgress] = useState<{ [key: string]: number }>({});
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      console.log("User signed out successfully");
    }
  };

  // Calculate time remaining
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const melbourneTime = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Melbourne" }))
      const nextMidnight = startOfDay(addDays(melbourneTime, 1))
      const remaining = formatDistanceToNow(nextMidnight, { addSuffix: true })
      setTimeRemaining(remaining)
    }

    const interval = setInterval(calculateTimeRemaining, 60000)
    calculateTimeRemaining()

    return () => clearInterval(interval)
  }, []);

  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setReferralCode(null);
      return;
    }

    const fetchReferralCode = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching referral code:", error);
        setReferralCode(null);
      } else {
        setReferralCode(data?.referral_code ?? null);
      }
    };

    fetchReferralCode();
  }, [session, supabase]);

  // Fetch milestones
  useEffect(() => {
    fetch("/api/gameplay/milestones")
      .then((res) => res.json())
      .then((data) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
  
        const sorted = [...data.playerMilestones].sort(
          (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
        );
  
        const currentIndex = sorted.findIndex((group) => {
          const start = new Date(group.weekStart);
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          return today >= start && today <= end;
        });
  
        setMilestones(sorted);
        setCurrentWeekIndex(currentIndex !== -1 ? currentIndex : 0);
      });
  }, []);  

  // Fetch milestone progress
  useEffect(() => {
    if (!session || milestones.length === 0) return

    const fetchProgress = async () => {
      const progress: { [key: string]: number } = {}
      if (!milestones[currentWeekIndex]) return

      const { weekStart, data } = milestones[currentWeekIndex]

      const startDate = new Date(weekStart)
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)

      for (const milestone of data) {
        const { table, field, value, name } = milestone

        let query = supabase
          .from(table)
          .select("*", { count: "exact" })
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString())
          .eq(field, value)

        if (session.user.id) {
          query = query.eq("author", session.user.id)
        }

        const { count, error } = await query
        if (!error && count !== null) {
          progress[name] = count
        }
      }

      setUserProgress(progress)
    }

    fetchProgress()
  }, [session, milestones, currentWeekIndex, supabase])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-2">
      <div className="relative flex items-center justify-between rounded-lg backdrop-blur-md bg-black/30 border border-white/10 shadow-lg px-4 py-2">
      <div className="flex items-center space-x-2">
        <Link href="/" legacyBehavior>
              <a>
                <img src="/planet.svg" alt="Logo" className="h-8 w-8 ml-1" />
              </a>
            </Link>

            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Button
                  className="text-lg font-bold text-white hidden sm:flex items-center space-x-2 p-2 bg-[#5FCBC3]/60 rounded-lg hover:bg-[#5FCBC3]/80 transition"
                  onClick={() => setSettlementsOpen((prev) => !prev)}
                >
                  <span>Star Sailors: Home</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 9l-7.5 7.5L4.5 9" />
                  </svg>
                </Button>
              </div>
              <Transition
                show={settlementsOpen}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Link href="/" passHref>
                    <Menu.Item>
                      {({ active }) => (
                        <a className={`block px-4 py-2 text-sm text-gray-700 ${active ? "bg-gray-100" : ""}`}>
                          My Settlements
                        </a>
                      )}
                    </Menu.Item>
                  </Link>
                  <Link href="/scenes/desert" passHref>
                    <Menu.Item>
                      {({ active }) => (
                        <a className={`block px-4 py-2 text-sm text-gray-700 ${active ? "bg-gray-100" : ""}`}>
                          Desert Base
                        </a>
                      )}
                    </Menu.Item>
                  </Link>
                  <Link href="/scenes/ocean" passHref>
                    <Menu.Item>
                      {({ active }) => (
                        <a className={`block px-4 py-2 text-sm text-gray-700 ${active ? "bg-gray-100" : ""}`}>
                          Ocean Base
                        </a>
                      )}
                    </Menu.Item>
                  </Link>
                  <Link href="/scenes/uploads" passHref>
                    <Menu.Item>
                      {({ active }) => (
                        <a className={`block px-4 py-2 text-sm text-gray-700 ${active ? "bg-gray-100" : ""}`}>
                          Conservation
                        </a>
                      )}
                    </Menu.Item>
                  </Link>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Stardust Balance */}
            <StardustDropdown />

            <MissionsPopover 
  // userProgress={userProgress}
  // milestones={milestones[currentWeekIndex]?.data || []}
/>

          <ResponsiveAlerts />

          {/* Tech Tree Button */}
          <TechnologyPopover />

          <LocationsDropdown />

          {/* <Button
            variant="ghost"
            size="icon"
           onClick={toggleDarkMode}
  className="text-white"
>
  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button> */}

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center gap-2 pl-2 pr-3">
                <div className="h-8 w-8 rounded-full overflow-hidden">
                    <div
                                    className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-[#5FCBC3]/60 hover:bg-[#5FCBC3]/80 transition"
                                  >
                    {/* <Avatar /> */}
                    <AvatarGenerator author={session?.user.id ?? ""} />
                    </div>
                </div>
                <ChevronDown className="h-4 w-4 text-white/70" />
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-black/80 backdrop-blur-md border border-white/10 text-white">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuGroup>
                <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10 cursor-pointer flex items-center">
                  <Link href='/account' className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {referralCode && (
    <>
      <DropdownMenuSeparator className="bg-white/10" />
      <DropdownMenuItem className="cursor-default select-text" disabled>
        <span className="font-mono text-sm">Referral: {referralCode}</span>
      </DropdownMenuItem>
    </>
  )}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-red-400">
                <Button onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="md:hidden text-white">
      <HammerIcon className="h-6 w-6" />
    </Button>
  </SheetTrigger>

  <SheetContent
    side="right"
    className="w-[85%] bg-gradient-to-b from-[#0f172a] to-[#020617] backdrop-blur-md border-white/10 p-0"
  >
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#5FCBC3]/60 hover:bg-[#5FCBC3]/80 transition flex items-center justify-center">
            <Avatar />
          </div>
          <div>
            {/* User's profile */}
          </div>
        </div>
      </div>

      {/* Stardust Section */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <StardustDropdown />
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-6">
          {/* Alerts Section */}
          <div className="space-y-2">
            <ResponsiveAlerts />
          </div>

          {/* Milestones Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#22d3ee] to-[#a855f7] flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-[#67e8f9]" />
              Weekly Milestones
            </h3>
            {milestones.length > 0 &&
              milestones[currentWeekIndex]?.data.slice(0, 3).map((milestone: any, index: number) => (
                <div key={index} className="bg-[#1e293b] rounded-lg p-3 border border-[#581c87]">
                  <div className="flex justify-between items-center">
                    <p className="text-white truncate">{milestone.name}</p>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {userProgress[milestone.name] || 0}/{milestone.requiredCount}
                    </div>
                  </div>
                </div>
              ))}
            {/* <Button variant="link" className="text-[#67e8f9] p-0 h-auto" onClick={() => router.push('/scenes/milestones')}>
              View All Milestones
            </Button> */}
          </div>

          {/* Technology Section */}
          <div className="space-y-2">
            <TechnologySection />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-2">
      <div className="justify-start p-4">
    {referralCode && (
      <p className="text-sm font-mono text-white select-text">Referral: {referralCode}</p>
    )}
  </div>
        <Button className="w-full justify-start" variant="ghost">
          <User className="mr-2 h-5 w-5" />
          Profile
        </Button>
        <Link href="/account" passHref>
          <Button className="w-full justify-start" variant="ghost">
            <Settings className="mr-2 h-5 w-5" />
            Settings
          </Button>
        </Link>
        <Button className="w-full justify-start text-red-400" variant="ghost" onClick={signOut}>
          <LogOut className="mr-2 h-5 w-5" />
          Log out
        </Button>
      </div>
    </div>
  </SheetContent>
</Sheet>
      </div>
    </nav>
  );
};