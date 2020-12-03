import { useEffect, FunctionComponent } from 'react';
import Head from 'next/head';
import { Container } from '@material-ui/core';
import styles from 'styles/Profile.module.scss';
import { useRouter } from 'next/router';
import { User } from 'utils/interfaces';
import Navbar from 'components/Navbar';
import useUser from 'utils/useUser';
import Loader from 'components/Loader';

const Profile: FunctionComponent<User> = () => {
    const router = useRouter();
    const { user, status } = useUser();

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
                <title>Профил &#8226; Heggyo</title>
            </Head>
            <Navbar />
            <Container
                maxWidth={false}
                className={styles.content}
                disableGutters
            >
                {/* <div className={classes.root}>
                    <AppBar position='static'>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            aria-label='simple tabs example'
                        >
                            <Tab label='Item One' {...a11yProps(0)} />
                            <Tab label='Item Two' {...a11yProps(1)} />
                            <Tab label='Item Three' {...a11yProps(2)} />
                        </Tabs>
                    </AppBar>
                    <TabPanel value={value} index={0}>
                        Item One
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        Item Two
                    </TabPanel>
                    <TabPanel value={value} index={2}>
                        Item Three
                    </TabPanel>
                </div> */}
            </Container>
        </>
    );
};

export default Profile;
