/**
 * v0 by Vercel.
 * @see https://v0.dev/t/bOg9oEOPYfV
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "../Core/ui/Button"

export default function UponSignupModal() {
  return (
    <div className="relative w-full max-w-2xl p-4 rounded-lg border border-gray-100 shadow-lg md:p-8 dark:border-gray-800 bg-gray-200 mt-10">
      <div className="absolute top-4 right-4">
        {/* <Button size="icon" variant="outline">
          <XIcon className="w-4 h-4" />
          <span className="sr-only">Close</span>
        </Button> */}
      </div>
      <div className="space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">Getting Started</h1>
          <p className="text-sm tracking-wide leading-loose text-gray-500 md:text-base/relaxed lg:text-sm/relaxed xl:text-base/relaxed dark:text-gray-400">
            Learn how to play the game
          </p>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Step 1: Visit a planet</h2>
            <p className="text-sm tracking-wide leading-loose text-gray-500 md:text-base/relaxed lg:text-sm/relaxed xl:text-base/relaxed dark:text-gray-400">
              There's 6 planets to choose from for your starter planet. Visit them all and pick one you like
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Create a sector</h2>
            <p className="text-sm tracking-wide leading-loose text-gray-500 md:text-base/relaxed lg:text-sm/relaxed xl:text-base/relaxed dark:text-gray-400">
              Note (admin): This should be done when the user chooses their planet
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Explore your sector</h2>
            <p className="text-sm tracking-wide leading-loose text-gray-500 md:text-base/relaxed lg:text-sm/relaxed xl:text-base/relaxed dark:text-gray-400">
              Send out some rovers & collect resources
            </p>
          </div>
        </div>
        {/* <Button className="mx-auto" size="lg" variant="outline">
          Close Guide
        </Button> */}
      </div>
    </div>
  );
};

function XIcon(props) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
};