import Link from "next/link";
import { useRouter } from "next/router";

const bottombarLinks = [
  {
    imgURL: "/home.svg",
    route: "/feed",
    label: "Feed",
  },
  {
    imgURL: "/planet.svg",
    route: "/garden",
    label: "Garden",
  },
  {
    imgURL: "/eagle.svg",
    route: "/explore",
    label: "Explore",
  },
  {
    imgURL: "/rover.svg",
    route: "/create-post",
    label: "Gather",
  },
  // {
  //   imgURL: "/satellite.svg",
  //   route: "/create-post",
  //   label: "Missions",
  // },
  {
    imgURL: "/satellite.svg",
    route: "/planets/1",
    label: "Missions",
  },
];

const Bottombar = () => {
  const { pathname } = useRouter();

  return (
    <section className="bottom-bar flex justify-between items-center p-4 bg-white fixed bottom-0 left-0 w-full border-t">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;
        return (
          <Link legacyBehavior key={`bottombar-${link.label}`} href={link.route} passHref>
            <a className={`${
              isActive && "rounded-[10px] bg-primary-500 "
            } flex flex-col items-center justify-center p-2 transition`}>
              <img
                src={link.imgURL}
                alt={link.label}
                width={24} 
                height={24}
                className={`mb-1 ${isActive ? "invert-white" : "text-light-2"}`}
              />
              <p className={`tiny-medium ${isActive ? "text-light-3" : "text-light-2"}`}>
                {link.label}
              </p>
            </a>
          </Link>
        );
      })}
    </section>
  );
};

export default Bottombar;