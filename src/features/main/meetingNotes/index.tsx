import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Typography, styled } from "@mui/material";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import {
  IconHelp,
  IconNotes,
  IconTextCaption,
  IconTool,
} from "@tabler/icons-react";
import * as React from "react";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import MeetingNotesHelp from "./Help/MeetingNotesHelp";
import { useAtom } from "jotai";
import { meetingNotesFormAtom } from "../../../atoms/meetingNotesAtom";
import Footer from "../../../components/layouts/footer";
import MeetingNotesTool from "./Tool/Content/MeetingNotesTool";

interface MeetingNotesProps {
  footer: React.ReactNode;
}

const StyledTab = styled(Tab)(({ theme }) => ({
  borderRight: "1px solid #E7E5E4",
  backgroundColor: "#F5F5F4",
  "&.Mui-selected": {
    backgroundColor: "#FFFFFF",
    color: "#1C1917",
    fontWeight: 600,
    borderBottom: "2px solid #1C1917",
  },
  "&:not(.Mui-selected)": {
    color: theme.palette.text.primary,
  },
}));

const StyledTabs = styled(TabList)(() => ({
  borderTopLeftRadius: "10px",
  borderBottom: "none",
  "& .MuiTabs-indicator": {
    display: "none",
  },
}));

const MeetingNotes = ({ footer }: MeetingNotesProps) => {
  const [value, setValue] = React.useState("Tool");
  const [meetingNotesFormValues] = useAtom(meetingNotesFormAtom);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Footer footer={value === "Tool" ? footer : null}>
      <Box sx={{ typography: "body1", p: 2 }}>
        <HeaderTitle
          title="Meeting Notes"
          subtitle={meetingNotesFormValues.type.name}
          icon={<IconTextCaption width={18} height={18} color={"#FFFFFF"} />}
        />
        <Box
          sx={{
            border: "1px solid",
            borderColor: "neutral.200",
            borderRadius: "10px",
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          <TabContext value={value}>
            <Box
              sx={{
                backgroundColor: "neutral.100",
                borderBottom: "1px solid #E7E5E4",
                borderTopLeftRadius: "10px",
                borderColor: "#E7E5E4",
              }}
            >
              <StyledTabs onChange={handleChange} aria-label="tabs">
                <StyledTab
                  label={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <IconTool size="14px" />
                      <Typography
                        variant="body"
                        sx={{ fontSize: "14px", fontWeight: "520" }}
                      >
                        Tool
                      </Typography>
                    </Box>
                  }
                  value="Tool"
                />
                <StyledTab
                  label={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <IconHelp size="14px" />
                      <Typography
                        variant="body"
                        sx={{ fontSize: "14px", fontWeight: "520" }}
                      >
                        Help
                      </Typography>
                    </Box>
                  }
                  value="Help"
                />
              </StyledTabs>
            </Box>
            <TabPanel sx={{ p: 0 }} value="Tool">
              <MeetingNotesTool />
            </TabPanel>
            <TabPanel id="Help_MKGAI_Summary" sx={{ p: 0 }} value="Help">
              <MeetingNotesHelp />
            </TabPanel>
          </TabContext>
        </Box>
      </Box>
    </Footer>
  );
};

export default MeetingNotes;
