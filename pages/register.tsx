import {
    Button,
    Container,
    IconButton,
    InputAdornment,
    Snackbar,
    TextField,
} from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';
import { gql } from 'graphql-request';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FormEvent, FunctionComponent, useState } from 'react';
//TODO: change styles file
import styles from 'styles/RegisterInstitution.module.scss';
import graphQLClient from 'utils/graphqlclient';

const Register: FunctionComponent = () => {
    const router = useRouter();

    const [error, setError] = useState('');
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [registerToken, setRegisterToken] = useState('');
    const [revealPassword, setRevealPassword] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await graphQLClient.request(
                gql`
                    mutation (
                        $firstName: String!
                        $middleName: String!
                        $lastName: String!
                        $email: String!
                        $password: String!
                        $registerToken: String!
                    ) {
                        register(
                            input: {
                                firstName: $firstName
                                middleName: $middleName
                                lastName: $lastName
                                email: $email
                                password: $password
                                registerToken: $registerToken
                            }
                        ) {
                            userId
                        }
                    }
                `,
                {
                    firstName,
                    middleName,
                    lastName,
                    email,
                    password,
                    registerToken,
                }
            );
            router.replace('/login');
        } catch (error) {
            setError('Неизвестна грешка');
        }
    };
    return (
        <>
            <Head>
                <title>Регистрация &#8226; Heggyo</title>
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
                            Създай своя акаунт
                        </span>
                    </div>
                    <div className={styles['input-container']}>
                        <TextField
                            required
                            className={styles.textfield}
                            label='Първо име'
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            variant='outlined'
                        />
                        <TextField
                            required
                            className={styles.textfield}
                            label='Презиме'
                            value={middleName}
                            onChange={(e) => setMiddleName(e.target.value)}
                            variant='outlined'
                        />
                        <TextField
                            required
                            className={styles.textfield}
                            label='Фамилия'
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            variant='outlined'
                        />
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
                            label='Регистрационен код'
                            className={styles.textfield}
                            variant='outlined'
                            value={registerToken}
                            required
                            onChange={(e) => setRegisterToken(e.target.value)}
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
                            Регистрирай се
                        </Button>
                    </div>
                </form>
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
export default Register;
