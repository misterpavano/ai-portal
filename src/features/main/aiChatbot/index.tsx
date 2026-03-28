import Box from "@mui/material/Box";
import AIChatbotTool from "./Tool/MKGChatbotTool";

const AIChatbot = () => {
  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <AIChatbotTool
          clientName="ChatAI"
          vectorStoreId="vs_68d53e9d8ea08191a2b09da324988367"
          assistantId="asst_SVuodb2WYsDotr6QjPyBixoi"
        />
      </Box>
    </Box>
  );
};

export default AIChatbot;
