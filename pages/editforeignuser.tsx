import Drawer from 'components/Drawer';
import Navbar from 'components/Navbar';
import { gql } from 'graphql-request';
import {
    Avatar,
    Breadcrumbs,
    Button,
    Container,
    Typography,
} from '@material-ui/core';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FunctionComponent, useEffect, useState } from 'react';
import useSWR from 'swr';
import { useAuth } from 'utils/useAuth';
// FIXME: fix import files for styles
import styles from 'styles/Profile.module.scss';
import { EditOutlined, PersonOutlineOutlined } from '@material-ui/icons';
import { UserRoles } from 'utils/enums';

const EditForeignUser: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();
    const [uuid, setUUID] = useState('');
    const [role, setRole] = useState('');
    const forStudent = gql`
        query($uuid: String!) {
            student(id: $uuid) {
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
        }
    `;
    const forTeacher = gql`
        query($uuid: String!) {
            teacher(id: $uuid) {
                id
                user {
                    id
                    firstName
                    middleName
                    lastName
                    userRole
                }
                education
                yearsExperience
                contractType
            }
        }
    `;
    const [swrReq, setSwrReq] = useState('');
    const { data } = useSWR([swrReq, JSON.stringify({ uuid })]);

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
        if (
            (user?.userRole as string) === 'STUDENT' ||
            (user?.userRole as string) === 'PARENT'
        ) {
            router.push('/dashboard');
        }
        console.log(data);
    }, [data, status]);

    useEffect(() => {
        setRole(router.query.r as string);
        if (router.query.r === 'teacher') {
            setUUID(router.query.id as string);
            setSwrReq(forTeacher);
        } else {
            setUUID(router.query.id as string);
            setSwrReq(forStudent);
        }
    }, []);

    const getRole = (role: UserRoles | string | undefined) => {
        switch (role) {
            case 'ADMIN':
                return 'Админ';
            case 'PARENT':
                return 'Родител';
            case 'STUDENT':
                return 'Ученик';
            case 'TEACHER':
                return 'Учител';
            case 'VIEWER':
                return 'Посетител';
            default:
                return undefined;
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
                            <div className={styles['info']}>
                                {data && (
                                    <div className={styles['details']}>
                                        <Typography
                                            className={styles['name']}
                                            variant='h4'
                                        >
                                            {role === 'student' &&
                                                `${data.student.user.firstName} ${data.student.user.lastName}`}
                                            {role === 'teacher' &&
                                                `${data.teacher.user.firstName} ${data.teacher.user.lastName}`}
                                        </Typography>
                                        <Breadcrumbs
                                            className={
                                                styles['additional-info']
                                            }
                                        >
                                            <Typography
                                                className={
                                                    styles['additional-text']
                                                }
                                            >
                                                <PersonOutlineOutlined />

                                                {role === 'student' &&
                                                    getRole(
                                                        data.student.user
                                                            .userRole
                                                    )}
                                                {role === 'teacher' &&
                                                    getRole(
                                                        data.teacher.user
                                                            .userRole
                                                    )}
                                            </Typography>
                                            <Typography>
                                                {role == 'teacher' &&
                                                    data.teacher.contractType}
                                            </Typography>
                                        </Breadcrumbs>
                                    </div>
                                )}
                            </div>
                            <div className={styles['actions']}>
                                <Button
                                    color='primary'
                                    variant='contained'
                                    disableElevation
                                    startIcon={<EditOutlined />}
                                >
                                    Редактиране
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </>
    );
};

export default EditForeignUser;
