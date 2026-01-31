import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#ffffff',
        },
        secondary: {
            main: '#77A53C',
        },
        info: {
            main: '#dc1dbc',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
        },
    },
});

export default theme;
