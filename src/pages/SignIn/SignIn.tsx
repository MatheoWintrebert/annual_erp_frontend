import { FieldEmail } from "@/components/Fields/FieldEmail";
import { FieldCode } from "@/components/Fields/FieldCode";
import { FieldPassword } from "@/components/Fields/FieldPassword";
import { useLoginMutation } from "@/services";
import { Stack } from "@mui/material";
import { useRef, useState, useEffect } from 'react'; 
import { storage } from '@/utils';
import { useForm } from "react-hook-form";
import { CustomLoadingButton } from "@/components/CustomLoadingButton/CustomLoadingButton";

interface SignInFormInputs {
	email: string;
	password: string;
	code: string;
}

export const SignIn = () => {
	const [login, { isLoading }] = useLoginMutation();
	const [loading, setLoading] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');

	const methods = useForm<SignInFormInputs>();
    const { handleSubmit, setValue, trigger, watch } = methods;

	const buttonRef = useRef(null);

	const onSubmit = handleSubmit(async ({ email, password, code }: SignInFormInputs) => {
        try {
			console.log('onSubmit called with:', { email, password, code });
            await login({ email, password, code }).unwrap();
        } catch (error) {
            console.error('Login failed:', error);
        }
    });

    return (
        <>
		<div>
				<Stack mb={2}>
					<input
						type="email"
						placeholder="Email"
						{...methods.register('email', { required: 'Email is required' })}
					/>
				</Stack>

				<Stack>
					<input
						type="password"
						placeholder="Password"
						{...methods.register('password', { required: 'Password is required' })}
						onChange={() => setErrorMessage('')}
						onKeyDown={async (e) => {
							if (e.key === 'Enter') {
								const isValid = await trigger();
								if (isValid) {
									buttonRef.current?.click();
								}
							}
						}}
					/>
				</Stack>
				<Stack mb={2}>
					<input
						type="text"
						placeholder="Code"
						{...methods.register('code', { required: 'Code is required' })}
						onChange={() => setErrorMessage('')}
						defaultValue={storage.getItem('email') || ''}
					/>
				</Stack>
            <CustomLoadingButton fullWidth onClick={onSubmit} loading={loading} title={'Login'} ref={buttonRef}>
                Login
            </CustomLoadingButton>
        </div></>
    );
};