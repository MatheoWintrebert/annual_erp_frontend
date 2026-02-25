import { forwardRef } from "react";
import type { FC } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import type { LoadingButtonProps } from "@mui/lab/LoadingButton";
// import loader from '@/assets/loader.gif';

export const CustomLoadingButton: FC<LoadingButtonProps> = forwardRef(
  (props, ref) => {
    const { loading, loadingIndicator } = props;

    return (
      <LoadingButton
        {...props}
        loading={loading}
        ref={ref}
        // loadingIndicator={loading ? <img src={loader} width={24} alt="loading" /> : loadingIndicator}
      />
    );
  }
);

CustomLoadingButton.displayName = "CustomLoadingButton";
