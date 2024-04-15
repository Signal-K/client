import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button"; 

export function MissionList() {
  const missions = [
    { name: "Pick your home planet", completed: true },
    { name: "Build your first rover", completed: false },
    { name: "Collect your first resources", completed: false },
    { name: "Build your first structure", completed: false },
    { name: "Make your first classification", completed: false },
  ];

  return (
    <>
      <CardHeader>
        <CardTitle>To-Do List</CardTitle>
        <CardDescription>Manage your daily tasks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 overflow-y-auto max-h-[480px] pr-4">
        {missions.map((mission, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="#">
                <LinkIcon
                  className={`w-5 h-5 text-gray-500 ${
                    mission.completed ? "line-through" : ""
                  } hover:text-gray-900 dark:hover:text-gray-50`}
                />
              </Link>
              <p
                className={`${
                  mission.completed ? "line-through text-gray-500 dark:text-gray-400" : ""
                }`}
              >
                {mission.name}
              </p>
            </div>
          </div>
        ))}
        </CardContent>
      </>
  );
}

function LinkIcon(props) {
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}
