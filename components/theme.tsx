import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#ff5722',
        },
        secondary: {
            main: '#5e35b1',
        },
        error: {
            main: '#ff1744',
        },
        background: {
            default: '#fff',
        },
    },
});

export default theme;
