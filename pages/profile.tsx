import {
    useEffect,
    useState,
    FunctionComponent,
    ReactNode,
    FormEvent,
    Fragment,
    MouseEvent,
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
    Popover,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import styles from 'styles/Profile.module.scss';
import { useRouter } from 'next/router';
import { Class, Grade, Student, Subject, User } from 'utils/interfaces';
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
import { getUserStatus, getUserRole, getGradeName } from 'utils/helpers';
import graphQLClient from 'utils/graphqlclient';
import { gql } from 'graphql-request';
import useSWR from 'swr';

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

interface GradeTableProps {
    student: Student;
    subjectId: string | undefined;
    classId: string | undefined;
}

const GradeTable: FunctionComponent<GradeTableProps> = (props) => {
    const [anchorEl, setAnchorEl] = useState<(HTMLButtonElement | null)[]>([]);

    const { data } = useSWR([
        gql`
            query($subjectId: String!, $classId: String!) {
                getAllGradesPerClassPerSubject(
                    subjectId: $subjectId
                    classId: $classId
                ) {
                    id
                    createdAt
                    message
                    grade
                    gradeWithWords
                    type
                    student {
                        id
                    }
                }
            }
        `,
        JSON.stringify({ subjectId: props.subjectId, classId: props.classId }),
    ]);

    console.log(data);

    const onGradeHover = (index: number, value: HTMLButtonElement | null) => {
        const temp = anchorEl;
        temp[index] = value;
        setAnchorEl([...temp]);
    };

    return (
        <div className={styles['grades-container']}>
            <Fragment key={props.student.id}>
                <div className={styles['grade-row']}>
                    <div
                        className={`${styles['grade-field']} ${styles['grade-field-name']}`}
                    >
                        <span>{`${
                            props.student?.user?.firstName
                        } ${props.student?.user?.middleName?.charAt(0)}. ${
                            props.student?.user?.lastName
                        }`}</span>
                    </div>
                    <div
                        className={`${styles['grade-field']} ${styles['grade-field-grades']}`}
                    >
                        {data?.getAllGradesPerClassPerSubject
                            ?.filter(
                                (grade: Grade) =>
                                    grade?.student?.id === props.student.id
                            )
                            .sort((a: Grade, b: Grade) =>
                                (a.createdAt as Date) > (b.createdAt as Date)
                                    ? 1
                                    : (a.createdAt as Date) <
                                      (b.createdAt as Date)
                                    ? -1
                                    : 0
                            )
                            .map((grade: Grade, i: number) => (
                                <Fragment key={grade.id}>
                                    <span
                                        aria-haspopup='true'
                                        className={styles.grade}
                                        onMouseEnter={(
                                            e: MouseEvent<HTMLButtonElement>
                                        ) => onGradeHover(i, e.currentTarget)}
                                        onMouseLeave={() =>
                                            onGradeHover(i, null)
                                        }
                                        key={grade.id}
                                    >{`${getGradeName(
                                        grade.gradeWithWords,
                                        true
                                    )} ${grade.grade}`}</span>
                                    <Popover
                                        style={{ pointerEvents: 'none' }}
                                        open={Boolean(anchorEl[i])}
                                        anchorEl={anchorEl[i]}
                                        onClose={() => onGradeHover(i, null)}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'center',
                                        }}
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'center',
                                        }}
                                    >
                                        <Typography className='grade-message'>
                                            {grade.message || 'Оценка'}
                                        </Typography>
                                    </Popover>
                                </Fragment>
                            ))}
                    </div>
                </div>
            </Fragment>
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
    const [anchorEl, setAnchorEl] = useState<(HTMLButtonElement | null)[]>([]);
    // const [subjectId, setSubjectId] = useState('');
    // const [asd, setClassId] = useState('');
    const [innerValue, setInnerValue] = useState(0);
    // const tabCounter = 0;

    const { data } = useSWR(
        gql`
            query {
                getAllClasses {
                    id
                    number
                    letter
                    subjects {
                        id
                        name
                    }
                    teacher {
                        id
                        user {
                            id
                        }
                    }
                }

                getAllStudents {
                    id
                    user {
                        firstName
                        middleName
                        lastName
                        email
                        status
                    }
                    class {
                        id
                        number
                        letter
                    }
                    prevEducation
                    recordMessage
                    dossier {
                        id
                        createdAt
                        updatedAt
                        fromUser {
                            id
                            firstName
                            middleName
                            lastName
                        }
                        subject {
                            id
                            name
                        }
                        message
                    }
                }
            }
        `
    );

    // const { data: grades } = useSWR([
    //     gql`
    //         query($subjectId: String!, $classId: String!) {
    //             getAllGradesPerClassPerSubject(
    //                 subjectId: $subjectId
    //                 classId: $classId
    //             ) {
    //                 id
    //                 createdAt
    //                 message
    //                 grade
    //                 gradeWithWords
    //                 type
    //                 student {
    //                     id
    //                 }
    //             }
    //         }
    //     `,
    //     JSON.stringify({ classId: asd, subjectId }),
    // ]);

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

    const onGradeHover = (index: number, value: HTMLButtonElement | null) => {
        const temp = anchorEl;
        temp[index] = value;
        setAnchorEl([...temp]);
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
                            input: {
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
                                            {getUserRole(user.role)}
                                        </Typography>
                                        <Typography
                                            className={
                                                styles['additional-text']
                                            }
                                        >
                                            <AdjustOutlined />
                                            {getUserStatus(user.status)}
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
                        <AppBar
                            position='static'
                            color='transparent'
                            elevation={0}
                        >
                            <Tabs
                                indicatorColor='primary'
                                value={innerValue}
                                onChange={(_e, newValue) => {
                                    setInnerValue(newValue);
                                }}
                            >
                                {data?.getAllClasses?.map((cls: Class) =>
                                    cls?.subjects?.map((subject: Subject) => (
                                        <Tab
                                            key={subject.id}
                                            disableRipple
                                            label={`
                                                ${cls.number}${cls.letter} 
                                                ${subject.name}
                                            `}
                                        />
                                    ))
                                )}
                            </Tabs>
                        </AppBar>
                        <div className={styles['grade-row']}>
                            <div
                                className={`${styles['grade-field']} ${styles['grade-field-name']}`}
                            >
                                <span>
                                    <strong>Име</strong>
                                </span>
                            </div>

                            <div
                                className={`${styles['grade-field']} ${styles['grade-field-grades']}`}
                            >
                                <span>
                                    <strong>Оценки</strong>
                                </span>
                            </div>
                        </div>
                        {data?.getAllClasses?.map((cls: Class) =>
                            cls?.subjects?.map(
                                (subject: Subject, i: number) => (
                                    <TabPanel
                                        key={i}
                                        value={innerValue}
                                        index={innerValue}
                                    >
                                        <GradeTable
                                            subjectId={subject.id}
                                            classId={cls.id}
                                            student={data?.getAllStudents.filter(
                                                (st: Student | undefined) =>
                                                    st?.user?.id === user.id
                                            )}
                                        />
                                    </TabPanel>
                                )
                            )
                        )}
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
