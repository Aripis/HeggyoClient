import {
    useEffect,
    useState,
    FunctionComponent,
    FormEvent,
    createContext,
    useContext,
} from 'react';
import Head from 'next/head';
import Navbar from 'components/Navbar';
import Drawer from 'components/Drawer';
import Link from 'components/Link';
import {
    Container,
    Button,
    TextField,
    Snackbar,
    MenuItem,
    Checkbox,
    ListItemText,
    InputLabel,
    FormControl,
    Select,
} from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
} from '@material-ui/pickers';
import {
    DoneOutlined,
    CloseOutlined,
    AddOutlined,
    RemoveOutlined,
} from '@material-ui/icons';
import { useAuth } from 'utils/useAuth';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
import styles from 'styles/Addschedule.module.scss';
import graphQLClient from 'utils/graphqlclient';
import useSWR from 'swr';
import { gql } from 'graphql-request';
import Alert from '@material-ui/lab/Alert';
import { Class, Teacher, Subject } from 'utils/interfaces';

interface ScheduleField {
    id: number;
    weekDay: string;
    startTime: Date | null;
    endTime: Date | null;
    subjectUUID: string;
    teachersUUIDs: string[];
}

interface ScheduleFieldProps extends Partial<ScheduleField> {
    id: number;
    subjects: Subject[];
    teachers: Teacher[];
    onDelete?: (id: number) => void;
}

interface ScheduleContext {
    updateSubject: (updateField: ScheduleField) => void;
}

const ScheduleContext = createContext<ScheduleContext>({
    updateSubject: () => ({}),
});

