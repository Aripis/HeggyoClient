import { useEffect, useState, FunctionComponent } from 'react';
import Head from 'next/head';
import Navbar from 'components/Navbar';
import Drawer from 'components/Drawer';
import {
    Container,
    Button,
    Snackbar,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { ExpandMoreOutlined } from '@material-ui/icons';
import { useAuth } from 'utils/useAuth';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
import styles from 'styles/Users.module.scss';
import { gql } from 'graphql-request';
import { Student, StudentDossier, Teacher } from 'utils/interfaces';
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
    studentDossier?: StudentDossier | undefined;
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
                expandIcon={<ExpandMoreOutlined />}
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
                            `/viewstudent?r=${props.userRole}&id=${props.id}`
                        )
                    }
                >
                    Виж още
                </Button>
            </AccordionDetails>
        </Accordion>
    );
};

const Students: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();
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
                    dossierMessage
                }
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

        if (data) {
            console.log(data);
        }
    }, [user, status, data]);

    if (!user) {
        return <Loader />;
    }

    return (
        <>
            <Head>
                <title>Ученици &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Ученици' />
                <div className={styles.content}>
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
                                            studentDossier={student?.dossier}
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

export default Students;
