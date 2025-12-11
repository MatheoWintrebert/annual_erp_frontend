import { createTheme } from '@mui/material/styles';

const primaryColor = '#676767';
const secondaryColor = '#77A53C';

const theme = createTheme({
    colorSchemes: {
        light: true,
        dark: true,
    },
    palette: {
        primary: {
            main: primaryColor,
        },
        secondary: {
            main: secondaryColor,
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
        text: {
            primary: '#000000',
            secondary: '#555555',
        },
    },
});

export default theme;
