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
    Checkbox,
    ListItemText,
    InputLabel,
    FormControl,
    Select,
} from '@material-ui/core';
import { DoneOutlined, CloseOutlined } from '@material-ui/icons';
import { useAuth } from 'utils/useAuth';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
import styles from 'styles/Editsubject.module.scss';
import graphQLClient from 'utils/graphqlclient';
import useSWR from 'swr';
import { gql } from 'graphql-request';
import Alert from '@material-ui/lab/Alert';
import { Class, Teacher } from 'utils/interfaces';

const EditSubject: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startYear, setStartYear] = useState(new Date().getFullYear());
    const [endYear, setEndYear] = useState(new Date().getFullYear() + 1);
    const [error, setError] = useState('');
    const [classUUID, setClassUUID] = useState('');
    const [teachersUUIDs, setTeachersUUIDs] = useState<string[]>([]);
    const { data } = useSWR(gql`
        query {
            classes {
                id
                classNumber
                classLetter
            }
            teachers {
                id
                user {
                    firstName
                    lastName
                }
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

    useEffect(() => {
        (async () => {
            try {
                const subjectData = await graphQLClient.request(
                    gql`
                        query($id: String!) {
                            subject(id: $id) {
                                id
                                startYear
                                endYear
                                name
                                description
                                teachers {
                                    id
                                    user {
                                        firstName
                                        lastName
                                    }
                                }
                                class {
                                    id
                                    classNumber
                                    classLetter
                                }
                            }
                        }
                    `,
                    {
                        id: router.query.id,
                    }
                );
                setName(subjectData.subject.name);
                setDescription(subjectData.subject.description);
                setStartYear(subjectData.subject.startYear);
                setEndYear(subjectData.subject.endYear);
                setClassUUID(subjectData.subject.class.id);
                setTeachersUUIDs(
                    subjectData.subject.teachers.map(
                        (teacher: Teacher) => teacher.id
                    )
                );
            } catch (error) {
                setError('Неизвестна грешка');
            }
        })();
    }, []);

    const editSubject = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await graphQLClient.request(
                gql`
                    mutation(
                        $id: String!
                        $startYear: Int!
                        $endYear: Int!
                        $name: String!
                        $description: String!
                        $classUUID: String!
                        $teachersUUIDs: [String!]
                    ) {
                        updateSubject(
                            createSubjectInput: {
                                id: $id
                                startYear: $startYear
                                endYear: $endYear
                                name: $name
                                description: $description
                                classUUID: $classUUID
                                teachersUUIDs: $teachersUUIDs
                            }
                        ) {
                            subjectId
                        }
                    }
                `,
                {
                    id: router.query.id,
                    startYear,
                    endYear,
                    name,
                    description,
                    classUUID,
                    teachersUUIDs,
                }
            );
            router.push('/subjects');
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
                <title>Редактирай предмет &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Редактирай предмет' />
                <div className={styles.content}>
                    <div className={styles['actions-container']}>
                        <Button
                            className={`${styles['confirm']} ${styles['button-link']}`}
                            disableElevation
                            variant='contained'
                            color='primary'
                            form='editSubject'
                            type='submit'
                            endIcon={<DoneOutlined />}
                        >
                            Потвърди
                        </Button>
                        <Link
                            className={styles['button-link']}
                            underline='none'
                            href='/subjects'
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
                        id='editSubject'
                        className={styles['editsubject-container']}
                        onSubmit={editSubject}
                    >
                        <div className={styles['input-container']}>
                            <TextField
                                fullWidth
                                label='Име'
                                required
                                variant='outlined'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <div className={styles['class-container']}>
                                <FormControl
                                    variant='outlined'
                                    className={styles['class-select']}
                                >
                                    <InputLabel id='teachers-select-label'>
                                        Преподаватели
                                    </InputLabel>
                                    <Select
                                        label='Преподаватели'
                                        labelId='teachers-select-label'
                                        multiple
                                        value={teachersUUIDs}
                                        onChange={(e) =>
                                            setTeachersUUIDs(
                                                e.target.value as string[]
                                            )
                                        }
                                        renderValue={(selected) =>
                                            (selected as string[])
                                                .map(
                                                    (selection) =>
                                                        data.teachers.find(
                                                            (
                                                                teacher: Teacher
                                                            ) =>
                                                                teacher.id ===
                                                                selection
                                                        )?.user
                                                )
                                                .map(
                                                    (user) =>
                                                        `${user?.firstName} ${user?.lastName}`
                                                )
                                                .join(', ')
                                        }
                                    >
                                        {data &&
                                            data?.teachers &&
                                            data?.teachers.map(
                                                (
                                                    teacher: Teacher,
                                                    i: number
                                                ) => (
                                                    <MenuItem
                                                        key={i}
                                                        value={teacher.id}
                                                    >
                                                        <Checkbox
                                                            color='primary'
                                                            checked={
                                                                teachersUUIDs.indexOf(
                                                                    teacher.id as string
                                                                ) > -1
                                                            }
                                                        />
                                                        <ListItemText
                                                            primary={`${teacher.user?.firstName} ${teacher.user?.lastName}`}
                                                        />
                                                    </MenuItem>
                                                )
                                            )}
                                    </Select>
                                </FormControl>
                                <TextField
                                    select
                                    className={styles['class-select']}
                                    label='Клас'
                                    required
                                    variant='outlined'
                                    value={classUUID}
                                    onChange={(e) =>
                                        setClassUUID(e.target.value)
                                    }
                                >
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
                            </div>
                            <div className={styles['years-container']}>
                                <TextField
                                    className={styles['years-input']}
                                    label='Стартираща година'
                                    required
                                    variant='outlined'
                                    value={startYear}
                                    inputProps={{
                                        min: new Date().getFullYear(),
                                    }}
                                    onChange={(e) =>
                                        setStartYear(parseInt(e.target.value))
                                    }
                                    type='number'
                                />
                                <TextField
                                    className={styles['years-input']}
                                    label='Завършваща година'
                                    required
                                    variant='outlined'
                                    value={endYear}
                                    inputProps={{
                                        min: new Date().getFullYear() + 1,
                                    }}
                                    onChange={(e) =>
                                        setEndYear(parseInt(e.target.value))
                                    }
                                    type='number'
                                />
                            </div>
                        </div>
                        <div className={styles['input-container']}>
                            <TextField
                                label='Описание на предмета'
                                required
                                variant='outlined'
                                fullWidth
                                value={description}
                                multiline
                                rowsMax={5}
                                onChange={(e) => setDescription(e.target.value)}
                            />
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

export default EditSubject;
