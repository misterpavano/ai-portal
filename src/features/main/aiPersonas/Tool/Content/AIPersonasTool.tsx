import React from "react";
import Box from "@mui/material/Box";
import { useAtom } from "jotai";

import {
  aiPersonasFormAtom,
  aiPersonasStepAtom,
} from "../../../../../atoms/aiPersonasAtom";
import PersonasSelectionSteps from "./PersonasSelectionStep";
import AIPersonasChatbotTool from "../Chatbot/PersonasChatbotTool";
import ConversationGoalsStep from "./ConersationGoals";

interface Step {
  label: string;
  component: React.ReactNode;
}

const AIPersonasTool: React.FC = () => {
  const [step, setCurrentStep] = useAtom(aiPersonasStepAtom);
  const [, setAIPersonasFormValues] = useAtom(aiPersonasFormAtom);

  const nextStep = () => {
    setCurrentStep((prevStep) => ({
      ...prevStep,
      currentStep: prevStep.currentStep + 1,
    }));
  };

  const steps: Step[] = [
    {
      label: "Selection",
      component: (
        <PersonasSelectionSteps
          nextStep={nextStep}
          setSelectedPersona={(persona) => {
            setAIPersonasFormValues((prevValues) => ({
              ...prevValues,
              persona,
            }));
          }}
        />
      ),
    },
    {
      label: "Goals",
      component: <ConversationGoalsStep />,
    },
    {
      label: "Chatbot",
      component: (
        <AIPersonasChatbotTool
          clientName="Hedgehox_AI_Bot"
          vectorStoreId="vs_04sFUGvNwetXjrzZcN17hvcP"
          assistantId="asst_BPz5DIjkI9dj6m2TIHN2fEID"
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

export default AIPersonasTool;
