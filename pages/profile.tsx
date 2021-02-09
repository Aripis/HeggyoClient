import {
    useEffect,
    useState,
    FunctionComponent,
    ReactNode,
    FormEvent,
} from 'react';
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
    TextField,
    Snackbar,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import styles from 'styles/Profile.module.scss';
import { useRouter } from 'next/router';
import { User } from 'utils/interfaces';
import Navbar from 'components/Navbar';
import Drawer from 'components/Drawer';
import { useAuth } from 'utils/useAuth';
import Loader from 'components/Loader';
import {
    PersonOutlineOutlined,
    EditOutlined,
    AdjustOutlined,
    DoneOutlined,
    CloseOutlined,
} from '@material-ui/icons';
import { UserRoles, UserStatus } from 'utils/enums';
import graphQLClient from 'utils/graphqlclient';
import { gql } from 'graphql-request';

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
    const [edit, setEdit] = useState(false);
    const [firstName, setFirstName] = useState<string | undefined>('');
    const [middleName, setMiddleName] = useState<string | undefined>('');
    const [lastName, setLastName] = useState<string | undefined>('');
    const [email, setEmail] = useState<string | undefined>('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
        if (user) {
            setFirstName(user.firstName);
            setMiddleName(user.middleName);
            setLastName(user.lastName);
            setEmail(user.email);
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

    const getStatus = (role: UserStatus | string | undefined) => {
        switch (role) {
            case 'UNVERIFIED':
                return 'Непотвърден';
            case 'ACTIVE':
                return 'Активен';
            case 'INACTIVE':
                return 'Неактивен';
            case 'BLOCKED':
                return 'Блокиран';
            default:
                return undefined;
        }
    };

    const updateProfile = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await graphQLClient.request(
                gql`
                    mutation(
                        $firstName: String!
                        $middleName: String!
                        $lastName: String!
                        $email: String!
                    ) {
                        updateUser(
                            updateUserInput: {
                                firstName: $firstName
                                middleName: $middleName
                                lastName: $lastName
                                email: $email
                            }
                        ) {
                            userId
                        }
                    }
                `,
                { firstName, middleName, lastName, email }
            );
            setEdit(false);
        } catch (error) {
            setError('Неизвестна грешка');
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
                            src='https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
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
                                        <Typography
                                            className={
                                                styles['additional-text']
                                            }
                                        >
                                            <AdjustOutlined />
                                            {getStatus(user.status)}
                                        </Typography>
                                    </Breadcrumbs>
                                </div>
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
                            <Tab disableRipple label='Оценки' />
                        </Tabs>
                    </AppBar>
                    <TabPanel value={value} index={0}>
                        <form
                            onSubmit={updateProfile}
                            className={styles['additional-info']}
                        >
                            <TextField
                                required
                                inputProps={{ readOnly: !edit }}
                                className={styles['info-field']}
                                label='Първо име'
                                value={firstName}
                                onChange={(e) => {
                                    setFirstName(e.target.value as string);
                                }}
                                variant='outlined'
                            />
                            <TextField
                                required
                                inputProps={{ readOnly: !edit }}
                                className={styles['info-field']}
                                label='Презиме'
                                value={middleName}
                                onChange={(e) => {
                                    setMiddleName(e.target.value as string);
                                }}
                                variant='outlined'
                            />
                            <TextField
                                required
                                inputProps={{ readOnly: !edit }}
                                className={styles['info-field']}
                                label='Фамилия'
                                value={lastName}
                                onChange={(e) => {
                                    setLastName(e.target.value as string);
                                }}
                                variant='outlined'
                            />
                            <TextField
                                required
                                inputProps={{ readOnly: !edit }}
                                className={styles['info-field']}
                                label='Имейл'
                                value={email}
                                type='email'
                                onChange={(e) => {
                                    setEmail(e.target.value as string);
                                }}
                                variant='outlined'
                            />
                            {!edit ? (
                                <Button
                                    className={styles['edit-button']}
                                    color='primary'
                                    variant='contained'
                                    disableElevation
                                    startIcon={<EditOutlined />}
                                    onClick={() => setEdit(!edit)}
                                >
                                    Редактиране
                                </Button>
                            ) : (
                                <div className={styles['actions-container']}>
                                    <Button
                                        className={styles['edit-button']}
                                        disableElevation
                                        variant='contained'
                                        color='primary'
                                        endIcon={<DoneOutlined />}
                                        type='submit'
                                    >
                                        Потвърди
                                    </Button>
                                    <Button
                                        className={styles['edit-button']}
                                        disableElevation
                                        variant='outlined'
                                        color='secondary'
                                        endIcon={<CloseOutlined />}
                                        onClick={() => setEdit(false)}
                                    >
                                        Отказ
                                    </Button>
                                </div>
                            )}
                        </form>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        Оценки
                    </TabPanel>
                </div>
                <Snackbar
                    open={Boolean(error)}
                    autoHideDuration={6000}
                    onClose={() => setError('')}
                >
                    <Alert
                        elevation={6}
                        variant='filled'
                        onClose={() => setError('')}
                        severity='error'
                    >
                        {error}
                    </Alert>
                </Snackbar>
            </Container>
        </>
    );
};

export default Profile;
