import Link from "next/link";
import { useRouter } from "next/router";

const bottombarLinks = [
  {
    imgURL: "/assets/icons/home.svg",
    route: "/",
    label: "Home",
  },
  {
    imgURL: "/assets/icons/wallpaper.svg",
    route: "/explore",
    label: "Explore",
  },
  {
    imgURL: "/assets/icons/bookmark.svg",
    route: "/saved",
    label: "Saved",
  },
  {
    imgURL: "/assets/icons/gallery-add.svg",
    route: "/create-post",
    label: "Create",
  },
];

const Bottombar = () => {
  const { pathname } = useRouter();

  return (
    <section className="bottom-bar flex justify-between p-4 bg-white fixed bottom-0 left-0 w-full">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;
        return (
          <Link legacyBehavior key={`bottombar-${link.label}`} href={link.route}>
            <a className={`${
              isActive && "rounded-[10px] bg-primary-500 "
            } flex-center flex-col gap-1 p-2 transition`}>
              <img
                src={link.imgURL}
                alt={link.label}
                width={16}
                height={16}
                className={`${isActive && "invert-white"}`}
              />
              <p className="tiny-medium text-light-2">{link.label}</p>
            </a>
          </Link>
        );
      })}
    </section>
  );
};

export default Bottombar;
