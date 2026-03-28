import { useAtom } from "jotai";
import MeetingNotes from "../../../features/main/meetingNotes/index";
import MeetingNotesFooter from "../../../features/main/meetingNotes/Tool/Content/MeetingNotesFooter";
import { meetingNotesStepAtom } from "../../../atoms/meetingNotesAtom";

const MeetingNotesPage = () => {
  const [step, setCurrentStep] = useAtom(meetingNotesStepAtom);
  const isNextButtonVisible = step.currentStep !== 0;

  const nextStep = () => {
    setCurrentStep((prevStep) => ({
      ...prevStep,
      currentStep: prevStep.currentStep + 1,
    }));
  };
  return (
    <MeetingNotes
      footer={
        <MeetingNotesFooter
          step={step}
          setCurrentStep={setCurrentStep}
          nextStep={nextStep}
          isNextButtonVisible={isNextButtonVisible}
        />
      }
    />
  );
};

export default MeetingNotesPage;
