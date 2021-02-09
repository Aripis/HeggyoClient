import Alert from '@material-ui/lab/Alert';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Breadcrumbs,
    Container,
    Snackbar,
    Typography,
} from '@material-ui/core';
import Drawer from 'components/Drawer';
import Navbar from 'components/Navbar';
import { gql } from 'graphql-request';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FunctionComponent, useEffect, useState } from 'react';
import useSWR from 'swr';
import { useAuth } from 'utils/useAuth';
import styles from 'styles/EditForeignUser.module.scss';
import { ExpandMoreOutlined, PersonOutlineOutlined } from '@material-ui/icons';
import { StudentDossier, Subject, User } from 'utils/interfaces';
import { getUserStatus, getUserRole } from 'utils/helpers';

interface DossierProps {
    id: string | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    fromUser: User | undefined;
    subject?: Subject | undefined;
    dossierMessage?: string | undefined;
}

const StudentsComponent: FunctionComponent<DossierProps> = (props) => {
    const [expanded, setExpanded] = useState(false);

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
                    <strong>от: </strong>
                    {`${props.fromUser?.firstName} ${
                        expanded ? props.fromUser?.middleName : ''
                    } ${props.fromUser?.lastName}`}
                    {!props.fromUser && '--'}
                </Typography>
                <Typography variant='body1' className={styles['role-text']}>
                    <strong>Роля: </strong>
                    {props.fromUser?.userRole || '--'}
                </Typography>
                <Typography variant='body1' className={styles['status']}>
                    <strong> Статус: </strong>
                    {props.fromUser?.status
                        ? getUserStatus(props.fromUser?.status)
                        : '--'}
                </Typography>
            </AccordionSummary>
            <AccordionDetails className={styles['accordion-details']}>
                <div className={styles['details']}>
                    <Typography
                        variant='body1'
                        className={styles['email-text']}
                    >
                        <strong>Коментар: </strong>
                        {props.dossierMessage || '--'}
                    </Typography>
                </div>
            </AccordionDetails>
        </Accordion>
    );
};

const ViewStudent: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();
    const [role, setRole] = useState('');
    const [error, setError] = useState('');

    const [studentUUID, setStudentUUID] = useState('');

    const [swrReq, setSwrReq] = useState(gql`
        query {
            profile {
                id
            }
        }
    `);
    const studentQuery = gql`
        query($studentUUID: String!) {
            student(id: $studentUUID) {
                id
                user {
                    id
                    firstName
                    middleName
                    lastName
                    email
                    status
                    userRole
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
        }
    `;
    const { data } = useSWR([swrReq, JSON.stringify({ studentUUID })]);

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
        if (user && user?.userRole !== 'ADMIN') {
            router.back();
        }
        setRole(router.query.r as string);
        if (role === 'STUDENT') {
            setStudentUUID(router.query.id as string);
        }
        setSwrReq(studentQuery);
    }, [data, status, router]);

    return (
        <>
            <Head>
                <title>Ученик &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Ученик' />
                <div className={styles.content}>
                    <div className={styles['profile-container']}>
                        <Avatar
                            className={styles.avatar}
                            src='https://www.w3schools.com/howto/img_avatar.png'
                            alt='profile'
                        />
                        <div className={styles['profile-info']}>
                            <>
                                <Typography
                                    className={styles['name']}
                                    variant='h4'
                                >
                                    {data &&
                                        data?.student &&
                                        data?.student?.user &&
                                        `${data.student.user.firstName} ${data.student.user.middleName} ${data.student.user.lastName}`}
                                </Typography>
                                <Breadcrumbs
                                    className={styles['additional-info']}
                                >
                                    <Typography
                                        className={styles['additional-text']}
                                    >
                                        <PersonOutlineOutlined />
                                        {data &&
                                            data?.student &&
                                            data?.student?.user &&
                                            getUserRole(
                                                data.student.user.userRole
                                            )}
                                    </Typography>
                                    {data &&
                                        data?.student &&
                                        data?.student?.class &&
                                        data.student.class.classNumber &&
                                        data.student.class.classLetter && (
                                            <Typography>
                                                {data.student.class.classNumber}
                                                {data.student.class.classLetter}
                                            </Typography>
                                        )}
                                </Breadcrumbs>
                                <Typography
                                    className={styles['record-message']}
                                >
                                    {data &&
                                        data?.student &&
                                        data?.student?.recordMessage &&
                                        data.student.recordMessage}
                                </Typography>
                            </>
                        </div>
                    </div>
                    {data && data?.student && (
                        <div>
                            {data?.student?.dossier.map(
                                (dossier: StudentDossier, i: number) => (
                                    <StudentsComponent
                                        key={i}
                                        id={data.student.id}
                                        createdAt={
                                            new Date(dossier?.createdAt as Date)
                                        }
                                        updatedAt={
                                            new Date(dossier?.updatedAt as Date)
                                        }
                                        fromUser={dossier.fromUser}
                                        dossierMessage={dossier.dossierMessage}
                                        subject={dossier.subject}
                                    ></StudentsComponent>
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
export default ViewStudent;
