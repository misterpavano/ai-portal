import React from "react";
import {
  Skeleton as MuiSkeleton,
  SkeletonProps as MuiSkeletonProps,
} from "@mui/material";

interface SkeletonProps extends MuiSkeletonProps {
  variant?: "text" | "rectangular" | "rounded";
  animation?: "pulse" | "wave" | false;
  width?: number | string;
  height?: number | string;
  sx?: object;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = "text",
  animation = "pulse",
  width,
  height,
  sx,
  ...props
}) => {
  return (
    <MuiSkeleton
      variant={variant}
      animation={animation}
      width={width}
      height={height}
      sx={sx}
      {...props}
    />
  );
};

export default Skeleton;
