import { Button } from "../ui/Button";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import { checkCurrentActiveUrl } from "../../../lib/helper/str.helper";

type TProps = {
  url: string;
  label: string;
  Icon: LucideIcon;
  active: boolean;
};

const NavItem: React.FC<TProps> = ({ url, Icon, label, active }) => {
  return (
    <li>
      <Link href={url}>
        <Button
          variant={active ? "default" : "ghost"}
          className={`flex items-center justify-start space-x-2 w-full ${
            active
              ? "bg-black text-white rounded-full"
              : "bg-white text-foreground rounded-full"
          }`}
        >
          <Icon className="w-8 aspect-square" />
          <span className="text-lg">{label}</span>
        </Button>
      </Link>
    </li>
  );
};

export default NavItem;