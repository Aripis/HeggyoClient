import { useEffect, FunctionComponent, useState } from 'react';
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
import { PeopleOutlined, Work, BeachAccess } from '@material-ui/icons';

const Dashboard: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();
    const [filterByStatus, setFilterByStatus] = useState<string | undefined>(
        undefined
    );
    const [filterByType, setFilterByType] = useState<string | undefined>(
        undefined
    );
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
                                {data?.messagesByCriteria &&
                                    data?.messagesByCriteria?.map(
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
                                                            styles[
                                                                'card-header'
                                                            ]
                                                        }
                                                        avatar={
                                                            <Avatar>
                                                                {message?.from?.firstName?.charAt(
                                                                    0
                                                                )}
                                                            </Avatar>
                                                        }
                                                        title={`${message?.from?.firstName} ${message?.from?.lastName}`}
                                                        subheader={`
                                                            ${date.toUTCString()} 
                                                            ${message?.type} 
                                                            ${message?.status}`}
                                                    />
                                                    <CardContent>
                                                        {message?.data}
                                                        {/* TODO: check if there is file and do some work */}
                                                    </CardContent>
                                                </Card>
                                            );
                                        }
                                    )}
                            </div>
                            {user && (user?.userRole as string) === 'ADMIN' && (
                                <div className={styles['statistics']}>
                                    <Card elevation={0}>
                                        <CardHeader
                                            title={data?.institution?.name}
                                            subheader={`${data?.institution?.email}`}
                                        />
                                    </Card>
                                    {data?.users &&
                                        data?.students &&
                                        data?.teachers &&
                                        data?.parents && (
                                            <List
                                                className={
                                                    styles['statistics-list']
                                                }
                                                subheader={
                                                    <ListSubheader>
                                                        Статистика
                                                    </ListSubheader>
                                                }
                                            >
                                                <ListItem>
                                                    <ListItemAvatar>
                                                        <Avatar>
                                                            <Work />
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={`${data?.institution?.educationalStage} SCHOOL`}
                                                    />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemAvatar>
                                                        <Avatar>
                                                            <Work />
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            data?.institution
                                                                ?.type
                                                        }
                                                    />
                                                </ListItem>
                                                <ListItem>
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
                                                <ListItem>
                                                    <ListItemAvatar>
                                                        <Avatar>
                                                            <Work />
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={`${data?.students.length}`}
                                                        secondary='Ученици'
                                                    />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemAvatar>
                                                        <Avatar>
                                                            <BeachAccess />
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={`${data?.teachers.length}`}
                                                        secondary='Учители'
                                                    />
                                                </ListItem>
                                            </List>
                                        )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Container>
        </>
    );
};

export default Dashboard;
