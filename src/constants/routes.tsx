import { IconBroadcast, IconProgressCheck } from "@tabler/icons-react";
import { colors } from "../theme/colors";
import { GeneralRoute } from "../types/route";

const activeRouteColor = colors.accent.main;
const inactiveRouteColor = "rgba(255, 255, 255, 0.5)";

export const prototypeRoutes: GeneralRoute[] = [
  {
    title: "Extra Editor",
    path: "/route-assistant",
    renderIcon: (isActive: boolean) => (
      <IconProgressCheck
        width={18}
        height={18}
        color={isActive ? activeRouteColor : inactiveRouteColor}
      />
    ),
  },
  {
    title: "Audio to Text",
    path: "/audio-to-text",
    renderIcon: (isActive: boolean) => (
      <IconBroadcast
        width={18}
        height={18}
        color={isActive ? activeRouteColor : inactiveRouteColor}
      />
    ),
  },
];
