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
    MeetingRoomOutlined,
    DashboardOutlined,
    DescriptionOutlined,
    CollectionsBookmarkOutlined,
    PeopleAltOutlined,
} from '@material-ui/icons';
import { FunctionComponent, useState } from 'react';
import styles from 'styles/Drawer.module.scss';

const Drawer: FunctionComponent = () => {
    const [open, setOpen] = useState(
        !window.matchMedia('(max-width: 730px)').matches
    );

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
                    <Link
                        className={styles.title}
                        underline='none'
                        href='/dashboard'
                    >
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
                    <Link
                        underline='none'
                        className={styles.link}
                        href='/dashboard'
                    >
                        <Button>
                            <DashboardOutlined /> Табло
                        </Button>
                    </Link>
                    <Link underline='none' className={styles.link} href='/'>
                        <Button>
                            <PeopleAltOutlined /> Потребители
                        </Button>
                    </Link>
                    <Link
                        underline='none'
                        className={styles.link}
                        href='/subjects'
                    >
                        <Button>
                            <CollectionsBookmarkOutlined />
                            Предмети
                        </Button>
                    </Link>
                    <Link underline='none' className={styles.link} href='/'>
                        <Button>
                            <MeetingRoomOutlined />
                            Класове
                        </Button>
                    </Link>
                    <Link underline='none' className={styles.link} href='/'>
                        <Button>
                            <DescriptionOutlined />
                            Учебни програми
                        </Button>
                    </Link>
                    <Link underline='none' className={styles.link} href='/'>
                        <Button>
                            <SettingsOutlined />
                            Настройки
                        </Button>
                    </Link>
                </SwipeableDrawer>
            </Container>
        </>
    );
};

export default Drawer;
