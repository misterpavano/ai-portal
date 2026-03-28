import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  LinearProgress,
} from "@mui/material";

import techLead from "../../../../../assets/personas/tech_lead.png";
import {
  aiPersonasFormAtom,
  aiPersonasStepAtom,
} from "../../../../../atoms/aiPersonasAtom";
import { useAtom } from "jotai";

interface ConversationGoalsStepProps {}

const ConversationGoalsStep: React.FC<ConversationGoalsStepProps> = () => {
  const [aiPersonas, setAiPersonas] = useAtom(aiPersonasFormAtom);
  const [, setCurrentStep] = useAtom(aiPersonasStepAtom);

  const [goal, setGoal] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGoal(event.target.value);
  };

  const handleStartConversation = () => {
    if (goal.trim()) {
      setAiPersonas((prev) => ({
        ...prev,
        persona: {
          ...prev.persona,
          conversationGoals: goal,
        },
      }));

      setCurrentStep((prevStep) => ({
        ...prevStep,
        currentStep: prevStep.currentStep + 1,
      }));
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100vh",
        margin: "auto",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {/* Left Section */}
      <Box
        sx={{
          width: "60%",
          display: "flex",
          flexDirection: "column",
          padding: "90px 50px",
        }}
      >
        <Typography sx={{ fontSize: "24px", fontWeight: 600, marginBottom: 2 }}>
          Conversation goal
        </Typography>

        <Typography
          sx={{ fontSize: "16px", color: "#475467", marginBottom: 3 }}
        >
          <b>
            Define key objectives and challenges for your selected <br />{" "}
            persona.
          </b>{" "}
          Align their needs with actionable goals to drive <br /> meaningful
          engagement.
        </Typography>

        <TextField
          fullWidth
          placeholder="Enter conversation goal..."
          value={goal}
          onChange={handleChange}
          sx={{
            maxWidth: "522px",
            height: "53px",
            backgroundColor: "#FAFAF9",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              fontSize: "14px",
              "& fieldset": { border: "none" },
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  variant="contained"
                  onClick={handleStartConversation}
                  disabled={!goal.trim()}
                  sx={{
                    height: "48px",
                    marginTop: 0.7,
                    marginRight: -1.4,
                    backgroundColor: goal.trim() ? "#7397B3" : "#D3D3D3",
                    color: "#fff",
                    borderRadius: "12px",
                    fontWeight: 500,
                    fontSize: "14px",
                    textTransform: "none",
                    padding: "20px 10px",
                    "&:hover": {
                      backgroundColor: goal.trim() ? "#5E87A0" : "#D3D3D3",
                    },
                  }}
                >
                  Start conversation
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Right Section */}
      <Box
        sx={{
          width: "40%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FAFAF9",
          borderLeft: "1px solid #E7E7E7",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: 3,
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "10px",
              marginBottom: 1,
            }}
          >
            <Box sx={{ display: "flex", gap: "15px", alignItems: "center" }}>
              <Box
                sx={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "30%",
                  overflow: "hidden",
                }}
              >
                <img
                  src={techLead}
                  alt="1"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
              <Typography sx={{ fontWeight: 540, fontSize: "16px" }}>
                {aiPersonas.persona.name}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 500, fontSize: "14px" }}>
              Attributes:
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  sx={{ fontWeight: 400, fontSize: "14px", color: "#475467" }}
                >
                  Attributes:
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={10}
                sx={{
                  height: 8,
                  borderRadius: "20px",
                  backgroundColor: "#D6D3D1",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: "20px",
                    backgroundColor: "#E86D5A",
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ConversationGoalsStep;
