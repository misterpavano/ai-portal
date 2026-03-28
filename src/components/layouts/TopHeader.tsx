import React from "react";
import { useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { IconBell, IconChevronDown } from "@tabler/icons-react";

const HeaderBar = styled(Box)({
  height: 56,
  minHeight: 56,
  backgroundColor: "#FFFFFF",
  borderBottom: "1px solid #E7E5E4",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 24px",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  boxSizing: "border-box" as const,
});

const Breadcrumb = styled(Typography)({
  fontSize: 15,
  fontWeight: 600,
  color: "#1C1917",
  letterSpacing: "-0.01em",
});

const RightSection = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 16,
});

const NotificationButton = styled(Box)({
  width: 36,
  height: 36,
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#78716C",
  transition: "background-color 200ms ease-out, color 200ms ease-out",
  "&:hover": {
    backgroundColor: "#F5F5F4",
    color: "#44403C",
  },
});

const UserPill = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  cursor: "pointer",
  padding: "4px 8px 4px 4px",
  borderRadius: "8px",
  transition: "background-color 200ms ease-out",
  "&:hover": {
    backgroundColor: "#F5F5F4",
  },
});

const Avatar = styled(Box)({
  width: 30,
  height: 30,
  borderRadius: "50%",
  backgroundColor: "#E86D5A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#FFFFFF",
  fontSize: 12,
  fontWeight: 600,
});

function derivePageName(pathname: string): string {
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  if (!clean || clean === "dashboard") return "Dashboard";
  return clean
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
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
          <IconChevronDown size={14} color="#78716C" stroke={2} />
        </UserPill>
      </RightSection>
    </HeaderBar>
  );
};

export default TopHeader;
