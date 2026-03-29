import Box from "@mui/material/Box";
import { useState } from "react";
import Footer from "../../../components/layouts/footer";
import { Typography, styled } from "@mui/material";
import TabList from "@mui/lab/TabList";
import Tab from "@mui/material/Tab";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import { IconHelp, IconTextCaption, IconTool } from "@tabler/icons-react";
import TabPanel from "@mui/lab/TabPanel";
import TabContext from "@mui/lab/TabContext";
import ProjectBriefTool from "./Tool/Content/ProjectBriefTool";
import {
  projectBriefFormAtom,
  projectBriefStepAtom,
} from "../../../atoms/projectBriefAtom";
import { useAtom } from "jotai";

interface ProjectBriefProps {
  footer?: React.ReactNode;
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

const ProjectBriefGenerator = ({ footer }: ProjectBriefProps) => {
  const [value, setValue] = useState("Tool");
  const [step] = useAtom(projectBriefStepAtom);
  const [projectBriefFromValues] = useAtom(projectBriefFormAtom);

  const isVisible = step.currentStep === 0;

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  return (
    <>
      {isVisible ? (
        <Footer footer={value === "Tool" ? footer : null}>
          <Box sx={{ typography: "body1", p: 2 }}>
            <HeaderTitle
              title="Project Brief Assistant"
              icon={
                <IconTextCaption width={18} height={18} color={"#FFFFFF"} />
              }
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
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
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
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
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
                  <ProjectBriefTool />
                </TabPanel>
                <TabPanel id="Help_MKGAI_Summary" sx={{ p: 0 }} value="Help">
                  <Box></Box>
                </TabPanel>
              </TabContext>
            </Box>
          </Box>
        </Footer>
      ) : (
        <Footer footer={value === "Tool" ? footer : null}>
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ProjectBriefTool />
            </Box>
          </Box>
        </Footer>
      )}
    </>
  );
};

export default ProjectBriefGenerator;
