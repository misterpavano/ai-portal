import { Box, Typography } from "@mui/material";

type TInputDescriptionProps = {
  text: any;
  marginTop?: string;
  fontSize?: number;
};

function InputDescriptionBox({
  text,
  marginTop,
  fontSize = 11,
}: TInputDescriptionProps) {
  return (
    <Box
      sx={{
        position: "relative",
        maxWidth: 300,
        marginTop: marginTop,
        padding: "12px 16px",
        color: "white",
        backgroundColor: "black",
        borderRadius: "12px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
        "&::before": {
          content: '""',
          position: "absolute",
          left: "-8px",
          top: "20px",
          width: 0,
          height: 0,
          borderRight: "8px solid black",
          borderTop: "6px solid transparent",
          borderBottom: "6px solid transparent",
        },
      }}
    >
      <Typography style={{ fontSize: fontSize }}>{text}</Typography>
    </Box>
  );
}

export default InputDescriptionBox;
