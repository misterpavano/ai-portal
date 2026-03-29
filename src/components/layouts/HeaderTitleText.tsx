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
import { MouseEvent, ReactNode, useState } from "react";
import { useAtom } from "jotai";
import {
  userAtom,
  isAuthenticatedAtom,
  userDisplayNameAtom,
} from "../../atoms/userAtom";
import { useLogoutMutation } from "../../api/slices/authApiSlice";
import { useOptionalAuth } from "../../hooks/useOptionalAuth";

type HeaderTitleProps = {
  title: string;
  icon: ReactNode;
  subtitle?: string;
  selectedModel?: string;
};

const clearSummaryStorage = () => {
  localStorage.removeItem("assistantIdMeetingSummary");
  localStorage.removeItem("vectorStoreIdMeetingSummary");
  localStorage.removeItem("assistantModelMeetingSummary");
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
  const { signOut } = useOptionalAuth();

  const handleMenuOpen = (event: MouseEvent<HTMLDivElement>) => {
    setAnchorEl((current) => (current ? null : event.currentTarget));
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      handleMenuClose();
      await logout().unwrap();
    } catch (_error) {
      // Keep local auth cleanup resilient even if the API call fails.
    } finally {
      clearSummaryStorage();
      setUser(null);
      setIsAuthenticated(false);
      signOut();
    }
  };

  const userInitials = user
    ? `${user.givenName?.charAt(0) || ""}${user.surname?.charAt(0) || ""}`
    : "";

  return (
    <CardHeader
      sx={{
        backgroundColor: "common.white",
        color: "text.primary",
        minHeight: 66,
        px: { xs: 2, md: 5 },
        py: 2.5,
        borderRadius: 0,
        position: "sticky",
        top: 0,
        zIndex: 1,
        borderBottom: "1px solid",
        borderColor: "neutral.300",
      }}
      title={
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: subtitle ? "flex-start" : "center",
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                borderRadius: "10px",
                backgroundColor: "#1C1917",
                width: 32,
                height: 32,
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                mr: 2,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
            <Stack gap={0.5} sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.01em", color: "#1C1917" }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body" sx={{ lineHeight: 1.4, color: "#78716C", fontSize: 13 }}>
                  {subtitle}
                </Typography>
              )}
              {selectedModel && (
                <Box
                  sx={{
                    backgroundColor: "error.main",
                    borderRadius: 1,
                    px: 1,
                    py: 0.25,
                    alignSelf: "flex-start",
                  }}
                >
                  <Typography
                    variant="xsmall_bold"
                    sx={{ color: "common.white" }}
                  >
                    Selected model: {selectedModel}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>

          <Box
            onClick={handleMenuOpen}
            sx={{
              cursor: "pointer",
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: 1,
              p: 1,
              borderRadius: 999,
              backgroundColor: "transparent",
              flexShrink: 0,
              transition: "background-color 200ms ease-out",
              "&:hover": {
                backgroundColor: "#F5F5F4",
              },
            }}
          >
            <Avatar
              sx={{
                backgroundColor: "#1C1917",
                width: 28,
                height: 28,
                fontSize: 12,
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
                  mt: 1,
                  py: 1,
                  boxShadow: theme.customShadows.elevated,
                },
              }}
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleMenuClose}
            >
              <MenuItem sx={{ px: 2, py: 1.25, color: "text.primary" }}>
                <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
                  Hello, {displayName}
                </Typography>
              </MenuItem>
              <Divider sx={{ mx: 2, borderColor: "neutral.400" }} />
              <MenuItem sx={{ px: 2, py: 1.25, color: "text.primary", mt: 1 }}>
                <IconUser
                  width={22}
                  height={22}
                  style={{ marginRight: 10, color: theme.palette.text.primary }}
                />
                Profile
              </MenuItem>
              <Divider sx={{ mx: 2, borderColor: "neutral.400" }} />
              <MenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                sx={{ px: 2, py: 1.25, color: "text.primary", mt: 1 }}
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
