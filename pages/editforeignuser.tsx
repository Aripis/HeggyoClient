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
import { ContractType, StatusType } from 'utils/enums';
import { getContractType, getStatusType } from 'utils/helpers';

const EditForeignUser: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();
    const [error, setError] = useState('');
    const [userStatus, setUserStatus] = useState('');
    const [userId, setUserId] = useState('');

    const [recordMessage, setRecordMessage] = useState('');
    const [teacherContract, setTeacherContract] = useState('');
    const { r: role, id } = router.query;

    const forStudent = gql`
        query($id: String!) {
            getStudent(id: $id) {
                id
                user {
                    id
                    firstName
                    middleName
                    lastName
                    email
                    status
                    role
                }
                class {
                    number
                    letter
                }
                prevEducation
                recordMessage
            }
        }
    `;
    const forTeacher = gql`
        query($id: String!) {
            getTeacher(id: $id) {
                id
                user {
                    id
                    firstName
                    middleName
                    lastName
                    email
                    status
                    role
                }
                education
                yearsExperience
                contractType
            }
        }
    `;

    const { data } = useSWR([
        role === 'STUDENT' ? forStudent : forTeacher,
        JSON.stringify({ id }),
    ]);

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
        if (user && user?.role !== 'ADMIN') {
            router.back();
        }
        if (role === 'TEACHER') {
            setUserStatus(data?.getTeacher?.user?.status as string);
            setTeacherContract(data?.getTeacher?.contractType as string);
            setUserId(data?.getTeacher?.user?.id as string);
        } else if (role === 'STUDENT') {
            setUserStatus(data?.getStudent?.user?.status as string);
            setUserId(data?.getStudent?.user?.id as string);
            setRecordMessage(data?.getStudent?.recordMessage as string);
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
                            input: { id: $stId, recordMessage: $recordMessage }
                        ) {
                            studentId
                        }

                        updateUserStatus(
                            input: { id: $userId, userStatus: $userStatus }
                        ) {
                            userId
                        }
                    }
                `,
                {
                    stId: id,
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
                        $contractType: ContractType
                    ) {
                        updateTeacher(
                            input: { id: $tchId, contractType: $contractType }
                        ) {
                            teacherId
                        }

                        updateUserStatus(
                            input: { id: $userId, userStatus: $userStatus }
                        ) {
                            userId
                        }
                    }
                `,
                {
                    tchId: id,
                    contractType: teacherContract,
                    userId,
                    userStatus,
                }
            );
            router.push('/users');
        } catch (error) {
            console.log(error);
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
                            src='https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
                            alt='profile'
                        />
                        <div className={styles['profile-info']}>
                            {data && role === 'STUDENT' && data?.getStudent && (
                                <>
                                    <Typography
                                        className={styles['name']}
                                        variant='h4'
                                    >
                                        {`${data.getStudent.user.firstName} ${data.getStudent.user.middleName} ${data.getStudent.user.lastName}`}
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
                                                data.getStudent.user.role
                                            )}
                                        </Typography>
                                        {data.getStudent.class.number &&
                                            data.getStudent.class.letter && (
                                                <Typography>
                                                    {
                                                        data.getStudent.class
                                                            .number
                                                    }
                                                    {
                                                        data.getStudent.class
                                                            .letter
                                                    }
                                                </Typography>
                                            )}
                                    </Breadcrumbs>
                                    <Typography
                                        className={styles['record-message']}
                                    >
                                        {data.getStudent.recordMessage}
                                    </Typography>
                                </>
                            )}
                            {data && role === 'TEACHER' && data?.getTeacher && (
                                <>
                                    <Typography
                                        className={styles['name']}
                                        variant='h4'
                                    >
                                        {data.getTeacher.user.firstName}
                                        {data.getTeacher.user.lastName}
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
                                                data.getTeacher.user.role
                                            )}
                                        </Typography>
                                        <Typography>
                                            {data.getTeacher.contractType}
                                        </Typography>
                                    </Breadcrumbs>
                                </>
                            )}
                        </div>
                    </div>
                    <div className={styles['edit-fields']}>
                        {data && role === 'STUDENT' && data?.getStudent && (
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
                                    {Object.values(ContractType).map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {getContractType(type)}
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
                                {Object.values(StatusType).map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {getStatusType(type)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    </div>
                    {data && role === 'TEACHER' && data?.getTeacher && (
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
                    {data && role === 'STUDENT' && data?.getStudent && (
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
