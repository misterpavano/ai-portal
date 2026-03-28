import React from "react";
import { useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { IconBell, IconChevronDown } from "@tabler/icons-react";

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
  fontSize: 15,
  fontWeight: 600,
  color: theme.palette.text.primary,
  letterSpacing: "-0.01em",
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
  width: 36,
  height: 36,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: theme.palette.neutral[600],
  transition: "background-color 200ms ease-out, color 200ms ease-out",
  "&:hover": {
    backgroundColor: theme.palette.neutral[200],
    color: theme.palette.text.secondary,
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
  width: 30,
  height: 30,
  borderRadius: "50%",
  backgroundColor: theme.palette.accent.main,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.common.white,
  fontSize: 12,
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

  return (
    <HeaderBar>
      <Breadcrumb>{pageName}</Breadcrumb>
      <RightSection>
        <NotificationButton>
          <IconBell size={20} stroke={1.5} />
        </NotificationButton>
        <UserPill>
          <Avatar>U</Avatar>
          <IconChevronDown size={14} stroke={2} />
        </UserPill>
      </RightSection>
    </HeaderBar>
  );
};

export default TopHeader;
