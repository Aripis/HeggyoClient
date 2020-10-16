import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import styles from 'styles/Index.module.scss';

const Index = () => {
    return (
        <Container maxWidth='sm' className={styles.content}>
            <Box my={4}>
                <Typography variant='h4' component='h1' gutterBottom>
                    Next.js with TypeScript example
                </Typography>
            </Box>
        </Container>
    );
};

export default Index;
