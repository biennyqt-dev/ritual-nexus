export type RitualResourceId =
  | "what-is-ritual"
  | "ritual-team"
  | "ritual-blog"
  | "ritual-docs"
  | "ritual-lab"
  | "discord"
  | "x"
  | "github";

export interface HotspotBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RitualLink {
  id: RitualResourceId;
  title: string;
  href: string;
  placement:
    | "Top"
    | "Upper Left"
    | "Upper Right"
    | "Center"
    | "Lower Left"
    | "Lower Right"
    | "Bottom Left"
    | "Bottom Right";
  hotspot: HotspotBounds;
  labelPosition: "above" | "below" | "left" | "right";
  introOrder: number;
}

export const ritualLinks: RitualLink[] = [
  {
    id: "what-is-ritual",
    title: "What is Ritual?",
    href: "https://www.ritualfoundation.org/about",
    placement: "Top",
    hotspot: { x: 43.6, y: 8.2, width: 12.8, height: 13.2 },
    labelPosition: "above",
    introOrder: 0,
  },
  {
    id: "ritual-team",
    title: "Ritual Team",
    href: "https://www.ritualfoundation.org/team",
    placement: "Upper Left",
    hotspot: { x: 27.8, y: 23.9, width: 19.4, height: 15.2 },
    labelPosition: "left",
    introOrder: 1,
  },
  {
    id: "ritual-blog",
    title: "Ritual Blog",
    href: "https://www.ritualfoundation.org/blog",
    placement: "Upper Right",
    hotspot: { x: 52.8, y: 24.2, width: 19.4, height: 15.2 },
    labelPosition: "right",
    introOrder: 2,
  },
  {
    id: "ritual-docs",
    title: "Ritual Docs",
    href: "https://docs.ritualfoundation.org/",
    placement: "Center",
    hotspot: { x: 38.8, y: 39.2, width: 22.4, height: 14.8 },
    labelPosition: "above",
    introOrder: 3,
  },
  {
    id: "ritual-lab",
    title: "Ritual Lab",
    href: "https://ritual.net/",
    placement: "Lower Left",
    hotspot: { x: 28.9, y: 55.4, width: 19.2, height: 15.4 },
    labelPosition: "left",
    introOrder: 4,
  },
  {
    id: "github",
    title: "GitHub",
    href: "https://github.com/ritual-foundation",
    placement: "Lower Right",
    hotspot: { x: 51.9, y: 55.4, width: 19.2, height: 15.4 },
    labelPosition: "right",
    introOrder: 5,
  },
  {
    id: "discord",
    title: "Discord",
    href: "https://discord.com/invite/ritual-net",
    placement: "Bottom Left",
    hotspot: { x: 36.6, y: 70.6, width: 13.4, height: 13.4 },
    labelPosition: "below",
    introOrder: 6,
  },
  {
    id: "x",
    title: "X",
    href: "https://x.com/ritualfnd",
    placement: "Bottom Right",
    hotspot: { x: 51, y: 72.1, width: 13.4, height: 13.4 },
    labelPosition: "below",
    introOrder: 7,
  },
];

export const ritualIntroOrder = ritualLinks
  .slice()
  .sort((a, b) => a.introOrder - b.introOrder)
  .map((resource) => resource.id);
