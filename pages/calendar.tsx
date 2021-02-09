import { useEffect, useState, FunctionComponent } from 'react';
import Head from 'next/head';
import Navbar from 'components/Navbar';
import Drawer from 'components/Drawer';
import {
    Container,
    Snackbar,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    DialogActions,
    Button,
    TextField,
    Typography,
    MenuItem,
} from '@material-ui/core';
import {
    MuiPickersUtilsProvider,
    KeyboardDateTimePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { useAuth } from 'utils/useAuth';
import {
    CloseOutlined,
    DoneOutlined,
    DeleteOutlined,
} from '@material-ui/icons';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
import styles from 'styles/Calendar.module.scss';
import useSWR from 'swr';
import { gql } from 'graphql-request';
import Alert from '@material-ui/lab/Alert';
import { Message } from 'utils/interfaces';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { bg } from 'date-fns/locale';
import graphQLClient from 'utils/graphqlclient';
import { MessageStatus } from 'utils/enums';

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: {
        bg,
    },
});

const CalendarComponent: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();

    const [editDialog, setEditDialog] = useState<Message | null>(null);
    const [error, setError] = useState('');
    const { data, mutate } = useSWR([
        gql`
            query($filterByType: MessageType) {
                messagesByCriteria(criteria: { messageType: $filterByType }) {
                    id
                    createdAt
                    assignmentType
                    assignmentDueDate
                    subject {
                        name
                    }
                }
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
            }
        `,
        JSON.stringify({ filterByType: 'ASSIGNMENT' }),
    ]);

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
    }, [user, status]);

    if (!user) {
        return <Loader />;
    }

    const asgStatus = [
        { value: 'CREATED', content: 'Създадено' },
        { value: 'PUBLISHED', content: 'Изпратено' },
    ];

    const getAssignmentType = (type: string) => {
        switch (type) {
            case 'HOMEWORK':
                return 'Домашно';
            case 'CLASSWORK':
                return 'Работа в клас';
            case 'EXAM':
                return 'Контролно';
            default:
                return undefined;
        }
    };

    const openDialog = async (id: string) => {
        try {
            const data = await graphQLClient.request(
                gql`
                    query($id: String!) {
                        message(id: $id) {
                            id
                            createdAt
                            assignmentType
                            assignmentDueDate
                            data
                            status
                            subject {
                                name
                            }
                        }
                    }
                `,
                { id }
            );
            setEditDialog(data.message);
        } catch (error) {
            setError('Неизвестна грешка');
        }
    };

    const updateAssignment = async () => {
        try {
            await graphQLClient.request(
                gql`
                    mutation(
                        $id: String!
                        $data: String!
                        $assignmentDueDate: Date!
                        $status: MessageStatus!
                    ) {
                        updateMessage(
                            updateMessageInput: {
                                id: $id
                                data: $data
                                assignmentDueDate: $assignmentDueDate
                                status: $status
                            }
                        ) {
                            messageId
                        }
                    }
                `,
                {
                    id: editDialog?.id,
                    data: editDialog?.data,
                    assignmentDueDate: editDialog?.assignmentDueDate,
                    status: editDialog?.status,
                }
            );
            mutate();
            setEditDialog(null);
        } catch (error) {
            setError('Неизвестна грешка');
        }
    };

    const deleteAssignment = async () => {
        try {
            await graphQLClient.request(
                gql`
                    mutation($id: String!) {
                        removeMessage(id: $id) {
                            messageId
                        }
                    }
                `,
                { id: editDialog?.id }
            );
            mutate();
            setEditDialog(null);
        } catch (error) {
            setError('Неизвестна грешка');
        }
    };

    return (
        <>
            <Head>
                <title>Календар &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Календар' />
                <div className={styles.content}>
                    <div className={styles['calendar-container']}>
                        {data && (
                            <Calendar
                                localizer={localizer}
                                events={
                                    data.messagesByCriteria &&
                                    data.messagesByCriteria?.map(
                                        (event: Message) => ({
                                            id: event.id,
                                            title: `${
                                                event.subject?.name
                                            } - ${getAssignmentType(
                                                event.assignmentType as string
                                            )}`,
                                            start: new Date(
                                                event.createdAt as Date
                                            ),
                                            end: new Date(
                                                event.assignmentDueDate as Date
                                            ),
                                        })
                                    )
                                }
                                culture='bg'
                                startAccessor='start'
                                endAccessor='end'
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onSelectEvent={(event: any) =>
                                    openDialog(event.id)
                                }
                            />
                        )}
                    </div>
                </div>
                {editDialog && (
                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={bg}>
                        <Dialog
                            fullWidth
                            maxWidth='lg'
                            className={styles['dialog']}
                            open={Boolean(editDialog)}
                            onClose={() => setEditDialog(null)}
                        >
                            <DialogTitle className={styles['dialog-title']}>
                                {`${
                                    editDialog.subject?.name
                                } - ${getAssignmentType(
                                    editDialog.assignmentType as string
                                )}`}
                                <Typography
                                    color='textSecondary'
                                    variant='body2'
                                >
                                    Създадено:&nbsp;
                                    {format(
                                        new Date(editDialog.createdAt as Date),
                                        'do MMM yyyy',
                                        { locale: bg }
                                    )}
                                </Typography>
                            </DialogTitle>
                            <DialogContent className={styles['dialog-content']}>
                                <DialogContentText>
                                    <TextField
                                        label='Описани на заданието'
                                        variant='outlined'
                                        fullWidth
                                        value={editDialog.data}
                                        multiline
                                        rows={5}
                                        rowsMax={7}
                                        onChange={(e) =>
                                            setEditDialog({
                                                ...editDialog,
                                                data: e.target.value,
                                            })
                                        }
                                    />
                                </DialogContentText>
                                <div className={styles['input-container']}>
                                    <KeyboardDateTimePicker
                                        inputVariant='outlined'
                                        required
                                        variant='inline'
                                        invalidDateMessage='Невалиден формат'
                                        label='Краен срок'
                                        ampm={false}
                                        value={
                                            new Date(
                                                editDialog.assignmentDueDate as Date
                                            )
                                        }
                                        onChange={(date) =>
                                            date &&
                                            setEditDialog({
                                                ...editDialog,
                                                assignmentDueDate: new Date(
                                                    date.setSeconds(0, 0)
                                                ) as Date,
                                            })
                                        }
                                        autoOk
                                        format='do MMM yyyy HH:mm'
                                    />
                                    <TextField
                                        required
                                        select
                                        className={styles['asg-status']}
                                        label='Статус'
                                        variant='outlined'
                                        value={editDialog.status}
                                        onChange={(e) => {
                                            setEditDialog({
                                                ...editDialog,
                                                status: e.target
                                                    .value as MessageStatus,
                                            });
                                        }}
                                    >
                                        {asgStatus &&
                                            asgStatus.map((status) => (
                                                <MenuItem
                                                    key={status.value}
                                                    value={status.value}
                                                >
                                                    {status.content}
                                                </MenuItem>
                                            ))}
                                    </TextField>
                                </div>
                            </DialogContent>
                            <DialogActions className={styles['dialog-actions']}>
                                <div className={styles['actions-container']}>
                                    <Button
                                        className={styles['remove-asg']}
                                        onClick={deleteAssignment}
                                        disableElevation
                                        variant='outlined'
                                        endIcon={<DeleteOutlined />}
                                    >
                                        Изтрий
                                    </Button>
                                </div>
                                <div className={styles['actions-container']}>
                                    <Button
                                        onClick={() => setEditDialog(null)}
                                        disableElevation
                                        variant='outlined'
                                        color='secondary'
                                        endIcon={<CloseOutlined />}
                                    >
                                        Отказ
                                    </Button>
                                    <Button
                                        onClick={updateAssignment}
                                        disableElevation
                                        variant='contained'
                                        color='primary'
                                        endIcon={<DoneOutlined />}
                                    >
                                        Потвърди
                                    </Button>
                                </div>
                            </DialogActions>
                        </Dialog>
                    </MuiPickersUtilsProvider>
                )}
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

export default CalendarComponent;
