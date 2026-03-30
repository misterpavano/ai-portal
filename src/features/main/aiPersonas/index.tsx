import Box from "@mui/material/Box";
import { IconTextCaption } from "@tabler/icons-react";
import * as React from "react";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import { useAtom } from "jotai";
import Footer from "../../../components/layouts/footer";
import {
  aiPersonasFormAtom,
  aiPersonasStepAtom,
} from "../../../atoms/aiPersonasAtom";
import AIPersonasTool from "./Tool/Content/AIPersonasTool";
import AIPersonasHeader from "./Tool/Content/AIPersonasHeader";

interface AIPersonasProps {
  footer?: React.ReactNode;
}

const AIPersonas = ({ footer }: AIPersonasProps) => {
  const [step] = useAtom(aiPersonasStepAtom);
  const [aiPersonasValues] = useAtom(aiPersonasFormAtom);

  const isVisible = step.currentStep === 0;

  return (
    <>
      {isVisible ? (
        <Footer footer={footer}>
          <Box sx={{ typography: "body1", p: 2 }}>
            <HeaderTitle
              title="AI Personas"
              subtitle={aiPersonasValues.persona.name}
              icon={
                <IconTextCaption width={18} height={18} color={"#FFFFFF"} />
              }
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
              <AIPersonasTool />
            </Box>
          </Box>
        </Footer>
      ) : (
        <Footer footer={footer}>
          <Box>
            <AIPersonasHeader clientName="A" />
            <AIPersonasTool />
          </Box>
        </Footer>
      )}
    </>
  );
};

export default AIPersonas;
