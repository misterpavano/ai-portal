import Box from "@mui/material/Box";
import { IconTextCaption } from "@tabler/icons-react";
import * as React from "react";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import { useAtom } from "jotai";
import { meetingNotesFormAtom } from "../../../atoms/meetingNotesAtom";
import Footer from "../../../components/layouts/footer";
import MeetingNotesTool from "./Tool/Content/MeetingNotesTool";

interface MeetingNotesProps {
  footer: React.ReactNode;
}

const MeetingNotes = ({ footer }: MeetingNotesProps) => {
  const [meetingNotesFormValues] = useAtom(meetingNotesFormAtom);

  return (
    <Footer footer={footer}>
      <Box sx={{ typography: "body1", p: 2 }}>
        <HeaderTitle
          title="Meeting Notes"
          subtitle={meetingNotesFormValues.type.name}
          icon={<IconTextCaption width={18} height={18} color={"#FFFFFF"} />}
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
          <MeetingNotesTool />
        </Box>
      </Box>
    </Footer>
  );
};

export default MeetingNotes;
