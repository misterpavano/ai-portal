import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { Button, MenuItem, SelectChangeEvent, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import {
  IconBrandHeadlessui,
  IconCheck,
  IconNotebook,
} from "@tabler/icons-react";
import * as React from "react";
import DefaultButton from "../../../components/layouts/DefaultButton";
import HeaderTitle from "../../../components/layouts/HeaderTitleText";
import TextInput from "../../../components/layouts/TextInput";
import Dropdown from "../../../components/layouts/Select";
import TextArea from "../../../components/layouts/TextArea";
import Toast from "../../../components/layouts/Toast";
import Tooltip from "../../../components/layouts/Tooltip";

const DesignSystem = () => {
  const [tabValue, setTabValue] = React.useState("Design");
  const [inputValue, setInputValue] = React.useState("name@gmail.com");
  const [textAreaValue, setTextAreaValue] = React.useState(
    "Cras erat lacus, pretium et erat ut, pellentesque varius purus. Orci varius natoque penatibus et magnis dis parturient montes"
  );
  const [selectValue, setSelectValue] = React.useState("");
  const [openTooltip, setOpenTooltip] = React.useState(false);
  const [openSuccessToast, setOpenSuccessToast] = React.useState(false);
  const [openWarningToast, setOpenWarningToast] = React.useState(false);
  const [openErrorToast, setOpenErrorToast] = React.useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleTextAreaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextAreaValue(event.target.value);
  };

  const handleSelectChange = (event: SelectChangeEvent<string | string[]>) => {
    setSelectValue(event.target.value as string);
  };

  const handleOpenTooltip = () => {
    setOpenTooltip(true);
  };

  const handleCloseTooltip = () => {
    setOpenTooltip(false);
  };

  const handleSuccessToastClose = () => {
    setOpenSuccessToast(false);
  };

  const handleWarningToastClose = () => {
    setOpenWarningToast(false);
  };

  const handleErrorToastClose = () => {
    setOpenErrorToast(false);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1", pl: 2, pt: 2 }}>
      <HeaderTitle
        title="Design System"
        icon={<IconBrandHeadlessui width={18} height={18} color={"#FFFFFF"} />}
      />
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1.5, borderColor: "primary.400", mb: 3 }}>
          <TabList onChange={handleTabChange} aria-label="tabs">
            <Tab
              label={
                <Typography
                  variant="body"
                  sx={{ fontSize: 18, fontWeight: "600" }}
                >
                  Design
                </Typography>
              }
              value="Design"
            />
            <Tab
              label={
                <Typography
                  variant="body"
                  sx={{ fontSize: 18, fontWeight: "600" }}
                >
                  System
                </Typography>
              }
              value="System"
            />
          </TabList>
        </Box>
      </TabContext>
      <Box sx={{ pb: 3 }}>
        <DefaultButton
          style={{ width: 92, height: 49, borderRadius: 4, marginRight: 2 }}
          title="Button"
          type="primary"
          onClick={() => console.log("test")}
        />
        <DefaultButton
          style={{ width: 92, height: 49, borderRadius: 4 }}
          title="Button"
          type="primary"
          onClick={() => console.log("test")}
          disabled
        />
      </Box>

      <Box sx={{ pb: 3 }}>
        <DefaultButton
          style={{ width: 92, height: 49, borderRadius: 4, marginRight: 2 }}
          title="Button"
          type="secondary"
          onClick={() => console.log("test")}
        />
        <DefaultButton
          style={{ width: 92, height: 49, borderRadius: 4 }}
          title="Button"
          type="secondary"
          onClick={() => console.log("test")}
          disabled
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextArea
          value={""}
          onChange={() => {}}
          placeholder="Briefly describe the direction for this discussion guide..."
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextArea value={textAreaValue} onChange={handleTextAreaChange} />
      </Box>

      <Box sx={{ mb: 5, mt: 5, display: "flex", flex: 1, gap: 2 }}>
        <TextInput
          value={inputValue}
          onChange={handleInputChange}
          containerStyles={{
            width: 300,
          }}
        />
        <TextInput
          placeholder="Placeholder text"
          value={""}
          onChange={() => {}}
          containerStyles={{
            width: 300,
          }}
        />
        <TextInput
          disabled
          value={"Disabled input field"}
          onChange={() => {}}
          containerStyles={{
            width: 300,
          }}
        />
        <TextInput
          icon={
            <IconBrandHeadlessui width={20} height={20} color={"#57534E"} />
          }
          value={"name@gmail.com"}
          onChange={() => {}}
          containerStyles={{
            width: 300,
          }}
        />
        <TextInput
          error={true}
          value={"name@gmail.com"}
          onChange={() => {}}
          containerStyles={{
            width: 300,
          }}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, pb: 2 }}>
        <TextInput
          topText="Top text"
          value="Input field with top text"
          onChange={() => {}}
          containerStyles={{
            width: 300,
          }}
        />

        <TextInput
          bottomText="Bottom text"
          value="Input field with bottom text"
          onChange={() => {}}
          containerStyles={{
            width: 300,
          }}
        />

        <TextInput
          topText="Top text"
          bottomText="Bottom text"
          value="Input field with bottom and top text"
          onChange={() => {}}
          containerStyles={{
            width: 300,
          }}
        />
      </Box>

      <Box sx={{ pb: 3 }}>
        <Dropdown
          value={selectValue}
          onSelect={handleSelectChange}
          styles={{
            width: 300,
            height: 55,
          }}
        >
          {selectValue === "" && (
            <MenuItem
              sx={{
                alignItems: "center",
                display: "flex",
                flexDirection: "row",
              }}
              value=""
              disabled
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <IconNotebook width={20} height={20} color={"#57534E"} />
                <Typography sx={{ fontSize: 14, color: "neutral.700" }}>
                  Choose the output format
                </Typography>
              </Box>
            </MenuItem>
          )}
          <MenuItem value={"Output"}>Output</MenuItem>
          <MenuItem value={"Output 1"}>Output 1</MenuItem>
          <MenuItem value={"Output 2"}>Output 2</MenuItem>
        </Dropdown>
      </Box>

      <Box sx={{ pb: 3 }}>
        <Tooltip
          open={openTooltip}
          onClose={handleCloseTooltip}
          onOpen={handleOpenTooltip}
          title="This is a tooltip"
        >
          <Button>Tooltip</Button>
        </Tooltip>
      </Box>

      <Box>
        <Toast
          open={openSuccessToast}
          onClose={handleSuccessToastClose}
          type="success"
          icon={<IconCheck fontSize="inherit" />}
          variant="filled"
          style={{ background: "#16a34a" }}
          title="Here is a gentle confirmation that your action was successful."
        />
        <Button onClick={() => setOpenSuccessToast(true)}>Success Toast</Button>

        <Toast
          open={openWarningToast}
          onClose={handleWarningToastClose}
          type="warning"
          title="Warning alert, please be careful in the future!"
        />
        <Button onClick={() => setOpenWarningToast(true)}>Warning Toast</Button>

        <Toast
          open={openErrorToast}
          onClose={handleErrorToastClose}
          type="error"
          title="Error alert, please double check the errors!"
        />
        <Button onClick={() => setOpenErrorToast(true)}>Error Toast</Button>
      </Box>
    </Box>
  );
};

export default DesignSystem;
