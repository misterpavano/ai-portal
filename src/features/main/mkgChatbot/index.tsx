import Box from "@mui/material/Box";
import MKGChatbotTool from "./Tool/MKGChatbotTool";

const MKGChatbot = () => {
  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <MKGChatbotTool
          clientName="Hedgehox_AI_Bot"
          vectorStoreId="vs_04sFUGvNwetXjrzZcN17hvcP"
          assistantId="asst_BPz5DIjkI9dj6m2TIHN2fEID"
        />
      </Box>
    </Box>
  );
};

export default MKGChatbot;
