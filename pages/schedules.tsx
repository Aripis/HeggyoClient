import { useEffect, useState, FunctionComponent } from 'react';
import Head from 'next/head';
import Navbar from 'components/Navbar';
import Drawer from 'components/Drawer';
import { Container, Button, Snackbar } from '@material-ui/core';
import Link from 'components/Link';
import Alert from '@material-ui/lab/Alert';
import { AddOutlined } from '@material-ui/icons';
import { useAuth } from 'utils/useAuth';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
import styles from 'styles/Schedules.module.scss';

const Schedule: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();

    const [error, setError] = useState('');

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

    return (
        <>
            <Head>
                <title>Учебни програми &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Учебни програми' />
                <div className={styles.content}>
                    <div className={styles['actions-container']}>
                        <Link
                            className={styles['schedule-add']}
                            underline='none'
                            href='/addschedule'
                        >
                            <Button
                                disableElevation
                                variant='contained'
                                color='primary'
                                endIcon={<AddOutlined />}
                            >
                                Добави програма
                            </Button>
                        </Link>
                    </div>
                    <div className={styles['schedules-container']}></div>
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

export default Schedule;
