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

const MainContainer = styled(Box)({
  display: "flex",
  height: "100vh",
  position: "relative",
});

const ToggleButton = styled(IconButton)<{ isSidebarOpen: boolean }>(
  ({ isSidebarOpen }) => ({
    position: "fixed",
    top: 58,
    left: isSidebarOpen ? 290 : 80,
    backgroundColor: "white",
    border: "1px solid #E7E5E4",
    borderRadius: "50%",
    zIndex: 2000,
    width: 16,
    padding: 0,
    height: 16,
    boxShadow:
      "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)",
    transition: "left 0.3s",
    "&:hover": {
      backgroundColor: "#F5F5F4",
    },
  })
);

const SidebarDrawer = styled(Drawer)<{ isSidebarOpen: boolean }>(
  ({ isSidebarOpen }) => ({
    width: isSidebarOpen ? 300 : 90,
    flexShrink: 0,
    whiteSpace: "nowrap",
    transition: "width 0.3s",
    "& .MuiDrawer-paper": {
      width: isSidebarOpen ? 300 : 90,
      boxSizing: "border-box",
      backgroundColor: "#0C0A09",
      borderColor: "#292524",
      borderWidth: 2,
      transition: "width 0.3s",
      overflowX: "hidden",
    },
  })
);

const SidebarToolbar = styled(Toolbar)<{ isSidebarOpen: boolean }>(
  ({ isSidebarOpen }) => ({
    backgroundColor: "#0C0A09",
    height: "66px",
    justifyContent: isSidebarOpen ? "flex-start" : "center",
    position: "sticky",
    top: 0,
    zIndex: 1,
  })
);

const SidebarContainer = styled(Container)({
  backgroundColor: "#0C0A09",
  flex: 1,
  padding: "10px 12px 0 12px",
});

const SectionTitle = styled(Typography)<{
  isSidebarOpen: boolean;
  isHelp?: boolean;
  isAdmin?: boolean;
}>(({ isSidebarOpen, isHelp, isAdmin }) => ({
  color: "#A8A29E",
  fontSize: 16,
  fontWeight: "600",
  paddingLeft: isSidebarOpen ? 16 : isHelp ? 13.6 : isAdmin ? 6.4 : 0,
  paddingBottom: 8,
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
  paddingBottom: 12,
  paddingTop: 12,
  marginBottom: 8,
  backgroundColor: isActive ? "rgba(232, 109, 90, 0.08)" : "transparent",
  borderRadius: isActive ? "8px" : "0",
  borderLeft: isActive ? "3px solid #E86D5A" : "3px solid transparent",
  boxShadow: isActive ? "0 1px 4px -1px rgba(0, 0, 0, 0.25)" : "none",
  "&:hover": {
    borderRadius: "8px",
    backgroundColor: disabled
      ? isActive
        ? "rgba(232, 109, 90, 0.08)"
        : "transparent"
      : isHoverDisabled
      ? isActive
        ? "rgba(232, 109, 90, 0.08)"
        : "transparent"
      : "rgba(255, 255, 255, 0.06)",
  },
  cursor: disabled ? "not-allowed" : "pointer",
}));

const IconContainer = styled(Box)({
  marginLeft: 4.8,
});

const NavText = styled(Typography)<{
  disabled?: boolean;
  isActive: boolean;
}>(({ disabled, isActive }) => ({
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.4 : 1,
  pointerEvents: disabled ? "none" : "auto",
  fontSize: 14,
  fontWeight: isActive ? "500" : "400",
  paddingLeft: 16,
  paddingTop: 1.6,
  marginBottom: 4,
  color: isActive ? "#FFFFFF" : "#A8A29E",
  "&:hover": {
    color: "#E7E5E4",
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  backgroundColor: theme.palette.background.default,
  display: "flex",
  flexDirection: "column",
}));

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

const CustomDivider = styled(Divider)({
  borderColor: "rgba(255, 255, 255, 0.06)",
});

const Logo = styled("img")<{ src: string; alt?: string }>(({ src }) => ({
  width: 134,
  content: `url(${src})`,
}));

export default {
  MainContainer,
  ToggleButton,
  SidebarDrawer,
  SidebarToolbar,
  SidebarContainer,
  SectionTitle,
  CustomListItemWrapper,
  CustomListItemButton,
  IconContainer,
  NavText,
  MainContent,
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
};
