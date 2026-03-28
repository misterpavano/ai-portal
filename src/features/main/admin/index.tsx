import { Box, Stack, Tab, Typography, styled } from "@mui/material";
import TextArea from "../../../components/layouts/TextArea";
import { useCallback, useEffect, useState } from "react";
import DefaultButton from "../../../components/layouts/DefaultButton";
import useCognito from "../../../hooks/useCognito";
import Toast from "../../../components/layouts/Toast";
import { useOptionalAuth } from "../../../hooks/useOptionalAuth";
import {
  ListUsersResponse,
  UserType,
} from "aws-sdk/clients/cognitoidentityserviceprovider";
import { AWSError } from "aws-sdk";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import { IconUserSearch, IconUsersPlus } from "@tabler/icons-react";
import { TabContext, TabList, TabPanel } from "@mui/lab";

const StyledTab = styled(Tab)(({ theme }) => ({
  borderRight: `1.7px solid ${theme.palette.neutral[200]}`,
  backgroundColor: theme.palette.neutral[100],
  "&.Mui-selected": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
  },
  "&:not(.Mui-selected)": {
    color: theme.palette.text.primary,
  },
}));

const StyledTabs = styled(TabList)(() => ({
  borderTopLeftRadius: "6px",
  borderBottom: "none",
  "& .MuiTabs-indicator": {
    display: "none",
  },
}));

const Admin = () => {
  const [value, setValue] = useState("");
  const [tabValue, setTabValue] = useState("Admin");
  const { createUser, getUsers, deleteUser } = useCognito();
  const [errorToast, setErrorToast] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [users, setUsers] = useState<UserType[] | undefined>(undefined);
  const { user } = useOptionalAuth();
  const email = (user as any)?.signInDetails?.loginId;

  const handleGetUsers = useCallback(() => {
    getUsers()
      .then((data) => setUsers((data as ListUsersResponse).Users))
      .catch((err) => setErrorToast(err.message || "Something went wrong!"));
  }, [getUsers]);

  useEffect(() => {
    handleGetUsers();
  }, [handleGetUsers]);

  const handleCreateUsers = async () => {
    const emails = value.split(",").map((email) => email.trim());
    for (const email of emails) {
      const result = await createUser(email);
      if (result.success) {
        setSuccessToast("Created successfully");
      } else {
        setErrorToast((result.error as AWSError).message + " " + email);
      }
      console.log(result);
    }

    handleGetUsers();
    setValue("");
  };

  const showListUsers = () => {
    return users?.map((user) => {
      return (
        <Stack
          sx={{ marginTop: 2, gap: 30, alignItems: "center" }}
          direction="row"
        >
          <Stack sx={{ flex: 1 }}>
            <Typography variant="body1">
              {user?.Attributes?.[0].Value!}
            </Typography>
          </Stack>
          {email !== user?.Attributes?.[0].Value && (
            <DefaultButton
              style={{ background: "#DC5E5E" }}
              title="Delete"
              type={"primary"}
              onClick={() =>
                handleDeleteUser(user?.Attributes?.[0].Value ?? "")
              }
            />
          )}
        </Stack>
      );
    });
  };

  const handleDeleteUser = (email: string) => {
    deleteUser(email)
      .then(() => handleGetUsers())
      .catch((err) => setErrorToast(err.message || "Something went wrong!"));
  };

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ typography: "body1", p: 2 }}>
      <HeaderTitle
        title="Admin"
        icon={<IconUsersPlus width={18} height={18} color={"#FFFFFF"} />}
      />
      <Box
        sx={{
          border: "1.8px solid",
          borderColor: "neutral.200",
          borderRadius: "8px",
        }}
      >
        <TabContext value={tabValue}>
          <Box
            sx={{
              backgroundColor: "neutral.100",
              borderBottom: 1.5,
              borderTopLeftRadius: "6px",
              borderColor: "primary.400",
            }}
          >
            <StyledTabs onChange={handleChange} aria-label="tabs">
              <StyledTab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <IconUsersPlus size="14px" />
                    <Typography
                      variant="body"
                      sx={{ fontSize: "14px", fontWeight: "520" }}
                    >
                      Create a user
                    </Typography>
                  </Box>
                }
                value="Admin"
              />
              <StyledTab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <IconUserSearch size="14px" />
                    <Typography
                      variant="body"
                      sx={{ fontSize: "14px", fontWeight: "520" }}
                    >
                      See all users
                    </Typography>
                  </Box>
                }
                value="All_Admins"
              />
            </StyledTabs>
          </Box>
          <TabPanel sx={{ p: 0 }} value="Admin">
            <Box sx={{ p: 2 }}>
              <Typography variant="h2">Admin</Typography>
              <TextArea
                placeholder="Create user by writing emails separated by comma (info@aiportal.com, ...)"
                value={value}
                styles={{ marginTop: 20 }}
                onChange={(e: any) => setValue(e.target.value)}
              />
              <DefaultButton
                type="primary"
                title="Create"
                onClick={handleCreateUsers}
                style={{ marginTop: 2, width: 200, height: 45 }}
              />
            </Box>
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value="All_Admins">
            <Box sx={{ p: 2 }}>
              <Stack sx={{ flex: 1 }}>
                <Typography variant="h2">List of Users</Typography>
                {showListUsers()}
              </Stack>
              <Toast
                autoHideDuration={100}
                onClose={() => setErrorToast("")}
                type="error"
                open={!!errorToast}
                title={errorToast}
              />
              <Toast
                autoHideDuration={100}
                onClose={() => setSuccessToast("")}
                type="success"
                open={!!successToast}
                title={successToast}
              />
            </Box>
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default Admin;
