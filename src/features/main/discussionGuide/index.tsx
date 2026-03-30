import * as React from "react";
import Box from "@mui/material/Box";
import { IconDirectionArrows } from "@tabler/icons-react";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import DiscussionGuideTool from "./Tool/DiscussionGuideTool";
import { useAtom } from "jotai";
import { discussionGuideFlowAtom } from "../../../atoms/discussionGuideAtom";
import Footer from "../../../components/layouts/footer";

interface DiscussionGuideProps {
  footer: React.ReactNode;
}

const DiscussionGuide: React.FC<DiscussionGuideProps> = ({ footer }) => {
  const [discussionGuideFlow] = useAtom(discussionGuideFlowAtom);

  return (
    <Footer footer={footer}>
      <Box sx={{ typography: "body1", p: 2 }}>
        <HeaderTitle
          title="Discussion Guide Tool"
          subtitle={discussionGuideFlow.type.name}
          icon={
            <IconDirectionArrows width={18} height={18} color={"#FFFFFF"} />
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
          <DiscussionGuideTool />
        </Box>
      </Box>
    </Footer>
  );
};

export default DiscussionGuide;
