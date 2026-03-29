import {
  Box,
  FormControl,
  FormHelperText,
  InputAdornment,
  TextField,
  InputBase,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IconAlertCircle } from "@tabler/icons-react";

type TextInputProps = {
  placeholder?: string;
  value: string | number;
  containerStyles?: React.CSSProperties;
  inputStyles?: React.CSSProperties;
  disabled?: boolean;
  topText?: string;
  description?: string;
  bottomText?: string;
  error?: boolean;
  icon?: React.ReactNode;
  type?: string;
  name?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEnterPressed?: () => void;
  inputType?: "TextField" | "InputBase";
  multiline?: any;
  maxRows?: any;
  inputBaseStyles?: React.CSSProperties;
};

const TextInput = ({
  placeholder,
  value,
  topText,
  bottomText,
  type,
  containerStyles,
  inputStyles,
  disabled,
  error,
  icon,
  description,
  name,
  multiline,
  maxRows,
  onChange,
  onEnterPressed,
  inputBaseStyles,
  inputType = "TextField",
}: TextInputProps) => {
  const theme = useTheme();
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (onEnterPressed) {
        onEnterPressed();
        const syntheticEvent = {
          target: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    }
  };

  return (
    <FormControl
      sx={{
        ...(inputType === "InputBase" && { width: "100%" }),
      }}
      variant="outlined"
    >
      <Box
        sx={{
          ...(inputType === "InputBase" && { width: "100%" }),
          justifyContent: "flex-start",
          alignSelf: "center",
          ...containerStyles,
        }}
      >
        {topText && (
          <Box sx={{ height: 20, pb: description ? 0 : 0.5 }}>
            <FormHelperText
              sx={{ color: "neutral.700", fontSize: 13, fontWeight: 500 }}
              id="outlined-weight-helper-text"
            >
              {topText}
            </FormHelperText>
          </Box>
        )}
        {description && (
          <Box sx={{ pb: 0.5 }}>
            <Typography sx={{ fontSize: "11px", color: "neutral.600" }}>
              {description}
            </Typography>
          </Box>
        )}

        {inputType === "TextField" ? (
          <TextField
            style={containerStyles}
            error={error}
            disabled={disabled}
            placeholder={placeholder}
            type={type}
            variant="outlined"
            name={name}
            sx={{
              width: "100%",
              backgroundColor: "white",
              borderRadius: 40,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#E7E5E4",
                  borderWidth: 1,
                },
                "&:hover fieldset": {
                  borderColor: "#D6D3D1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#E86D5A",
                  borderWidth: 2,
                  boxShadow: "0 0 0 3px rgba(232, 109, 90, 0.12)",
                },
              },
              ...inputStyles,
            }}
            onKeyDown={handleKeyDown}
            InputProps={{
              style: {
                borderRadius: "8px",
                height: "44px",
              },
              startAdornment: icon,
              endAdornment: error && (
                <InputAdornment position="end">
                  <IconAlertCircle
                    width={20}
                    height={20}
                    style={{ color: theme.palette.error.main }}
                  />
                </InputAdornment>
              ),
            }}
            inputProps={{
              style: {
                borderBottom: "none",
                paddingLeft: icon ? 10 : 15,
                paddingRight: 15,
                alignItems: "center",
                fontSize: 14,
              },
            }}
            value={value}
            onChange={onChange}
          />
        ) : (
          <InputBase
            multiline={multiline}
            maxRows={maxRows}
            style={containerStyles}
            placeholder={placeholder}
            disabled={disabled}
            onKeyDown={handleKeyDown}
            sx={{
              ...inputStyles,
              "& .MuiInputBase-input": {
                ...inputBaseStyles,
              },
            }}
            value={value}
            onChange={onChange}
          />
        )}
        {error && (
          <FormHelperText sx={{ color: "error.main" }}>
            This field is required!
          </FormHelperText>
        )}
        {bottomText && (
          <FormHelperText sx={{ color: "neutral.700", fontSize: 16 }}>
            {bottomText}
          </FormHelperText>
        )}
      </Box>
    </FormControl>
  );
};

export default TextInput;
