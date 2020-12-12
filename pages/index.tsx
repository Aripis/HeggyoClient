import { useEffect, FunctionComponent } from 'react';
import Head from 'next/head';
import Navbar from 'components/Navbar';
import { Container } from '@material-ui/core';
import { useAuth } from 'utils/useAuth';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
// import styles from 'styles/Index.module.scss';

const Index: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();

    useEffect(() => {
        if (status === 'DONE') {
            router.push('/dashboard');
        }
    }, [user, status]);

    if (user) {
        return <Loader />;
    }

    return (
        <>
            <Head>
                <title>Heggyo - Училищен асистент</title>
            </Head>
            <Container
                className='main-container'
                maxWidth={false}
                disableGutters
            >
                <Navbar title='Heggyo' />
            </Container>
            {/* <Container className={styles.content} disableGutters></Container> */}
            {/* <Footer /> */}
        </>
    );
};

export default Index;
