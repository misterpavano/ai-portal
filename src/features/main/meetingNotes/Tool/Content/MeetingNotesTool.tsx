import React from "react";
import Box from "@mui/material/Box";
import { useAtom } from "jotai";
import {
  meetingNotesFormAtom,
  meetingNotesStepAtom,
} from "../../../../../atoms/meetingNotesAtom";
import MeetingNotesTypesStep from "./MeetingNotesTypesStep";
import MeetingNotesDiscussionStep from "./MeetingNotesDiscussionStep";
import MeetingNotesStructureStep from "./MeetingNotesStructureStep";
import ReviewMeetingNotes from "./ReviewMeetingNotes";
import ReviewGeneralMeetingNotes from "./ReviewGeneralMeetingNotes";

interface Step {
  label: string;
  component: React.ReactNode;
}

const MeetingNotesTool: React.FC = () => {
  const [step, setCurrentStep] = useAtom(meetingNotesStepAtom);
  const [meetingNotesFormValues, setMeetingNotesFormValues] =
    useAtom(meetingNotesFormAtom);

  const nextStep = () => {
    setCurrentStep((prevStep) => ({
      ...prevStep,
      currentStep: prevStep.currentStep + 1,
    }));
  };

  const steps: Step[] =
    meetingNotesFormValues.type.name === "General Meeting Notes"
      ? [
          {
            label: "Introduction",
            component: (
              <MeetingNotesTypesStep
                nextStep={nextStep}
                setSelectedType={(type) => {
                  setMeetingNotesFormValues((prevValues) => ({
                    ...prevValues,
                    type,
                  }));
                }}
              />
            ),
          },
          {
            label: "Mandatory Inputs",
            component: <MeetingNotesDiscussionStep />,
          },
          {
            label: "Review",
            component: <ReviewGeneralMeetingNotes />,
          },
        ]
      : [
          {
            label: "Introduction",
            component: (
              <MeetingNotesTypesStep
                nextStep={nextStep}
                setSelectedType={(type) => {
                  setMeetingNotesFormValues((prevValues) => ({
                    ...prevValues,
                    type,
                  }));
                }}
              />
            ),
          },
          {
            label: "Mandatory Inputs",
            component: <MeetingNotesDiscussionStep />,
          },
          {
            label: "Structure",
            component: (
              <MeetingNotesStructureStep
                selectedType={meetingNotesFormValues.type.name}
              />
            ),
          },
          {
            label: "Output",
            component: <ReviewMeetingNotes />,
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

export default MeetingNotesTool;
