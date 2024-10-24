import { Sun, Moon } from "lucide-react"

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-12 sm:h-16 backdrop-blur-sm">
      <div className="h-full flex justify-between items-start">
        <Sun className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-400" />
        <Moon className="h-12 w-12 sm:h-16 sm:w-16 text-blue-400" />
      </div>
    </header>
  );
};