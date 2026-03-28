import { styled } from "@mui/material/styles";
import {
  Box,
  Drawer,
  IconButton,
  ListItem,
  ListItemButton,
  Typography,
  Dialog,
  Toolbar,
  Container,
  Divider,
} from "@mui/material";
import { IconXboxXFilled } from "@tabler/icons-react";

// ─── Layout Constants ──────────────────────────────────────────────────
const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 64;
const TRANSITION = "all 200ms ease-out";

const MainContainer = styled(Box)({
  display: "flex",
  height: "100vh",
  position: "relative",
});

const ToggleButton = styled(IconButton)<{ isSidebarOpen: boolean }>(
  ({ isSidebarOpen }) => ({
    position: "fixed",
    top: 58,
    left: isSidebarOpen ? SIDEBAR_EXPANDED - 10 : SIDEBAR_COLLAPSED - 10,
    backgroundColor: "#1C1917",
    border: "1px solid #292524",
    borderRadius: "50%",
    zIndex: 2000,
    width: 20,
    padding: 0,
    height: 20,
    boxShadow: "0px 2px 8px rgba(0,0,0,0.3)",
    transition: "left 200ms ease-out, background-color 200ms ease-out",
    color: "#A8A29E",
    "&:hover": {
      backgroundColor: "#292524",
      color: "#FFFFFF",
    },
  })
);

const SidebarDrawer = styled(Drawer)<{ isSidebarOpen: boolean }>(
  ({ isSidebarOpen }) => ({
    width: isSidebarOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED,
    flexShrink: 0,
    whiteSpace: "nowrap",
    transition: TRANSITION,
    "& .MuiDrawer-paper": {
      width: isSidebarOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED,
      boxSizing: "border-box",
      backgroundColor: "#0C0A09",
      borderRight: "1px solid #292524",
      transition: "width 200ms ease-out",
      overflowX: "hidden",
      display: "flex",
      flexDirection: "column",
    },
  })
);

const SidebarToolbar = styled(Toolbar)<{ isSidebarOpen: boolean }>(
  ({ isSidebarOpen }) => ({
    backgroundColor: "#0C0A09",
    height: 56,
    minHeight: "56px !important",
    justifyContent: isSidebarOpen ? "flex-start" : "center",
    padding: isSidebarOpen ? "0 16px !important" : "0 !important",
    position: "sticky",
    top: 0,
    zIndex: 1,
  })
);

const SidebarContainer = styled(Container)({
  backgroundColor: "#0C0A09",
  flex: 1,
  padding: "8px 10px 0 10px !important",
  overflowY: "auto",
  overflowX: "hidden",
  "&::-webkit-scrollbar": {
    width: 4,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#292524",
    borderRadius: 4,
  },
});

const SectionTitle = styled(Typography)<{
  isSidebarOpen: boolean;
  isHelp?: boolean;
  isAdmin?: boolean;
}>(({ isSidebarOpen }) => ({
  color: "#78716C",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  paddingLeft: isSidebarOpen ? 12 : 0,
  paddingBottom: 6,
  textAlign: isSidebarOpen ? "left" : "center",
  transition: TRANSITION,
  opacity: isSidebarOpen ? 1 : 0,
  height: isSidebarOpen ? "auto" : 0,
  overflow: "hidden",
}));

const CustomListItemWrapper = styled(ListItem)({
  padding: 0,
});

const CustomListItemButton = styled(ListItemButton)<{
  isActive: boolean;
  disabled?: boolean;
  isHoverDisabled: boolean;
}>(({ isActive, disabled, isHoverDisabled }) => ({
  alignItems: "center",
  padding: "10px 12px",
  marginBottom: 2,
  backgroundColor: isActive ? "rgba(232, 109, 90, 0.08)" : "transparent",
  borderRadius: 6,
  borderLeft: isActive ? "3px solid #E86D5A" : "3px solid transparent",
  transition: TRANSITION,
  minHeight: 40,
  "&:hover": {
    backgroundColor: disabled
      ? isActive
        ? "rgba(232, 109, 90, 0.08)"
        : "transparent"
      : isHoverDisabled
      ? isActive
        ? "rgba(232, 109, 90, 0.08)"
        : "transparent"
      : "rgba(255, 255, 255, 0.04)",
    borderRadius: 6,
  },
  cursor: disabled ? "not-allowed" : "pointer",
}));

const IconContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 20,
});

const NavText = styled(Typography)<{
  disabled?: boolean;
  isActive: boolean;
}>(({ disabled, isActive }) => ({
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.4 : 1,
  pointerEvents: disabled ? "none" : "auto",
  fontSize: 13,
  fontWeight: isActive ? 500 : 400,
  paddingLeft: 12,
  color: isActive ? "#FFFFFF" : "#A8A29E",
  transition: TRANSITION,
  whiteSpace: "nowrap",
  "&:hover": {
    color: "#E7E5E4",
  },
}));

