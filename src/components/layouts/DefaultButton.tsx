import { Button, Typography } from "@mui/material";
import { useTheme, type Theme } from "@mui/material/styles";

type DefaultButtonProps = {
  title: string;
  onClick?: () => void;
  type: "primary" | "secondary";
  disabled?: boolean;
  id?: string;
  style?: React.CSSProperties;
  textStyle?: React.CSSProperties;
  submit?: boolean;
  className?: string;
};

const backgroundColor = (
  theme: Theme,
  type: "primary" | "secondary",
  disabled: boolean
) => {
  if (disabled && type === "primary") {
    return theme.palette.neutral[300];
  }

  if (disabled || type === "secondary") {
    return "transparent";
  }

  // Charcoal primary
  return "#1C1917";
};

const border = (
  theme: Theme,
  type: "primary" | "secondary",
  disabled: boolean
) => {
  if (type === "secondary") {
    return `1px solid ${
      disabled ? theme.palette.neutral[400] : theme.palette.neutral[400]
    }`;
  }

  return "none";
};

const textColor = (
  theme: Theme,
  type: "primary" | "secondary",
  disabled: boolean
) => {
  if (disabled && type === "primary") {
    return theme.palette.text.secondary;
  }

  if (disabled && type === "secondary") {
    return theme.palette.neutral[500];
  }

  if (type === "secondary") {
    return theme.palette.text.primary;
  }

  return theme.palette.common.white;
};

const DefaultButton = ({
  title,
  onClick,
  type,
  disabled = false,
  style,
  id,
  textStyle,
  submit,
  className,
}: DefaultButtonProps) => {
  const theme = useTheme();

  const styles = {
    borderRadius: "8px",
    backgroundColor: backgroundColor(theme, type, disabled),
    border: border(theme, type, disabled),
    color: textColor(theme, type, disabled),
    textTransform: "none",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
    "&:hover": {
      backgroundColor:
        type === "primary" ? "#292524" : theme.palette.neutral[100],
      color:
        type === "primary"
          ? theme.palette.common.white
          : theme.palette.text.secondary,
      borderColor: type === "secondary" ? "#E86D5A" : undefined,
    },
    ...style,
  };

  const textStyles = {
    color: textColor(theme, type, disabled),
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "0.01em",
    ...textStyle,
  };

  return (
    <Button
      id={id}
      sx={styles}
      type={submit ? "submit" : "button"}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      <Typography variant="body" sx={textStyles}>
        {title}
      </Typography>
    </Button>
  );
};

export default DefaultButton;
