import { useEffect, useState, FunctionComponent, FormEvent } from 'react';
import Head from 'next/head';
import Navbar from 'components/Navbar';
import Drawer from 'components/Drawer';
import Link from 'components/Link';
import {
    Container,
    Button,
    TextField,
    Snackbar,
    MenuItem,
    InputLabel,
    FormControl,
    Select,
} from '@material-ui/core';
import { DoneOutlined, CloseOutlined } from '@material-ui/icons';
import { useAuth } from 'utils/useAuth';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
import styles from 'styles/Editclass.module.scss';
import graphQLClient from 'utils/graphqlclient';
import useSWR from 'swr';
import { gql } from 'graphql-request';
import Alert from '@material-ui/lab/Alert';
import { Teacher } from 'utils/interfaces';

const EditClass: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();

    const [classNumber, setClassNumber] = useState(0);
    const [classLetter, setClassLetter] = useState('');
    const [totalStudentCount, setTotalStudentCount] = useState(0);
    const [teacherId, setTeacherId] = useState('');
    const [error, setError] = useState('');
    const { data } = useSWR([
        gql`
            query ($classId: String) {
                getAllAvailableClassTeachers(classId: $classId) {
                    id
                    user {
                        firstName
                        lastName
                    }
                }
            }
        `,
        JSON.stringify({ classId: router.query.id }),
    ]);

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
        if (user && user?.role !== 'ADMIN') {
            router.back();
        }
    }, [user, status]);

    useEffect(() => {
        (async () => {
            try {
                const classData = await graphQLClient.request(
                    gql`
                        query ($id: String!) {
                            getClass(id: $id) {
                                id
                                totalStudentCount
                                teacher {
                                    id
                                    user {
                                        firstName
                                        lastName
                                    }
                                }
                                letter
                                number
                            }
                        }
                    `,
                    {
                        id: router.query.id,
                    }
                );
                setClassNumber(classData.getClass.number);
                setClassLetter(classData.getClass.letter);
                setTotalStudentCount(classData.getClass.totalStudentCount);
                setTeacherId(
                    classData.getClass.teacher
                        ? classData.getClass.teacher.id
                        : ''
                );
            } catch (error) {
                setError('Неизвестна грешка');
            }
        })();
    }, []);

    const editClass = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await graphQLClient.request(
                gql`
                    mutation (
                        $id: String!
                        $totalStudentCount: Int!
                        $teacherId: String!
                        $classLetter: String!
                        $classNumber: Int!
                    ) {
                        updateClass(
                            input: {
                                id: $id
                                totalStudentCount: $totalStudentCount
                                teacherId: $teacherId
                                letter: $classLetter
                                number: $classNumber
                            }
                        ) {
                            classId
                        }
                    }
                `,
                {
                    id: router.query.id,
                    totalStudentCount,
                    teacherId,
                    classLetter,
                    classNumber,
                }
            );
            router.push('/classes');
        } catch (error) {
            setError('Неизвестна грешка');
        }
    };

    if (!user) {
        return <Loader />;
    }

    return (
        <>
            <Head>
                <title>Редактирай клас &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Редактирай клас' />
                <div className={styles.content}>
                    <div className={styles['actions-container']}>
                        <Button
                            className={`${styles['confirm']} ${styles['button-link']}`}
                            disableElevation
                            variant='contained'
                            color='primary'
                            form='editClass'
                            type='submit'
                            endIcon={<DoneOutlined />}
                        >
                            Потвърди
                        </Button>
                        <Link
                            className={styles['button-link']}
                            underline='none'
                            href='/classes'
                        >
                            <Button
                                disableElevation
                                variant='outlined'
                                color='secondary'
                                endIcon={<CloseOutlined />}
                            >
                                Отказ
                            </Button>
                        </Link>
                    </div>
                    <form
                        id='editClass'
                        className={styles['editclass-container']}
                        onSubmit={editClass}
                    >
                        <div className={styles['input-container']}>
                            <TextField
                                className={styles['classnumber-select']}
                                label='Клас'
                                placeholder='1 - 12'
                                type='number'
                                inputProps={{
                                    min: 1,
                                    max: 12,
                                }}
                                required
                                variant='outlined'
                                value={classNumber}
                                onChange={(e) =>
                                    setClassNumber(parseInt(e.target.value))
                                }
                            />
                            <TextField
                                className={styles['classletter-select']}
                                label='Паралелка'
                                placeholder='А, Б, В...'
                                required
                                variant='outlined'
                                value={classLetter}
                                onChange={(e) =>
                                    setClassLetter(e.target.value.toUpperCase())
                                }
                            />
                            <TextField
                                className={styles['studentcount-select']}
                                label='Брой ученици в клас'
                                type='number'
                                inputProps={{
                                    min: 1,
                                }}
                                required
                                variant='outlined'
                                value={totalStudentCount}
                                onChange={(e) =>
                                    setTotalStudentCount(
                                        parseInt(e.target.value)
                                    )
                                }
                            />
                            <FormControl
                                variant='outlined'
                                className={styles['teacher-select']}
                            >
                                <InputLabel id='teacher-select-label'>
                                    Класен ръководител
                                </InputLabel>
                                <Select
                                    label='Класен ръководител'
                                    labelId='teacher-select-label'
                                    value={teacherId}
                                    onChange={(e) =>
                                        setTeacherId(e.target.value as string)
                                    }
                                    renderValue={(selected) => {
                                        const selectedTeacher: Teacher =
                                            data?.getAllAvailableClassTeachers.find(
                                                (teacher: Teacher) =>
                                                    teacher.id === selected
                                            );
                                        return `${selectedTeacher?.user?.firstName} ${selectedTeacher?.user?.lastName}`;
                                    }}
                                >
                                    <MenuItem value=''>Без</MenuItem>
                                    {data &&
                                        data?.getAllAvailableClassTeachers &&
                                        data?.getAllAvailableClassTeachers?.map(
                                            (teacher: Teacher, i: number) => (
                                                <MenuItem
                                                    key={i}
                                                    value={teacher.id}
                                                >
                                                    {`${teacher?.user?.firstName} ${teacher?.user?.lastName}`}
                                                </MenuItem>
                                            )
                                        )}
                                </Select>
                            </FormControl>
                        </div>
                    </form>
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

export default EditClass;
