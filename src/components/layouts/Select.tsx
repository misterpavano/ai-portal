import {
  Box,
  FormHelperText,
  Select as Dropdown,
  SelectChangeEvent,
  MenuProps,
} from "@mui/material";
import { IconChevronDown } from "@tabler/icons-react";
import React from "react";

type SelectProps = {
  children: React.ReactNode;
  value?: string | string[];
  onSelect?: (event: SelectChangeEvent<string | string[]>) => void;
  styles?: React.CSSProperties;
  name?: string;
  topText?: string;
  error?: boolean;
  multiple?: boolean;
};

const Select = ({
  children,
  value,
  onSelect,
  styles,
  name,
  topText,
  error,
  multiple,
}: SelectProps) => {
  // Custom menu props to control height and scrolling
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps: Partial<MenuProps> = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
    variant: "menu",
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left",
    },
  };

  let additionalProps = multiple && {
    renderValue: (selected: string | string[]) => {
      if (multiple && Array.isArray(selected)) {
        if (selected[0] === "") {
          selected.shift();
        }
        return selected.join(", ");
      }
      return selected;
    },
  };

  return (
    <>
      <Box sx={{ height: 20 }}>
        <FormHelperText sx={{ color: "neutral.700", fontSize: 16 }}>
          {topText}
        </FormHelperText>
      </Box>
      <Dropdown
        value={value}
        multiple={multiple}
        onChange={onSelect}
        variant="outlined"
        name={name}
        error={error}
        MenuProps={MenuProps}
        sx={{
          borderRadius: 2,
          marginRight: 15,
          backgroundColor: "white",
          "& .MuiOutlinedInput-notchedOutline": {
            borderWidth: 1.5,
            borderColor: "neutral.200",
          },
          "& .MuiSelect-select": {
            fontSize: 14, // Reduced font size
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
          ...styles,
        }}
        displayEmpty
        {...additionalProps}
      >
        {React.Children.map(children, (child) =>
          React.cloneElement(child as React.ReactElement, {
            sx: {
              fontSize: 14, // Reduced font size for menu items
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            },
          })
        )}
      </Dropdown>
    </>
  );
};

export default Select;
