import { FunctionComponent } from 'react';
import Head from 'next/head';
import Navbar from 'components/Navbar';
import { Container } from '@material-ui/core';
// import styles from 'styles/I ndex.module.scss';

const Index: FunctionComponent = () => {
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
