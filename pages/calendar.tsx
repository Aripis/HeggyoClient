import { useEffect, useState, FunctionComponent } from 'react';
import Head from 'next/head';
import Navbar from 'components/Navbar';
import Drawer from 'components/Drawer';
import { Container, Snackbar } from '@material-ui/core';
import { useAuth } from 'utils/useAuth';
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

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: {
        bg: bg,
    },
});

const CalendarComponent: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();

    const [error, setError] = useState('');
    const { data } = useSWR([
        gql`
            query($filterByType: MessageType) {
                messagesByCriteria(criteria: { messageType: $filterByType }) {
                    id
                    createdAt
                    assignmentType
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
        if (user && (user?.userRole as string) !== 'ADMIN') {
            router.back();
        }
    }, [user, status]);

    if (!user) {
        return <Loader />;
    }

    const getAssignmentType = (type: string) => {
        console.log(type);
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
                                                event.assignmentType
                                            )}`,
                                            start: new Date(
                                                event.createdAt as number
                                            ),
                                            end: new Date(
                                                event.createdAt as number
                                            ),
                                        })
                                    )
                                }
                                culture='bg'
                                startAccessor='start'
                                endAccessor='end'
                                // onSelectEvent={() => router.push('/dashboard')}
                            />
                        )}
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

export default CalendarComponent;
