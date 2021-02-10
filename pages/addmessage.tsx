import {
    Button,
    Checkbox,
    Container,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    Select,
    TextField,
    Snackbar,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Head from 'next/head';
import Navbar from 'components/Navbar';
import ArrowBackIosOutlinedIcon from '@material-ui/icons/ArrowBackIosOutlined';
import { useAuth } from 'utils/useAuth';
import { FormEvent, FunctionComponent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from 'styles/Addmessage.module.scss';
import { AddOutlined } from '@material-ui/icons';
import useSWR from 'swr';
import { User, Class, Subject } from 'utils/interfaces';
import { gql } from 'graphql-request';
import {
    KeyboardDateTimePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import graphQLClient from 'utils/graphqlclient';
import Drawer from 'components/Drawer';
import { DropzoneArea } from 'material-ui-dropzone';
import { AssignmentType, MessageType } from 'utils/enums';
import { getAssignmentType, getMessageType } from 'utils/helpers';

const AddMessage: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();
    const [toUsersUUIDs, setToUsersUUIDs] = useState<string[]>([]);
    const [toClassUUIDs, setToClassUUIDs] = useState<string[]>([]);
    const [messageData, setMessageData] = useState('');
    const [type, setType] = useState('MESSAGE');
    const [error, setError] = useState('');
    const [files, setFiles] = useState<File[]>([]);

    const [subjectUUID, setSubjectUUID] = useState('');
    const [assignmentType, setAssignmentType] = useState('');
    const [assignmentDueDate, setAssignmentDueDate] = useState<Date | null>(
        new Date()
    );

    const { data } = useSWR(gql`
        query {
            classes {
                id
                classLetter
                classNumber
            }

            users {
                id
                firstName
                lastName
            }

            subjects {
                id
                name
            }
        }
    `);

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
    }, [user, status]);

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
            router.push('/dashboard');
        } catch (error) {
            console.log(error);
            setError('Неизвестна грешка');
        }
    };

    return (
        <>
            <Head>
                <title>Добави съобщение &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Добави съобщение' />
                <div className={styles['card-div']}>
                    <div className={styles['buttons-div']}>
                        <Button
                            disableElevation
                            variant='contained'
                            color='secondary'
                            className={styles['back-button']}
                            startIcon={<ArrowBackIosOutlinedIcon />}
                            onClick={() => router.back()}
                        >
                            Назад
                        </Button>
                        <Button
                            disableElevation
                            variant='contained'
                            color='primary'
                            onClick={addMessage}
                            startIcon={<AddOutlined />}
                        >
                            Добави
                        </Button>
                    </div>
                    <div className={styles['input-fields']}>
                        <FormControl
                            variant='outlined'
                            className={styles['users-select']}
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
                                    setToUsersUUIDs(e.target.value as string[])
                                }
                                renderValue={(selected) =>
                                    (selected as string[])
                                        .map(
                                            (selection) =>
                                                data &&
                                                data.users?.find(
                                                    (user: User) =>
                                                        user.id === selection
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
                                    data?.users.map((user: User, i: number) => (
                                        <MenuItem key={i} value={user.id}>
                                            <Checkbox
                                                color='primary'
                                                checked={
                                                    toUsersUUIDs.indexOf(
                                                        user.id as string
                                                    ) > -1
                                                }
                                            />
                                            <ListItemText
                                                primary={`${user.firstName} ${user.lastName}`}
                                            />
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        <FormControl
                            variant='outlined'
                            className={styles['class-select']}
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
                                    setToClassUUIDs(e.target.value as string[])
                                }
                                renderValue={(selected) =>
                                    (selected as string[])
                                        .map(
                                            (selection) =>
                                                data &&
                                                data.classes?.find(
                                                    (cls: Class) =>
                                                        cls.id === selection
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
                                        (cls: Class, i: number) => (
                                            <MenuItem key={i} value={cls.id}>
                                                <Checkbox
                                                    color='primary'
                                                    checked={
                                                        toClassUUIDs.indexOf(
                                                            cls.id as string
                                                        ) > -1
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
                            select
                            className={styles['user-select']}
                            label='Тип'
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value as string);
                            }}
                            variant='outlined'
                        >
                            {Object.values(MessageType).map((type) => (
                                <MenuItem key={type} value={type}>
                                    {getMessageType(type)}
                                </MenuItem>
                            ))}
                        </TextField>
                        {type && type === 'ASSIGNMENT' && (
                            <>
                                <TextField
                                    select
                                    className={styles['class-select']}
                                    label='Вид задание'
                                    value={assignmentType}
                                    onChange={(e) => {
                                        setAssignmentType(
                                            e.target.value as string
                                        );
                                    }}
                                    variant='outlined'
                                >
                                    {Object.values(AssignmentType).map(
                                        (type) => (
                                            <MenuItem key={type} value={type}>
                                                {getAssignmentType(type)}
                                            </MenuItem>
                                        )
                                    )}
                                </TextField>
                                <TextField
                                    select
                                    className={styles['subject-select']}
                                    label='Предмет'
                                    value={subjectUUID}
                                    onChange={(e) => {
                                        setSubjectUUID(
                                            e.target.value as string
                                        );
                                    }}
                                    variant='outlined'
                                >
                                    {data &&
                                        data?.subjects &&
                                        data?.subjects?.map(
                                            (subject: Subject) => (
                                                <MenuItem
                                                    key={subject.id}
                                                    value={subject.id}
                                                >
                                                    {subject.name}
                                                </MenuItem>
                                            )
                                        )}
                                </TextField>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <KeyboardDateTimePicker
                                        inputVariant='outlined'
                                        ampm={false}
                                        className={styles['date-time-select']}
                                        autoOk
                                        invalidDateMessage='Невалиден формат'
                                        label='Краен срок'
                                        value={assignmentDueDate}
                                        onChange={(date) => {
                                            setAssignmentDueDate(date);
                                        }}
                                    />
                                </MuiPickersUtilsProvider>
                            </>
                        )}
                        <TextField
                            className={styles['msg-data-select']}
                            label='Съобщение'
                            value={messageData}
                            onChange={(e) => {
                                setMessageData(e.target.value as string);
                            }}
                            variant='outlined'
                        />
                    </div>
                    <div className={styles['input-fields']}>
                        <DropzoneArea
                            showAlerts={['error']}
                            showFileNames
                            previewGridProps={{
                                item: { xs: false, md: true },
                            }}
                            previewGridClasses={{
                                container: 'upload-grid-container',
                                item: 'item',
                            }}
                            maxFileSize={40000000}
                            filesLimit={10}
                            onChange={(files) => setFiles(files)}
                        />
                    </div>
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

export default AddMessage;
