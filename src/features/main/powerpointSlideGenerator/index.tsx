import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import PowerpointSlideGeneratorTool from "./Tool/PowerpointSlideGeneratorTool";
import PowerpointSlideGeneratorHelp from "./Help/PowerpointSlideGeneratorHelp";
import { Typography, styled } from "@mui/material";
import { IconHelp, IconLayoutSidebar, IconTool } from "@tabler/icons-react";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";

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

const PowerpointSlideGenerator = () => {
  const [value, setValue] = React.useState("Tool");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ typography: "body1", p: 2 }}>
      <HeaderTitle
        title="Powerpoint Slide Generator"
        icon={<IconLayoutSidebar width={18} height={18} color={"#FFFFFF"} />}
      />
      <Box
        sx={{
          border: "1px solid",
          borderColor: "neutral.200",
          borderRadius: "10px",
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
          <TabPanel value="Tool">
            <PowerpointSlideGeneratorTool />
          </TabPanel>
          <TabPanel value="Help">
            <PowerpointSlideGeneratorHelp />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default PowerpointSlideGenerator;
