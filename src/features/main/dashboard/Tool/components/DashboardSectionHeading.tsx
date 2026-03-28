import { Typography } from "@mui/material";
import { ReactNode } from "react";

type DashboardSectionHeadingProps = {
  children: ReactNode;
};

const DashboardSectionHeading = ({
  children,
}: DashboardSectionHeadingProps) => {
  return (
    <Typography
      sx={{
        fontSize: 14,
        fontWeight: 600,
        color: "text.secondary",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        mb: 2,
      }}
    >
      {children}
    </Typography>
  );
};

export default DashboardSectionHeading;
