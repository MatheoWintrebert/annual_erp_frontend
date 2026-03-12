import type { FC } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import type { LoadingButtonProps } from "@mui/lab/LoadingButton";

export const CustomLoadingButton: FC<LoadingButtonProps> = (props) => {
  return <LoadingButton {...props} />;
};

CustomLoadingButton.displayName = "CustomLoadingButton";
