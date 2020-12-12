import { useEffect, useState, FunctionComponent, FormEvent } from 'react';
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
} from '@material-ui/core';
import { DoneOutlined, CloseOutlined } from '@material-ui/icons';
import { useAuth } from 'utils/useAuth';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
import styles from 'styles/Addsubject.module.scss';
import graphQLClient from 'utils/graphqlclient';
import useSWR from 'swr';
import { gql } from 'graphql-request';
import Alert from '@material-ui/lab/Alert';
import { Class } from 'utils/interfaces';

const AddSubject: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startYear, setStartYear] = useState(new Date().getFullYear());
    const [endYear, setEndYear] = useState(new Date().getFullYear() + 1);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [classUUID, setClassUUID] = useState('');
    const { data } = useSWR(gql`
        query {
            classes {
                id
                classNumber
                classLetter
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

    const addSubject = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await graphQLClient.request(
                gql`
                    mutation(
                        $startYear: Int!
                        $endYear: Int!
                        $name: String!
                        $description: String!
                        $classUUID: String!
                    ) {
                        createSubject(
                            subjectData: {
                                startYear: $startYear
                                endYear: $endYear
                                name: $name
                                description: $description
                                classUUID: $classUUID
                            }
                        ) {
                            subjectId
                        }
                    }
                `,
                { startYear, endYear, name, description, classUUID }
            );
            router.push('/subjects');
        } catch (error) {
            console.log(error);
        }
    };

    if (!user) {
        return <Loader />;
    }

    return (
        <>
            <Head>
                <title>Heggyo - Училищен асистент</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Добави предмет' />
                <div className={styles.content}>
                    <div className={styles['actions-container']}>
                        <Button
                            className={`${styles['confirm']} ${styles['button-link']}`}
                            disableElevation
                            variant='contained'
                            color='primary'
                            form='addSubject'
                            type='submit'
                            endIcon={<DoneOutlined />}
                        >
                            Потвърди
                        </Button>
                        <Link
                            className={styles['button-link']}
                            underline='none'
                            href='/subjects'
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
                        id='addSubject'
                        className={styles['addsubject-container']}
                        onSubmit={addSubject}
                    >
                        <div className={styles['input-container']}>
                            <TextField
                                fullWidth
                                label='Име'
                                required
                                variant='outlined'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <TextField
                                select
                                className={styles['class-select']}
                                label='Клас'
                                required
                                variant='outlined'
                                value={classUUID}
                                onChange={(e) => setClassUUID(e.target.value)}
                            >
                                {data.classes &&
                                    data.classes.map(
                                        (currClass: Class, i: number) => (
                                            <MenuItem
                                                key={i}
                                                value={currClass.id}
                                            >
                                                {`${currClass.classNumber} ${currClass.classLetter}`}
                                            </MenuItem>
                                        )
                                    )}
                            </TextField>
                            <div className={styles['years-container']}>
                                <TextField
                                    className={styles['years-input']}
                                    label='Стартираща година'
                                    required
                                    variant='outlined'
                                    value={startYear}
                                    inputProps={{
                                        min: new Date().getFullYear(),
                                    }}
                                    onChange={(e) =>
                                        setStartYear(parseInt(e.target.value))
                                    }
                                    type='number'
                                />
                                <TextField
                                    className={styles['years-input']}
                                    label='Завършваща година'
                                    required
                                    variant='outlined'
                                    value={endYear}
                                    inputProps={{
                                        min: new Date().getFullYear() + 1,
                                    }}
                                    onChange={(e) =>
                                        setEndYear(parseInt(e.target.value))
                                    }
                                    type='number'
                                />
                            </div>
                        </div>
                        <div className={styles['input-container']}>
                            <TextField
                                label='Описание на предмета'
                                required
                                variant='outlined'
                                fullWidth
                                value={description}
                                multiline
                                rowsMax={5}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </form>
                </div>
                <Snackbar
                    open={error}
                    autoHideDuration={6000}
                    onClose={() => setError(false)}
                >
                    <Alert
                        elevation={6}
                        variant='filled'
                        onClose={() => setError(false)}
                        severity='error'
                    >
                        {errorMessage}
                    </Alert>
                </Snackbar>
            </Container>
        </>
    );
};

export default AddSubject;
