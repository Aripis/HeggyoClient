import {
    useEffect,
    FunctionComponent,
    useState,
    Fragment,
    FormEvent,
} from 'react';
import Head from 'next/head';
import {
    Avatar,
    Button,
    Container,
    CardContent,
    CardHeader,
    ListSubheader,
    MenuItem,
    TextField,
    Card,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Link,
    Typography,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    Checkbox,
} from '@material-ui/core';
import styles from 'styles/Dashboard.module.scss';
import Navbar from 'components/Navbar';
import Drawer from 'components/Drawer';
import { useAuth } from 'utils/useAuth';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
import useSWR from 'swr';
import { gql } from 'graphql-request';
import { Class, Message, Subject, User } from 'utils/interfaces';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import {
    PeopleOutlined,
    SchoolOutlined,
    LocalLibraryOutlined,
    BusinessOutlined,
    ApartmentOutlined,
    SupervisorAccountOutlined,
    CloseOutlined,
    DoneOutlined,
} from '@material-ui/icons';
import {
    getInstitutionType,
    getEducationStage,
    getMessageType,
    getAssignmentType,
} from 'utils/helpers';
import Alert from '@material-ui/lab/Alert';

import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import graphQLClient from 'utils/graphqlclient';
import { AssignmentType, MessageType } from 'utils/enums';
import {
    KeyboardDateTimePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DropzoneArea } from 'material-ui-dropzone';

