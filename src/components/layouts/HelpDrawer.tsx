import React from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Tab,
  styled,
} from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { IconX } from "@tabler/icons-react";

// Help content imports
import RouteValidatorHelp from "../../features/main/routeValidator/Help/RouteValidatorHelp";
import AudioToTextHelp from "../../features/main/audioToText/Help/AudioToTextHelp";
import BlogGeneratorHelp from "../../features/main/blogGenerator/Help/BlogGeneratorHelp";
import DiscussionGuideHelp from "../../features/main/discussionGuide/Help/DiscussionGuideHelp";
import DoctorDiscussionGuideHelp from "../../features/main/doctorDiscussionGuide/Help/DiscussionGuidesHelp";
import InterviewSummariesHelp from "../../features/main/interviewSummaries/Help/InterviewSummariesHelp";
import MeetingNotesHelp from "../../features/main/meetingNotes/Help/MeetingNotesHelp";
import PowerpointSlideGeneratorHelp from "../../features/main/powerpointSlideGenerator/Help/PowerpointSlideGeneratorHelp";

interface HelpEntry {
  key: string;
  label: string;
  route: string;
  component: React.FC;
}

const helpEntries: HelpEntry[] = [
  {
    key: "route-assistant",
    label: "Route Assistant",
    route: "/route-assistant",
    component: RouteValidatorHelp,
  },
  {
    key: "audio-to-text",
    label: "Audio to Text",
    route: "/audio-to-text",
    component: AudioToTextHelp,
  },
  {
    key: "discussion-guide",
    label: "Discussion Guide",
    route: "/discussion-guide",
    component: DiscussionGuideHelp,
  },
  {
    key: "doctor-discussion-guide",
    label: "Doctor Discussion Guide",
    route: "/doctor-discussion-guide",
    component: DoctorDiscussionGuideHelp,
  },
  {
    key: "meeting-summaries",
    label: "Meeting Summaries",
    route: "/meeting-summaries",
    component: InterviewSummariesHelp,
  },
  {
    key: "meeting-notes",
    label: "Meeting Notes",
    route: "/meeting-notes",
    component: MeetingNotesHelp,
  },
  {
    key: "blog-generator",
    label: "Blog Generator",
    route: "/blog-generator",
    component: BlogGeneratorHelp,
  },
  {
    key: "powerpoint-slide-generator",
    label: "PPTx Slide Generator",
    route: "/powerpoint-slide-generator",
    component: PowerpointSlideGeneratorHelp,
  },
];

const StyledTab = styled(Tab)({
  textTransform: "none",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  minHeight: 40,
  padding: "8px 16px",
  color: "#78716C",
  "&.Mui-selected": {
    color: "#1C1917",
    fontWeight: 600,
  },
});

const StyledTabList = styled(TabList)({
  minHeight: 40,
  "& .MuiTabs-indicator": {
    backgroundColor: "#1C1917",
    height: 2,
  },
  "& .MuiTabs-flexContainer": {
    gap: 0,
  },
});

interface HelpDrawerProps {
  open: boolean;
  onClose: () => void;
}

const HelpDrawer: React.FC<HelpDrawerProps> = ({ open, onClose }) => {
  const location = useLocation();

  // Auto-select tab based on current route
  const currentEntry = helpEntries.find(
    (e) => e.route === location.pathname
  );
  const defaultTab = currentEntry?.key || helpEntries[0].key;

  const [activeTab, setActiveTab] = React.useState(defaultTab);

  // Update active tab when route changes or drawer opens
  React.useEffect(() => {
    if (open && currentEntry) {
      setActiveTab(currentEntry.key);
    }
  }, [open, currentEntry]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const ActiveHelp = helpEntries.find((e) => e.key === activeTab)?.component;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 520 },
          maxWidth: "100vw",
          borderLeft: "1px solid #E7E5E4",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 1.5,
          borderBottom: "1px solid #E7E5E4",
          minHeight: 56,
        }}
      >
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 700,
            color: "#1C1917",
            letterSpacing: "-0.01em",
          }}
        >
          Help
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#A8A29E",
            "&:hover": { color: "#1C1917", backgroundColor: "#F5F5F4" },
          }}
        >
          <IconX size={18} stroke={1.5} />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: "1px solid #E7E5E4",
          px: 1,
          overflowX: "auto",
          "&::-webkit-scrollbar": { height: 0 },
        }}
      >
        <TabContext value={activeTab}>
          <StyledTabList
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            {helpEntries.map((entry) => (
              <StyledTab
                key={entry.key}
                label={entry.label}
                value={entry.key}
              />
            ))}
          </StyledTabList>
        </TabContext>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <TabContext value={activeTab}>
          {helpEntries.map((entry) => (
            <TabPanel key={entry.key} value={entry.key} sx={{ p: 0 }}>
              <entry.component />
            </TabPanel>
          ))}
        </TabContext>
      </Box>
    </Drawer>
  );
};

export default HelpDrawer;
