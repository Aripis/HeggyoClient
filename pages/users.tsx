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
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { LoopOutlined, ExpandMoreOutlined } from '@material-ui/icons';
import { useAuth } from 'utils/useAuth';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
import styles from 'styles/Users.module.scss';
import { gql } from 'graphql-request';
import { Class, Student, StudentDossier, Teacher } from 'utils/interfaces';
import graphQLClient from 'utils/graphqlclient';
import useSWR from 'swr';
import { ContractType, UserStatus, UserRole } from 'utils/enums';
import { getUserRole, getContractType, getUserStatus } from 'utils/helpers';

interface UsersProps {
    id: string | undefined;
    role: UserRole | undefined;
    firstName: string | undefined;
    middleName: string | undefined;
    lastName: string | undefined;
    email: string | undefined;
    status: UserStatus | undefined;
    classNumber?: number | undefined;
    classLetter?: string | undefined;
    prevEducation?: string | undefined;
    recordMessage?: string | undefined;
    education?: string | undefined;
    yearsExperience?: number | undefined;
    contractType?: ContractType | undefined;
    studentDossier?: StudentDossier | undefined;
}

const UsersComponent: FunctionComponent<UsersProps> = (props) => {
    const [expanded, setExpanded] = useState(false);
    const router = useRouter();

    return (
        <Accordion
            elevation={0}
            expanded={expanded}
            onChange={() => setExpanded(!expanded)}
            className={styles['user-accordion']}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreOutlined />}
                className={styles['accordion-summary']}
            >
                <Typography variant='body1' className={styles['names']}>
                    <strong>Име: </strong>
                    {`${props.firstName} ${expanded ? props.middleName : ''} ${
                        props.lastName
                    }`}
                    {!props.firstName &&
                        !props.middleName &&
                        !props.lastName &&
                        '--'}
                </Typography>
                <Typography variant='body1' className={styles['role-text']}>
                    <strong>Роля: </strong>
                    {getUserRole(props.role) || '--'}
                </Typography>
                <Typography variant='body1' className={styles['status']}>
                    <strong>Статус: </strong>
                    {getUserStatus(props.status) || '--'}
                </Typography>
            </AccordionSummary>
            <AccordionDetails className={styles['accordion-details']}>
                <div className={styles['details']}>
                    <Typography
                        variant='body1'
                        className={styles['email-text']}
                    >
                        <strong>Имейл: </strong>
                        {props.email || '--'}
                    </Typography>
                    {props.role === 'STUDENT' && (
                        <>
                            <Typography className={styles['class']}>
                                <strong>Клас: </strong>
                                {`${props.classNumber}${props.classLetter}`}
                                {!props.classLetter &&
                                    !props.classNumber &&
                                    '--'}
                            </Typography>
                            <Typography className={styles['record-message']}>
                                <strong>Коментар: </strong>
                                {props.recordMessage || '--'}
                            </Typography>
                        </>
                    )}
                    {props.role === 'TEACHER' && (
                        <>
                            <Typography className={styles['years-experience']}>
                                <strong>Стаж: </strong>
                                {props.yearsExperience || '--'}
                            </Typography>
                            <Typography className={styles['contract-type']}>
                                <strong>Вид договор: </strong>
                                {getContractType(props.contractType) || '--'}
                            </Typography>
                            <Typography className={styles['education']}>
                                <strong>Квалификация: </strong>
                                {props.education || '--'}
                            </Typography>
                        </>
                    )}
                </div>
                <Button
                    variant='contained'
                    color='primary'
                    disableElevation
                    className={styles['button-view-more']}
                    onClick={() =>
                        router.push(
                            `/editforeignuser?r=${props.role}&id=${props.id}`
                        )
                    }
                >
                    Виж още
                </Button>
            </AccordionDetails>
        </Accordion>
    );
};

const Users: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();

    const [role, setRole] = useState('');
    const [token, setToken] = useState('');
    const [classId, setClassId] = useState('');
    const [error, setError] = useState('');
    const { data } = useSWR(gql`
        query {
            getAllClasses {
                id
                number
                letter
            }

            getAllStudents {
                id
                user {
                    firstName
                    middleName
                    lastName
                    email
                    status
                }
                class {
                    number
                    letter
                }
                prevEducation
                recordMessage
                dossier {
                    id
                    createdAt
                    updatedAt
                    fromUser {
                        id
                        firstName
                        middleName
                        lastName
                    }
                    subject {
                        id
                        name
                    }
                    message
                }
            }

            getAllTeachers {
                id
                user {
                    firstName
                    middleName
                    lastName
                    email
                    status
                }
                education
                yearsExperience
                contractType
            }
        }
    `);

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
        if (user && user?.role !== 'ADMIN') {
            router.back();
        }
    }, [user, status, data]);

    if (!user) {
        return <Loader />;
    }

    const generateToken = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await graphQLClient.request(
                gql`
                    query ($classId: String, $role: UserRole!) {
                        generateUserToken(
                            input: { classId: $classId, role: $role }
                        ) {
                            token
                        }
                    }
                `,
                {
                    classId,
                    role: role,
                }
            );
            setToken(res.generateUserToken.token);
        } catch (error) {
            setError('Неизвестна грешка');
        }
    };

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
                                    setClassId('');
                                    setToken('');
                                }}
                            >
                                {Object.values(UserRole).map((role) => (
                                    <MenuItem key={role} value={role}>
                                        {getUserRole(role)}
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
                                    value={classId}
                                    onChange={(e) => setClassId(e.target.value)}
                                >
                                    <MenuItem value=''>Без</MenuItem>
                                    {data?.getAllClasses?.map(
                                        (currClass: Class) => (
                                            <MenuItem
                                                key={currClass.id}
                                                value={currClass.id}
                                            >
                                                {`${currClass.number}${currClass.letter}`}
                                            </MenuItem>
                                        )
                                    )}
                                </TextField>
                            )}
                            <TextField
                                className={styles['token-input']}
                                inputProps={{ readOnly: true }}
                                style={{ pointerEvents: 'none' }}
                                label='Регистрационен код'
                                variant='outlined'
                                value={token}
                            />
                        </div>
                    </form>
                    {data && (
                        <div className={styles['users-container']}>
                            {data?.getAllStudents?.map((student: Student) => (
                                <UsersComponent
                                    key={student?.id}
                                    id={student?.id}
                                    role={UserRole['STUDENT']}
                                    firstName={student?.user?.firstName}
                                    middleName={student?.user?.middleName}
                                    lastName={student?.user?.lastName}
                                    email={student?.user?.email}
                                    status={student?.user?.status}
                                    recordMessage={student?.recordMessage}
                                    prevEducation={student?.prevEducation}
                                    classLetter={student?.class?.letter}
                                    classNumber={student?.class?.number}
                                    studentDossier={student?.dossier}
                                />
                            ))}
                            {data?.getAllTeachers?.map(
                                (teacher: Teacher, i: number) => (
                                    <UsersComponent
                                        key={i}
                                        id={teacher?.id}
                                        role={UserRole['TEACHER']}
                                        firstName={teacher?.user?.firstName}
                                        middleName={teacher?.user?.middleName}
                                        lastName={teacher?.user?.lastName}
                                        email={teacher?.user?.email}
                                        status={teacher?.user?.status}
                                        education={teacher?.education}
                                        yearsExperience={
                                            teacher?.yearsExperience
                                        }
                                        contractType={teacher?.contractType}
                                    />
                                )
                            )}
                        </div>
                    )}
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
