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
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    DialogActions,
    IconButton,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
    CloseOutlined,
    DoneOutlined,
    ExpandMoreOutlined,
} from '@material-ui/icons';
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
import { ContractType, UserStatus, UserRole, GradeType } from 'utils/enums';
import {
    getUserStatus,
    getUserRole,
    getGradeName,
    getGradeType,
    getGradeEnum,
} from 'utils/helpers';
import graphQLClient from 'utils/graphqlclient';
import AddOutlined from '@material-ui/icons/AddOutlined';

interface UsersProps {
    id: string | undefined;
    role: UserRole | undefined;
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
                    {getUserRole(props.role) || '--'}
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
                    {props.role === 'STUDENT' && (
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
                            `/viewstudent?r=${props.role}&id=${props.id}`
                        )
                    }
                >
                    Виж още
                </Button>
            </AccordionDetails>
        </Accordion>
    );
};

interface GradeDialogProps {
    studentId: string | undefined;
    subjectId: string | undefined;
    mutate: () => void;
}

const GradeDialog: FunctionComponent<GradeDialogProps> = (props) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [grade, setGrade] = useState(6);
    const [gradeType, setGradeType] = useState('');

    const addGrade = async () => {
        try {
            await graphQLClient.request(
                gql`
                    mutation (
                        $studentId: String!
                        $subjectId: String!
                        $grade: Float!
                        $message: String!
                        $gradeWithWords: GradeWord!
                        $type: GradeType!
                    ) {
                        addGrade(
                            input: {
                                studentId: $studentId
                                subjectId: $subjectId
                                message: $message
                                grade: $grade
                                gradeWithWords: $gradeWithWords
                                type: $type
                            }
                        ) {
                            gradeId
                        }
                    }
                `,
                {
                    studentId: props.studentId,
                    subjectId: props.subjectId,
                    message,
                    grade,
                    gradeWithWords: getGradeEnum(grade),
                    type: gradeType,
                }
            );
            setOpen(false);
            props.mutate();
        } catch (error) {
            throw new Error(error);
        }
    };

    return (
        <>
            <IconButton
                className={styles['add-grade-button']}
                onClick={() => setOpen(true)}
                color='primary'
            >
                <AddOutlined />
            </IconButton>
            <Dialog
                fullWidth
                maxWidth='lg'
                className={styles['dialog']}
                open={open}
                onClose={() => setOpen(false)}
            >
                <DialogTitle className={styles['dialog-title']}>
                    Добави оценка
                </DialogTitle>
                <DialogContent className={styles['dialog-content']}>
                    <div className={styles['input-container']}>
                        <TextField
                            label='Основание за оценката'
                            variant='outlined'
                            fullWidth
                            value={message}
                            multiline
                            rows={7}
                            rowsMax={9}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <div className={styles['grade-options']}>
                            <FormControl
                                variant='outlined'
                                className={styles['grade-select']}
                            >
                                <InputLabel id='grade-select-label'>
                                    Оценка
                                </InputLabel>
                                <Select
                                    label='Оценка'
                                    labelId='grade-select-label'
                                    value={grade}
                                    onChange={(e) => {
                                        setGrade(
                                            parseInt(e.target.value as string)
                                        );
                                    }}
                                    renderValue={(selected) =>
                                        (getGradeName(grade) +
                                            ' ' +
                                            selected) as string
                                    }
                                >
                                    {[2, 3, 4, 5, 6].map((grade) => (
                                        <MenuItem key={grade} value={grade}>
                                            {getGradeName(grade) + ' ' + grade}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl
                                variant='outlined'
                                className={styles['grade-type-select']}
                            >
                                <InputLabel id='grade-type-select-label'>
                                    Вид на оценката
                                </InputLabel>
                                <Select
                                    label='Оценка'
                                    labelId='grade-type-select-label'
                                    value={gradeType}
                                    required
                                    onChange={(e) => {
                                        setGradeType(e.target.value as string);
                                    }}
                                    renderValue={(selected) =>
                                        getGradeType(selected as string)
                                    }
                                >
                                    {Object.values(GradeType).map(
                                        (gradeType) => (
                                            <MenuItem
                                                key={gradeType}
                                                value={gradeType}
                                            >
                                                {getGradeType(gradeType)}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions className={styles['dialog-actions']}>
                    <Button
                        onClick={() => setOpen(false)}
                        disableElevation
                        variant='outlined'
                        color='secondary'
                        endIcon={<CloseOutlined />}
                    >
                        Отказ
                    </Button>

                    <Button
                        onClick={addGrade}
                        disableElevation
                        variant='contained'
                        color='primary'
                        endIcon={<DoneOutlined />}
                    >
                        Потвърди
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

interface GradeTableProps {
    students: Student[];
    subjectId: string | undefined;
    classId: string | undefined;
}

const GradeTable: FunctionComponent<GradeTableProps> = (props) => {
    const [anchorEl, setAnchorEl] = useState<(HTMLButtonElement | null)[]>([]);

    const { data, mutate } = useSWR([
        gql`
            query ($subjectId: String!, $classId: String!) {
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

    const onGradeHover = (index: number, value: HTMLButtonElement | null) => {
        const temp = anchorEl;
        temp[index] = value;
        setAnchorEl([...temp]);
    };

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
                    className={`${styles['grade-field']} ${styles['grade-field-turm-1']}`}
                >
                    <span>
                        <strong>1 срок</strong>
                    </span>
                </div>

                <div
                    className={`${styles['grade-field']} ${styles['grade-field-turm-2']}`}
                >
                    <span>
                        <strong>2 срок</strong>
                    </span>
                </div>

                <div
                    className={`${styles['grade-field']} ${styles['grade-field-year']}`}
                >
                    <span>
                        <strong>Годишна</strong>
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
            {props.students.map((student: Student) => (
                <Fragment key={student.id}>
                    <div className={styles['grade-row']}>
                        <div
                            className={`${styles['grade-field']} ${styles['grade-field-name']}`}
                        >
                            <span>{`${
                                student?.user?.firstName
                            } ${student?.user?.middleName?.charAt(0)}. ${
                                student?.user?.lastName
                            }`}</span>
                            <GradeDialog
                                mutate={mutate}
                                studentId={student.id}
                                subjectId={props.subjectId}
                            />
                        </div>
                        <div
                            className={`${styles['grade-field']} ${styles['grade-field-turm-1']}`}
                        >
                            {data?.getAllGradesPerClassPerSubject?.filter(
                                (grade: Grade) =>
                                    grade?.student?.id === student.id &&
                                    (grade.type as string) === 'TURM_1'
                            ).length > 0 ? (
                                data?.getAllGradesPerClassPerSubject
                                    ?.filter(
                                        (grade: Grade) =>
                                            grade?.student?.id === student.id &&
                                            (grade.type as string) === 'TURM_1'
                                    )
                                    .sort((a: Grade, b: Grade) =>
                                        (a.createdAt as Date) >
                                        (b.createdAt as Date)
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
                                                ) =>
                                                    onGradeHover(
                                                        i,
                                                        e.currentTarget
                                                    )
                                                }
                                                onMouseLeave={() =>
                                                    onGradeHover(i, null)
                                                }
                                                key={grade.id}
                                            >{`${getGradeName(
                                                grade.gradeWithWords,
                                                true
                                            )} ${grade.grade}`}</span>
                                            <Popover
                                                style={{
                                                    pointerEvents: 'none',
                                                }}
                                                open={Boolean(anchorEl[i])}
                                                anchorEl={anchorEl[i]}
                                                onClose={() =>
                                                    onGradeHover(i, null)
                                                }
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
                                    ))
                            ) : (
                                <span
                                    aria-haspopup='true'
                                    className={styles.grade}
                                >
                                    Няма
                                </span>
                            )}
                        </div>
                        <div
                            className={`${styles['grade-field']} ${styles['grade-field-turm-2']}`}
                        >
                            {data?.getAllGradesPerClassPerSubject?.filter(
                                (grade: Grade) =>
                                    grade?.student?.id === student.id &&
                                    (grade.type as string) === 'TURM_2'
                            ).length > 0 ? (
                                data?.getAllGradesPerClassPerSubject
                                    ?.filter(
                                        (grade: Grade) =>
                                            grade?.student?.id === student.id &&
                                            (grade.type as string) === 'TURM_2'
                                    )
                                    .sort((a: Grade, b: Grade) =>
                                        (a.createdAt as Date) >
                                        (b.createdAt as Date)
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
                                                ) =>
                                                    onGradeHover(
                                                        i,
                                                        e.currentTarget
                                                    )
                                                }
                                                onMouseLeave={() =>
                                                    onGradeHover(i, null)
                                                }
                                                key={grade.id}
                                            >{`${getGradeName(
                                                grade.gradeWithWords,
                                                true
                                            )} ${grade.grade}`}</span>
                                            <Popover
                                                style={{
                                                    pointerEvents: 'none',
                                                }}
                                                open={Boolean(anchorEl[i])}
                                                anchorEl={anchorEl[i]}
                                                onClose={() =>
                                                    onGradeHover(i, null)
                                                }
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
                                    ))
                            ) : (
                                <span
                                    aria-haspopup='true'
                                    className={styles.grade}
                                >
                                    Няма
                                </span>
                            )}
                        </div>
                        <div
                            className={`${styles['grade-field']} ${styles['grade-field-year']}`}
                        >
                            {data?.getAllGradesPerClassPerSubject?.filter(
                                (grade: Grade) =>
                                    grade?.student?.id === student.id &&
                                    (grade.type as string) === 'YEAR'
                            ).length > 0 ? (
                                data?.getAllGradesPerClassPerSubject
                                    ?.filter(
                                        (grade: Grade) =>
                                            grade?.student?.id === student.id &&
                                            (grade.type as string) === 'YEAR'
                                    )
                                    .sort((a: Grade, b: Grade) =>
                                        (a.createdAt as Date) >
                                        (b.createdAt as Date)
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
                                                ) =>
                                                    onGradeHover(
                                                        i,
                                                        e.currentTarget
                                                    )
                                                }
                                                onMouseLeave={() =>
                                                    onGradeHover(i, null)
                                                }
                                                key={grade.id}
                                            >{`${getGradeName(
                                                grade.gradeWithWords,
                                                true
                                            )} ${grade.grade}`}</span>
                                            <Popover
                                                style={{
                                                    pointerEvents: 'none',
                                                }}
                                                open={Boolean(anchorEl[i])}
                                                anchorEl={anchorEl[i]}
                                                onClose={() =>
                                                    onGradeHover(i, null)
                                                }
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
                                    ))
                            ) : (
                                <span
                                    aria-haspopup='true'
                                    className={styles.grade}
                                >
                                    Няма
                                </span>
                            )}
                        </div>
                        <div
                            className={`${styles['grade-field']} ${styles['grade-field-grades']}`}
                        >
                            {data?.getAllGradesPerClassPerSubject?.filter(
                                (grade: Grade) =>
                                    grade?.student?.id === student.id &&
                                    (grade?.type as string) !== 'TURM_1' &&
                                    (grade?.type as string) !== 'TURM_2' &&
                                    (grade?.type as string) !== 'YEAR'
                            ).length > 0 ? (
                                data?.getAllGradesPerClassPerSubject
                                    ?.filter(
                                        (grade: Grade) =>
                                            grade?.student?.id === student.id &&
                                            (grade?.type as string) !==
                                                'TURM_1' &&
                                            (grade?.type as string) !==
                                                'TURM_2' &&
                                            (grade?.type as string) !== 'YEAR'
                                    )
                                    .sort((a: Grade, b: Grade) =>
                                        (a.createdAt as Date) >
                                        (b.createdAt as Date)
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
                                                ) =>
                                                    onGradeHover(
                                                        i,
                                                        e.currentTarget
                                                    )
                                                }
                                                onMouseLeave={() =>
                                                    onGradeHover(i, null)
                                                }
                                                key={grade.id}
                                            >{`${getGradeName(
                                                grade.gradeWithWords,
                                                true
                                            )} ${grade.grade}`}</span>
                                            <Popover
                                                style={{
                                                    pointerEvents: 'none',
                                                }}
                                                open={Boolean(anchorEl[i])}
                                                anchorEl={anchorEl[i]}
                                                onClose={() =>
                                                    onGradeHover(i, null)
                                                }
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
                                    ))
                            ) : (
                                <span
                                    aria-haspopup='true'
                                    className={styles.grade}
                                >
                                    Няма
                                </span>
                            )}
                        </div>
                    </div>
                </Fragment>
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

    let tabCounter = 0;

    const { data } = useSWR(gql`
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
    `);

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
        if (user && user.role !== 'ADMIN' && user.role !== 'TEACHER') {
            router.back();
        }
    }, [user, status, data]);

    if (!user) {
        return <Loader />;
    }

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
                    {user.role === 'ADMIN' && (
                        <div className={styles['users-container']}>
                            {data?.getAllStudents?.map(
                                (student: Student, i: number) => (
                                    <UsersComponent
                                        key={i}
                                        id={student?.id}
                                        role={UserRole['STUDENT']}
                                        firstName={student?.user?.firstName}
                                        middleName={student?.user?.middleName}
                                        lastName={student?.user?.lastName}
                                        email={student?.user?.email}
                                        status={student?.user?.status}
                                        recordMessage={student?.recordMessage}
                                        prevEducation={student?.prevEducation}
                                        classLetter={student?.class?.letter}
                                        classNumber={student?.class?.number}
                                        studentDossier={student?.dossier}
                                    />
                                )
                            )}
                        </div>
                    )}

                    {user?.role === 'TEACHER' && (
                        <>
                            <AppBar
                                position='static'
                                color='transparent'
                                elevation={0}
                            >
                                <Tabs
                                    indicatorColor='primary'
                                    value={value}
                                    onChange={(_e, newValue) =>
                                        setValue(newValue)
                                    }
                                >
                                    {data?.getAllClasses?.filter(
                                        (cls: Class) =>
                                            cls?.teacher?.user?.id === user?.id
                                    ).length && (
                                        <Tab disableRipple label='Моят клас' />
                                    )}

                                    {data?.getAllClasses?.map((cls: Class) =>
                                        cls?.subjects?.map(
                                            (subject: Subject) => (
                                                <Tab
                                                    disableRipple
                                                    key={subject.id}
                                                    label={`${cls.number}${cls.letter} ${subject.name}`}
                                                />
                                            )
                                        )
                                    )}
                                </Tabs>
                            </AppBar>
                            <TabPanel value={value} index={0}>
                                {data && (
                                    <div className={styles['users-container']}>
                                        {data.getAllStudents &&
                                            data.getAllStudents
                                                .filter((student: Student) => {
                                                    if (
                                                        data.getAllClasses
                                                            .filter(
                                                                (
                                                                    cls: Class
                                                                ) => {
                                                                    if (
                                                                        cls
                                                                            ?.teacher
                                                                            ?.user
                                                                            ?.id ===
                                                                        user?.id
                                                                    ) {
                                                                        tabCounter = 1;
                                                                        return true;
                                                                    }
                                                                }
                                                            )
                                                            .map(
                                                                (cls: Class) =>
                                                                    cls.id
                                                            )
                                                            .includes(
                                                                student?.class
                                                                    ?.id
                                                            )
                                                    ) {
                                                        return student;
                                                    }
                                                })
                                                .map(
                                                    (
                                                        student: Student,
                                                        i: number
                                                    ) => (
                                                        <UsersComponent
                                                            key={i}
                                                            id={student?.id}
                                                            role={
                                                                UserRole[
                                                                    'STUDENT'
                                                                ]
                                                            }
                                                            firstName={
                                                                student?.user
                                                                    ?.firstName
                                                            }
                                                            middleName={
                                                                student?.user
                                                                    ?.middleName
                                                            }
                                                            lastName={
                                                                student?.user
                                                                    ?.lastName
                                                            }
                                                            email={
                                                                student?.user
                                                                    ?.email
                                                            }
                                                            status={
                                                                student?.user
                                                                    ?.status
                                                            }
                                                            recordMessage={
                                                                student?.recordMessage
                                                            }
                                                            prevEducation={
                                                                student?.prevEducation
                                                            }
                                                            classLetter={
                                                                student?.class
                                                                    ?.letter
                                                            }
                                                            classNumber={
                                                                student?.class
                                                                    ?.number
                                                            }
                                                            studentDossier={
                                                                student?.dossier
                                                            }
                                                        />
                                                    )
                                                )}
                                    </div>
                                )}
                            </TabPanel>
                            {data?.getAllClasses?.map((cls: Class) =>
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
                                                <Tab
                                                    disableRipple
                                                    label='Ученици'
                                                />
                                                <Tab
                                                    disableRipple
                                                    label='Оценки'
                                                />
                                            </Tabs>
                                        </AppBar>
                                        <TabPanel value={innerValue} index={0}>
                                            {' '}
                                            <div
                                                className={
                                                    styles['users-container']
                                                }
                                            >
                                                {data.getAllStudents
                                                    .filter(
                                                        (student: Student) =>
                                                            student?.class
                                                                ?.id === cls.id
                                                    )
                                                    .map((student: Student) => (
                                                        <UsersComponent
                                                            key={student?.id}
                                                            id={student?.id}
                                                            role={
                                                                UserRole[
                                                                    'STUDENT'
                                                                ]
                                                            }
                                                            firstName={
                                                                student?.user
                                                                    ?.firstName
                                                            }
                                                            middleName={
                                                                student?.user
                                                                    ?.middleName
                                                            }
                                                            lastName={
                                                                student?.user
                                                                    ?.lastName
                                                            }
                                                            email={
                                                                student?.user
                                                                    ?.email
                                                            }
                                                            status={
                                                                student?.user
                                                                    ?.status
                                                            }
                                                            recordMessage={
                                                                student?.recordMessage
                                                            }
                                                            prevEducation={
                                                                student?.prevEducation
                                                            }
                                                            classLetter={
                                                                student?.class
                                                                    ?.letter
                                                            }
                                                            classNumber={
                                                                student?.class
                                                                    ?.number
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
                                                students={data.getAllStudents.filter(
                                                    (student: Student) =>
                                                        student?.class?.id ===
                                                        cls.id
                                                )}
                                                subjectId={subject.id}
                                                classId={cls.id}
                                            />
                                        </TabPanel>
                                    </TabPanel>
                                ))
                            )}
                        </>
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
