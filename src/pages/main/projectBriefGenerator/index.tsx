import { useAtom } from "jotai";
import ProjectBriefGenerator from "../../../features/main/projectBriefGenerator";
import {
  projectBriefFormAtom,
  projectBriefStepAtom,
} from "../../../atoms/projectBriefAtom";
import ProjectBriefFooter from "../../../features/main/projectBriefGenerator/Tool/Content/ProjectBriefFooter";

const ProjectBriefGeneratorPage = () => {
  const [step, setCurrentStep] = useAtom(projectBriefStepAtom);
  const [projectBriefFromValues] = useAtom(projectBriefFormAtom);
  const isFooterVisible =
    !projectBriefFromValues.type.name ||
    projectBriefFromValues.type.name === "Audit";

  const isVisible = step.currentStep !== 2;

  const nextStep = () => {
    setCurrentStep((prevStep) => ({
      ...prevStep,
      currentStep: prevStep.currentStep + 1,
    }));
  };

  return (
    <ProjectBriefGenerator
      footer={
        isFooterVisible && (
          <ProjectBriefFooter
            step={step}
            setCurrentStep={setCurrentStep}
            nextStep={nextStep}
            isNextButtonVisible={isVisible}
          />
        )
      }
    />
  );
};

export default ProjectBriefGeneratorPage;
