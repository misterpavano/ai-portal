import { Box, Typography, CardHeader } from "@mui/material";
import { IconArrowLeft } from "@tabler/icons-react";
import { useAtom } from "jotai";
import {
  aiPersonasFormAtom,
  aiPersonasStepAtom,
} from "../../../../../atoms/aiPersonasAtom";
import { initialAIPersonasValues } from "../../../../../config/aiPersonasValues";

interface PersonasChatbotHeaderProps {
  clientName: string;
  isTyping: boolean;
  classes: Record<string, string>;
}

const PersonasChatbotHeader = ({
  clientName,
  isTyping,
  classes,
}: PersonasChatbotHeaderProps) => {
  const [, setCurrentStep] = useAtom(aiPersonasStepAtom);
  const [, setAIPersonasFormValues] = useAtom(aiPersonasFormAtom);

  const handleReturnToFirstStep = () => {
    setCurrentStep({ currentStep: 0, isFinished: false });
    setAIPersonasFormValues(initialAIPersonasValues);
  };
  return (
    <CardHeader
      style={{
        color: "black",
        height: "65px",
        borderRadius: 0,
        borderBottom: "2px solid #f1f1f1",
      }}
      title={
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            alignItems: "center",
            position: "relative",
          }}
        >
          <IconArrowLeft
            style={{ cursor: "pointer" }}
            onClick={handleReturnToFirstStep}
            size={18}
            color="black"
          />
          {isTyping && <Box className={classes.greenDot} />}
          <Box
            sx={{
              display: "flex",
              flex: 1,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography style={{ fontWeight: 400, fontSize: "16px" }}>
                AI Personas / <b>{clientName.replace(/_/g, " ")}</b>
              </Typography>
            </Box>
            <Box
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            ></Box>
          </Box>
        </Box>
      }
    />
  );
};

export default PersonasChatbotHeader;
