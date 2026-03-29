import {
  Box,
  FormHelperText,
  Select as Dropdown,
  SelectChangeEvent,
  MenuProps,
} from "@mui/material";
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
        borderRadius: 8,
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
        <FormHelperText sx={{ color: "neutral.700", fontSize: 13, fontWeight: 500 }}>
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
          borderRadius: "8px",
          marginRight: 15,
          backgroundColor: "white",
          height: 44,
          "& .MuiOutlinedInput-notchedOutline": {
            borderWidth: 1,
            borderColor: "#E7E5E4",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#D6D3D1",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E86D5A",
            borderWidth: 2,
            boxShadow: "0 0 0 3px rgba(232, 109, 90, 0.12)",
          },
          "& .MuiSelect-select": {
            fontSize: 14,
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
              fontSize: 14,
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
