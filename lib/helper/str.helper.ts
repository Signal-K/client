import { ReadonlyURLSearchParams } from "next/navigation";

/**
 * Generates a random string of the specified length.
 * @param length The length of the random string.
 * @returns The generated random string.
 */
export const generateAnonymousRandomString = (length: number) => {
  let result = "";

  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }

  return result;
};

/**
 * Trims the user profile name if it exceeds 15 characters.
 * @param name The user profile name.
 * @returns The trimmed user profile name.
 */
export const trimUserProfileName = (name: string) => {
  if (name.length <= 15) return name;

  const splittedName = name.split("");
  splittedName.splice(12, name.length - 12, "...");

  return splittedName.join("");
};

/**
 * Checks if the current URL is the active URL.
 * @param pathname The current pathname.
 * @param url The URL to check against.
 * @param query The URL query parameters.
 * @returns True if the current URL is active, otherwise false.
 */
export const checkCurrentActiveUrl = (
  pathname: string | null,
  url: string,
  query: ReadonlyURLSearchParams | null
) => {
  if (!pathname && !query) return false;

  if (query?.get("c")) {
    const currentUrl = pathname + "?c=" + query.get("c");
    return currentUrl === url;
  }

  return pathname === url;
};

/**
 * Gets the relative time format for the provided date.
 * @param createdAt The date for which to generate the relative time.
 * @returns The formatted relative time.
 */
export const getMetaData = (createdAt: string | Date) => {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const ranges = {
    years: 3600 * 24 * 365,
    months: 3600 * 24 * 30,
    weeks: 3600 * 24 * 7,
    days: 3600 * 24,
    hours: 3600,
    minutes: 60,
    seconds: 1,
  };

  const secondsElapsed = (date.getTime() - Date.now()) / 1000;

  type TRange = keyof typeof ranges;

  for (let key in ranges) {
    if (ranges[key as TRange] < Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / ranges[key as TRange];
      return formatter.format(Math.round(delta), key as TRange);
    }
  }
};