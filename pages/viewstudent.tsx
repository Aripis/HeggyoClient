import { Container, Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Drawer from 'components/Drawer';
import Navbar from 'components/Navbar';
import { gql } from 'graphql-request';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FunctionComponent, useEffect, useState } from 'react';
import useSWR from 'swr';
import { useAuth } from 'utils/useAuth';
import styles from 'styles/EditForeignUser.module.scss';

const ViewStudent: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();
    const [role, setRole] = useState('');
    const [error, setError] = useState('');

    const [studentUUID, setStudentUUID] = useState('');

    const studentQuery = gql`
        query($studentUUID: String!) {
            student(id: $studentUUID) {
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
        }
    `;
    const { data } = useSWR([studentQuery, JSON.stringify(studentUUID)]);

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
        if (user && (user?.userRole as string) !== 'ADMIN') {
            router.back();
        }
        setRole(router.query.r as string);
        setStudentUUID(router.query.id as string);
        // if (router.query.r === 'teacher') {
        //     setSwrReq(forTeacher);
        //     setUserStatus(data?.teacher?.user?.status as string);
        //     setTeacherContract(data?.teacher?.contractType as string);
        //     setUserId(data?.teacher?.user?.id as string);
        // } else if (router.query.r === 'student') {
        //     setSwrReq(forStudent);
        //     setUserStatus(data?.student?.user?.status as string);
        //     setUserId(data?.student?.user?.id as string);
        //     setRecordMessage(data?.student?.recordMessage as string);
        // }
    }, [data, status, router, role]);

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
                <div className={styles.content}></div>
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
