import {
    useEffect,
    useState,
    FunctionComponent,
    ReactNode,
    MouseEvent,
    Fragment,
} from 'react';
import Head from 'next/head';
import Navbar from 'components/Navbar';
import Drawer from 'components/Drawer';
import {
    Container,
    Button,
    Snackbar,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    AppBar,
    Tabs,
    Tab,
    Popover,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { ExpandMoreOutlined } from '@material-ui/icons';
import { useAuth } from 'utils/useAuth';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
import styles from 'styles/Students.module.scss';
import { gql } from 'graphql-request';
import {
    Student,
    StudentDossier,
    Class,
    Subject,
    Grade,
} from 'utils/interfaces';
import useSWR from 'swr';
import { ContractType, UserStatus, UserRoles } from 'utils/enums';
import { getUserStatus, getUserRole, getGradeName } from 'utils/helpers';
import graphQLClient from 'utils/graphqlclient';

interface UsersProps {
    id: string | undefined;
    userRole: UserRoles | undefined;
    firstName: string | undefined;
    middleName: string | undefined;
    lastName: string | undefined;
    email: string | undefined;
    status: UserStatus | undefined;
    classNumber?: number | undefined;
    classLetter?: string | undefined;
    prevEducation?: string | undefined;
    recordMessage?: string | undefined;
    education?: string | undefined;
    yearsExperience?: number | undefined;
    contractType?: ContractType | undefined;
    studentDossier?: StudentDossier | undefined;
}

interface TabPanelProps {
    children?: ReactNode;
    index: number;
    value: number;
}

const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
        <div hidden={value !== index} {...other}>
            {value === index && <div>{children}</div>}
        </div>
    );
};

const UsersComponent: FunctionComponent<UsersProps> = (props) => {
    const [expanded, setExpanded] = useState(false);
    const router = useRouter();

    return (
        <Accordion
            elevation={0}
            expanded={expanded}
            onChange={() => setExpanded(!expanded)}
            className={styles['user-accordion']}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreOutlined />}
                className={styles['accordion-summary']}
            >
                <Typography variant='body1' className={styles['names']}>
                    <strong>Име: </strong>
                    {`${props.firstName} ${expanded ? props.middleName : ''} ${
                        props.lastName
                    }`}
                    {!props.firstName &&
                        !props.middleName &&
                        !props.lastName &&
                        '--'}
                </Typography>
                <Typography variant='body1' className={styles['role-text']}>
                    <strong>Роля: </strong>
                    {getUserRole(props.userRole) || '--'}
                </Typography>
                <Typography variant='body1' className={styles['status']}>
                    <strong>Статус: </strong>
                    {props.status ? getUserStatus(props.status) : '--'}
                </Typography>
            </AccordionSummary>
            <AccordionDetails className={styles['accordion-details']}>
                <div className={styles['details']}>
                    <Typography
                        variant='body1'
                        className={styles['email-text']}
                    >
                        <strong>Имейл: </strong>
                        {props.email || '--'}
                    </Typography>
                    {props.userRole === 'STUDENT' && (
                        <>
                            <Typography className={styles['class']}>
                                <strong>Клас: </strong>
                                {props.classNumber}
                                {props.classLetter}
                                {!props.classLetter &&
                                    !props.classNumber &&
                                    '--'}
                            </Typography>
                            <Typography className={styles['record-message']}>
                                <strong>Коментар: </strong>
                                {props.recordMessage || '--'}
                            </Typography>
                        </>
                    )}
                </div>
                <Button
                    variant='contained'
                    color='primary'
                    disableElevation
                    className={styles['button-view-more']}
                    onClick={() =>
                        router.push(
                            `/viewstudent?r=${props.userRole}&id=${props.id}`
                        )
                    }
                >
                    Виж още
                </Button>
            </AccordionDetails>
        </Accordion>
    );
};

interface GradeTableProps {
    students: Student[];
    subjectId: string | undefined;
    classId: string | undefined;
}

