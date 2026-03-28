import React, { useState } from "react";
import Box from "@mui/material/Box";
import { useAtom } from "jotai";
import {
  projectBriefFormAtom,
  projectBriefStepAtom,
} from "../../../../../atoms/projectBriefAtom";
import ProjectBriefTypesStep from "./ProjectBriefTypesStep";
import ProjectBriefChatbotTool from "./Interview/ProjectBriefChatbotTool";
import ReviewAuditProjectBrief from "./Audit/ReviewAuditProjectBrief";
import AuditProjectBrief from "./Audit/AuditProjectBrief";
import { projectBriefSlice } from "../../../../../api/slices/projectBriefSlice";

interface Step {
  label: string;
  component: React.ReactNode;
}

type TProjectType = {
  assistantId: string;
  sheetUrl: string;
  label: string;
};

const ProjectBriefTool: React.FC = () => {
  const [projectBriefFormValue, setProjectBriefFormValues] =
    useAtom(projectBriefFormAtom);

  const projectTypes: TProjectType[] = [
    {
      label: "Please select project type",
      assistantId: "",
      sheetUrl: "",
    },
    {
      label: "Website",
      assistantId:
        projectBriefFormValue.type.name === "Audit"
          ? "asst_6RD1YoSkD8T2JyyvMKT5bujl"
          : "asst_VHJmr5SHVZPb0VM7NMUuvjuI",
      sheetUrl:
        "AKfycbxiF6H1R1kkRr8NRdfspwzpq9o8Psqay1sh-WBLqoag_sV0EScj24pjZLiQqGZqFqbO/exec",
    },
    {
      label: "Veeva",
      assistantId:
        projectBriefFormValue.type.name === "Audit"
          ? "asst_hZtU9GHDKwwhdMLvkiv4yntK"
          : "asst_gtwbbkfSo1auipUz2614IeFy",
      sheetUrl: "",
    },
  ];

  const [step, setCurrentStep] = useAtom(projectBriefStepAtom);
  const [assistantId, setAssistantId] = useState<string>(
    projectTypes[0].assistantId
  );
  const selectedProjectType = projectTypes.find(
    (projectType) => projectType.assistantId === assistantId
  );
  const { data } = projectBriefSlice.useGetDataFromSheetQuery(
    selectedProjectType?.sheetUrl || "",
    { skip: !assistantId }
  );

  const nextStep = () => {
    setCurrentStep((prevStep) => ({
      ...prevStep,
      currentStep: prevStep.currentStep + 1,
    }));
  };

  const handleSelect = async (e: any) => {
    setAssistantId(e.target.value);
  };

  const steps: Step[] = [
    {
      label: "Introduction",
      component: (
        <ProjectBriefTypesStep
          nextStep={nextStep}
          setSelectedType={(type) => {
            setProjectBriefFormValues((prevValues) => ({
              ...prevValues,
              type,
            }));
          }}
        />
      ),
    },
    {
      label: "Output",
      component:
        projectBriefFormValue.type.name === "Audit" ? (
          <AuditProjectBrief
            assistantId={assistantId}
            projectTypes={projectTypes}
            handleSelect={handleSelect}
          />
        ) : (
          <ProjectBriefChatbotTool />
        ),
    },
    {
      label: "Review",
      component: (
        <ReviewAuditProjectBrief
          questions={data?.questions}
          assistantId={assistantId}
          projectTypes={projectTypes}
          handleSelect={handleSelect}
        />
      ),
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "50vh",
        width: "100%",
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        {steps[step.currentStep].component}
      </Box>
    </Box>
  );
};

export default ProjectBriefTool;
