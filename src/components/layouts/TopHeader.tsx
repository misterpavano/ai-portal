import React from "react";
import { useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { IconBell, IconChevronDown, IconHelp } from "@tabler/icons-react";
import HelpDrawer from "./HelpDrawer";

const HeaderBar = styled(Box)(({ theme }) => ({
  height: 56,
  minHeight: 56,
  backgroundColor: theme.palette.common.white,
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  padding: "0 24px",
  fontFamily: theme.typography.fontFamily,
  boxSizing: "border-box",
  [theme.breakpoints.down("sm")]: {
    padding: "0 16px",
  },
}));

const Breadcrumb = styled(Typography)(({ theme }) => ({
  fontSize: 11,
  fontWeight: 700,
  color: "#A8A29E",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

const RightSection = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 16,
  flexShrink: 0,
});

const NotificationButton = styled(Box)(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#A8A29E",
  transition: "all 200ms ease-out",
  "&:hover": {
    backgroundColor: "#F5F5F4",
    color: "#1C1917",
  },
}));

const UserPill = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  cursor: "pointer",
  padding: "4px 8px 4px 4px",
  borderRadius: 8,
  transition: "background-color 200ms ease-out",
  "&:hover": {
    backgroundColor: theme.palette.neutral[200],
  },
}));

const Avatar = styled(Box)(({ theme }) => ({
  width: 28,
  height: 28,
  borderRadius: "50%",
  backgroundColor: "#1C1917",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.common.white,
  fontSize: 11,
  fontWeight: 600,
}));

function derivePageName(pathname: string): string {
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  if (!clean || clean === "dashboard") return "Dashboard";
  return clean
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const TopHeader: React.FC = () => {
  const location = useLocation();
  const pageName = derivePageName(location.pathname);
  const [helpOpen, setHelpOpen] = React.useState(false);

  return (
    <HeaderBar>
      <Breadcrumb>{pageName}</Breadcrumb>
      <RightSection>
        <NotificationButton onClick={() => setHelpOpen(true)}>
          <IconHelp size={20} stroke={1.5} />
        </NotificationButton>
        <NotificationButton>
          <IconBell size={20} stroke={1.5} />
        </NotificationButton>
      </RightSection>
      <HelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
    </HeaderBar>
  );
};

export default TopHeader;
