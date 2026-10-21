import type { SVGProps } from "react";

/** Line icons for the admin (24 grid, 1.75 stroke, round caps). Decorative: the label next to them says it all. */
const P: Record<string, string> = {
  dashboard: "M4 13h6V4H4zM14 20h6v-9h-6zM14 4h6v4h-6zM4 17h6v3H4z",
  home: "M4 11.5 12 5l8 6.5M6.5 9.8V19h11V9.8M10 19v-5h4v5",
  pages: "M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 6.5 20V4a.5.5 0 0 1 .5-.5ZM13.5 3.5V8H18M9.5 12.5h5M9.5 16h5",
  media: "M4.5 5.5h15v13h-15zM4.5 15l4-4 3.5 3.5 2.5-2.5 5 5M15 9.5h.01",
  camera: "M4 8.5h3.5L9 6h6l1.5 2.5H20V18H4zM12 15.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  jar: "M8 3.5h8v3H8zM7 6.5h10a1 1 0 0 1 1 1V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V7.5a1 1 0 0 1 1-1ZM9 11h6v5H9z",
  news: "M5 5h11v14H6.5A1.5 1.5 0 0 1 5 17.5zM16 9h3v8.5a1.5 1.5 0 0 1-3 0M8 8.5h5M8 12h5M8 15.5h3",
  calendar: "M4.5 6h15v14h-15zM4.5 10h15M8.5 3.5v4M15.5 3.5v4M8 13.5h2M14 13.5h2M8 17h2",
  ticket: "M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4zM14 7v10",
  briefcase: "M4 8h16v11H4zM9 8V5.5h6V8M4 13h16",
  inbox: "M4 13.5 6.5 5h11l2.5 8.5V19H4zM4 13.5h4.5l1.5 2h4l1.5-2H20",
  mail: "M4 6h16v12H4zM4.5 6.5 12 13l7.5-6.5",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2.1 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.1 1.2L10 21h4l.5-2.6a7 7 0 0 0 2.1-1.2l2.3.9 2-3.4-2-1.5c.07-.4.1-.8.1-1.2Z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5",
  external: "M13.5 5H19v5.5M19 5l-8 8M17 14v5H5V7h5",
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM15.5 15.5 20 20",
  plus: "M12 5v14M5 12h14",
  logout: "M14 4.5h4.5v15H14M10 8l-4 4 4 4M6 12h9.5",
  menu: "M4 7h16M4 12h16M4 17h10",
  close: "M6 6l12 12M18 6 6 18",
  arrow: "M5 12h14M13 6l6 6-6 6",
  download: "M12 4v11M7 10.5l5 5 5-5M5 19.5h14",
  check: "M5 12.5l4.5 4.5L19 7.5",
  alert: "M12 4 21 19.5H3zM12 10v4.5M12 17.2h.01",
  spark: "M12 3.5 13.8 10l6.7 2-6.7 2L12 20.5 10.2 14l-6.7-2 6.7-2z",
};

export type IconName = keyof typeof P;

export function Icon({ name, className, ...rest }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className ?? "size-5"} {...rest}>
      <path d={P[name]} />
    </svg>
  );
}