const ScheduleField: FunctionComponent<ScheduleFieldProps> = (props) => {
    const { updateSubject } = useContext(ScheduleContext);
    const [weekDay, setWeekDay] = useState('');
    const [startTime, setStartTime] = useState<Date | null>(new Date());
    const [endTime, setEndTime] = useState<Date | null>(new Date());
    const [subjectUUID, setSubjectUUID] = useState('');
    const [teachersUUIDs, setTeachersUUIDs] = useState<string[]>([]);
    const weekDays = [
        { value: 'MONDAY', content: 'Понеделник' },
        { value: 'TUESDAY', content: 'Вторник' },
        { value: 'WEDNESDAY', content: 'Сряда' },
        { value: 'THURSDAY', content: 'Четвъртък' },
        { value: 'FRIDAY', content: 'Петък' },
        { value: 'SATURDAY', content: 'Събота' },
        { value: 'SUNDAY', content: 'Неделя' },
    ];

    return (
        <div className={styles['input-container']}>
            <Button
                disableElevation
                variant='outlined'
                className={styles['remove-subject']}
                disabled={!props.onDelete}
                onClick={() =>
                    props.onDelete && props.onDelete(props.id as number)
                }
            >
                <RemoveOutlined />
            </Button>
            <TextField
                select
                className={styles['day-select']}
                label='Ден от седмицата'
                required
                value={weekDay}
                onChange={(e) => {
                    setWeekDay(e.target.value);
                    updateSubject({
                        id: props.id,
                        weekDay: e.target.value,
                        startTime: startTime,
                        endTime: endTime,
                        subjectUUID: subjectUUID,
                        teachersUUIDs: teachersUUIDs,
                    });
                }}
                variant='outlined'
            >
                {weekDays &&
                    weekDays.map((weekDay) => (
                        <MenuItem key={weekDay.value} value={weekDay.value}>
                            {weekDay.content}
                        </MenuItem>
                    ))}
            </TextField>
            <div className={styles['time-container']}>
                <KeyboardTimePicker
                    inputVariant='outlined'
                    ampm={false}
                    className={styles.time}
                    autoOk
                    required
                    invalidDateMessage='Невалиден формат'
                    label='Начален час'
                    value={startTime}
                    onChange={(date) => {
                        setStartTime(date);
                        updateSubject({
                            id: props.id,
                            weekDay: weekDay,
                            startTime: date && new Date(date.setSeconds(0, 0)),
                            endTime: endTime,
                            subjectUUID: subjectUUID,
                            teachersUUIDs: teachersUUIDs,
                        });
                    }}
                />
                <KeyboardTimePicker
                    inputVariant='outlined'
                    ampm={false}
                    className={styles.time}
                    autoOk
                    required
                    invalidDateMessage='Невалиден формат'
                    label='Краен час'
                    value={endTime}
                    onChange={(date) => {
                        setEndTime(date);
                        updateSubject({
                            id: props.id,
                            weekDay: weekDay,
                            startTime: startTime,
                            endTime: date && new Date(date.setSeconds(0, 0)),
                            subjectUUID: subjectUUID,
                            teachersUUIDs: teachersUUIDs,
                        });
                    }}
                />
            </div>
            <FormControl
                variant='outlined'
                className={styles['subject-select']}
                required
            >
                <InputLabel id='subject-select-label'>Предмет</InputLabel>
                <Select
                    label='Предмет'
                    labelId='subject-select-label'
                    value={subjectUUID}
                    onChange={(e) => {
                        setSubjectUUID(e.target.value as string);
                        updateSubject({
                            id: props.id,
                            weekDay: weekDay,
                            startTime: startTime,
                            endTime: endTime,
                            subjectUUID: e.target.value as string,
                            teachersUUIDs: teachersUUIDs,
                        });
                    }}
                    renderValue={(selected) => {
                        const selectedSubject:
                            | Subject
                            | undefined = props.subjects.find(
                            (subject: Subject) => subject.id === selected
                        );
                        return `${selectedSubject?.class?.classNumber}${selectedSubject?.class?.classLetter} ${selectedSubject?.name}`;
                    }}
                >
                    {props.subjects &&
                        props.subjects?.map((subject: Subject, i: number) => (
                            <MenuItem key={i} value={subject.id}>
                                {`${subject?.class?.classNumber}${subject?.class?.classLetter} ${subject?.name}`}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>
            <FormControl
                variant='outlined'
                className={styles['teachers-select']}
                required
            >
                <InputLabel id='teachers-select-label'>
                    Преподаватели
                </InputLabel>
                <Select
                    label='Преподаватели'
                    labelId='teachers-select-label'
                    multiple
                    value={teachersUUIDs}
                    onChange={(e) => {
                        setTeachersUUIDs(e.target.value as string[]);
                        updateSubject({
                            id: props.id,
                            weekDay: weekDay,
                            startTime: startTime,
                            endTime: endTime,
                            subjectUUID: subjectUUID,
                            teachersUUIDs: e.target.value as string[],
                        });
                    }}
                    renderValue={(selected) =>
                        (selected as string[])
                            .map(
                                (selection) =>
                                    props.teachers.find(
                                        (teacher: Teacher) =>
                                            teacher.id === selection
                                    )?.user
                            )
                            .map(
                                (user) => `${user?.firstName} ${user?.lastName}`
                            )
                            .join(', ')
                    }
                >
                    {teachersUUIDs &&
                        props.teachers &&
                        props.teachers.map((teacher: Teacher, i: number) => (
                            <MenuItem key={i} value={teacher.id}>
                                <Checkbox
                                    color='primary'
                                    checked={
                                        teachersUUIDs.indexOf(
                                            teacher.id as string
                                        ) > -1
                                    }
                                />
                                <ListItemText
                                    primary={`${teacher.user?.firstName} ${teacher.user?.lastName}`}
                                />
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>
        </div>
    );
};

const AddSchedule: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();

    const [error, setError] = useState('');
    const [classUUID, setClassUUID] = useState('');
    const [fields, setFields] = useState<ScheduleField[]>([
        {
            id: 0,
            startTime: new Date(new Date().setSeconds(0, 0)),
            endTime: new Date(new Date().setSeconds(0, 0)),
            weekDay: '',
            subjectUUID: '',
            teachersUUIDs: [],
        },
    ]);

    const { data } = useSWR(gql`
        query {
            classes {
                id
                classNumber
                classLetter
            }
            teachers {
                id
                user {
                    firstName
                    lastName
                }
            }
            subjects {
                id
                name
                description
                startYear
                endYear
                class {
                    id
                    classNumber
                    classLetter
                }
            }
        }
    `);

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
        if (user && (user?.userRole as string) !== 'ADMIN') {
            router.back();
        }
    }, [user, status]);

    const addSchedule = async (e: FormEvent) => {
        e.preventDefault();
        try {
            for (const field of fields) {
                await graphQLClient.request(
                    gql`
                        mutation(
                            $startTime: Date!
                            $endTime: Date!
                            $day: WeekDays!
                            $subjectUUID: String!
                            $classUUID: String!
                            $teachersUUIDs: [String!]!
                        ) {
                            createSchedule(
                                createScheduleInput: {
                                    startTime: $startTime
                                    endTime: $endTime
                                    day: $day
                                    subjectUUID: $subjectUUID
                                    classUUID: $classUUID
                                    teachersUUIDs: $teachersUUIDs
                                }
                            ) {
                                scheduleId
                            }
                        }
                    `,
                    {
                        startTime: field.startTime,
                        endTime: field.endTime,
                        day: field.weekDay,
                        subjectUUID: field.subjectUUID,
                        classUUID: classUUID,
                        teachersUUIDs: field.teachersUUIDs,
                    }
                );
            }
            router.push('/schedules');
        } catch ({ response }) {
            if (
                response.errors[0].message.includes('This Class already exists')
            ) {
                setError('Има предмет вече на това място');
            }
            setError('Неизвестна грешка');
        }
    };

    const removeSubject = (id: number) => {
        setFields([...fields.filter((field) => field.id !== id)]);
    };

    const addSubject = () => {
        setFields([
            ...fields,
            {
                id: fields.length,
                startTime: new Date(),
                endTime: new Date(),
                weekDay: '',
                subjectUUID: '',
                teachersUUIDs: [],
            },
        ]);
    };

    const updateSubject = (updateField: ScheduleField) => {
        const newFields = fields;
        const index = fields.findIndex((field) => field.id === updateField.id);
        newFields[index] = updateField;
        setFields(newFields);
    };

    if (!user) {
        return <Loader />;
    }

    return (
        <>
            <Head>
                <title>Добави програма &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <ScheduleContext.Provider value={{ updateSubject }}>
                <Container
                    className='main-container'
                    maxWidth={false}
                    disableGutters
                >
                    <Navbar title='Добави програма' />
                    <div className={styles.content}>
                        <div className={styles['actions-container']}>
                            <Button
                                className={`${styles['confirm']} ${styles['button-link']}`}
                                disableElevation
                                variant='contained'
                                color='primary'
                                form='addSchedule'
                                type='submit'
                                endIcon={<DoneOutlined />}
                            >
                                Потвърди
                            </Button>
                            <Link
                                className={styles['button-link']}
                                underline='none'
                                href='/schedules'
                            >
                                <Button
                                    disableElevation
                                    variant='outlined'
                                    color='secondary'
                                    endIcon={<CloseOutlined />}
                                >
                                    Отказ
                                </Button>
                            </Link>
                        </div>
                        <form
                            id='addSchedule'
                            className={styles['addschedule-container']}
                            onSubmit={addSchedule}
                        >
                            <div className={styles['input-container']}>
                                <FormControl
                                    required
                                    variant='outlined'
                                    className={styles['class-select']}
                                >
                                    <InputLabel id='class-select-label'>
                                        Клас
                                    </InputLabel>
                                    <Select
                                        label='Клас'
                                        labelId='class-select-label'
                                        value={classUUID}
                                        onChange={(e) =>
                                            setClassUUID(
                                                e.target.value as string
                                            )
                                        }
                                        renderValue={(selected) => {
                                            const selectedClass: Class = data.classes.find(
                                                (currClass: Class) =>
                                                    currClass.id === selected
                                            );
                                            return `${selectedClass.classNumber} ${selectedClass.classLetter}`;
                                        }}
                                    >
                                        {data &&
                                            data?.classes &&
                                            data?.classes?.map(
                                                (
                                                    currClass: Class,
                                                    i: number
                                                ) => (
                                                    <MenuItem
                                                        key={i}
                                                        value={currClass.id}
                                                    >
                                                        {`${currClass.classNumber} ${currClass.classLetter}`}
                                                    </MenuItem>
                                                )
                                            )}
                                    </Select>
                                </FormControl>
                            </div>
                            {classUUID && data && (
                                <>
                                    <MuiPickersUtilsProvider
                                        utils={DateFnsUtils}
                                    >
                                        {fields &&
                                            fields.map((field) => (
                                                <ScheduleField
                                                    key={field.id}
                                                    id={field.id}
                                                    onDelete={removeSubject}
                                                    teachers={data?.teachers}
                                                    subjects={data?.subjects.filter(
                                                        (subject: Subject) =>
                                                            subject.class
                                                                ?.id ===
                                                            classUUID
                                                    )}
                                                />
                                            ))}
                                    </MuiPickersUtilsProvider>
                                    <div className={styles['input-container']}>
                                        <Button
                                            disableElevation
                                            variant='contained'
                                            color='secondary'
                                            onClick={addSubject}
                                        >
                                            <AddOutlined />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </form>
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
            </ScheduleContext.Provider>
        </>
    );
};

export default AddSchedule;
