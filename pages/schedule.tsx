import { useEffect, useState, FunctionComponent, FormEvent } from 'react';
import Head from 'next/head';
import Navbar from 'components/Navbar';
import Drawer from 'components/Drawer';
import {
    Container,
    Button,
    Snackbar,
    TextField,
    MenuItem,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { LoopOutlined } from '@material-ui/icons';
import { useAuth } from 'utils/useAuth';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
import styles from 'styles/Schedule.module.scss';
import { gql } from 'graphql-request';
import { Class } from 'utils/interfaces';
import graphQLClient from 'utils/graphqlclient';
import useSWR from 'swr';

const Schedule: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();
    const { data: clsData } = useSWR(gql`
        query {
            classes {
                id
                classNumber
                classLetter
            }
        }
    `);

    const [error, setError] = useState('');

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
        if (user && (user?.userRole as string) !== 'ADMIN') {
            router.back();
        }
    }, [user, status]);

    const addSchedule = (e: FormEvent) => {
        e.preventDefault();
    };

    if (!user) {
        return <Loader />;
    }

    return (
        <>
            <Head>
                <title>Потребители &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Потребители' />
                <div className={styles.content}>
                    <div className={styles['actions-container']}>
                        <Button
                            className={`${styles['confirm']} ${styles['generate-button']}`}
                            disableElevation
                            variant='contained'
                            color='primary'
                            form='generateToken'
                            type='submit'
                            endIcon={<LoopOutlined />}
                        >
                            Генерирай код
                        </Button>
                    </div>
                    <form
                        id='addSchedule'
                        className={styles['generatetoken-container']}
                        onSubmit={addSchedule}
                    ></form>
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
