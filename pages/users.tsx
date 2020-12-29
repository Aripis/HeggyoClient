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
import styles from 'styles/Users.module.scss';
import { gql } from 'graphql-request';
import { Class } from 'utils/interfaces';
import graphQLClient from 'utils/graphqlclient';
import useSWR from 'swr';

const Users: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();

    const [role, setRole] = useState('');
    const [token, setToken] = useState('');
    const [classUUID, setClassUUID] = useState('');
    const [error, setError] = useState('');
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

    if (!user) {
        return <Loader />;
    }

    const generateToken = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await graphQLClient.request(
                gql`
                    query($classUUID: String, $userRole: UserRoles!) {
                        generateUserToken(
                            tokenpreferences: {
                                classUUID: $classUUID
                                userRole: $userRole
                            }
                        ) {
                            userRoleToken
                        }
                    }
                `,
                {
                    classUUID,
                    userRole: role,
                }
            );
            setToken(res.generateUserToken.userRoleToken);
        } catch (error) {
            setError('Неизвестна грешка');
        }
    };

    const roles = [
        { value: 'ADMIN', content: 'Администратор' },
        { value: 'STUDENT', content: 'Ученик' },
        { value: 'TEACHER', content: 'Учител' },
        { value: 'PARENT', content: 'Родител' },
    ];

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
                        id='generateToken'
                        className={styles['generatetoken-container']}
                        onSubmit={generateToken}
                    >
                        <div className={styles['input-container']}>
                            <TextField
                                select
                                className={styles['role-select']}
                                label='Роля'
                                required
                                variant='outlined'
                                value={role}
                                onChange={(e) => {
                                    setRole(e.target.value);
                                    setClassUUID('');
                                    setToken('');
                                }}
                            >
                                {roles &&
                                    roles.map((role, i: number) => (
                                        <MenuItem key={i} value={role.value}>
                                            {role.content}
                                        </MenuItem>
                                    ))}
                            </TextField>
                            {(role === 'STUDENT' || role === 'TEACHER') && (
                                <TextField
                                    select
                                    className={styles['class-select']}
                                    label='Клас'
                                    helperText={
                                        role === 'TEACHER' &&
                                        'Класен ръководител на'
                                    }
                                    required={role === 'STUDENT'}
                                    variant='outlined'
                                    value={classUUID}
                                    onChange={(e) =>
                                        setClassUUID(e.target.value)
                                    }
                                >
                                    <MenuItem value=''>Без</MenuItem>
                                    {data &&
                                        data?.classes &&
                                        data?.classes?.map(
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
                            )}
                        </div>
                        <div className={styles['input-container']}>
                            <TextField
                                inputProps={{ readOnly: true }}
                                style={{ pointerEvents: 'none' }}
                                label='Регистрационен код'
                                variant='outlined'
                                value={token}
                            />
                        </div>
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
        </>
    );
};

export default Users;
