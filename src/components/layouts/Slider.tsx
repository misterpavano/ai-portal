import {
  Box,
  FormHelperText,
  Typography,
  Slider as SliderMui,
} from "@mui/material";

type SliderProps = {
  topText?: string;
  value: number;
  placeholder?: string;
  name: string;
  handleChange: (event: Event, value: number | number[]) => void;
  styles?: React.CSSProperties;
  min?: number;
  max?: number;
  leftBottomText?: string;
  rightBottomText?: string;
};

const Slider = ({
  topText,
  value,
  name,
  min = 0,
  max = 10,
  handleChange,
  styles,
  leftBottomText,
  rightBottomText,
}: SliderProps) => {
  return (
    <Box sx={styles}>
      {topText && (
        <Box sx={{ height: 20 }}>
          <FormHelperText
            sx={{ color: "neutral.700", fontSize: 16 }}
            id="outlined-weight-helper-text"
          >
            {topText}
          </FormHelperText>
        </Box>
      )}
      <SliderMui
        name={name}
        valueLabelDisplay="auto"
        value={value}
        min={min}
        max={max}
        onChange={handleChange}
        style={{ padding: 0 }}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 2,
        }}
      >
        <Box sx={{ borderRadius: 2, backgroundColor: 'primary.700', paddingInline: 2, paddingBlock: 0.6 }}>
          <Typography
            variant="body2"
            sx={{
              cursor: "pointer",
              fontSize: 12,
              color: "neutral.700",
              fontWeight: "bold",
            }}
          >
            {leftBottomText}
          </Typography>
        </Box>
        <Box sx={{ borderRadius: 2, backgroundColor: 'primary.700', paddingInline: 2, paddingBlock: 0.6 }}>
          <Typography
            variant="body2"
            sx={{
              cursor: "pointer",
              fontSize: 12,
              color: "neutral.700",
              fontWeight: "bold",
            }}
          >
            {rightBottomText}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Slider;
