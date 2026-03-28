import { useEffect } from "react";
import { useAtom } from "jotai";
import Box from "@mui/material/Box";
import { meetingNotesFormAtom } from "../../../../../atoms/meetingNotesAtom";
import MeetingNotesDiscussionForm from "../Forms/MeetingNotesDiscussionForm";

const MeetingNotesDiscussionStep = () => {
  const [meetingNotesFormValues, setMeetingNotesFormValues] =
    useAtom(meetingNotesFormAtom);

  useEffect(() => {
    if (meetingNotesFormValues.objectives) {
      setMeetingNotesFormValues(meetingNotesFormValues);
    } else {
      setMeetingNotesFormValues(meetingNotesFormValues);
    }
  }, [meetingNotesFormValues]);

  return (
    <Box
      sx={{
        padding: "0 20px 20px 20px",
      }}
      gap={4}
      display="flex"
      flexDirection="row"
    >
      <Box sx={{ marginTop: 4, flexBasis: "50%" }}>
        <MeetingNotesDiscussionForm
          initialValues={meetingNotesFormValues}
          setMeetingNotesFormValues={setMeetingNotesFormValues}
        />
      </Box>
    </Box>
  );
};

export default MeetingNotesDiscussionStep;
