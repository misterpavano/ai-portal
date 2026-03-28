import { Box } from "@mui/material";
import DashboardHeader from "./DashboardHeader";
import DashboardContent from "./DashboardContent";

const DashboardTool = () => {
  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <DashboardHeader />
      <DashboardContent />
    </Box>
  );
};

export default DashboardTool;