const Dashboard: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();
    const [filterByStatus, setFilterByStatus] = useState<string | undefined>(
        undefined
    );
    const [filterByType, setFilterByType] = useState<string | undefined>(
        undefined
    );
    const [messagesByCriteria, setMessagesByCriteria] = useState([]);
    const [toUsersUUIDs, setToUsersUUIDs] = useState<string[]>([]);
    const [toClassUUIDs, setToClassUUIDs] = useState<string[]>([]);
    const [messageData, setMessageData] = useState('');
    const [type, setType] = useState('MESSAGE');
    const [files, setFiles] = useState<File[]>([]);
    const [addDialog, setAddDialog] = useState(false);
    const [subjectUUID, setSubjectUUID] = useState('');
    const [assignmentType, setAssignmentType] = useState('');
    const [assignmentDueDate, setAssignmentDueDate] = useState<Date | null>(
        new Date()
    );

    const [error, setError] = useState('');

    const messageTypes = [
        { value: 'MESSAGE', content: 'Съобщения' },
        { value: 'ASSIGNMENT', content: 'Задания' },
    ];
    const messageStatus = [
        { value: 'CREATED', content: 'Създадени' },
        { value: 'PUBLISHED', content: 'Изпратени' },
    ];

    const { data, mutate } = useSWR([
        gql`
            query($filterByStatus: MessageStatus, $filterByType: MessageType) {
                messagesByCriteria(
                    criteria: {
                        messageStatus: $filterByStatus
                        messageType: $filterByType
                    }
                ) {
                    id
                    data
                    from {
                        firstName
                        lastName
                    }
                    updatedAt
                    type
                    status
                    files {
                        filename
                        publicUrl
                    }
                }

                subjects {
                    id
                    name
                    class {
                        classNumber
                        classLetter
                    }
                }

                classes {
                    id
                    classNumber
                    classLetter
                }

                users {
                    id
                    firstName
                    lastName
                    userRole
                }

                students {
                    id
                }

                teachers {
                    id
                }

                parents {
                    id
                }

                institution {
                    name
                    email
                    type
                    educationalStage
                    alias
                }
            }
        `,
        JSON.stringify({ filterByStatus, filterByType }),
    ]);

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
    }, [user, status]);

    useEffect(() => {
        setMessagesByCriteria(
            data?.messagesByCriteria.sort((a: Message, b: Message) =>
                (a.updatedAt as Date) > (b.updatedAt as Date)
                    ? -1
                    : (a.updatedAt as Date) < (b.updatedAt as Date)
                    ? 1
                    : 0
            )
        );
    }, [data]);

    const addMessage = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await graphQLClient.request(
                gql`
                    mutation(
                        $toUserUUIDs: [String!]
                        $toClassUUIDs: [String!]
                        $data: String
                        $assignmentType: AssignmentType
                        $type: MessageType!
                        $subjectUUID: String
                        $assignmentDueDate: Date
                        $files: [Upload!]
                    ) {
                        createMessage(
                            createMessageInput: {
                                toUserUUIDs: $toUserUUIDs
                                toClassUUIDs: $toClassUUIDs
                                data: $data
                                assignmentType: $assignmentType
                                type: $type
                                subjectUUID: $subjectUUID
                                assignmentDueDate: $assignmentDueDate
                                files: $files
                            }
                        ) {
                            messageId
                        }
                    }
                `,
                {
                    toUserUUIDs: toUsersUUIDs,
                    toClassUUIDs: toClassUUIDs,
                    data: messageData,
                    assignmentType: assignmentType || null,
                    type: type,
                    subjectUUID: subjectUUID,
                    assignmentDueDate: assignmentDueDate,
                    files,
                }
            );
            setAddDialog(false);
        } catch (error) {
            setError('Неизвестна грешка');
        }
    };

    if (!user) {
        return <Loader />;
    }

    return (
        <>
            <Head>
                <title>Табло &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Табло' />
                <div className={styles.content}>
                    {data && (
                        <>
                            <div className={styles['messages-container']}>
                                <div className={styles['filters-container']}>
                                    <TextField
                                        select
                                        label='Тип'
                                        value={filterByType}
                                        variant='outlined'
                                        className={styles['type-select']}
                                        onChange={(e) => {
                                            setFilterByType(
                                                e.target.value as string
                                            );
                                            mutate();
                                        }}
                                    >
                                        <MenuItem value={undefined}>
                                            Без
                                        </MenuItem>
                                        {messageTypes &&
                                            messageTypes.map((type) => (
                                                <MenuItem
                                                    key={type.value}
                                                    value={type.value}
                                                >
                                                    {type.content}
                                                </MenuItem>
                                            ))}
                                    </TextField>
                                    <TextField
                                        select
                                        className={styles['status-select']}
                                        label='Статус'
                                        variant='outlined'
                                        value={filterByStatus}
                                        onChange={(e) => {
                                            setFilterByStatus(
                                                e.target.value as string
                                            );
                                            mutate();
                                        }}
                                    >
                                        <MenuItem value={undefined}>
                                            Без
                                        </MenuItem>
                                        {messageStatus &&
                                            messageStatus.map((status) => (
                                                <MenuItem
                                                    key={status.value}
                                                    value={status.value}
                                                >
                                                    {status.content}
                                                </MenuItem>
                                            ))}
                                    </TextField>
                                    <Button
                                        disableElevation
                                        variant='contained'
                                        color='primary'
                                        className={styles['add-button']}
                                        startIcon={<AddOutlinedIcon />}
                                        onClick={() => setAddDialog(true)}
                                    >
                                        Добави
                                    </Button>
                                </div>
                                <Dialog
                                    fullWidth
                                    maxWidth='lg'
                                    className={styles['dialog']}
                                    open={addDialog}
                                    onClose={() => setAddDialog(false)}
                                >
                                    <DialogTitle
                                        className={styles['dialog-title']}
                                    >
                                        Добави събощение
                                    </DialogTitle>
                                    <DialogContent
                                        className={styles['dialog-content']}
                                    >
                                        <div
                                            className={
                                                styles['input-container']
                                            }
                                        >
                                            <FormControl
                                                fullWidth
                                                variant='outlined'
                                                className={
                                                    styles['users-select']
                                                }
                                            >
                                                <InputLabel id='users-select-label'>
                                                    Потребители
                                                </InputLabel>
                                                <Select
                                                    label='Потребители'
                                                    labelId='users-select-label'
                                                    multiple
                                                    value={toUsersUUIDs}
                                                    onChange={(e) =>
                                                        setToUsersUUIDs(
                                                            e.target
                                                                .value as string[]
                                                        )
                                                    }
                                                    renderValue={(selected) =>
                                                        (selected as string[])
                                                            .map(
                                                                (selection) =>
                                                                    data &&
                                                                    data.users?.find(
                                                                        (
                                                                            user: User
                                                                        ) =>
                                                                            user.id ===
                                                                            selection
                                                                    )
                                                            )
                                                            .map(
                                                                (user) =>
                                                                    `${user.firstName} ${user.lastName}`
                                                            )
                                                            .join(', ')
                                                    }
                                                >
                                                    {data &&
                                                        data?.users &&
                                                        data?.users.map(
                                                            (
                                                                user: User,
                                                                i: number
                                                            ) => (
                                                                <MenuItem
                                                                    key={i}
                                                                    value={
                                                                        user.id
                                                                    }
                                                                >
                                                                    <Checkbox
                                                                        color='primary'
                                                                        checked={
                                                                            toUsersUUIDs.indexOf(
                                                                                user.id as string
                                                                            ) >
                                                                            -1
                                                                        }
                                                                    />
                                                                    <ListItemText
                                                                        primary={`${user.firstName} ${user.lastName}`}
                                                                    />
                                                                </MenuItem>
                                                            )
                                                        )}
                                                </Select>
                                            </FormControl>
                                            <FormControl
                                                fullWidth
                                                variant='outlined'
                                                className={
                                                    styles['class-select']
                                                }
                                            >
                                                <InputLabel id='class-select-label'>
                                                    Класове
                                                </InputLabel>
                                                <Select
                                                    label='Класове'
                                                    labelId='class-select-label'
                                                    multiple
                                                    value={toClassUUIDs}
                                                    onChange={(e) =>
                                                        setToClassUUIDs(
                                                            e.target
                                                                .value as string[]
                                                        )
                                                    }
                                                    renderValue={(selected) =>
                                                        (selected as string[])
                                                            .map(
                                                                (selection) =>
                                                                    data &&
                                                                    data.classes?.find(
                                                                        (
                                                                            cls: Class
                                                                        ) =>
                                                                            cls.id ===
                                                                            selection
                                                                    )
                                                            )
                                                            .map(
                                                                (cls) =>
                                                                    `${cls?.classNumber} ${cls?.classLetter}`
                                                            )
                                                            .join(', ')
                                                    }
                                                >
                                                    {data &&
                                                        data?.classes &&
                                                        data?.classes.map(
                                                            (
                                                                cls: Class,
                                                                i: number
                                                            ) => (
                                                                <MenuItem
                                                                    key={i}
                                                                    value={
                                                                        cls.id
                                                                    }
                                                                >
                                                                    <Checkbox
                                                                        color='primary'
                                                                        checked={
                                                                            toClassUUIDs.indexOf(
                                                                                cls.id as string
                                                                            ) >
                                                                            -1
                                                                        }
                                                                    />
                                                                    <ListItemText
                                                                        primary={`${cls?.classNumber} ${cls?.classLetter}`}
                                                                    />
                                                                </MenuItem>
                                                            )
                                                        )}
                                                </Select>
                                            </FormControl>
                                            <TextField
                                                fullWidth
                                                select
                                                className={
                                                    styles['user-select']
                                                }
                                                label='Тип'
                                                value={type}
                                                onChange={(e) => {
                                                    setType(
                                                        e.target.value as string
                                                    );
                                                }}
                                                variant='outlined'
                                            >
                                                {Object.values(MessageType).map(
                                                    (type) => (
                                                        <MenuItem
                                                            key={type}
                                                            value={type}
                                                        >
                                                            {getMessageType(
                                                                type
                                                            )}
                                                        </MenuItem>
                                                    )
                                                )}
                                            </TextField>
                                            {type && type === 'ASSIGNMENT' && (
                                                <>
                                                    <TextField
                                                        select
                                                        className={
                                                            styles[
                                                                'class-select'
                                                            ]
                                                        }
                                                        fullWidth
                                                        label='Вид задание'
                                                        value={assignmentType}
                                                        onChange={(e) => {
                                                            setAssignmentType(
                                                                e.target
                                                                    .value as string
                                                            );
                                                        }}
                                                        variant='outlined'
                                                    >
                                                        {Object.values(
                                                            AssignmentType
                                                        ).map((type) => (
                                                            <MenuItem
                                                                key={type}
                                                                value={type}
                                                            >
                                                                {getAssignmentType(
                                                                    type
                                                                )}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        className={
                                                            styles[
                                                                'subject-select'
                                                            ]
                                                        }
                                                        label='Предмет'
                                                        value={subjectUUID}
                                                        onChange={(e) => {
                                                            setSubjectUUID(
                                                                e.target
                                                                    .value as string
                                                            );
                                                        }}
                                                        variant='outlined'
                                                    >
                                                        {data &&
                                                            data?.subjects &&
                                                            data?.subjects?.map(
                                                                (
                                                                    subject: Subject
                                                                ) => (
                                                                    <MenuItem
                                                                        key={
                                                                            subject.id
                                                                        }
                                                                        value={
                                                                            subject.id
                                                                        }
                                                                    >
                                                                        {`
                                                                            ${subject.class?.classNumber}${subject.class?.classLetter} ${subject.name}
                                                                            `}
                                                                    </MenuItem>
                                                                )
                                                            )}
                                                    </TextField>
                                                    <MuiPickersUtilsProvider
                                                        utils={DateFnsUtils}
                                                    >
                                                        <KeyboardDateTimePicker
                                                            fullWidth
                                                            inputVariant='outlined'
                                                            ampm={false}
                                                            className={
                                                                styles[
                                                                    'date-time-select'
                                                                ]
                                                            }
                                                            autoOk
                                                            invalidDateMessage='Невалиден формат'
                                                            label='Краен срок'
                                                            value={
                                                                assignmentDueDate
                                                            }
                                                            onChange={(
                                                                date
                                                            ) => {
                                                                setAssignmentDueDate(
                                                                    date
                                                                );
                                                            }}
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </>
                                            )}
                                            <TextField
                                                className={
                                                    styles['msg-data-select']
                                                }
                                                multiline
                                                fullWidth
                                                rows={7}
                                                rowsMax={9}
                                                label='Съобщение'
                                                value={messageData}
                                                onChange={(e) => {
                                                    setMessageData(
                                                        e.target.value as string
                                                    );
                                                }}
                                                variant='outlined'
                                            />
                                        </div>
                                        <div
                                            className={
                                                styles['input-container']
                                            }
                                        >
                                            <DropzoneArea
                                                showAlerts={['error']}
                                                showFileNames
                                                dropzoneClass={`dropzone ${styles['message-dropzone']}`}
                                                previewGridProps={{
                                                    item: {
                                                        xs: false,
                                                        md: true,
                                                    },
                                                }}
                                                previewGridClasses={{
                                                    container:
                                                        'upload-grid-container',
                                                    item: 'upload-grid-item',
                                                }}
                                                maxFileSize={40000000}
                                                filesLimit={10}
                                                onChange={(files) =>
                                                    setFiles(files)
                                                }
                                            />
                                        </div>
                                    </DialogContent>
                                    <DialogActions
                                        className={styles['dialog-actions']}
                                    >
                                        <Button
                                            onClick={() => setAddDialog(false)}
                                            disableElevation
                                            variant='outlined'
                                            color='secondary'
                                            endIcon={<CloseOutlined />}
                                        >
                                            Отказ
                                        </Button>
                                        <Button
                                            onClick={addMessage}
                                            disableElevation
                                            variant='contained'
                                            color='primary'
                                            endIcon={<DoneOutlined />}
                                        >
                                            Потвърди
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                                {messagesByCriteria?.map(
                                    (message: Message, i: number) => {
                                        const date = new Date(
                                            message?.updatedAt as Date
                                        );
                                        return (
                                            <Card
                                                className={styles['card']}
                                                key={i}
                                            >
                                                <CardHeader
                                                    className={
                                                        styles['card-header']
                                                    }
                                                    avatar={
                                                        <Avatar>
                                                            {message?.from?.firstName?.charAt(
                                                                0
                                                            )}
                                                        </Avatar>
                                                    }
                                                    title={`${message?.from?.firstName} ${message?.from?.lastName}`}
                                                    subheader={format(
                                                        date,
                                                        'do MMM yyyy k:m',
                                                        { locale: bg }
                                                    )}
                                                />
                                                <CardContent
                                                    className={
                                                        styles['card-content']
                                                    }
                                                >
                                                    <Typography>
                                                        {`${message?.data}`}
                                                    </Typography>
                                                    <br />
                                                    <Typography>
                                                        {message?.files?.map(
                                                            (
                                                                file,
                                                                i: number
                                                            ) => (
                                                                <Fragment
                                                                    key={i}
                                                                >
                                                                    <Link
                                                                        href={
                                                                            file.publicUrl
                                                                        }
                                                                        target='_blank'
                                                                    >
                                                                        {`${file.filename}`}
                                                                    </Link>
                                                                    <br />
                                                                </Fragment>
                                                            )
                                                        )}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        );
                                    }
                                )}
                            </div>
                            {user.userRole === 'ADMIN' && (
                                <Card
                                    elevation={0}
                                    className={`${styles['card']} ${styles['statistics']}`}
                                >
                                    <CardHeader
                                        title={data?.institution?.name}
                                        subheader={`${data?.institution?.email}`}
                                    />
                                    <CardContent>
                                        {data?.users &&
                                            data?.students &&
                                            data?.teachers &&
                                            data?.parents && (
                                                <List
                                                    className={
                                                        styles[
                                                            'statistics-list'
                                                        ]
                                                    }
                                                    subheader={
                                                        <ListSubheader
                                                            disableGutters
                                                        >
                                                            Статистика
                                                        </ListSubheader>
                                                    }
                                                >
                                                    <ListItem disableGutters>
                                                        <ListItemAvatar>
                                                            <Avatar>
                                                                <BusinessOutlined />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={getEducationStage(
                                                                data
                                                                    ?.institution
                                                                    ?.educationalStage
                                                            )}
                                                            secondary='Тип'
                                                        />
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <ListItemAvatar>
                                                            <Avatar>
                                                                <ApartmentOutlined />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={getInstitutionType(
                                                                data
                                                                    ?.institution
                                                                    ?.type
                                                            )}
                                                            secondary='Вид'
                                                        />
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <ListItemAvatar>
                                                            <Avatar>
                                                                <PeopleOutlined />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={`${data?.users.length}`}
                                                            secondary='Общо потребители'
                                                        />
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <ListItemAvatar>
                                                            <Avatar>
                                                                <SchoolOutlined />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={`${data?.students.length}`}
                                                            secondary='Ученици'
                                                        />
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <ListItemAvatar>
                                                            <Avatar>
                                                                <LocalLibraryOutlined />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={`${data?.teachers.length}`}
                                                            secondary='Учители'
                                                        />
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <ListItemAvatar>
                                                            <Avatar>
                                                                <SupervisorAccountOutlined />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={`${data?.parents.length}`}
                                                            secondary='Родители'
                                                        />
                                                    </ListItem>
                                                </List>
                                            )}
                                    </CardContent>
                                </Card>
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

export default Dashboard;
