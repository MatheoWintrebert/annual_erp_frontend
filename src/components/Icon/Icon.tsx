import { SvgIcon } from "@mui/material";
import type { IconProps } from "./types";

export const Icon = ({ name, ...props }: IconProps) => {
  return (
    <SvgIcon {...props} inheritViewBox>
      <use href={`/sprite.svg#${name}`} />
    </SvgIcon>
  );
};
