import {
  Box,
  Typography,
  CardHeader,
  MenuItem,
  Menu,
  Avatar,
  Divider,
} from "@mui/material";
import {
  IconLogout,
  IconMessageChatbot,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { useAtom } from "jotai";
import { useState } from "react";
import {
  isAuthenticatedAtom,
  userAtom,
  userDisplayNameAtom,
} from "../../../../atoms/userAtom";

interface AIChatbotHeaderProps {
  clientName: string;
  isTyping: boolean;
  classes: Record<string, string>;
}

const AIChatbotHeader = ({
  clientName,
  isTyping,
  classes,
}: AIChatbotHeaderProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const [user, setUser] = useAtom(userAtom);
  const [, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [displayName] = useAtom(userDisplayNameAtom);

  const handleMenuOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    if (anchorEl) {
      handleMenuClose();
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <CardHeader
      style={{
        backgroundColor: "white",
        color: "black",
        height: "34px",

        borderRadius: 0,
        borderBottom: "2px solid #f1f1f1",
      }}
      title={
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            paddingX: 3,
            position: "relative",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              borderRadius: 2,
              backgroundColor: "primary.600",
              width: 28,
              height: 28,
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              mr: 1.5,
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
                {clientName}
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

export default AIChatbotHeader;
