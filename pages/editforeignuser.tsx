import Drawer from 'components/Drawer';
import Navbar from 'components/Navbar';
import { gql } from 'graphql-request';
import {
    Avatar,
    Breadcrumbs,
    Button,
    Container,
    MenuItem,
    TextField,
    Typography,
    Snackbar,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FormEvent, FunctionComponent, useEffect, useState } from 'react';
import useSWR from 'swr';
import { useAuth } from 'utils/useAuth';
import styles from 'styles/EditForeignUser.module.scss';
import { EditOutlined, PersonOutlineOutlined } from '@material-ui/icons';
import { getUserRole } from 'utils/helpers';
import graphQLClient from 'utils/graphqlclient';

const EditForeignUser: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();
    const [uuid, setUUID] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const [userStatus, setUserStatus] = useState('');
    const [userId, setUserId] = useState('');

    const [recordMessage, setRecordMessage] = useState('');
    const [teacherContract, setTeacherContract] = useState('');

    const forStudent = gql`
        query student($uuid: String!) {
            student(id: $uuid) {
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
            }
        }
    `;
    const forTeacher = gql`
        query teacher($uuid: String!) {
            teacher(id: $uuid) {
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
                education
                yearsExperience
                contractType
            }
        }
    `;
    const [swrReq, setSwrReq] = useState(gql`
        query {
            profile {
                id
            }
        }
    `);
    const { data } = useSWR([swrReq, JSON.stringify({ uuid })]);

    const contractTypes = [
        { value: 'PART_TIME', content: 'Хоноруван' },
        { value: 'FULL_TIME', content: 'На договор' },
    ];

    const statusTypes = [
        { value: 'ACTIVE', content: 'Активен' },
        { value: 'INACTIVE', content: 'Неактивен' },
        { value: 'BLOCKED', content: 'Блокиран' },
        { value: 'UNVERIFIED', content: 'Непотвърден' },
    ];

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
        if (user && user?.userRole !== 'ADMIN') {
            router.back();
        }
        setRole(router.query.r as string);
        setUUID(router.query.id as string);
        if (router.query.r === 'TEACHER') {
            setSwrReq(forTeacher);
            setUserStatus(data?.teacher?.user?.status as string);
            setTeacherContract(data?.teacher?.contractType as string);
            setUserId(data?.teacher?.user?.id as string);
        } else if (router.query.r === 'STUDENT') {
            setSwrReq(forStudent);
            setUserStatus(data?.student?.user?.status as string);
            setUserId(data?.student?.user?.id as string);
            setRecordMessage(data?.student?.recordMessage as string);
        }
    }, [data, status, router]);

    const updateStudent = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await graphQLClient.request(
                gql`
                    mutation(
                        $stId: String!
                        $userId: String!
                        $recordMessage: String!
                        $userStatus: UserStatus!
                    ) {
                        updateStudentRecord(
                            updateStudentRecordInput: {
                                uuid: $stId
                                recordMessage: $recordMessage
                            }
                        ) {
                            studentId
                        }

                        updateUserStatus(
                            updateUserStatus: {
                                id: $userId
                                userStatus: $userStatus
                            }
                        ) {
                            userId
                        }
                    }
                `,
                {
                    stId: router.query.id,
                    recordMessage,
                    userId,
                    userStatus,
                }
            );
            router.push('/users');
        } catch (error) {
            setError('Неизвестна грешка');
        }
    };

    const updateTeacher = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await graphQLClient.request(
                gql`
                    mutation(
                        $tchId: String!
                        $userId: String!
                        $userStatus: UserStatus!
                        $contractType: ContractType!
                    ) {
                        updateTeacher(
                            updateTeacherInput: {
                                id: $tchId
                                contractType: $contractType
                            }
                        ) {
                            teacherId
                        }

                        updateUserStatus(
                            updateUserStatus: {
                                id: $userId
                                userStatus: $userStatus
                            }
                        ) {
                            userId
                        }
                    }
                `,
                {
                    tchId: router.query.id,
                    contractType: teacherContract,
                    userId,
                    userStatus,
                }
            );
            router.push('/users');
        } catch (error) {
            setError('Неизвестна грешка');
        }
    };

    return (
        <>
            <Head>
                <title>Потребител &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Потребител' />
                <div className={styles.content}>
                    <div className={styles['profile-container']}>
                        <Avatar
                            className={styles.avatar}
                            src='https://www.w3schools.com/howto/img_avatar.png'
                            alt='profile'
                        />
                        <div className={styles['profile-info']}>
                            {data && role === 'STUDENT' && data?.student && (
                                <>
                                    <Typography
                                        className={styles['name']}
                                        variant='h4'
                                    >
                                        {`${data.student.user.firstName} ${data.student.user.middleName} ${data.student.user.lastName}`}
                                    </Typography>
                                    <Breadcrumbs
                                        className={styles['additional-info']}
                                    >
                                        <Typography
                                            className={
                                                styles['additional-text']
                                            }
                                        >
                                            <PersonOutlineOutlined />
                                            {getUserRole(
                                                data.student.user.userRole
                                            )}
                                        </Typography>
                                        {data.student.class.classNumber &&
                                            data.student.class.classLetter && (
                                                <Typography>
                                                    {
                                                        data.student.class
                                                            .classNumber
                                                    }
                                                    {
                                                        data.student.class
                                                            .classLetter
                                                    }
                                                </Typography>
                                            )}
                                    </Breadcrumbs>
                                    <Typography
                                        className={styles['record-message']}
                                    >
                                        {data.student.recordMessage}
                                    </Typography>
                                </>
                            )}
                            {data && role === 'TEACHER' && data?.teacher && (
                                <>
                                    <Typography
                                        className={styles['name']}
                                        variant='h4'
                                    >
                                        {data.teacher.user.firstName}
                                        {data.teacher.user.lastName}
                                    </Typography>
                                    <Breadcrumbs
                                        className={styles['additional-info']}
                                    >
                                        <Typography
                                            className={
                                                styles['additional-text']
                                            }
                                        >
                                            <PersonOutlineOutlined />
                                            {getUserRole(
                                                data.teacher.user.userRole
                                            )}
                                        </Typography>
                                        <Typography>
                                            {data.teacher.contractType}
                                        </Typography>
                                    </Breadcrumbs>
                                </>
                            )}
                        </div>
                    </div>
                    <div className={styles['edit-fields']}>
                        {data && role === 'STUDENT' && data?.student && (
                            <>
                                <TextField
                                    label='Коментар'
                                    value={recordMessage}
                                    variant='outlined'
                                    className={styles['record-message']}
                                    onChange={(e) => {
                                        setRecordMessage(
                                            e.target.value as string
                                        );
                                    }}
                                />
                                <TextField
                                    label='Файлове'
                                    value=''
                                    variant='outlined'
                                    className={styles['record-files']}
                                    onChange={() => null}
                                />
                            </>
                        )}
                        {role === 'TEACHER' && teacherContract && (
                            <>
                                <TextField
                                    select
                                    label='Договор'
                                    value={teacherContract}
                                    variant='outlined'
                                    className={styles['contract-type']}
                                    onChange={(e) => {
                                        setTeacherContract(
                                            e.target.value as string
                                        );
                                    }}
                                >
                                    {contractTypes &&
                                        contractTypes.map((type) => (
                                            <MenuItem
                                                key={type.value}
                                                value={type.value}
                                            >
                                                {type.content}
                                            </MenuItem>
                                        ))}
                                </TextField>
                            </>
                        )}
                        {userStatus && (
                            <TextField
                                select
                                label='Статус'
                                value={userStatus}
                                variant='outlined'
                                className={styles['user-status']}
                                onChange={(e) => {
                                    setUserStatus(e.target.value as string);
                                }}
                            >
                                {statusTypes &&
                                    statusTypes.map((type) => (
                                        <MenuItem
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.content}
                                        </MenuItem>
                                    ))}
                            </TextField>
                        )}
                    </div>
                    {data && role === 'TEACHER' && data?.teacher && (
                        <div className={styles['actions']}>
                            <Button
                                color='primary'
                                variant='contained'
                                disableElevation
                                startIcon={<EditOutlined />}
                                onClick={updateTeacher}
                            >
                                Редактиране
                            </Button>
                        </div>
                    )}
                    {data && role === 'STUDENT' && data?.student && (
                        <div className={styles['actions']}>
                            <Button
                                color='primary'
                                variant='contained'
                                disableElevation
                                startIcon={<EditOutlined />}
                                onClick={updateStudent}
                            >
                                Редактиране
                            </Button>
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

export default EditForeignUser;
