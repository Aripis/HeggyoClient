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
import styles from 'styles/Addsubject.module.scss';
import graphQLClient from 'utils/graphqlclient';
import useSWR from 'swr';
import { gql } from 'graphql-request';
import Alert from '@material-ui/lab/Alert';
import { Class, Teacher } from 'utils/interfaces';

const AddSubject: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startYear, setStartYear] = useState(new Date().getFullYear());
    const [endYear, setEndYear] = useState(new Date().getFullYear() + 1);
    const [error, setError] = useState('');
    const [classId, setClassId] = useState('');
    const [teachersIds, setTeachersIds] = useState<string[]>([]);
    const { data } = useSWR(gql`
        query {
            getAllClasses {
                id
                number
                letter
            }
            getAllTeachers {
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
        if (user && user?.role !== 'ADMIN') {
            router.back();
        }
    }, [user, status]);

    const addSubject = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await graphQLClient.request(
                gql`
                    mutation(
                        $startYear: Int!
                        $endYear: Int!
                        $name: String!
                        $description: String!
                        $classId: String!
                        $teachersIds: [String!]
                    ) {
                        addSubject(
                            input: {
                                startYear: $startYear
                                endYear: $endYear
                                name: $name
                                description: $description
                                classId: $classId
                                teachersIds: $teachersIds
                            }
                        ) {
                            subjectId
                        }
                    }
                `,
                {
                    startYear,
                    endYear,
                    name,
                    description,
                    classId,
                    teachersIds,
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
                <title>Добави предмет &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Добави предмет' />
                <div className={styles.content}>
                    <div className={styles['actions-container']}>
                        <Button
                            className={`${styles['confirm']} ${styles['button-link']}`}
                            disableElevation
                            variant='contained'
                            color='primary'
                            form='addSubject'
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
                        id='addSubject'
                        className={styles['addsubject-container']}
                        onSubmit={addSubject}
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
                                        value={teachersIds}
                                        onChange={(e) =>
                                            setTeachersIds(
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
                                                        `${user.firstName} ${user.lastName}`
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
                                                                teachersIds.indexOf(
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
                                    value={classId}
                                    onChange={(e) => setClassId(e.target.value)}
                                >
                                    {data &&
                                        data?.getAllClasses &&
                                        data?.getAllClasses?.map(
                                            (currClass: Class, i: number) => (
                                                <MenuItem
                                                    key={i}
                                                    value={currClass.id}
                                                >
                                                    {`${currClass.number} ${currClass.letter}`}
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

export default AddSubject;
