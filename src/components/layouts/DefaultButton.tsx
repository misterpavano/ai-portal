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
  if (type === "primary") {
    return theme.palette.primary.main;
  }
  return "none";
};

const borderColor = (
  theme: Theme,
  type: "primary" | "secondary",
  disabled: boolean
) => {
  if (disabled && type === "secondary") {
    return `1px solid ${theme.palette.neutral[400]}`;
  }

  if (type === "secondary") {
    return `1px solid ${theme.palette.neutral[400]}`;
  }

  if (type === "primary") {
    return "none";
  }
  return "none";
};

const textColor = (
  theme: Theme,
  type: "primary" | "secondary",
  disabled: boolean
) => {
  if (disabled && type === "primary") {
    return "black";
  }

  if (disabled && type === "secondary") {
    return theme.palette.neutral[500];
  }

  if (type === "secondary") {
    return "black";
  }

  return "white";
};

const DefaultButton = ({
  title,
  onClick,
  type,
  disabled,
  style,
  id,
  textStyle,
  submit,
  className,
}: DefaultButtonProps) => {
  const theme = useTheme();

  const styles = {
    borderRadius: "8px",
    backgroundColor: backgroundColor(theme, type, disabled || false),
    border: borderColor(theme, type, disabled || false),
    color: type === "primary" ? "white" : "black",
    textTransform: "none",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      backgroundColor:
        type === "primary" ? theme.palette.primary.dark : "transparent",
      color: type === "primary" ? "white" : theme.palette.neutral[600],
    },
    ...style,
  };

  const textStyles = {
    color: textColor(theme, type, disabled || false),
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: "0.02em",
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
