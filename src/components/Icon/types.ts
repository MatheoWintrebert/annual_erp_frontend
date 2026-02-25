// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO nocheck is needed for create release build
import type { SvgIconProps } from '@mui/material';

import type { IconName } from './names';

export interface IconProps extends SvgIconProps {
	name: IconName;
}
