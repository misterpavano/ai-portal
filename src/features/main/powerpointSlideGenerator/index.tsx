import * as React from "react";
import Box from "@mui/material/Box";
import PowerpointSlideGeneratorTool from "./Tool/PowerpointSlideGeneratorTool";
import { IconLayoutSidebar } from "@tabler/icons-react";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";

const PowerpointSlideGenerator = () => {
  return (
    <Box sx={{ typography: "body1", p: 2 }}>
      <HeaderTitle
        title="Powerpoint Slide Generator"
        icon={<IconLayoutSidebar width={18} height={18} color={"#FFFFFF"} />}
      />
      <Box
        sx={{
          border: "1px solid",
          borderColor: "neutral.200",
          borderRadius: "10px",
          p: 3,
        }}
      >
        <PowerpointSlideGeneratorTool />
      </Box>
    </Box>
  );
};

export default PowerpointSlideGenerator;
