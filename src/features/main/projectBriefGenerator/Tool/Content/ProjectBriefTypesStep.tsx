import React from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import { IconArrowNarrowRight, IconContrast2 } from "@tabler/icons-react";

interface ProjectBriefStepProps {
  setSelectedType: (type: { name: string; id: string }) => void;
  nextStep: () => void;
}

export type ProjectBriefType = "Audit" | "Interview";

const ProjectBriefTypesStep: React.FC<ProjectBriefStepProps> = ({
  setSelectedType,
  nextStep,
}) => {
  const types: ProjectBriefType[] = ["Audit", "Interview"];

  const typeToIcon: Record<ProjectBriefType, JSX.Element> = {
    Audit: <IconContrast2 size={18} />,
    Interview: <IconContrast2 size={18} />,
  };

  const typeToDescription: Record<ProjectBriefType, string> = {
    Audit:
      "Mauris vitae placerat orci. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
    Interview:
      "Mauris vitae placerat orci. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
  };

  const typeToId: Record<ProjectBriefType, string> = {
    Audit: "audit_project",
    Interview: "interview_project",
  };

  return (
    <Box sx={{ padding: "20px 0 20px 20px" }}>
      <Grid container columnSpacing={2} rowSpacing={2} sx={{ maxWidth: 980 }}>
        {types.map((name, key) => (
          <Grid item lg={6} xs={12} sm={6} key={key}>
            <Box
              key={key}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                border: "1px solid #E7E7E7",
                borderRadius: "8px",
                padding: "15px",
                width: 480,
                height: 140,
                marginBottom: "10px",
                opacity: 1,
                filter: "none",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 540,
                    fontSize: "16px",
                    lineHeight: "19px",
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 0.5,
                  }}
                >
                  {typeToIcon[name]}
                  <Box sx={{ ml: 1 }}>{name}</Box>
                </Typography>
                <Typography sx={{ fontSize: "14px" }}>
                  {typeToDescription[name]}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  height: 30,
                }}
              >
                <Button
                  id={typeToId[name]}
                  sx={{
                    display: "flex",
                    gap: "5px",
                    border: "1.5px solid black",
                    fontSize: "12px",
                    height: 30,
                    pointerEvents: "auto",
                  }}
                  onClick={() => {
                    setSelectedType({ name, id: typeToId[name] });
                    nextStep();
                  }}
                >
                  Proceed to {name}
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

export default ProjectBriefTypesStep;
