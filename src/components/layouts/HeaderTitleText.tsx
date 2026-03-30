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
import React, { MouseEvent, ReactNode, useState } from "react";
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
  /** Optional breadcrumb trail shown below the title, e.g. ["Document to Review"] */
  breadcrumb?: string[];
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
  breadcrumb,
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
              {breadcrumb && breadcrumb.length > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#A8A29E",
                      fontWeight: 500,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {title}
                  </Typography>
                  {breadcrumb.map((crumb, i) => (
                    <React.Fragment key={i}>
                      <Typography
                        sx={{ fontSize: 12, color: "#D6D3D1", mx: 0.25 }}
                      >
                        /
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 12,
                          color:
                            i === breadcrumb.length - 1
                              ? "#1C1917"
                              : "#A8A29E",
                          fontWeight:
                            i === breadcrumb.length - 1 ? 600 : 500,
                          letterSpacing: "0.01em",
                        }}
                      >
                        {crumb}
                      </Typography>
                    </React.Fragment>
                  ))}
                </Box>
              )}
              {subtitle && !breadcrumb?.length && (
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

          {/* User menu removed for demo */}
        </Box>
      }
    />
  );
};

export default HeaderTitle;
