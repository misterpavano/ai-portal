/* eslint-disable react-hooks/exhaustive-deps */
import "react-quill/dist/quill.snow.css";
import Box from "@mui/material/Box";
import { memo } from "react";

import ExecutiveInterviewSummary from "./ExecutiveInterviewSummary";

const MemoizedExecutiveInterviewSummary = memo(ExecutiveInterviewSummary);

const ReviewInterviewSummaries = () => {
  return (
    <Box sx={{ width: "100%", marginTop: "10px" }}>
      <MemoizedExecutiveInterviewSummary />
    </Box>
  );
};

export default ReviewInterviewSummaries;
