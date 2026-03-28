import {
  IconDirectionArrows,
  IconLayoutSidebar,
  IconBrandOpenai,
  IconTextCaption,
  IconBrandBlogger,
  IconMessageChatbot,
  IconClipboardText,
  IconRobot,
  IconProgressCheck,
  IconBroadcast,
} from "@tabler/icons-react";
import { GeneralRoute } from "../types/route";

export const prototypeRoutes: GeneralRoute[] = [
  // {
  //   title: "AI Chatbot",
  //   path: "/ai-chatbot",
  //   renderIcon: (isActive: boolean) => (
  //     <IconMessageChatbot
  //       width={18}
  //       height={18}
  //       color={isActive ? "#507DA0" : "#AAAAAA"}
  //     />

  {
    title: "Route Assistant",
    path: "/route-assistant",
    renderIcon: (isActive: boolean) => (
      <IconProgressCheck
        width={18}
        height={18}
        color={isActive ? "#E86D5A" : "rgba(255,255,255,0.5)"}
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
        color={isActive ? "#E86D5A" : "rgba(255,255,255,0.5)"}
      />
    ),
  },
  // {
  //   title: "Discussion Guide",
  //   path: "/discussion-guide",
  //   renderIcon: (isActive: boolean) => (
  //     <IconClipboardText
  //       width={18}
  //       height={18}
  //       color={isActive ? "#507DA0" : "#AAAAAA"}
  //     />
  //   ),
  // },
  // {
  //   title: "Doctor Discussion Guide",
  //   path: "/doctor-discussion-guide",
  //   renderIcon: (isActive: boolean) => (
  //     <IconDirectionArrows
  //       width={18}
  //       height={18}
  //       color={isActive ? "#507DA0" : "#AAAAAA"}
  //     />
  //   ),
  // },
  // {
  //   title: "Meeting Summaries",
  //   path: "/meeting-summaries",
  //   renderIcon: (isActive: boolean) => (
  //     <IconBrandOpenai
  //       width={18}
  //       height={18}
  //       color={isActive ? "#507DA0" : "#AAAAAA"}
  //     />
  //   ),
  // },
  // {
  //   title: "Project Brief Generator",
  //   path: "/project-brief-generator",
  //   renderIcon: (isActive: boolean) => (
  //     <IconTextCaption
  //       width={18}
  //       height={18}
  //       color={isActive ? "#507DA0" : "#AAAAAA"}
  //     />
  //   ),
  // },
  // {
  //   title: "Meeting Notes",
  //   path: "/meeting-notes",
  //   renderIcon: (isActive: boolean) => (
  //     <IconTextCaption
  //       width={18}
  //       height={18}
  //       color={isActive ? "#507DA0" : "#AAAAAA"}
  //     />
  //   ),
  // },
  // {
  //   title: "AI Personas",
  //   path: "/ai-personas",
  //   renderIcon: (isActive: boolean) => (
  //     <IconRobot
  //       width={18}
  //       height={18}
  //       color={isActive ? "#507DA0" : "#AAAAAA"}
  //     />
  //   ),
  // },
  // {
  //   title: "PPTx Slide Generator",
  //   path: "/powerpoint-slide-generator",
  //   renderIcon: (isActive: boolean) => (
  //     <IconLayoutSidebar
  //       width={18}
  //       height={18}
  //       color={isActive ? "#507DA0" : "#AAAAAA"}
  //     />
  //   ),
  // },
  // {
  //   title: "Blog Generator",
  //   path: "/blog-generator",
  //   renderIcon: (isActive: boolean) => (
  //     <IconBrandBlogger
  //       width={18}
  //       height={18}
  //       color={isActive ? "#507DA0" : "#AAAAAA"}
  //     />
  //   ),
  // },
];
