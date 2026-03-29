import { Box, Typography } from "@mui/material";
import { IconCheck } from "@tabler/icons-react";
import type { ComponentType } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconComponent = ComponentType<any>;

export interface OptionCardProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: IconComponent;
  title: string;
  description: string;
  disabled?: boolean;
}

const OptionCard = ({
  checked,
  onChange,
  icon: Icon,
  title,
  description,
  disabled = false,
}: OptionCardProps) => (
  <Box
    onClick={() => !disabled && onChange(!checked)}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      p: 2,
      borderRadius: "12px",
      border: "1.5px solid",
      borderColor: checked ? "#E86D5A" : "#E7E5E4",
      bgcolor: checked ? "#FEF2F0" : "#FFFFFF",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "all 0.15s ease",
      "&:hover": {
        borderColor: disabled
          ? "#E7E5E4"
          : checked
            ? "#D4553F"
            : "#D6D3D1",
        bgcolor: disabled
          ? "#FFFFFF"
          : checked
            ? "#FEF2F0"
            : "#FAFAF9",
      },
    }}
  >
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "10px",
        bgcolor: checked ? "#E86D5A" : "#F5F5F4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s ease",
        flexShrink: 0,
      }}
    >
      <Icon
        size={18}
        color={checked ? "#FFFFFF" : "#78716C"}
        strokeWidth={1.5}
      />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 600,
          color: "#1C1917",
          lineHeight: 1.3,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: 12,
          color: "#A8A29E",
          lineHeight: 1.4,
        }}
      >
        {description}
      </Typography>
    </Box>
    <Box
      sx={{
        width: 22,
        height: 22,
        borderRadius: "6px",
        border: "1.5px solid",
        borderColor: checked ? "#E86D5A" : "#D6D3D1",
        bgcolor: checked ? "#E86D5A" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s ease",
        flexShrink: 0,
      }}
    >
      {checked && <IconCheck size={14} color="#FFFFFF" strokeWidth={2.5} />}
    </Box>
  </Box>
);

export default OptionCard;
