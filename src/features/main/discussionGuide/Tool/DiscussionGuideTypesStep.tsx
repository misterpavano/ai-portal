import { Box, Typography, Button, Grid } from "@mui/material";
import {
  IconArrowNarrowRight,
  IconNotebook,
  IconRouteAltLeft,
  IconClockHour12,
  IconLayersIntersect,
  IconHourglassEmpty,
  IconContrast2,
} from "@tabler/icons-react";
import { GuideType } from "../../../../types/discussionGuidesTypes";

export type DiscussionGuideTypesStepProps = {
  setSelectedType: (type: { name: string; id: string }) => void;
  nextStep: () => void;
};

const DiscussionGuideTypesStep = ({
  setSelectedType,
  nextStep,
}: DiscussionGuideTypesStepProps) => {
  const types: GuideType[] = [
    "Focus Group",
    "Patient Journey",
    "Communication Testing",
    "TPP Testing",
    "Payer Guides",
    "Market Assessment",
  ];

  // Map types to icons
  const typeToIcon: Record<GuideType, JSX.Element> = {
    "Focus Group": <IconContrast2 size={18} />,
    "Patient Journey": <IconNotebook size={18} />,
    "Communication Testing": <IconLayersIntersect size={18} />,
    "TPP Testing": <IconClockHour12 size={18} />,
    "Payer Guides": <IconRouteAltLeft size={18} />,
    "Market Assessment": <IconHourglassEmpty size={18} />,
  };

  const typeToId: Record<GuideType, string> = {
    "Focus Group": "focus_group",
    "Patient Journey": "patient_journey",
    "Communication Testing": "communication_testing",
    "TPP Testing": "tpp_testing",
    "Payer Guides": "payer_guides",
    "Market Assessment": "market_assessment",
  };

  return (
    <Box sx={{ padding: "20px 0 20px 20px" }}>
      <Grid container columnSpacing={2} rowSpacing={2} sx={{ maxWidth: 980 }}>
        {types.map((name, key) => (
          <Grid item lg={6} xs={12} sm={6} key={key}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                border: "1px solid rgb(231, 231, 231)",
                borderRadius: "8px",
                padding: "15px",
                width: "100%",
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
              </Box>
              <Box
                sx={{
                  display: "flex",
                  width: 280,
                  height: 30,
                }}
              >
                <Button
                  id={typeToId[name]}
                  sx={{
                    display: "flex",
                    gap: "10px",
                    border: "1.5px solid black",
                    fontSize: "12px",
                    height: 30,
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

export default DiscussionGuideTypesStep;
