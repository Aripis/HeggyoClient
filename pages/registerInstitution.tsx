import { FormEvent, FunctionComponent, useState } from 'react';
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
    Typography,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
// TODO: change styling
import styles from 'styles/Login.module.scss';
import { EducationStage, InstitutionType } from 'utils/enums';
import { getEducationStage, getInstitutionType } from 'utils/helpers';

const Register: FunctionComponent = () => {
    const router = useRouter();
    const [error, setError] = useState('');

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [alias, setAlias] = useState('');
    const [type, setType] = useState('');
    const [educationalStage, setEducationalStage] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const steps = [
        'Регистрирай институция',
        'Регистрирай администратор',
        'Завърши регистрацията',
    ];

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
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } catch ({ response }) {
            if (response.errors[0].message.includes('User not found')) {
                setError('Невалиден имейл');
            } else if (
                response.errors[0].message.includes('Invalid password')
            ) {
                setError('Невалиден парола');
            }
        }
    };
    const handleAdminSubmit = async (e: FormEvent) => {
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
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } catch ({ response }) {
            if (response.errors[0].message.includes('User not found')) {
                setError('Невалиден имейл');
            } else if (
                response.errors[0].message.includes('Invalid password')
            ) {
                setError('Невалиден парола');
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
                            <div>
                                <TextField
                                    label='Имейл'
                                    className={styles.textfield}
                                    variant='outlined'
                                    type='email'
                                    value={email}
                                    required
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <TextField
                                    label='Абревиатура'
                                    className={styles.textfield}
                                    variant='outlined'
                                    value={alias}
                                    required
                                    onChange={(e) => setAlias(e.target.value)}
                                />
                            </div>
                            <FormControl>
                                <InputLabel id='institution-type'>
                                    Тип
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
                            <FormControl>
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
                        </div>
                        <div className={styles['input-container']}>
                            <Button
                                color='primary'
                                variant='contained'
                                disableElevation
                                className={styles.submit}
                                type='submit'
                            >
                                Регистрирай институция
                            </Button>
                        </div>
                    </form>
                )}
                {activeStep === 1 && (
                    <div className={styles['input-container']}>
                        <Button
                            color='primary'
                            variant='contained'
                            disableElevation
                            onChange={() =>
                                setActiveStep(
                                    (prevActiveStep) => prevActiveStep + 1
                                )
                            }
                            className={styles.submit}
                        >
                            Регистрирай администратор
                        </Button>
                    </div>
                )}
                {activeStep === 2 && (
                    <div className={styles['input-container']}>
                        <Button
                            color='primary'
                            variant='contained'
                            disableElevation
                            onClick={() => router.replace('/dashboard')}
                            className={styles.submit}
                        >
                            Завърши регистрацията
                        </Button>
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
