import { FormEvent, FunctionComponent, useState, useEffect } from 'react';
import graphQLClient from 'utils/graphqlclient';
import { gql } from 'graphql-request';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
    Button,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    Step,
    Stepper,
    StepLabel,
    TextField,
    InputAdornment,
    IconButton,
} from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';
import styles from 'styles/RegisterInstitution.module.scss';
import { EducationStage, InstitutionType } from 'utils/enums';
import { getEducationStage, getInstitutionType } from 'utils/helpers';
import { useAuth } from 'utils/useAuth';
import Loader from 'components/Loader';

const Register: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();

    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [revealPassword, setRevealPassword] = useState(false);
    const [alias, setAlias] = useState('');
    const [type, setType] = useState('');
    const [educationalStage, setEducationalStage] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const steps = [
        'Регистрирай институция',
        'Регистрирай администратор',
        'Завърши регистрацията',
    ];
    const [error, setError] = useState('');

    useEffect(() => {
        if (status === 'DONE') {
            router.push('/');
        }
        if (typeof window !== 'undefined') {
            setName(sessionStorage.getItem('name') || '');
            setEmail(sessionStorage.getItem('email') || '');
            setAlias(sessionStorage.getItem('alias') || '');
            setType(sessionStorage.getItem('type') as string);
            setEducationalStage(
                sessionStorage.getItem('educationalStage') as string
            );
            setActiveStep(
                parseInt(sessionStorage.getItem('activeStep') as string) || 0
            );
        }
    }, [user, status]);

    const handleInstitutionSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await graphQLClient.request(
                gql`
                    mutation(
                        $name: String!
                        $email: String!
                        $type: InstitutionType!
                        $educationalStage: EducationStage!
                        $alias: String!
                    ) {
                        addInstitution(
                            createInstitutionInput: {
                                name: $name
                                email: $email
                                type: $type
                                educationalStage: $educationalStage
                                alias: $alias
                            }
                        ) {
                            institutionId
                        }
                    }
                `,
                { name, email, type, educationalStage, alias }
            );
            sessionStorage.setItem('name', name);
            sessionStorage.setItem('email', email);
            sessionStorage.setItem('type', type);
            sessionStorage.setItem('educationalStage', educationalStage);
            sessionStorage.setItem('alias', alias);
            sessionStorage.setItem('activeStep', (activeStep + 1).toString());
            setActiveStep(activeStep + 1);
        } catch (error) {
            setError('Неизвестна грешка');
        }
    };
    const handleAdminSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await graphQLClient.request(
                gql`
                    mutation(
                        $firstName: String!
                        $middleName: String!
                        $lastName: String!
                        $email: String!
                        $password: String!
                        $registerToken: String!
                    ) {
                        register(
                            createUserInput: {
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
                    email: userEmail,
                    password,
                    registerToken: `${
                        alias || sessionStorage.getItem('alias')
                    }#a@`,
                }
            );
            sessionStorage.setItem('activeStep', (activeStep + 1).toString());
            setActiveStep(activeStep + 1);
        } catch (error) {
            console.log(error);
            setError('Неизвестна грешка');
        }
    };

    if (user) {
        return <Loader />;
    }

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
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                {activeStep === 0 && (
                    <form
                        className={styles.form}
                        onSubmit={handleInstitutionSubmit}
                    >
                        <div className={styles['input-container']}>
                            <span className={styles['sub-title']}>
                                Присъедени се към нас
                            </span>
                        </div>
                        <div className={styles['input-container']}>
                            <TextField
                                label='Име'
                                className={styles.textfield}
                                variant='outlined'
                                value={name}
                                required
                                onChange={(e) => setName(e.target.value)}
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
                                label='Абревиатура'
                                className={styles.textfield}
                                variant='outlined'
                                value={alias}
                                required
                                onChange={(e) => setAlias(e.target.value)}
                            />
                            <FormControl
                                variant='outlined'
                                required
                                className={styles.textfield}
                            >
                                <InputLabel id='institution-educational-stage'>
                                    Тип
                                </InputLabel>
                                <Select
                                    label='Вид'
                                    variant='outlined'
                                    labelId='institution-educational-stage'
                                    value={educationalStage}
                                    onChange={(e) => {
                                        setEducationalStage(
                                            e.target.value as string
                                        );
                                    }}
                                    renderValue={(selected) =>
                                        getEducationStage(selected as string)
                                    }
                                >
                                    {Object.values(EducationStage).map(
                                        (stage) => (
                                            <MenuItem key={stage} value={stage}>
                                                {`${getEducationStage(stage)}`}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                            <FormControl
                                variant='outlined'
                                required
                                className={styles.textfield}
                            >
                                <InputLabel id='institution-type'>
                                    Вид
                                </InputLabel>
                                <Select
                                    label='Тип'
                                    variant='outlined'
                                    labelId='institution-type'
                                    value={type}
                                    onChange={(e) => {
                                        setType(e.target.value as string);
                                    }}
                                    renderValue={(selected) =>
                                        getInstitutionType(selected as string)
                                    }
                                >
                                    {Object.values(InstitutionType).map(
                                        (type) => (
                                            <MenuItem key={type} value={type}>
                                                {`${getInstitutionType(type)}`}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        </div>
                        <div className={styles['input-container']}>
                            <Button
                                color='primary'
                                variant='contained'
                                disableElevation
                                className={styles.submit}
                                type='submit'
                            >
                                Създай институция
                            </Button>
                        </div>
                    </form>
                )}
                {activeStep === 1 && (
                    <form className={styles.form} onSubmit={handleAdminSubmit}>
                        <div className={styles['input-container']}>
                            <span className={styles['sub-title']}>
                                Създай своя администраторски акаунт
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
                                value={userEmail}
                                required
                                onChange={(e) => setUserEmail(e.target.value)}
                            />
                            <TextField
                                label='Парола'
                                className={styles.textfield}
                                variant='outlined'
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment
                                            onClick={() =>
                                                setRevealPassword(
                                                    !revealPassword
                                                )
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
                                Регистрирай администратор
                            </Button>
                        </div>
                    </form>
                )}
                {activeStep === 2 && (
                    <div className={styles.form}>
                        <div className={styles['input-container']}>
                            <span className={styles['sub-title']}>
                                Превю на институцията
                            </span>
                        </div>
                        <div className={styles['input-container']}>
                            <TextField
                                className={styles.textfield}
                                label='Име'
                                value={name}
                                variant='outlined'
                            />
                            <TextField
                                className={styles.textfield}
                                label='Имейл'
                                value={email}
                                variant='outlined'
                            />
                            <TextField
                                label='Абревиатура'
                                className={styles.textfield}
                                value={alias}
                                variant='outlined'
                            />
                            <TextField
                                className={styles.textfield}
                                label='Тип'
                                value={getInstitutionType(type)}
                                variant='outlined'
                            />
                            <TextField
                                className={styles.textfield}
                                label='Вид'
                                value={getEducationStage(educationalStage)}
                                variant='outlined'
                            />
                        </div>
                        <div className={styles['input-container']}>
                            <Button
                                className={styles.submit}
                                disableElevation
                                color='primary'
                                variant='contained'
                                onClick={() => {
                                    sessionStorage.clear();
                                    router.replace('/login');
                                }}
                            >
                                Завърши регистрацията
                            </Button>
                        </div>
                    </div>
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

export default Register;
