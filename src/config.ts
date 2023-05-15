import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://blog.shamus.dev/",
  author: "Shamus",
  desc: "Shamus' blog",
  title: "Shamus.dev",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 5,
};

export const LOCALE = ["en-EN"]; // set to [] to use the environment default

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/Shamus03",
    linkTitle: ` ${SITE.author} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/shamus-taylor-3b501b131/",
    linkTitle: `${SITE.author} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "blog@shamus.dev",
    linkTitle: `Send an email to ${SITE.author}`,
    active: true,
  },
];
