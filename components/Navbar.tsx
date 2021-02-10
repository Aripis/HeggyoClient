import { AppBar, Toolbar, Typography, Button } from '@material-ui/core';
import Link from './Link';
import { FunctionComponent } from 'react';
import styles from 'styles/Navbar.module.scss';
import { useAuth } from 'utils/useAuth';
import Loader from 'components/Loader';

interface NavbarProps {
    title?: string;
}

const Navbar: FunctionComponent<NavbarProps> = (props) => {
    const { user, status, logout } = useAuth();

    if (status === 'FETCHING') {
        return <Loader />;
    }

    return (
        <AppBar elevation={0} className={styles.navbar} position='static'>
            <Toolbar>
                <Typography className={styles.title} variant='h1'>
                    {props.title}
                </Typography>
                <div className={styles.links}>
                    <span className={styles.separator}></span>
                    {!user ? (
                        <>
                            <Link
                                underline='none'
                                className={styles.link}
                                href='/login'
                            >
                                <Button
                                    disableElevation
                                    color='primary'
                                    variant='contained'
                                >
                                    Влез
                                </Button>
                            </Link>
                            <Link
                                underline='none'
                                className={styles.link}
                                href='/register'
                            >
                                <Button
                                    disableElevation
                                    color='primary'
                                    variant='outlined'
                                >
                                    Регистрация
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                underline='none'
                                className={styles.link}
                                href='/profile'
                            >
                                <Button>Профил</Button>
                            </Link>
                            <Button
                                onClick={() => logout()}
                                className={styles.link}
                            >
                                Излез
                            </Button>
                        </>
                    )}
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
