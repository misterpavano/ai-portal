import React, { useState } from "react";
import { Box, FormHelperText, InputAdornment, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IconAlertCircle } from "@tabler/icons-react";

type TextAreaProps = {
    placeholder?: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement> | any) => void;
    styles?: React.CSSProperties;
    name?: string;
    topText?: string;
    description?: string;
    error?: boolean;
    showCharacterCount?: boolean;
    maxLength?: number;
    disabled?: boolean;
    isLongText?: boolean;
};

const TextArea = ({
    placeholder,
    value,
    onChange,
    error,
    name,
    styles,
    topText,
    description,
    maxLength,
    disabled,
    isLongText,
    showCharacterCount = false,
}: TextAreaProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const theme = useTheme();

    const remainingChars = maxLength ? maxLength - value.length : undefined;

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!maxLength || event.target.value.length <= maxLength) {
            onChange(event);
        }
    };

    return (
        <Box sx={{ position: "relative" }}>
            {topText && (
                <Box sx={{ height: 18, pb: isLongText ? 2 : 0.5 }}>
                    <FormHelperText sx={{ color: "neutral.700" }}>{topText}</FormHelperText>
                </Box>
            )}
            {description && (
                <Box sx={{ pb: 0.5 }}>
                    <Typography sx={{ fontSize: "11px", color: "neutral.600" }}>
                        {description}
                    </Typography>
                </Box>
            )}
            <Box sx={{ position: "relative" }}>
                <textarea
                    maxLength={maxLength}
                    className="text-area"
                    disabled={disabled}
                    placeholder={placeholder}
                    name={name}
                    value={value}
                    rows={4}
                    style={{
                        borderRadius: "8px",
                        resize: "none",
                        lineHeight: "150%",
                        border: error
                            ? isFocused
                                ? `2px solid ${theme.palette.error.main}`
                                : `1px solid ${theme.palette.error.main}`
                            : `1px solid ${theme.palette.neutral[300]}`,
                        width: "100%",
                        padding: 15,
                        fontFamily: "inherit",
                        fontSize: 15,
                        pointerEvents: disabled ? "none" : "auto",
                        opacity: disabled ? 0.6 : 1,
                        ...styles,
                    }}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                {error && (
                    <InputAdornment
                        position="end"
                        sx={{ position: "absolute", left: "97%", top: "calc(50% - 10px)" }}
                    >
                        <IconAlertCircle
                            width={20}
                            height={20}
                            style={{ color: theme.palette.error.main }}
                        />
                    </InputAdornment>
                )}
            </Box>
            {error && (
                <FormHelperText id="outlined-weight-helper-text" sx={{ color: "error.main" }}>
                    The field is required!
                </FormHelperText>
            )}
            {!error && showCharacterCount && (
                <Box
                    sx={{
                        fontSize: "12px",
                        position: "absolute",
                        bottom: 10,
                        right: 0,
                        color: remainingChars && remainingChars < 0 ? "error.main" : "inherit",
                    }}
                >
                    {value.length}/{maxLength}
                </Box>
            )}
        </Box>
    );
};

export default TextArea;
