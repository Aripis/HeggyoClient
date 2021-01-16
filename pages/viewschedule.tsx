import { useEffect, useState, FunctionComponent } from 'react';
import Head from 'next/head';
import Navbar from 'components/Navbar';
import Drawer from 'components/Drawer';
import { Container, Snackbar } from '@material-ui/core';
import { useAuth } from 'utils/useAuth';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
import styles from 'styles/Viewschedule.module.scss';
import useSWR from 'swr';
import { gql } from 'graphql-request';
import Alert from '@material-ui/lab/Alert';
import { Schedule } from 'utils/interfaces';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, set, setDay } from 'date-fns';
import { bg } from 'date-fns/locale';

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: {
        bg,
    },
});

const ViewSchedule: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();

    const [error, setError] = useState('');
    const { data } = useSWR([
        gql`
            query($classId: String!) {
                schedulesByClass(classId: $classId) {
                    id
                    startTime
                    endTime
                    day
                    subject {
                        name
                    }
                }
            }
        `,
        JSON.stringify({ classId: router.query.classId }),
    ]);

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
    }, [user, status]);

    if (!user) {
        return <Loader />;
    }

    return (
        <>
            <Head>
                <title>Учебна програма &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Учебна програма' />
                <div className={styles.content}>
                    <div className={styles['calendar-container']}>
                        {data && (
                            <Calendar
                                toolbar={false}
                                defaultView='week'
                                views={['week']}
                                localizer={localizer}
                                events={
                                    data.schedulesByClass &&
                                    data.schedulesByClass?.map(
                                        (event: Schedule) => {
                                            const startTime = new Date(
                                                event.startTime as Date
                                            );
                                            const endTime = new Date(
                                                event.endTime as Date
                                            );
                                            return {
                                                id: event.id,
                                                title: event.subject?.name,
                                                start: setDay(
                                                    set(new Date(), {
                                                        hours: startTime.getHours(),
                                                        minutes: startTime.getMinutes(),
                                                        seconds: startTime.getSeconds(),
                                                        milliseconds: startTime.getMilliseconds(),
                                                    }),
                                                    startTime.getDay()
                                                ),
                                                end: setDay(
                                                    set(new Date(), {
                                                        hours: endTime.getHours(),
                                                        minutes: endTime.getMinutes(),
                                                        seconds: endTime.getSeconds(),
                                                        milliseconds: endTime.getMilliseconds(),
                                                    }),
                                                    endTime.getDay()
                                                ),
                                            };
                                        }
                                    )
                                }
                                culture='bg'
                                startAccessor='start'
                                endAccessor='end'
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

export default ViewSchedule;
