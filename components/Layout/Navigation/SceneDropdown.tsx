"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Book, ChevronDown } from "lucide-react"
import Link from "next/link"

export function StarSailorsDropdown() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="text-white px-2">
          <Book className="mr-2 h-4 w-4" />
          Star Sailors
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="grid gap-1">
          <Link href="/ssg" className="hover:bg-muted rounded-md px-2 py-1 text-sm">Star Sailors: Galaxy</Link>
          <Link href="/ssp" className="hover:bg-muted rounded-md px-2 py-1 text-sm">Star Sailors: Planet</Link>
          <Link href="/ssm" className="hover:bg-muted rounded-md px-2 py-1 text-sm">Star Sailors: Missions</Link>
          <Link href="/ssc" className="hover:bg-muted rounded-md px-2 py-1 text-sm">Star Sailors: Codex</Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};