import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Typography, styled } from "@mui/material";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { IconHelp, IconRoute, IconTool } from "@tabler/icons-react";
import * as React from "react";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import { useAtom } from "jotai";
import { routeValidatorStepAtom } from "../../../atoms/routeValidatorAtom";
import RouteValidatorTool from "./Tool/Content/RouteValidatorTool";
import RouteValidatorFooter from "./Tool/Content/RouteValidatorFooter";

const StyledTab = styled(Tab)(() => ({
  backgroundColor: "#FFFFFF",
  textTransform: "none",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  "&.Mui-selected": {
    backgroundColor: "#FFFFFF",
    color: "#1C1917",
    fontWeight: 600,
    borderBottom: "2px solid #1C1917",
  },
  "&:not(.Mui-selected)": {
    color: "#44403C",
  },
}));

const StyledTabs = styled(TabList)(() => ({
  paddingLeft: 8,
  borderTopLeftRadius: "10px",
  borderBottom: "none",
  "& .MuiTabs-indicator": {
    display: "none",
  },
}));

const RouteValidator = () => {
  const [step, setCurrentStep] = useAtom(routeValidatorStepAtom);
  // Hide Next button on first step (0) and last step (2 - Output)
  const isNextButtonVisible = step.currentStep !== 0 && step.currentStep !== 2;

  const nextStep = () => {
    setCurrentStep((prevStep) => ({
      ...prevStep,
      currentStep: prevStep.currentStep + 1,
    }));
  };

  const [value, setValue] = React.useState("Tool");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <>
      <HeaderTitle
        title="Route Assistant"
        subtitle="Validate and review documents"
        icon={<IconRoute width={18} height={18} color={"#FFFFFF"} />}
      />
      <Box sx={{ typography: "body1", p: 3 }}>
        <Box
          sx={{
            border: "1px solid",
            borderColor: "#E7E5E4",
            borderRadius: "10px",
            boxShadow:
              "0 1px 3px rgba(28,25,23,0.06), 0 1px 2px rgba(28,25,23,0.04)",
            backgroundColor: "#FFFFFF",
          }}
        >
          <TabContext value={value}>
            <Box
              sx={{
                borderBottom: "1px solid #E7E5E4",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
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
              {step.currentStep !== 2 && (
                <Box sx={{ padding: 3 }}>
                  <RouteValidatorFooter
                    step={step}
                    setCurrentStep={setCurrentStep}
                    nextStep={nextStep}
                    isNextButtonVisible={isNextButtonVisible}
                  />
                </Box>
              )}
              <RouteValidatorTool />
            </TabPanel>
            <TabPanel id="Help_Route_Validator" sx={{ p: 0 }} value="Help">
              <Box sx={{ p: 3 }}>
                <Typography>Help content will be added here.</Typography>
              </Box>
            </TabPanel>
          </TabContext>
        </Box>
      </Box>
    </>
  );
};

export default RouteValidator;
