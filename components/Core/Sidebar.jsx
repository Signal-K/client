import { forwardRef } from "react";
import Link from "next/link";
import { HomeIcon, StarIcon, PaintBrushIcon, DocumentMagnifyingGlassIcon, CreditCardIcon, UserIcon, RocketLaunchIcon, MagnifyingGlassCircleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";

const CoreSidebar = forwardRef(({ showNav }, ref) => {
    const router = useRouter();
  
    return (
      <div ref={ref} className="fixed w-64 h-full bg-white shadow-sm">
        <div className="flex justify-center mt-6 mb-14">
          <picture>
            <img
              className="w-32 h-auto"
              src="https://user-images.githubusercontent.com/31812229/222339335-ae57fdb9-6fbd-4d26-9225-a18c02b6edeb.png"
              alt="signal kinetics logo"
            />
          </picture>
        </div>
  
        <div className="flex flex-col">
          <Link href="/">
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                router.pathname == "/"
                  ? "bg-green-100 text-green-500"
                  : "text-gray-400 hover:bg-green-100 hover:text-green-500"
              }`}
            >
              <div className="mr-2">
                <HomeIcon className="h-5 w-5" />
              </div>
              <div>
                <p>Home</p>
              </div>
            </div>
          </Link>
          <Link href="/feed">
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                router.pathname == "/feed"
                  ? "bg-green-100 text-green-500"
                  : "text-gray-400 hover:bg-green-100 hover:text-green-500"
              }`}
            >
              <div className="mr-2">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <p>Feed</p>
              </div>
            </div>
          </Link>
          <Link href="/billing">
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                router.pathname == "/billing"
                  ? "bg-green-100 text-green-500"
                  : "text-gray-400 hover:bg-green-100 hover:text-green-500"
              }`}
            >
              <div className="mr-2">
                <CreditCardIcon className="h-5 w-5" />
              </div>
              <div>
                <p>ORCID</p>
              </div>
            </div>
          </Link>
          <Link href="/ships">
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                router.pathname == "/ships"
                  ? "bg-green-100 text-green-500"
                  : "text-gray-400 hover:bg-green-100 hover:text-green-500"
              }`}
            >
              <div className="mr-2">
                <RocketLaunchIcon className="h-5 w-5" />
              </div>
              <div>
                <p>Shipyard</p>
              </div>
            </div>
          </Link>
          <Link href="/journal/ipfs">
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                router.pathname == "/journal/ipfs"
                  ? "bg-green-100 text-green-500"
                  : "text-gray-400 hover:bg-green-100 hover:text-green-500"
              }`}
            >
              <div className="mr-2">
                <PaintBrushIcon className="h-5 w-5" />
              </div>
              <div>
                <p>Pins</p>
              </div>
            </div>
          </Link>
          <Link href="/journal">
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                router.pathname == "/journal"
                  ? "bg-green-100 text-green-500"
                  : "text-gray-400 hover:bg-green-100 hover:text-green-500"
              }`}
            >
              <div className="mr-2">
                <DocumentMagnifyingGlassIcon className="h-5 w-5" />
              </div>
              <div>
                <p>Journal</p>
              </div>
            </div>
          </Link>
          <Link href="/posts/lens/parselay.lens">
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                router.pathname == "/posts/lens/parselay.lens"
                  ? "bg-green-100 text-green-500"
                  : "text-gray-400 hover:bg-green-100 hover:text-green-500"
              }`}
            >
              <div className="mr-2">
                <MagnifyingGlassCircleIcon className="h-5 w-5" />
              </div>
              <div>
                <p>Lens</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  });
  
CoreSidebar.displayName = "SideBar";
  
export default CoreSidebar;

export const GameplaySidebar = forwardRef(({ showNav }, ref) => {
  const router = useRouter();

  return (
    <div ref={ref} className="fixed w-64 h-full bg-white shadow-sm">
      <div className="flex justify-center mt-6 mb-14">
        <picture>
          <img
            className="w-32 h-auto"
            src="https://user-images.githubusercontent.com/31812229/222339335-ae57fdb9-6fbd-4d26-9225-a18c02b6edeb.png"
            alt="signal kinetics logo"
          />
        </picture>
      </div>

      <div className="flex flex-col">
        <Link href="/">
          <div
            className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
              router.pathname == "/"
                ? "bg-green-100 text-green-500"
                : "text-gray-400 hover:bg-green-100 hover:text-green-500"
            }`}
          >
            <div className="mr-2">
              <HomeIcon className="h-5 w-5" />
            </div>
            <div>
              <p>Home</p>
            </div>
          </div>
        </Link>
        <Link href="/posts">
          <div
            className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
              router.pathname == "/posts"
                ? "bg-green-100 text-green-500"
                : "text-gray-400 hover:bg-green-100 hover:text-green-500"
            }`}
          >
            <div className="mr-2">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <p>Feed</p>
            </div>
          </div>
        </Link>
        <Link href="/planets">
          <div
            className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
              router.pathname == "/planets"
                ? "bg-green-100 text-green-500"
                : "text-gray-400 hover:bg-green-100 hover:text-green-500"
            }`}
          >
            <div className="mr-2">
              <StarIcon className="h-5 w-5" />
            </div>
            <div>
              <p>Planets</p>
            </div>
          </div>
        </Link>
        <Link href="/ships">
          <div
            className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
              router.pathname == "/ships"
                ? "bg-green-100 text-green-500"
                : "text-gray-400 hover:bg-green-100 hover:text-green-500"
            }`}
          >
            <div className="mr-2">
              <RocketLaunchIcon className="h-5 w-5" />
            </div>
            <div>
              <p>Shipyard</p>
            </div>
          </div>
        </Link>
        <Link href="/journal/ipfs">
          <div
            className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
              router.pathname == "/journal/ipfs"
                ? "bg-green-100 text-green-500"
                : "text-gray-400 hover:bg-green-100 hover:text-green-500"
            }`}
          >
            <div className="mr-2">
              <PaintBrushIcon className="h-5 w-5" />
            </div>
            <div>
              <p>Pins</p>
            </div>
          </div>
        </Link>
        <Link href="/journal">
          <div
            className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
              router.pathname == "/journal"
                ? "bg-green-100 text-green-500"
                : "text-gray-400 hover:bg-green-100 hover:text-green-500"
            }`}
          >
            <div className="mr-2">
              <DocumentMagnifyingGlassIcon className="h-5 w-5" />
            </div>
            <div>
              <p>Journal</p>
            </div>
          </div>
        </Link>
        <Link href="/posts/lens/parselay.lens">
          <div
            className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
              router.pathname == "/posts/lens/parselay.lens"
                ? "bg-green-100 text-green-500"
                : "text-gray-400 hover:bg-green-100 hover:text-green-500"
            }`}
          >
            <div className="mr-2">
              <MagnifyingGlassCircleIcon className="h-5 w-5" />
            </div>
            <div>
              <p>Profile</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
});

CoreSidebar.displayName = "SideBar";