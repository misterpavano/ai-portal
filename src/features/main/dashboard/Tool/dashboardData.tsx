import {
  IconBroadcast,
  IconCheck,
  IconClock,
  IconFileAnalytics,
  IconProgressCheck,
  IconTrendingUp,
} from "@tabler/icons-react";

export type DashboardStat = {
  label: string;
  value: string;
  icon: typeof IconFileAnalytics;
};

export type QuickAction = {
  title: string;
  description: string;
  path: string;
  icon: typeof IconProgressCheck;
};

export type ActivityItem = {
  action: string;
  tool: string;
  time: string;
};

export const dashboardStats: DashboardStat[] = [
  {
    label: "Documents Processed",
    value: "47",
    icon: IconFileAnalytics,
  },
  {
    label: "Sessions Today",
    value: "3",
    icon: IconClock,
  },
  {
    label: "Tasks Completed",
    value: "12",
    icon: IconCheck,
  },
  {
    label: "Efficiency Gain",
    value: "68%",
    icon: IconTrendingUp,
  },
];

export const quickActions: QuickAction[] = [
  {
    title: "Route Assistant",
    description:
      "Validate and review route documents with AI-powered analysis.",
    path: "/route-assistant",
    icon: IconProgressCheck,
  },
  {
    title: "Audio to Text",
    description:
      "Transcribe audio files into structured, reviewable text content.",
    path: "/audio-to-text",
    icon: IconBroadcast,
  },
];

export const recentActivity: ActivityItem[] = [
  {
    action: "Route document validated",
    tool: "Route Assistant",
    time: "2 hours ago",
  },
  {
    action: "Audio file transcribed",
    tool: "Audio to Text",
    time: "5 hours ago",
  },
  {
    action: "Route review completed",
    tool: "Route Assistant",
    time: "Yesterday",
  },
  {
    action: "Transcription exported",
    tool: "Audio to Text",
    time: "2 days ago",
  },
];
