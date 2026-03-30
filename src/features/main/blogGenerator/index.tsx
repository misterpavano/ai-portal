import * as React from "react";
import Box from "@mui/material/Box";
import DiscussionGuidesTool from "./Tool/BlogGeneratorTool";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import { IconDirectionArrows } from "@tabler/icons-react";

const BlogGenerator = () => {
  return (
    <Box sx={{ typography: "body1", p: 2 }}>
      <HeaderTitle
        title="Blog Generator"
        icon={<IconDirectionArrows width={18} height={18} color={"#FFFFFF"} />}
      />
      <Box
        sx={{
          border: "1px solid",
          borderColor: "neutral.200",
          borderRadius: "10px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 3,
          }}
        >
          <DiscussionGuidesTool />
        </Box>
      </Box>
    </Box>
  );
};

export default BlogGenerator;
