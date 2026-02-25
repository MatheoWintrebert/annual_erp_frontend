import type { ReactNode } from 'react';

import type { RegisterOptions, UseFormReturn } from 'react-hook-form';
import type { InputBaseProps } from '@mui/material';

export interface FieldProps extends UseFormReturn {
	name?: string;
	label?: string;
	placeholder?: string;
	InputProps?: InputBaseProps;
	helperText?: null | ReactNode;
	autoComplete?: string;
	validation?: null | RegisterOptions;
	rows?: number;
	type?: string;
	disabled?: boolean;
	required?: boolean;
	sx?: Record<string, unknown>;
	labelAccount?: boolean;
	sxForm?: Record<string, unknown>;
}

export interface SelectProps extends UseFormReturn {
	name?: string;
	label?: string;
	helperText?: null | ReactNode;
	autoComplete?: string;
	validation?: null | RegisterOptions;
	disabled?: boolean;
	required?: boolean;
	countryCode?: string;
	sx?: Record<string, unknown>;
	labelAccount?: boolean;
	sxForm?: Record<string, unknown>;
}