const GradeTable: FunctionComponent<GradeTableProps> = (props) => {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await graphQLClient.request(
                    gql`
                        query($subjectId: String!, $classId: String!) {
                            gradesPerClassPerSubject(
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
                    { subjectId: props.subjectId, classId: props.classId }
                );
                setGrades(data.gradesPerClassPerSubject);
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);

    return (
        <div className={styles['grades-container']}>
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
            {props.students.map((student) => (
                <div key={student.id} className={styles['grade-row']}>
                    <div
                        className={`${styles['grade-field']} ${styles['grade-field-name']}`}
                    >
                        <span>{`${
                            student?.user?.firstName
                        } ${student?.user?.middleName?.charAt(0)}. ${
                            student?.user?.lastName
                        }`}</span>
                    </div>
                    <div
                        className={`${styles['grade-field']} ${styles['grade-field-grades']}`}
                    >
                        {grades
                            .filter(
                                (grade) => grade?.student?.id === student.id
                            )
                            .sort((a: Grade, b: Grade) =>
                                (a.createdAt as Date) > (b.createdAt as Date)
                                    ? 1
                                    : (a.createdAt as Date) <
                                      (b.createdAt as Date)
                                    ? -1
                                    : 0
                            )
                            .map((grade) => (
                                <Fragment key={grade.id}>
                                    <span
                                        aria-haspopup='true'
                                        className={styles.grade}
                                        onMouseEnter={(
                                            e: MouseEvent<HTMLButtonElement>
                                        ) => setAnchorEl(e.currentTarget)}
                                        onMouseLeave={() => setAnchorEl(null)}
                                        key={grade.id}
                                    >{`${getGradeName(
                                        grade.gradeWithWords?.toUpperCase(),
                                        true
                                    )} ${grade.grade}`}</span>
                                    <Popover
                                        style={{ pointerEvents: 'none' }}
                                        open={Boolean(anchorEl)}
                                        anchorEl={anchorEl}
                                        onClose={() => setAnchorEl(null)}
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
                                            {grade.message}
                                        </Typography>
                                    </Popover>
                                </Fragment>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const Students: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();

    const [value, setValue] = useState(0);
    const [innerValue, setInnerValue] = useState(0);
    const [error, setError] = useState('');

    const { data } = useSWR(gql`
        query {
            classes {
                id
                classNumber
                classLetter
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

            students {
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
                    classNumber
                    classLetter
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
                    dossierMessage
                }
            }
        }
    `);

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
        if (
            user &&
            user?.userRole !== 'ADMIN' &&
            user?.userRole !== 'TEACHER'
        ) {
            router.back();
        }
    }, [user, status, data]);

    if (!user) {
        return <Loader />;
    }

    let tabCounter = 0;

    return (
        <>
            <Head>
                <title>Ученици &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Ученици' />
                <div className={styles.content}>
                    <AppBar position='static' color='transparent' elevation={0}>
                        <Tabs
                            indicatorColor='primary'
                            value={value}
                            onChange={(_e, newValue) => setValue(newValue)}
                        >
                            {data?.classes?.filter(
                                (cls: Class) =>
                                    cls?.teacher?.user?.id === user?.id
                            ).length && <Tab disableRipple label='Моят клас' />}

                            {data?.classes?.map((cls: Class) =>
                                cls?.subjects?.map((subject: Subject) => (
                                    <Tab
                                        disableRipple
                                        key={subject.id}
                                        label={`${cls.classNumber}${cls.classLetter} ${subject.name}`}
                                    />
                                ))
                            )}
                        </Tabs>
                    </AppBar>
                    <TabPanel value={value} index={0}>
                        {data && (
                            <div className={styles['users-container']}>
                                {data.students &&
                                    data.students
                                        .filter((student: Student) => {
                                            if (
                                                data.classes
                                                    .filter((cls: Class) => {
                                                        if (
                                                            cls?.teacher?.user
                                                                ?.id ===
                                                            user?.id
                                                        ) {
                                                            tabCounter = 1;
                                                            return true;
                                                        }
                                                    })
                                                    .map((cls: Class) => cls.id)
                                                    .includes(
                                                        student?.class?.id
                                                    )
                                            ) {
                                                return student;
                                            }
                                        })
                                        .map((student: Student, i: number) => (
                                            <UsersComponent
                                                key={i}
                                                id={student?.id}
                                                userRole={UserRoles['STUDENT']}
                                                firstName={
                                                    student?.user?.firstName
                                                }
                                                middleName={
                                                    student?.user?.middleName
                                                }
                                                lastName={
                                                    student?.user?.lastName
                                                }
                                                email={student?.user?.email}
                                                status={student?.user?.status}
                                                recordMessage={
                                                    student?.recordMessage
                                                }
                                                prevEducation={
                                                    student?.prevEducation
                                                }
                                                classLetter={
                                                    student?.class?.classLetter
                                                }
                                                classNumber={
                                                    student?.class?.classNumber
                                                }
                                                studentDossier={
                                                    student?.dossier
                                                }
                                            />
                                        ))}
                            </div>
                        )}
                    </TabPanel>
                    {data?.classes?.map((cls: Class) =>
                        cls?.subjects?.map((subject: Subject) => (
                            <TabPanel
                                key={subject.id}
                                value={value}
                                index={tabCounter++}
                            >
                                <AppBar
                                    position='static'
                                    color='transparent'
                                    elevation={0}
                                >
                                    <Tabs
                                        indicatorColor='primary'
                                        value={innerValue}
                                        onChange={(_e, newValue) =>
                                            setInnerValue(newValue)
                                        }
                                    >
                                        <Tab disableRipple label='Ученици' />
                                        <Tab disableRipple label='Оценки' />
                                    </Tabs>
                                </AppBar>
                                <TabPanel value={innerValue} index={0}>
                                    {' '}
                                    <div className={styles['users-container']}>
                                        {data.students
                                            .filter(
                                                (student: Student) =>
                                                    student?.class?.id ===
                                                    cls.id
                                            )
                                            .map((student: Student) => (
                                                <UsersComponent
                                                    key={student?.id}
                                                    id={student?.id}
                                                    userRole={
                                                        UserRoles['STUDENT']
                                                    }
                                                    firstName={
                                                        student?.user?.firstName
                                                    }
                                                    middleName={
                                                        student?.user
                                                            ?.middleName
                                                    }
                                                    lastName={
                                                        student?.user?.lastName
                                                    }
                                                    email={student?.user?.email}
                                                    status={
                                                        student?.user?.status
                                                    }
                                                    recordMessage={
                                                        student?.recordMessage
                                                    }
                                                    prevEducation={
                                                        student?.prevEducation
                                                    }
                                                    classLetter={
                                                        student?.class
                                                            ?.classLetter
                                                    }
                                                    classNumber={
                                                        student?.class
                                                            ?.classNumber
                                                    }
                                                    studentDossier={
                                                        student?.dossier
                                                    }
                                                />
                                            ))}
                                    </div>
                                </TabPanel>
                                <TabPanel value={innerValue} index={1}>
                                    <GradeTable
                                        students={data.students.filter(
                                            (student: Student) =>
                                                student?.class?.id === cls.id
                                        )}
                                        subjectId={subject.id}
                                        classId={cls.id}
                                    />
                                </TabPanel>
                            </TabPanel>
                        ))
                    )}
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

export default Students;
