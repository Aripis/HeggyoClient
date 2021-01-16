import { useEffect, useState, FunctionComponent } from 'react';
import Head from 'next/head';
import Navbar from 'components/Navbar';
import Drawer from 'components/Drawer';
import {
    Container,
    Button,
    Snackbar,
    Card,
    CardHeader,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    Typography,
} from '@material-ui/core';
import Link from 'components/Link';
import Alert from '@material-ui/lab/Alert';
import { AddOutlined, MoreHorizOutlined } from '@material-ui/icons';
import { useAuth } from 'utils/useAuth';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
import styles from 'styles/Schedules.module.scss';
import { Class } from 'utils/interfaces';
import useSWR from 'swr';
import { gql } from 'graphql-request';

interface ScheduleCardProps {
    id?: string;
    startYear?: number;
    endYear?: number;
    classNumber?: number;
    classLetter?: string;
}

const ScheduleCard: FunctionComponent<ScheduleCardProps> = (props) => {
    const [menu, setMenu] = useState<null | HTMLElement>(null);

    return (
        <Card className={styles['card']}>
            <CardHeader
                className={styles['card-header']}
                avatar={<Avatar>{props.classLetter}</Avatar>}
                action={
                    <>
                        <IconButton onClick={(e) => setMenu(e.currentTarget)}>
                            <MoreHorizOutlined />
                        </IconButton>
                        <Link
                            underline='none'
                            color='initial'
                            className={styles['viewschedule-link']}
                            href={`/viewschedule?classId=${props.id}`}
                        ></Link>
                    </>
                }
                title={`Програма на ${props.classNumber}${props.classLetter}`}
                subheader={`${props.startYear} - ${props.endYear}`}
            />
            <Menu
                anchorEl={menu}
                keepMounted
                open={Boolean(menu)}
                onClose={() => setMenu(null)}
            >
                <MenuItem onClick={() => setMenu(null)}>
                    <Link
                        color='textPrimary'
                        underline='none'
                        href={{
                            pathname: '/editschedule',
                            query: { id: props.id },
                        }}
                    >
                        Редактирай
                    </Link>
                </MenuItem>
            </Menu>
        </Card>
    );
};

const Schedule: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();

    const [error, setError] = useState('');
    const { data } = useSWR(gql`
        query {
            classes {
                id
                startYear
                endYear
                classNumber
                classLetter
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

    if (!user) {
        return <Loader />;
    }

    return (
        <>
            <Head>
                <title>Учебни програми &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Учебни програми' />
                <div className={styles.content}>
                    <div className={styles['actions-container']}>
                        <Link
                            className={styles['schedule-add']}
                            underline='none'
                            href='/addschedule'
                        >
                            <Button
                                disableElevation
                                variant='contained'
                                color='primary'
                                endIcon={<AddOutlined />}
                            >
                                Добави програма
                            </Button>
                        </Link>
                    </div>
                    <div className={styles['schedules-container']}>
                        {data &&
                            data.classes?.map((currClass: Class, i: number) => (
                                <ScheduleCard key={i} {...currClass} />
                            ))}
                        {data && !data.classes && (
                            <div className={styles['no-classes']}>
                                <Typography color='textSecondary'>
                                    Няма съществуващи програми. За да добавите
                                    такива, натиснете бутона &quot;Добави
                                    програма&quot;.
                                </Typography>
                            </div>
                        )}
                    </div>
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

export default Schedule;
