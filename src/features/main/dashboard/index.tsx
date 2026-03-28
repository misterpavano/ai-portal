import { Box } from "@mui/material";
import DashboardTool from "./Tool/DashboardTool";

const Dashboard = () => {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <DashboardTool />
      </Box>
    </Box>
  );
};

export default Dashboard;
