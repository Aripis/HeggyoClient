import { useEffect } from 'react';
import { Container, Typography } from '@material-ui/core';
import styles from 'styles/Index.module.scss';

const Index = () => {
    useEffect(() => {
        fetch(process.env.NEXT_PUBLIC_API_URL)
            .then((response) => response.json())
            .then((data) => console.log(data));
    }, []);

    return (
        <Container maxWidth='sm' className={styles.content}>
            <Typography variant='h4' component='h1' gutterBottom>
                Next.js with TypeScript example
            </Typography>
        </Container>
    );
};

export default Index;
