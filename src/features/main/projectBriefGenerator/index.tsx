import Box from "@mui/material/Box";
import Footer from "../../../components/layouts/footer";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import { IconTextCaption } from "@tabler/icons-react";
import ProjectBriefTool from "./Tool/Content/ProjectBriefTool";
import {
  projectBriefStepAtom,
} from "../../../atoms/projectBriefAtom";
import { useAtom } from "jotai";

interface ProjectBriefProps {
  footer?: React.ReactNode;
}

const ProjectBriefGenerator = ({ footer }: ProjectBriefProps) => {
  const [step] = useAtom(projectBriefStepAtom);

  const isVisible = step.currentStep === 0;

  return (
    <>
      {isVisible ? (
        <Footer footer={footer}>
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
              <ProjectBriefTool />
            </Box>
          </Box>
        </Footer>
      ) : (
        <Footer footer={footer}>
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
