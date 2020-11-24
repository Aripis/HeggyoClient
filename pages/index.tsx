import { FunctionComponent, useState } from 'react';
import Head from 'next/head';
import Navbar from 'components/Navbar';
import { Container } from '@material-ui/core';
import styles from 'styles/Index.module.scss';

const Index: FunctionComponent = () => {
    return (
        <Container maxWidth={false} disableGutters>
            <Head>
                <title>Heggyo - Училищен асистент</title>
            </Head>
            <Navbar />
            {/* <Container className={styles.content} disableGutters></Container> */}
            {/* <Footer /> */}
        </Container>
    );
};

export default Index;
