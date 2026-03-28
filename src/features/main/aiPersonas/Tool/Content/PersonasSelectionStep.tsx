import React from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import { AIPersona } from "../../../../../types/aiPersonas";
import cmo from "../../../../../assets/personas/cmo.png";
import accountManager from "../../../../../assets/personas/account_manager.png";
import techLead from "../../../../../assets/personas/tech_lead.png";

interface AIPersonasStepProps {
  setSelectedPersona: (persona: AIPersona) => void;
  nextStep: () => void;
}

const personas: AIPersona[] = [
  {
    id: "tech_lead_no_patterns",
    name: "Skeptical Tech Lead",
    role: "Technical Lead",
    industry: "Digital Development",
    description:
      "A senior tech lead who prefers custom-built solutions over pattern libraries.",
    image: techLead,
  },
  {
    id: "pharma_agency_account_manager",
    name: "Pharma Agency Account Manager",
    role: "Account Manager",
    industry: "Pharmaceutical Marketing",
    description:
      "A seasoned account manager who prefers traditional methods and resists automation.",
    image: accountManager,
  },
  {
    id: "pharma_cmo",
    name: "Pharmaceutical CMO",
    role: "Chief Marketing Officer",
    industry: "Pharmaceutical",
    description:
      "A skeptical CMO who prefers proven marketing strategies over AI-driven methods.",
    image: cmo,
  },
];

const PersonasSelectionSteps: React.FC<AIPersonasStepProps> = ({
  setSelectedPersona,
  nextStep,
}) => {
  return (
    <Box sx={{ padding: "20px 0 20px 20px" }}>
      <Grid container columnSpacing={2} rowSpacing={2} sx={{ maxWidth: 980 }}>
        {personas.map((persona) => (
          <Grid item lg={6} xs={12} sm={6} key={persona.id}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                border: "1px solid #E7E7E7",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "10px",
                opacity: 1,
                filter: "none",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "10px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <Box
                    sx={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "30%",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={persona.image}
                      alt={persona.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 540, fontSize: "16px" }}>
                    {persona.name}
                  </Typography>
                  <Typography sx={{ fontSize: "14px", color: "#475467" }}>
                    {persona.description}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", height: 30, paddingLeft: 6 }}>
                <Button
                  id={persona.id}
                  sx={{
                    display: "flex",
                    gap: "5px",
                    border: "1.5px solid black",
                    fontSize: "12px",
                    height: 30,
                  }}
                  onClick={() => {
                    setSelectedPersona({ name: persona.name, id: persona.id });
                    nextStep();
                  }}
                >
                  Chat with {persona.name}
                  <IconArrowNarrowRight size={15} />
                </Button>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PersonasSelectionSteps;
