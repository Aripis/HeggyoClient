import { useEffect, useState, FunctionComponent, ReactNode } from 'react';
import Head from 'next/head';
import {
    Container,
    Avatar,
    Typography,
    Breadcrumbs,
    AppBar,
    Tab,
    Tabs,
    Button,
} from '@material-ui/core';
import styles from 'styles/Profile.module.scss';
import { useRouter } from 'next/router';
import { User } from 'utils/interfaces';
import Navbar from 'components/Navbar';
import Drawer from 'components/Drawer';
import { useAuth } from 'utils/useAuth';
import Loader from 'components/Loader';
import { PersonOutlineOutlined, EditOutlined } from '@material-ui/icons';
import { UserRoles } from 'utils/enums';

interface TabPanelProps {
    children?: ReactNode;
    index: number;
    value: number;
}

const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
        <div hidden={value !== index} {...other}>
            {value === index && (
                <div>
                    <Typography>{children}</Typography>
                </div>
            )}
        </div>
    );
};

const Profile: FunctionComponent<User> = () => {
    const router = useRouter();
    const { user, status } = useAuth();
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
    }, [user, status]);

    if (!user) {
        return <Loader />;
    }

    const getRole = (role: UserRoles | string | undefined) => {
        switch (role) {
            case 'ADMIN':
                return 'Админ';
            case 'PARENT':
                return 'Родител';
            case 'STUDENT':
                return 'Ученик';
            case 'TEACHER':
                return 'Учител';
            case 'VIEWER':
                return 'Посетител';
            default:
                return undefined;
        }
    };

    return (
        <>
            <Head>
                <title>Профил &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Профил' />
                <div className={styles.content}>
                    <div className={styles['profile-container']}>
                        <Avatar
                            className={styles.avatar}
                            src='https://www.w3schools.com/howto/img_avatar.png'
                            alt='profile'
                        />
                        <div className={styles['profile-info']}>
                            <div className={styles['info']}>
                                <div className={styles['details']}>
                                    <Typography
                                        className={styles['name']}
                                        variant='h4'
                                    >{`${user.firstName} ${user.lastName}`}</Typography>
                                    <Breadcrumbs
                                        className={styles['additional-info']}
                                    >
                                        <Typography
                                            className={
                                                styles['additional-text']
                                            }
                                        >
                                            <PersonOutlineOutlined />
                                            {getRole(user.userRole)}
                                        </Typography>
                                    </Breadcrumbs>
                                </div>
                            </div>
                            <div className={styles['actions']}>
                                <Button
                                    color='primary'
                                    variant='contained'
                                    disableElevation
                                    startIcon={<EditOutlined />}
                                >
                                    Редактиране
                                </Button>
                            </div>
                        </div>
                    </div>
                    <AppBar position='static' color='transparent' elevation={0}>
                        <Tabs
                            indicatorColor='primary'
                            value={value}
                            onChange={(_e, newValue) => setValue(newValue)}
                        >
                            <Tab disableRipple label='За потребителя' />
                            <Tab disableRipple label='Item Two' />
                            <Tab disableRipple label='Item Three' />
                        </Tabs>
                    </AppBar>
                    <TabPanel value={value} index={0}>
                        За потребителя
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        Item Two
                    </TabPanel>
                    <TabPanel value={value} index={2}>
                        Item Three
                    </TabPanel>
                </div>
            </Container>
        </>
    );
};

export default Profile;
