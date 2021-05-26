import {
    AppBar,
    Container,
    Popover,
    Tab,
    Tabs,
    Typography,
} from '@material-ui/core';
import Drawer from 'components/Drawer';
import Navbar from 'components/Navbar';
import { gql } from 'graphql-request';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
    Fragment,
    FunctionComponent,
    MouseEvent,
    ReactNode,
    useEffect,
    useState,
} from 'react';
import styles from 'styles/Grades.module.scss';
import useSWR from 'swr';
import { useAuth } from 'utils/useAuth';
import { Student, Grade } from 'utils/interfaces';
import { groupBy, property } from 'lodash';
import { getGradeName } from 'utils/helpers';
interface TabPanelProps {
    children?: ReactNode;
    index: number;
    value: number;
}

const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
        <div hidden={value !== index} {...other}>
            {value === index && (
                <div>
                    <Typography>{children}</Typography>
                </div>
            )}
        </div>
    );
};

const Grades: FunctionComponent = () => {
    const router = useRouter();
    const [value, setValue] = useState(0);
    const { user, status } = useAuth();
    const [anchorEl, setAnchorEl] = useState<(HTMLButtonElement | null)[]>([]);

    let tabCounter = 0;

    const { data } = useSWR(
        gql`
            query {
                getParentFromCurrUser {
                    id
                    students {
                        id
                        user {
                            firstName
                            lastName
                        }
                    }
                }

                getAllGrades {
                    id
                    createdAt
                    message
                    grade
                    gradeWithWords
                    type
                    student {
                        id
                    }
                    subject {
                        id
                        name
                    }
                }
            }
        `
    );

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
    }, [user, status, data]);

    const onGradeHover = (index: number, value: HTMLButtonElement | null) => {
        const temp = anchorEl;
        temp[index] = value;
        setAnchorEl([...temp]);
    };

    const groupBySubject = (grades: Grade[]) => {
        return groupBy(grades, property(['subject', 'name']));
    };

    return (
        <>
            <Head>
                <title>Профил &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Оценки' />
                <div className={styles.content}>
                    <AppBar position='static' color='transparent' elevation={0}>
                        <Tabs
                            indicatorColor='primary'
                            value={value}
                            onChange={(_e, newValue) => setValue(newValue)}
                        >
                            {data?.getParentFromCurrUser?.students.map(
                                (s: Student, i: number) => (
                                    <Tab
                                        key={i}
                                        disableRipple
                                        label={`${s?.user?.firstName} ${s?.user?.lastName}`}
                                    />
                                )
                            )}
                        </Tabs>
                    </AppBar>

                    {data?.getParentFromCurrUser?.students?.map(
                        (s: Student) => (
                            <TabPanel
                                key={s.id}
                                value={value}
                                index={tabCounter++}
                            >
                                <div className={styles['grades-container']}>
                                    <div className={styles['grade-row']}>
                                        <div
                                            className={`${styles['grade-field']} ${styles['grade-field-name']}`}
                                        >
                                            <span>
                                                <strong>Име</strong>
                                            </span>
                                        </div>

                                        <div
                                            className={`${styles['grade-field']} ${styles['grade-field-turm-1']}`}
                                        >
                                            <span>
                                                <strong>1 срок</strong>
                                            </span>
                                        </div>

                                        <div
                                            className={`${styles['grade-field']} ${styles['grade-field-turm-2']}`}
                                        >
                                            <span>
                                                <strong>2 срок</strong>
                                            </span>
                                        </div>

                                        <div
                                            className={`${styles['grade-field']} ${styles['grade-field-year']}`}
                                        >
                                            <span>
                                                <strong>Годишна</strong>
                                            </span>
                                        </div>

                                        <div
                                            className={`${styles['grade-field']} ${styles['grade-field-grades']}`}
                                        >
                                            <span>
                                                <strong>Оценки</strong>
                                            </span>
                                        </div>
                                    </div>
                                    {Object.entries(
                                        groupBySubject(
                                            data?.getAllGrades?.filter(
                                                (grade: Grade) =>
                                                    grade?.student?.id === s.id
                                            )
                                        )
                                    ).map(([key, value], i: number) => (
                                        <Fragment key={i}>
                                            <div
                                                className={styles['grade-row']}
                                            >
                                                <div
                                                    className={`${styles['grade-field']} ${styles['grade-field-name']}`}
                                                >
                                                    <span>{key}</span>
                                                </div>
                                                <div
                                                    className={`${styles['grade-field']} ${styles['grade-field-turm-1']}`}
                                                >
                                                    {(value as Grade[])?.filter(
                                                        (grade: Grade) =>
                                                            grade?.student
                                                                ?.id === s.id &&
                                                            (grade.type as string) ===
                                                                'TURM_1'
                                                    ).length > 0 ? (
                                                        (value as Grade[])
                                                            ?.filter(
                                                                (
                                                                    grade: Grade
                                                                ) =>
                                                                    grade
                                                                        ?.student
                                                                        ?.id ===
                                                                        s.id &&
                                                                    (grade.type as string) ===
                                                                        'TURM_1'
                                                            )
                                                            .sort(
                                                                (
                                                                    a: Grade,
                                                                    b: Grade
                                                                ) =>
                                                                    (a.createdAt as Date) >
                                                                    (b.createdAt as Date)
                                                                        ? 1
                                                                        : (a.createdAt as Date) <
                                                                          (b.createdAt as Date)
                                                                        ? -1
                                                                        : 0
                                                            )
                                                            .map(
                                                                (
                                                                    grade: Grade,
                                                                    i: number
                                                                ) => (
                                                                    <Fragment
                                                                        key={
                                                                            grade.id
                                                                        }
                                                                    >
                                                                        <span
                                                                            aria-haspopup='true'
                                                                            className={
                                                                                styles.grade
                                                                            }
                                                                            onMouseEnter={(
                                                                                e: MouseEvent<HTMLButtonElement>
                                                                            ) =>
                                                                                onGradeHover(
                                                                                    i,
                                                                                    e.currentTarget
                                                                                )
                                                                            }
                                                                            onMouseLeave={() =>
                                                                                onGradeHover(
                                                                                    i,
                                                                                    null
                                                                                )
                                                                            }
                                                                            key={
                                                                                grade.id
                                                                            }
                                                                        >{`${getGradeName(
                                                                            grade.gradeWithWords,
                                                                            true
                                                                        )} ${
                                                                            grade.grade
                                                                        }`}</span>
                                                                        <Popover
                                                                            style={{
                                                                                pointerEvents:
                                                                                    'none',
                                                                            }}
                                                                            open={Boolean(
                                                                                anchorEl[
                                                                                    i
                                                                                ]
                                                                            )}
                                                                            anchorEl={
                                                                                anchorEl[
                                                                                    i
                                                                                ]
                                                                            }
                                                                            onClose={() =>
                                                                                onGradeHover(
                                                                                    i,
                                                                                    null
                                                                                )
                                                                            }
                                                                            anchorOrigin={{
                                                                                vertical:
                                                                                    'bottom',
                                                                                horizontal:
                                                                                    'center',
                                                                            }}
                                                                            transformOrigin={{
                                                                                vertical:
                                                                                    'top',
                                                                                horizontal:
                                                                                    'center',
                                                                            }}
                                                                        >
                                                                            <Typography className='grade-message'>
                                                                                {grade.message ||
                                                                                    'Оценка'}
                                                                            </Typography>
                                                                        </Popover>
                                                                    </Fragment>
                                                                )
                                                            )
                                                    ) : (
                                                        <span
                                                            aria-haspopup='true'
                                                            className={
                                                                styles.grade
                                                            }
                                                        >
                                                            Няма
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    className={`${styles['grade-field']} ${styles['grade-field-turm-2']}`}
                                                >
                                                    {(value as Grade[])?.filter(
                                                        (grade: Grade) =>
                                                            grade?.student
                                                                ?.id === s.id &&
                                                            (grade.type as string) ===
                                                                'TURM_2'
                                                    ).length > 0 ? (
                                                        (value as Grade[])
                                                            ?.filter(
                                                                (
                                                                    grade: Grade
                                                                ) =>
                                                                    grade
                                                                        ?.student
                                                                        ?.id ===
                                                                        s.id &&
                                                                    (grade.type as string) ===
                                                                        'TURM_2'
                                                            )
                                                            .sort(
                                                                (
                                                                    a: Grade,
                                                                    b: Grade
                                                                ) =>
                                                                    (a.createdAt as Date) >
                                                                    (b.createdAt as Date)
                                                                        ? 1
                                                                        : (a.createdAt as Date) <
                                                                          (b.createdAt as Date)
                                                                        ? -1
                                                                        : 0
                                                            )
                                                            .map(
                                                                (
                                                                    grade: Grade,
                                                                    i: number
                                                                ) => (
                                                                    <Fragment
                                                                        key={
                                                                            grade.id
                                                                        }
                                                                    >
                                                                        <span
                                                                            aria-haspopup='true'
                                                                            className={
                                                                                styles.grade
                                                                            }
                                                                            onMouseEnter={(
                                                                                e: MouseEvent<HTMLButtonElement>
                                                                            ) =>
                                                                                onGradeHover(
                                                                                    i,
                                                                                    e.currentTarget
                                                                                )
                                                                            }
                                                                            onMouseLeave={() =>
                                                                                onGradeHover(
                                                                                    i,
                                                                                    null
                                                                                )
                                                                            }
                                                                            key={
                                                                                grade.id
                                                                            }
                                                                        >{`${getGradeName(
                                                                            grade.gradeWithWords,
                                                                            true
                                                                        )} ${
                                                                            grade.grade
                                                                        }`}</span>
                                                                        <Popover
                                                                            style={{
                                                                                pointerEvents:
                                                                                    'none',
                                                                            }}
                                                                            open={Boolean(
                                                                                anchorEl[
                                                                                    i
                                                                                ]
                                                                            )}
                                                                            anchorEl={
                                                                                anchorEl[
                                                                                    i
                                                                                ]
                                                                            }
                                                                            onClose={() =>
                                                                                onGradeHover(
                                                                                    i,
                                                                                    null
                                                                                )
                                                                            }
                                                                            anchorOrigin={{
                                                                                vertical:
                                                                                    'bottom',
                                                                                horizontal:
                                                                                    'center',
                                                                            }}
                                                                            transformOrigin={{
                                                                                vertical:
                                                                                    'top',
                                                                                horizontal:
                                                                                    'center',
                                                                            }}
                                                                        >
                                                                            <Typography className='grade-message'>
                                                                                {grade.message ||
                                                                                    'Оценка'}
                                                                            </Typography>
                                                                        </Popover>
                                                                    </Fragment>
                                                                )
                                                            )
                                                    ) : (
                                                        <span
                                                            aria-haspopup='true'
                                                            className={
                                                                styles.grade
                                                            }
                                                        >
                                                            Няма
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    className={`${styles['grade-field']} ${styles['grade-field-year']}`}
                                                >
                                                    {(value as Grade[])?.filter(
                                                        (grade: Grade) =>
                                                            grade?.student
                                                                ?.id === s.id &&
                                                            (grade.type as string) ===
                                                                'TURM_1'
                                                    ).length > 0 ? (
                                                        (value as Grade[])
                                                            ?.filter(
                                                                (
                                                                    grade: Grade
                                                                ) =>
                                                                    grade
                                                                        ?.student
                                                                        ?.id ===
                                                                        s.id &&
                                                                    (grade.type as string) ===
                                                                        'YEAR'
                                                            )
                                                            .sort(
                                                                (
                                                                    a: Grade,
                                                                    b: Grade
                                                                ) =>
                                                                    (a.createdAt as Date) >
                                                                    (b.createdAt as Date)
                                                                        ? 1
                                                                        : (a.createdAt as Date) <
                                                                          (b.createdAt as Date)
                                                                        ? -1
                                                                        : 0
                                                            )
                                                            .map(
                                                                (
                                                                    grade: Grade,
                                                                    i: number
                                                                ) => (
                                                                    <Fragment
                                                                        key={
                                                                            grade.id
                                                                        }
                                                                    >
                                                                        <span
                                                                            aria-haspopup='true'
                                                                            className={
                                                                                styles.grade
                                                                            }
                                                                            onMouseEnter={(
                                                                                e: MouseEvent<HTMLButtonElement>
                                                                            ) =>
                                                                                onGradeHover(
                                                                                    i,
                                                                                    e.currentTarget
                                                                                )
                                                                            }
                                                                            onMouseLeave={() =>
                                                                                onGradeHover(
                                                                                    i,
                                                                                    null
                                                                                )
                                                                            }
                                                                            key={
                                                                                grade.id
                                                                            }
                                                                        >{`${getGradeName(
                                                                            grade.gradeWithWords,
                                                                            true
                                                                        )} ${
                                                                            grade.grade
                                                                        }`}</span>
                                                                        <Popover
                                                                            style={{
                                                                                pointerEvents:
                                                                                    'none',
                                                                            }}
                                                                            open={Boolean(
                                                                                anchorEl[
                                                                                    i
                                                                                ]
                                                                            )}
                                                                            anchorEl={
                                                                                anchorEl[
                                                                                    i
                                                                                ]
                                                                            }
                                                                            onClose={() =>
                                                                                onGradeHover(
                                                                                    i,
                                                                                    null
                                                                                )
                                                                            }
                                                                            anchorOrigin={{
                                                                                vertical:
                                                                                    'bottom',
                                                                                horizontal:
                                                                                    'center',
                                                                            }}
                                                                            transformOrigin={{
                                                                                vertical:
                                                                                    'top',
                                                                                horizontal:
                                                                                    'center',
                                                                            }}
                                                                        >
                                                                            <Typography className='grade-message'>
                                                                                {grade.message ||
                                                                                    'Оценка'}
                                                                            </Typography>
                                                                        </Popover>
                                                                    </Fragment>
                                                                )
                                                            )
                                                    ) : (
                                                        <span
                                                            aria-haspopup='true'
                                                            className={
                                                                styles.grade
                                                            }
                                                        >
                                                            Няма
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    className={`${styles['grade-field']} ${styles['grade-field-grades']}`}
                                                >
                                                    {(value as Grade[])?.filter(
                                                        (grade: Grade) =>
                                                            grade?.student
                                                                ?.id === s.id &&
                                                            (grade?.type as string) !==
                                                                'TURM_1' &&
                                                            (grade?.type as string) !==
                                                                'TURM_2' &&
                                                            (grade?.type as string) !==
                                                                'YEAR'
                                                    ).length > 0 ? (
                                                        (value as Grade[])
                                                            ?.filter(
                                                                (
                                                                    grade: Grade
                                                                ) =>
                                                                    grade
                                                                        ?.student
                                                                        ?.id ===
                                                                        s.id &&
                                                                    (grade?.type as string) !==
                                                                        'TURM_1' &&
                                                                    (grade?.type as string) !==
                                                                        'TURM_2' &&
                                                                    (grade?.type as string) !==
                                                                        'YEAR'
                                                            )
                                                            .sort(
                                                                (
                                                                    a: Grade,
                                                                    b: Grade
                                                                ) =>
                                                                    (a.createdAt as Date) >
                                                                    (b.createdAt as Date)
                                                                        ? 1
                                                                        : (a.createdAt as Date) <
                                                                          (b.createdAt as Date)
                                                                        ? -1
                                                                        : 0
                                                            )
                                                            .map(
                                                                (
                                                                    grade: Grade,
                                                                    i: number
                                                                ) => (
                                                                    <Fragment
                                                                        key={
                                                                            grade.id
                                                                        }
                                                                    >
                                                                        <span
                                                                            aria-haspopup='true'
                                                                            className={
                                                                                styles.grade
                                                                            }
                                                                            onMouseEnter={(
                                                                                e: MouseEvent<HTMLButtonElement>
                                                                            ) =>
                                                                                onGradeHover(
                                                                                    i,
                                                                                    e.currentTarget
                                                                                )
                                                                            }
                                                                            onMouseLeave={() =>
                                                                                onGradeHover(
                                                                                    i,
                                                                                    null
                                                                                )
                                                                            }
                                                                            key={
                                                                                grade.id
                                                                            }
                                                                        >{`${getGradeName(
                                                                            grade.gradeWithWords,
                                                                            true
                                                                        )} ${
                                                                            grade.grade
                                                                        }`}</span>
                                                                        <Popover
                                                                            style={{
                                                                                pointerEvents:
                                                                                    'none',
                                                                            }}
                                                                            open={Boolean(
                                                                                anchorEl[
                                                                                    i
                                                                                ]
                                                                            )}
                                                                            anchorEl={
                                                                                anchorEl[
                                                                                    i
                                                                                ]
                                                                            }
                                                                            onClose={() =>
                                                                                onGradeHover(
                                                                                    i,
                                                                                    null
                                                                                )
                                                                            }
                                                                            anchorOrigin={{
                                                                                vertical:
                                                                                    'bottom',
                                                                                horizontal:
                                                                                    'center',
                                                                            }}
                                                                            transformOrigin={{
                                                                                vertical:
                                                                                    'top',
                                                                                horizontal:
                                                                                    'center',
                                                                            }}
                                                                        >
                                                                            <Typography className='grade-message'>
                                                                                {grade.message ||
                                                                                    'Оценка'}
                                                                            </Typography>
                                                                        </Popover>
                                                                    </Fragment>
                                                                )
                                                            )
                                                    ) : (
                                                        <span
                                                            aria-haspopup='true'
                                                            className={
                                                                styles.grade
                                                            }
                                                        >
                                                            Няма
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Fragment>
                                    ))}
                                </div>
                            </TabPanel>
                        )
                    )}
                </div>
            </Container>
        </>
    );
};

export default Grades;
