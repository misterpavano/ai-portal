import { Box, Typography, CardHeader } from "@mui/material";
import { IconMessageChatbot } from "@tabler/icons-react";

interface MKGChatbotHeaderProps {
  clientName: string;
  isTyping: boolean;
  classes: Record<string, string>;
}

const MKGChatbotHeader = ({
  clientName,
  isTyping,
  classes,
}: MKGChatbotHeaderProps) => {
  return (
    <CardHeader
      style={{
        color: "black",
        height: "65px",
        borderRadius: 0,
        borderBottom: "2px solid #f1f1f1",
      }}
      title={
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#E86D5A",
              borderRadius: "40%",
              padding: "5px",
            }}
          >
            <IconMessageChatbot size={18} color="white" />
          </Box>
          {isTyping && <Box className={classes.greenDot} />}
          <Box
            sx={{
              display: "flex",
              flex: 1,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography style={{ fontWeight: 600, fontSize: "18px" }}>
                {clientName.replace(/_/g, " ")}
              </Typography>
            </Box>
            <Box
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            ></Box>
          </Box>
        </Box>
      }
    />
  );
};

export default MKGChatbotHeader;
