import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { somethingWentWrong } from '@/constants/messages';



export const SignUp = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const methods = useForm();
	const { getValues, handleSubmit } = methods;

    const onSubmit = handleSubmit(async ({ email, password, code }) => {
		console.log('setErrorMessage');
		setErrorMessage('');
		console.log('setLoading to true');
		setLoading(true);

		console.log('start the condition ');
		if (recaptchaRef.current) {

			console.log('try block');
			try {
				console.log('before await signUp');
				console.log('email', email);
				console.log('password', password);
				const { nextStep } = await signUp({ username: email, password });
				console.log('after await signUp');
				console.log('nextStep', nextStep);
				if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
					console.log('setPleaseVerify');
					setPleaseVerify(true);
				} else {
					console.log('setErrorMessage');
					setErrorMessage(somethingWentWrong);
				}

				setLoading(false);
			} catch (error: unknown) {
				if (error instanceof Error) {
					setErrorMessage(error.message);
				} else {
					setErrorMessage(somethingWentWrong);
				}

				setLoading(false);
			}
		} else {
			setLoading(false);
			setErrorMessage(somethingWentWrong);
		}
	});
};