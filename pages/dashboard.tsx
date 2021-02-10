import { useEffect, FunctionComponent, useState, Fragment } from 'react';
import Head from 'next/head';
import {
    Avatar,
    Button,
    Container,
    CardContent,
    CardHeader,
    ListSubheader,
    MenuItem,
    TextField,
    Card,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Link,
    Typography,
} from '@material-ui/core';
import styles from 'styles/Dashboard.module.scss';
import Navbar from 'components/Navbar';
import Drawer from 'components/Drawer';
import { useAuth } from 'utils/useAuth';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
import useSWR from 'swr';
import { gql } from 'graphql-request';
import { Message } from 'utils/interfaces';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import {
    PeopleOutlined,
    SchoolOutlined,
    LocalLibraryOutlined,
    BusinessOutlined,
    ApartmentOutlined,
    SupervisorAccountOutlined,
} from '@material-ui/icons';
import { getInstitutionType, getEducationStage } from 'utils/helpers';

import { format } from 'date-fns';
import { bg } from 'date-fns/locale';

const Dashboard: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();
    const [filterByStatus, setFilterByStatus] = useState<string | undefined>(
        undefined
    );
    const [filterByType, setFilterByType] = useState<string | undefined>(
        undefined
    );
    const [messagesByCriteria, setMessagesByCriteria] = useState([]);
    const messageTypes = [
        { value: 'MESSAGE', content: 'Съобщения' },
        { value: 'ASSIGNMENT', content: 'Задания' },
    ];
    const messageStatus = [
        { value: 'CREATED', content: 'Създадени' },
        { value: 'PUBLISHED', content: 'Изпратени' },
    ];

    const { data, mutate } = useSWR([
        gql`
            query($filterByStatus: MessageStatus, $filterByType: MessageType) {
                messagesByCriteria(
                    criteria: {
                        messageStatus: $filterByStatus
                        messageType: $filterByType
                    }
                ) {
                    id
                    data
                    from {
                        firstName
                        lastName
                    }
                    updatedAt
                    type
                    status
                    files {
                        filename
                        publicUrl
                    }
                }

                classes {
                    id
                    classNumber
                    classLetter
                }

                users {
                    id
                    userRole
                }

                students {
                    id
                }

                teachers {
                    id
                }

                parents {
                    id
                }

                institution {
                    name
                    email
                    type
                    educationalStage
                    alias
                }
            }
        `,
        JSON.stringify({ filterByStatus, filterByType }),
    ]);

    useEffect(() => {
        if (status === 'REDIRECT') {
            router.push('/login');
        }
    }, [user, status]);

    useEffect(() => {
        setMessagesByCriteria(
            data?.messagesByCriteria.sort((a: Message, b: Message) =>
                (a.updatedAt as Date) > (b.updatedAt as Date)
                    ? -1
                    : (a.updatedAt as Date) < (b.updatedAt as Date)
                    ? 1
                    : 0
            )
        );
    }, [data]);

    if (!user) {
        return <Loader />;
    }

    return (
        <>
            <Head>
                <title>Табло &#8226; Heggyo</title>
            </Head>
            <Drawer />
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Табло' />
                <div className={styles.content}>
                    {data && (
                        <>
                            <div className={styles['messages-container']}>
                                <div className={styles['filters-container']}>
                                    <TextField
                                        select
                                        label='Тип'
                                        value={filterByType}
                                        variant='outlined'
                                        className={styles['type-select']}
                                        onChange={(e) => {
                                            setFilterByType(
                                                e.target.value as string
                                            );
                                            mutate();
                                        }}
                                    >
                                        <MenuItem value={undefined}>
                                            Без
                                        </MenuItem>
                                        {messageTypes &&
                                            messageTypes.map((type) => (
                                                <MenuItem
                                                    key={type.value}
                                                    value={type.value}
                                                >
                                                    {type.content}
                                                </MenuItem>
                                            ))}
                                    </TextField>
                                    <TextField
                                        select
                                        className={styles['status-select']}
                                        label='Статус'
                                        variant='outlined'
                                        value={filterByStatus}
                                        onChange={(e) => {
                                            setFilterByStatus(
                                                e.target.value as string
                                            );
                                            mutate();
                                        }}
                                    >
                                        <MenuItem value={undefined}>
                                            Без
                                        </MenuItem>
                                        {messageStatus &&
                                            messageStatus.map((status) => (
                                                <MenuItem
                                                    key={status.value}
                                                    value={status.value}
                                                >
                                                    {status.content}
                                                </MenuItem>
                                            ))}
                                    </TextField>
                                    <Button
                                        disableElevation
                                        variant='contained'
                                        color='primary'
                                        className={styles['add-button']}
                                        startIcon={<AddOutlinedIcon />}
                                        onClick={() =>
                                            router.push('/addmessage')
                                        }
                                    >
                                        Добави
                                    </Button>
                                </div>
                                {messagesByCriteria?.map(
                                    (message: Message, i: number) => {
                                        const date = new Date(
                                            message?.updatedAt as Date
                                        );
                                        return (
                                            <Card
                                                className={styles['card']}
                                                key={i}
                                            >
                                                <CardHeader
                                                    className={
                                                        styles['card-header']
                                                    }
                                                    avatar={
                                                        <Avatar>
                                                            {message?.from?.firstName?.charAt(
                                                                0
                                                            )}
                                                        </Avatar>
                                                    }
                                                    title={`${message?.from?.firstName} ${message?.from?.lastName}`}
                                                    subheader={format(
                                                        date,
                                                        'do MMM yyyy k:m',
                                                        { locale: bg }
                                                    )}
                                                />
                                                <CardContent
                                                    className={
                                                        styles['card-content']
                                                    }
                                                >
                                                    <Typography>
                                                        {`${message?.data}`}
                                                    </Typography>
                                                    <br />
                                                    <Typography>
                                                        {message?.files?.map(
                                                            (
                                                                file,
                                                                i: number
                                                            ) => (
                                                                <Fragment
                                                                    key={i}
                                                                >
                                                                    <Link
                                                                        href={
                                                                            file.publicUrl
                                                                        }
                                                                        target='_blank'
                                                                    >
                                                                        {`${file.filename}`}
                                                                    </Link>
                                                                    <br />
                                                                </Fragment>
                                                            )
                                                        )}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        );
                                    }
                                )}
                            </div>
                            {user.userRole === 'ADMIN' && (
                                <Card
                                    elevation={0}
                                    className={`${styles['card']} ${styles['statistics']}`}
                                >
                                    <CardHeader
                                        title={data?.institution?.name}
                                        subheader={`${data?.institution?.email}`}
                                    />
                                    <CardContent>
                                        {data?.users &&
                                            data?.students &&
                                            data?.teachers &&
                                            data?.parents && (
                                                <List
                                                    className={
                                                        styles[
                                                            'statistics-list'
                                                        ]
                                                    }
                                                    subheader={
                                                        <ListSubheader
                                                            disableGutters
                                                        >
                                                            Статистика
                                                        </ListSubheader>
                                                    }
                                                >
                                                    <ListItem disableGutters>
                                                        <ListItemAvatar>
                                                            <Avatar>
                                                                <BusinessOutlined />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={getEducationStage(
                                                                data
                                                                    ?.institution
                                                                    ?.educationalStage
                                                            )}
                                                            secondary='Тип'
                                                        />
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <ListItemAvatar>
                                                            <Avatar>
                                                                <ApartmentOutlined />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={getInstitutionType(
                                                                data
                                                                    ?.institution
                                                                    ?.type
                                                            )}
                                                            secondary='Вид'
                                                        />
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <ListItemAvatar>
                                                            <Avatar>
                                                                <PeopleOutlined />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={`${data?.users.length}`}
                                                            secondary='Общо потребители'
                                                        />
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <ListItemAvatar>
                                                            <Avatar>
                                                                <SchoolOutlined />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={`${data?.students.length}`}
                                                            secondary='Ученици'
                                                        />
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <ListItemAvatar>
                                                            <Avatar>
                                                                <LocalLibraryOutlined />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={`${data?.teachers.length}`}
                                                            secondary='Учители'
                                                        />
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <ListItemAvatar>
                                                            <Avatar>
                                                                <SupervisorAccountOutlined />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={`${data?.parents.length}`}
                                                            secondary='Родители'
                                                        />
                                                    </ListItem>
                                                </List>
                                            )}
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </div>
            </Container>
        </>
    );
};

export default Dashboard;
