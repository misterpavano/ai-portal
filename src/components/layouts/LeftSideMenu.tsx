import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Box, List } from "@mui/material";
import {
  IconHome2,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { prototypeRoutes } from "../../constants/routes";
import useCognito from "../../hooks/useCognito";
import { useEffect, useCallback } from "react";
import logo from "../../assets/kalabria-logo-white.svg";
import S from "./LeftSideMenu/LeftSideMenu.style";
import TopHeader from "./TopHeader";

const SideMenu = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { fetchUserSession } = useCognito();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const checkIfUserIsAdmin = useCallback(async () => {
    const isAdmin = await fetchUserSession();
    setIsAdmin(isAdmin);
  }, [fetchUserSession]);

  useEffect(() => {
    checkIfUserIsAdmin();
  }, [checkIfUserIsAdmin]);

  const CustomListItem = ({
    text,
    path,
    icon,
  }: {
    text: string;
    path: string;
    icon: React.ReactNode;
  }) => {
    const isActive = window.location.pathname === path;

    return (
      <S.CustomListItemWrapper>
        <S.CustomListItemButton
          isActive={isActive}
          isHoverDisabled={false}
          onClick={() => navigate(path)}
          sx={
            !isSidebarOpen
              ? { justifyContent: "center", px: 0 }
              : undefined
          }
        >
          <S.IconContainer>{icon}</S.IconContainer>
          {isSidebarOpen && (
            <S.NavText isActive={isActive}>{text}</S.NavText>
          )}
        </S.CustomListItemButton>
      </S.CustomListItemWrapper>
    );
  };

  return (
    <S.MainContainer>
      <S.SidebarDrawer
        variant="permanent"
        anchor="left"
        isSidebarOpen={isSidebarOpen}
      >
        <S.SidebarToolbar isSidebarOpen={isSidebarOpen}>
          {isSidebarOpen ? (
            <S.Logo src={logo} alt="kalabria-logo" />
          ) : (
            <S.LogoCollapsed src={logo} alt="kalabria-logo" />
          )}
        </S.SidebarToolbar>
        <S.CustomDivider />
        <S.SidebarContainer disableGutters>
          <List>
            <S.SectionTitle isSidebarOpen={isSidebarOpen}>
              Menu
            </S.SectionTitle>
            <CustomListItem
              text="Dashboard"
              path="/dashboard"
              icon={
                <IconHome2
                  width={18}
                  height={18}
                  color={
                    window.location.pathname === "/dashboard"
                      ? "#E86D5A"
                      : "rgba(255,255,255,0.5)"
                  }
                />
              }
            />
          </List>
          <S.SectionDivider />
          <List>
            <S.SectionTitle isSidebarOpen={isSidebarOpen}>
              AI Tools
            </S.SectionTitle>
            {prototypeRoutes.map((item, keyx) => (
              <CustomListItem
                key={keyx}
                text={item.title}
                icon={item.renderIcon(window.location.pathname === item.path)}
                path={item.path}
              />
            ))}
          </List>
        </S.SidebarContainer>

        <S.SidebarFooter isSidebarOpen={isSidebarOpen}>
          <S.UserSection isSidebarOpen={isSidebarOpen}>
            <S.UserAvatar>U</S.UserAvatar>
            {isSidebarOpen && <S.UserName>User</S.UserName>}
          </S.UserSection>
          <S.CollapseToggle onClick={toggleSidebar} size="small">
            {isSidebarOpen ? (
              <IconChevronLeft size={16} stroke={2} />
            ) : (
              <IconChevronRight size={16} stroke={2} />
            )}
          </S.CollapseToggle>
        </S.SidebarFooter>
      </S.SidebarDrawer>

      <S.MainContent>
        <TopHeader />
        <S.ContentBody>{children}</S.ContentBody>
      </S.MainContent>
    </S.MainContainer>
  );
};

export default SideMenu;
