import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import {
  BellRing,
  Bug,
  GanttChartSquare,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  StarHalfIcon,
  StarIcon,
  TrendingUp,
  User,
  User2Icon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import NavItem from "./NavItem";
import { Button } from "../ui/Button";

const navCategoryItems = [
  {
    url: "/",
    label: "STAR",
    Icon: StarHalfIcon,
  },
  {
    url: "/profile",
    label: "PROFILE",
    Icon: User2Icon,
  },
];

const navSettingItems = [
  {
    url: "https://starsailors.space",
    label: "STAR",
    Icon: StarHalfIcon,
  },
  {
    url: "/profile",
    label: "PROFILE",
    Icon: User2Icon,
  },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const query = useSearchParams();

  const [openAside, setOpenAside] = useState(false);
  const [logoutClicked, setLogoutClicked] = useState(false);

  const router = useRouter();
  const [user, setUser] = useState<{
    username: string;
    image: null | string;
    role: "common" | "developer" | string;
  }>({
    username: "",
    image: null,
    role: "common",
  });

  useEffect(() => {
    setOpenAside(false);
  }, [pathname, query]);

  return (
    <>
      <aside
        className={`
          lg:pl-[2rem] lg:border-r lg:pr-4 py-4 flex flex-col justify-between lg:w-1/5 h-screen lg:sticky lg:top-0 lg:px-0
          lg:z-10
          px-4 bg-secondary lg:bg-transparent lg:translate-y-0 transition-transform
          fixed inset-0 ${openAside ? "translate-y-0" : "-translate-y-[200%]"}
          z-20
      `}
      >
        <div>
          <h2 className="text-lg font-bold text-foreground/70 mb-4">
            Kategori Diskusi
          </h2>
          <ul className="space-y-4">
            {navCategoryItems.map((item, idx) => (
              <NavItem {...item} key={idx} active={pathname === item.url} />
            ))}
          </ul>

          <h2 className="text-lg font-bold mt-4 text-foreground/70">
            Pengaturan
          </h2>
          <ul className="space-y-4 mt-4">
            {navSettingItems.map((item, idx) => (
              <NavItem {...item} key={idx} active={pathname === item.url} />
            ))}
            {user.role === "developer" && (
              <NavItem
                url="/reported-post"
                label="Reported Post"
                Icon={Megaphone}
                active={pathname === "/reported-post"}
              />
            )}
          </ul>
        </div>

        <div>
          <div className="flex items-start gap-2">
            <Avatar className="rounded-full">
              <AvatarImage src={user.image ?? ""} />
              <AvatarFallback className="rounded-full">
                {user.username && user.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <Button
            className="w-full flex items-center space-x-2 justify-start mt-4 bg-white lg:hidden"
            variant="outline"
            onClick={() => setOpenAside(false)}
          >
            <Menu className="w-6 aspect-square" />
            <span>Tutup Menu</span>
          </Button>
        </div>
      </aside>
      <div className="fixed lg:hidden bottom-0 p-4 inset-x-0 z-10 bg-white supports-[backdrop-filter]:bg-white/60 border-t supports-[backdrop-filter]:backdrop-blur-md">
        <Button
          onClick={() => setOpenAside(true)}
          className="w-full flex items-center justify-start space-x-2"
        >
          <Menu className="w-6 aspect-square" />
          <span>Buka Menu</span>
        </Button>
      </div>
    </>
  );
};

export default Sidebar;