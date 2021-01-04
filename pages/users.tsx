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
import { LoopOutlined } from '@material-ui/icons';
import ExpandMoreOutlinedIcon from '@material-ui/icons/ExpandMoreOutlined';
import { useAuth } from 'utils/useAuth';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
import styles from 'styles/Users.module.scss';
import { gql } from 'graphql-request';
import { Class, Student, Teacher } from 'utils/interfaces';
import graphQLClient from 'utils/graphqlclient';
import useSWR from 'swr';
import { ContractType, UserStatus, UserRoles } from 'utils/enums';

interface UsersProps {
    id: string | undefined;
    userRole: UserRoles | undefined;
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
}

const UsersComponent: FunctionComponent<UsersProps> = (props) => {
    const [expanded, setExpanded] = useState(false);
    const router = useRouter();

    const getStatus = (role: UserStatus | string | undefined) => {
        switch (role) {
            case 'UNVERIFIED':
                return 'Непотвърден';
            case 'ACTIVE':
                return 'Активен';
            case 'INACTIVE':
                return 'Неактивен';
            case 'BLOCKED':
                return 'Блокиран';
            default:
                return undefined;
        }
    };
    const getContract = (role: ContractType | string | undefined) => {
        switch (role) {
            case 'PART_TIME':
                return 'Хоноруван';
            case 'FULL_TIME':
                return 'На договор';
            default:
                return undefined;
        }
    };

    return (
        <Accordion
            elevation={0}
            expanded={expanded}
            onChange={() => setExpanded(!expanded)}
            className={styles['user-accordion']}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreOutlinedIcon />}
                className={styles['accordion-summary']}
            >
                <Typography variant='body1' className={styles['names']}>
                    <strong>Име: </strong>
                    {props.firstName}
                    {expanded && props.middleName} {props.lastName}
                    {!props.firstName &&
                        !props.middleName &&
                        !props.lastName &&
                        '--'}
                </Typography>
                <Typography variant='body1' className={styles['role-text']}>
                    <strong>Роля: </strong>
                    {props.userRole || '--'}
                </Typography>
                <Typography variant='body1' className={styles['status']}>
                    <strong>Статус: </strong>
                    {props.status ? getStatus(props.status) : '--'}
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
                    {props.userRole === 'student' && (
                        <>
                            <Typography className={styles['class']}>
                                <strong>Клас: </strong>
                                {props.classNumber}
                                {props.classLetter}
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
                    {props.userRole === 'teacher' && (
                        <>
                            <Typography className={styles['years-experience']}>
                                <strong>Стаж: </strong>
                                {props.yearsExperience || '--'}
                            </Typography>
                            <Typography className={styles['contract-type']}>
                                <strong>Вид договор: </strong>
                                {props.contractType
                                    ? getContract(
                                          props.contractType.toUpperCase()
                                      )
                                    : '--'}
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
                            `/editforeignuser?r=${props.userRole}&id=${props.id}`
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
    const [classUUID, setClassUUID] = useState('');
    const [error, setError] = useState('');
    const { data } = useSWR(gql`
        query {
            classes {
                id
                classNumber
                classLetter
            }

            students {
                id
                user {
                    firstName
                    middleName
                    lastName
                    email
                    status
                }
                class {
                    classNumber
                    classLetter
                }
                prevEducation
                recordMessage
            }

            teachers {
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
                            {data?.students &&
                                data?.students?.map(
                                    (student: Student, i: number) => (
                                        <UsersComponent
                                            key={i}
                                            id={student?.id}
                                            userRole={UserRoles['STUDENT']}
                                            firstName={student?.user?.firstName}
                                            middleName={
                                                student?.user?.middleName
                                            }
                                            lastName={student?.user?.lastName}
                                            email={student?.user?.email}
                                            status={student?.user?.status}
                                            recordMessage={
                                                student?.recordMessage
                                            }
                                            prevEducation={
                                                student?.prevEducation
                                            }
                                            classLetter={
                                                student?.class?.classLetter
                                            }
                                            classNumber={
                                                student?.class?.classNumber
                                            }
                                        />
                                    )
                                )}
                            {data?.teachers &&
                                data?.teachers?.map(
                                    (teacher: Teacher, i: number) => (
                                        <UsersComponent
                                            key={i}
                                            id={teacher?.id}
                                            userRole={UserRoles['TEACHER']}
                                            firstName={teacher?.user?.firstName}
                                            middleName={
                                                teacher?.user?.middleName
                                            }
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
