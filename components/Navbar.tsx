import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Button,
    SwipeableDrawer,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import Link from './Link';
import { FunctionComponent, useState } from 'react';
import styles from 'styles/Navbar.module.scss';
import { gql } from 'graphql-request';
import useSWR from 'swr';

const Navbar: FunctionComponent = () => {
    const [open, setOpen] = useState(false);
    const { data } = useSWR(gql`
        query {
            checkRefreshToken
        }
    `);

    const navbarLinks = () => (
        <>
            <span className={styles.separator}></span>
            <Link underline='none' className={styles.link} href='/'>
                <Button>Тест</Button>
            </Link>
            <Link underline='none' className={styles.link} href='/'>
                <Button>Тест 2</Button>
            </Link>
            <Link underline='none' className={styles.link} href='/'>
                <Button>Тест 3</Button>
            </Link>
            <Link underline='none' className={styles.link} href='/'>
                <Button>Тест 4</Button>
            </Link>
            <Button className={styles.link}>Излез</Button>
            {data && !data.data.checkRefreshToken && (
                <Link underline='none' className={styles.link} href='/login'>
                    <Button
                        disableElevation
                        color='primary'
                        variant='contained'
                    >
                        Влез
                    </Button>
                </Link>
            )}
        </>
    );

    return (
        <AppBar elevation={0} className={styles.navbar} position='static'>
            <Toolbar>
                <IconButton
                    size='small'
                    className={styles['drawer-toggle']}
                    color='inherit'
                    aria-label='menu'
                    onClick={() => setOpen(!open)}
                >
                    <MenuIcon />
                </IconButton>
                <Link underline='none' className={styles.link} href='/'>
                    <Typography className={styles.title} variant='h1'>
                        Heggyo
                    </Typography>
                </Link>
                <div className={styles.links}>{navbarLinks()}</div>
                <SwipeableDrawer
                    anchor='left'
                    className='drawer'
                    open={open}
                    onClose={() => setOpen(false)}
                    onOpen={() => setOpen(true)}
                >
                    <Link underline='none' href='/'>
                        <Typography className='drawer-title' variant='h2'>
                            Heggyo
                        </Typography>
                    </Link>
                    {navbarLinks()}
                </SwipeableDrawer>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
