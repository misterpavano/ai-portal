import {
  Avatar,
  Box,
  CardHeader,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IconLogout, IconSettings, IconUser } from "@tabler/icons-react";
import { useState } from "react";
import { useAtom } from "jotai";
import {
  userAtom,
  isAuthenticatedAtom,
  userDisplayNameAtom,
} from "../../atoms/userAtom";
import { useLogoutMutation } from "../../api/slices/authApiSlice";
import { useAuthenticator } from "@aws-amplify/ui-react";

type HeaderTitleProps = {
  title: string;
  icon: React.ReactNode;
  subtitle?: string;
  selectedModel?: string;
};

const HeaderTitle = ({
  title,
  subtitle,
  icon,
  selectedModel,
}: HeaderTitleProps) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const [user, setUser] = useAtom(userAtom);
  const [, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [displayName] = useAtom(userDisplayNameAtom);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { signOut } = useAuthenticator((context) => [context.user]);

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

  const handleLogout = async () => {
    try {
      handleMenuClose();

      await logout().unwrap();

      // Clear interview summary assistant data from localStorage
      localStorage.removeItem("assistantIdMeetingSummary");
      localStorage.removeItem("vectorStoreIdMeetingSummary");
      localStorage.removeItem("assistantModelMeetingSummary");

      setUser(null);
      setIsAuthenticated(false);

      // Sign out from AWS Amplify authentication
      signOut();
    } catch (error) {
      // Clear interview summary assistant data from localStorage even on error
      localStorage.removeItem("assistantIdMeetingSummary");
      localStorage.removeItem("vectorStoreIdMeetingSummary");
      localStorage.removeItem("assistantModelMeetingSummary");

      setUser(null);
      setIsAuthenticated(false);

      // Sign out from AWS Amplify authentication even on error
      signOut();
    }
  };

  const userInitials = user
    ? `${user.givenName?.charAt(0) || ""}${user.surname?.charAt(0) || ""}`
    : "";

  return (
    <CardHeader
      sx={{
        backgroundColor: "white",
        color: "black",
        height: "66px",
        padding: "15px 40px 15px 40px",
        borderRadius: 0,
        position: "sticky",
        top: 0,
        zIndex: 1,
        borderBottom: 2,
        borderColor: "neutral.200",
      }}
      title={
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: subtitle ? "flex-start" : "center",
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
              {icon}
            </Box>
            <Stack gap={0.2}>
              <Typography
                sx={{ fontSize: 20, fontWeight: "bold", lineHeight: 1.2 }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography sx={{ fontSize: 14, lineHeight: 1.2 }}>
                  {subtitle}
                </Typography>
              )}
              {selectedModel && (
                <Box
                  sx={{
                    backgroundColor: "error.main",
                    borderRadius: "4px",
                    paddingX: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    Selected model: {selectedModel}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Right content */}
          <Box
            onClick={(event: any) => handleMenuOpen(event)}
            sx={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
              padding: 1,
              borderRadius: 30,
              backgroundColor: "neutral.300",
            }}
          >
            <Avatar
              sx={{
                backgroundColor: "primary.900",
                width: 30,
                fontSize: 14,
                height: 30,
              }}
            >
              {userInitials}
            </Avatar>
            <IconSettings color={theme.palette.accent.main} width={24} height={24} />
            <Menu
              sx={{
                "& .MuiPaper-root": {
                  borderRadius: 4,
                  minWidth: 310,
                  marginTop: 1,
                  padding: "8px 0 12px 0",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                },
              }}
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleMenuClose}
            >
              <MenuItem
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  fontSize: "14px",
                  color: "text.primary",
                }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: "16px" }}>
                  Hello, {displayName}
                </Typography>
              </MenuItem>
              <Divider
                sx={{ margin: "4px 16px", borderColor: "neutral.400" }}
              />
              <MenuItem
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  fontSize: "14px",
                  color: "text.primary",
                  mt: 1,
                }}
              >
                <IconUser
                  width={22}
                  height={22}
                  style={{ marginRight: 10, color: theme.palette.text.primary }}
                />
                Profile
              </MenuItem>
              <Divider
                sx={{ margin: "4px 16px", borderColor: "neutral.400" }}
              />

              <MenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  fontSize: "14px",
                  color: "text.primary",
                  mt: 1,
                }}
              >
                <IconLogout
                  width={22}
                  height={22}
                  style={{ marginRight: 8, color: theme.palette.text.primary }}
                />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      }
    />
  );
};

export default HeaderTitle;
