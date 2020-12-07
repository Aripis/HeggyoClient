import {
    SwipeableDrawer,
    IconButton,
    Button,
    Container,
    Typography,
} from '@material-ui/core';
import Link from './Link';
import {
    SettingsOutlined,
    DescriptionOutlined,
    DashboardOutlined,
    AddCircleOutlineOutlined,
} from '@material-ui/icons';
import { useEffect, FunctionComponent, useState } from 'react';
import styles from 'styles/Drawer.module.scss';

const Drawer: FunctionComponent = () => {
    const [open, setOpen] = useState(true);

    useEffect(() => {
        setOpen(!window.matchMedia('(max-width: 730px)').matches);
    }, []);

    return (
        <>
            <div
                className={`${styles.backdrop} ${open && styles.opened}`}
            ></div>
            <Container
                maxWidth={false}
                disableGutters
                className={`${styles['drawer-container']} ${
                    !open && styles.closed
                }`}
            >
                <div className={styles['upper-drawer']}>
                    <IconButton
                        size='small'
                        className={styles['drawer-toggle']}
                        color='inherit'
                        onClick={() => setOpen(!open)}
                    >
                        <span
                            className={`${styles['toggle-line']} ${
                                open && styles['toggled']
                            }`}
                        ></span>
                        <span
                            className={`${styles['toggle-line']} ${
                                open && styles['toggled']
                            }`}
                        ></span>
                        <span
                            className={`${styles['toggle-line']} ${
                                open && styles['toggled']
                            }`}
                        ></span>
                    </IconButton>
                    <Link className={styles.title} underline='none' href='/'>
                        <Typography className={styles.text} variant='h4'>
                            Heggyo
                        </Typography>
                    </Link>
                </div>
                <SwipeableDrawer
                    anchor='left'
                    className={styles.drawer}
                    open
                    variant='persistent'
                    onClose={() => setOpen(false)}
                    onOpen={() => setOpen(true)}
                >
                    <Link underline='none' className={styles.link} href='/'>
                        <Button>
                            <AddCircleOutlineOutlined /> Test 1
                        </Button>
                    </Link>
                    <Link underline='none' className={styles.link} href='/'>
                        <Button>
                            <DashboardOutlined />
                            Test 2
                        </Button>
                    </Link>
                    <Link underline='none' className={styles.link} href='/'>
                        <Button>
                            <DescriptionOutlined />
                            Test 3
                        </Button>
                    </Link>
                    <Link underline='none' className={styles.link} href='/'>
                        <Button>
                            <SettingsOutlined />
                            Settings
                        </Button>
                    </Link>
                </SwipeableDrawer>
            </Container>
        </>
    );
};

export default Drawer;
