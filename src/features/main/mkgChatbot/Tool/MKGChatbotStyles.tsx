import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  greenDot: {
    position: "absolute",
    bottom: 0,
    left: 20,
    backgroundColor: "#3D9A5C",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    zIndex: 1,
    animation: "$pulse 2s infinite",
  },
  typingDot: {
    width: "5px",
    height: "5px",
    backgroundColor: "#A8A29E",
    borderRadius: "50%",
    position: "absolute",
    animation: "$blink 1.5s infinite both",

    "&:nth-child(2)": {
      animationDelay: "0.2s",
      marginLeft: "15px",
    },
    "&:nth-child(3)": {
      animationDelay: "0.4s",
      marginLeft: "30px",
    },
  },
  cursor: {
    display: "inline-block",
    width: "0.7ch",
    animation: "$flicker 0.5s infinite",
  },
  "@keyframes pulse": {
    "0%": {
      transform: "scale(0.85)",
      boxShadow: "0 0 0 0 rgba(0, 0, 0, 0.7)",
    },
    "70%": {
      transform: "scale(1)",
      boxShadow: "0 0 0 10px rgba(0, 0, 0, 0)",
    },
    "100%": {
      transform: "scale(0.85)",
      boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
    },
  },
  "@keyframes loadingFade": {
    "0%": {
      opacity: 0,
    },
    "50%": {
      opacity: 0.8,
    },
    "100%": {
      opacity: 0,
    },
  },
  "@keyframes blink": {
    "0%": {
      opacity: 0.1,
    },
    "20%": {
      opacity: 1,
    },
    "100%": {
      opacity: 0.1,
    },
  },
  "@keyframes flicker": {
    "0%": {
      opacity: 0,
    },
    "50%": {
      opacity: 1,
    },
    "100%": {
      opacity: 0,
    },
  },
}));

export default useStyles;
