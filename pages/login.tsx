import { useState, FormEvent, FunctionComponent } from 'react';
import Head from 'next/head';
import {
    Container,
    TextField,
    Button,
    Snackbar,
    InputAdornment,
    IconButton,
} from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';
import styles from 'styles/Login.module.scss';
import { useRouter } from 'next/router';
import Link from 'components/Link';
import { GetServerSideProps } from 'next';
import { gql } from 'graphql-request';
import { graphQLClient } from 'pages/_app';

const Login: FunctionComponent = () => {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [revealPassword, setRevealPassword] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await graphQLClient.rawRequest(
                gql`
                    query($email: String!, $password: String!) {
                        login(
                            loginData: { email: $email, password: $password }
                        ) {
                            id
                        }
                    }
                `,
                { email, password }
            );
            graphQLClient.setHeader(
                'Authorization',
                res.headers.get('Authorization') || ''
            );
            router.push('/');
        } catch ({ response }) {
            if (response.errors[0].message.includes('User not found')) {
                setError(true);
                setErrorMessage('Невалиден имейл или парола');
            }
        }
    };

    return (
        <>
            <Head>
                <title>Вход &#8226; Heggyo</title>
            </Head>
            <Container
                maxWidth={false}
                className={styles.content}
                disableGutters
            >
                <h1 className={styles.title}>Heggyo</h1>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles['input-container']}>
                        <span className={styles['sub-title']}>
                            Влезте в своя акаунт
                        </span>
                    </div>
                    <div className={styles['input-container']}>
                        <TextField
                            label='Имейл'
                            className={styles.textfield}
                            variant='outlined'
                            type='email'
                            value={email}
                            required
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            label='Парола'
                            className={styles.textfield}
                            variant='outlined'
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment
                                        onClick={() =>
                                            setRevealPassword(!revealPassword)
                                        }
                                        position='end'
                                    >
                                        <IconButton edge='end'>
                                            {revealPassword ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            type={revealPassword ? 'text' : 'password'}
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className={styles['input-container']}>
                        <Button
                            className={styles.submit}
                            type='submit'
                            disableElevation
                            color='primary'
                            variant='contained'
                        >
                            Влез
                        </Button>
                    </div>
                    <div className={styles['input-container']}>
                        <Link className={styles['text']} href='/'>
                            Забравена парола?
                        </Link>
                    </div>
                </form>
                <div className={styles['register']}>
                    <span>Нямате институция? </span>
                    <Link href='/'>Регистрирайте</Link>
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    graphQLClient.setHeader('Cookie', ctx.req.headers.cookie || '');
    const data = await graphQLClient.request(
        gql`
            query {
                checkRefreshToken
            }
        `,
        {}
    );
    if (data.checkRefreshToken) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }
    return {
        props: {}, // will be passed to the page component as props
    };
};

export default Login;