const MainContent = styled(Box)({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column" as const,
  backgroundColor: "#FAFAF9",
  minHeight: "100vh",
  overflow: "auto",
});

const ContentBody = styled(Box)({
  flex: 1,
  padding: "24px",
  maxWidth: 1400,
  width: "100%",
  margin: "0 auto",
  boxSizing: "border-box" as const,
});

const SidebarFooter = styled(Box)<{ isSidebarOpen: boolean }>(
  ({ isSidebarOpen }) => ({
    padding: isSidebarOpen ? "12px 16px" : "12px 8px",
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: isSidebarOpen ? "flex-start" : "center",
    gap: 10,
    transition: TRANSITION,
  })
);

const VersionText = styled(Typography)({
  fontSize: 10,
  fontWeight: 500,
  color: "#57534E",
  position: "absolute",
  bottom: 4,
  left: 0,
  right: 0,
  textAlign: "center",
});

const ModalDialog = styled(Dialog)({});

const ModalContent = styled(Box)({
  marginTop: 8,
  paddingBottom: 16,
  paddingRight: "20px",
  paddingLeft: "20px",
  paddingTop: 32,
  backgroundColor: "white",
  borderRadius: 16,
  width: "300px",
  position: "relative",
});

const CloseIconWrapper = styled(Box)({
  marginBottom: 8,
});

const ModalBodyWrapper = styled(Box)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 16,
});

const ModalTitle = styled(Typography)({
  fontWeight: "bold",
  fontSize: "16px",
  textAlign: "center",
  marginBottom: 16,
});

const ModalDescription = styled(Typography)({
  fontSize: "13px",
  textAlign: "center",
  marginBottom: 16,
});

const ButtonsWrapper = styled(Box)({
  paddingLeft: 8,
  paddingRight: 8,
  gap: 16,
  marginTop: 16,
  display: "flex",
  justifyContent: "center",
});

const ButtonStyle = {
  borderRadius: "5px",
  height: "auto",
  padding: "5px 10px",
  lineHeight: "1em !important",
  width: "100%",
  flex: 1,
};

const ButtonTextStyle = {
  fontSize: "12px",
};

const CloseIcon = styled(IconXboxXFilled)({
  position: "absolute",
  top: 8,
  right: 8,
  width: 30,
  height: 18,
  borderRadius: "50%",
  cursor: "pointer",
});

const SectionDivider = styled(Divider)({
  borderColor: "rgba(255, 255, 255, 0.06)",
  margin: "4px 12px 12px 12px",
});

const CustomDivider = styled(Divider)({
  borderColor: "rgba(255, 255, 255, 0.06)",
  margin: "4px 10px",
});

const UserSection = styled(Box)<{ isSidebarOpen: boolean }>(
  ({ isSidebarOpen }) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 1,
    justifyContent: isSidebarOpen ? "flex-start" : "center",
    cursor: "pointer",
    borderRadius: 6,
    padding: isSidebarOpen ? "6px 8px" : "6px 0",
    transition: TRANSITION,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.04)",
    },
  })
);

const UserAvatar = styled(Box)({
  width: 32,
  height: 32,
  borderRadius: "50%",
  backgroundColor: "#E86D5A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#FFFFFF",
  fontSize: 13,
  fontWeight: 600,
  flexShrink: 0,
});

const UserName = styled(Typography)({
  color: "#E7E5E4",
  fontSize: 13,
  fontWeight: 500,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const CollapseToggle = styled(IconButton)({
  width: 28,
  height: 28,
  borderRadius: 6,
  color: "#A8A29E",
  padding: 0,
  transition: "color 200ms ease-out, background-color 200ms ease-out",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    color: "#E7E5E4",
  },
});

const Logo = styled("img")<{ src: string; alt?: string }>(({ src }) => ({
  width: 120,
  content: `url(${src})`,
  transition: "width 200ms ease-out",
}));

const LogoCollapsed = styled("img")<{ src: string; alt?: string }>(
  ({ src }) => ({
    width: 28,
    content: `url(${src})`,
  })
);

export default {
  MainContainer,
  ToggleButton,
  SidebarDrawer,
  SidebarToolbar,
  SidebarContainer,
  SectionTitle,
  SectionDivider,
  CustomListItemWrapper,
  CustomListItemButton,
  IconContainer,
  NavText,
  MainContent,
  ContentBody,
  SidebarFooter,
  UserSection,
  UserAvatar,
  UserName,
  CollapseToggle,
  VersionText,
  ModalDialog,
  ModalContent,
  CloseIconWrapper,
  ModalBodyWrapper,
  ModalTitle,
  ModalDescription,
  ButtonsWrapper,
  ButtonStyle,
  ButtonTextStyle,
  CloseIcon,
  CustomDivider,
  Logo,
  LogoCollapsed,
};
