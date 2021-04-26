import { useEffect, FunctionComponent } from 'react';
import Head from 'next/head';
import Navbar from 'components/Navbar';
import { Container, Divider } from '@material-ui/core';
import { useAuth } from 'utils/useAuth';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
import styles from 'styles/Index.module.scss';
import {
    MouseOutlined,
    ArrowDownwardOutlined,
    PeopleAltOutlined,
    SchoolOutlined,
    DoneOutlineOutlined,
} from '@material-ui/icons';

const Index: FunctionComponent = () => {
    const router = useRouter();
    const { user, status } = useAuth();

    useEffect(() => {
        if (status === 'DONE') {
            router.push('/dashboard');
        }
    }, [user, status]);

    if (status === 'FETCHING') {
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
                <div className={styles.content}>
                    <section
                        className={`${styles.section} ${styles['hero-section']}`}
                    >
                        <div className={styles['quote-container']}>
                            <span className={styles.quote}>
                                &quot;If you can dream it, you can do it.&quot;
                            </span>
                            <span className={styles['quote-author']}>
                                Walt Disney
                            </span>
                        </div>
                        <div className={styles['scroll-container']}>
                            <MouseOutlined />
                            <ArrowDownwardOutlined />
                        </div>
                    </section>
                    <section
                        className={`${styles.section} ${styles['feature-section']}`}
                    >
                        <div className={styles['feature-container']}>
                            <div className={styles['text-container']}>
                                <span className={styles.subheader}>
                                    Свържете се бързо
                                </span>
                                <span className={styles.header}>
                                    Пряка връзка между родители, ученици и
                                    учители
                                </span>
                                <ul className={styles.features}>
                                    <Divider orientation='vertical' absolute />
                                    <li>
                                        Учителите оптимално могат да редактират
                                        досието на ученик
                                    </li>
                                    <li>
                                        Учениците може да следят своите оценки,
                                        програми и предмети
                                    </li>
                                </ul>
                            </div>
                            <div className={styles['icons-container']}>
                                <PeopleAltOutlined />
                            </div>
                        </div>
                        <div
                            className={`${styles['feature-container']} ${styles.reversed}`}
                        >
                            <div className={styles['text-container']}>
                                <span className={styles.subheader}>
                                    Използвайте безпроблемно
                                </span>
                                <span className={styles.header}>
                                    Лесен за използване потребителски интерфейс
                                </span>
                                <ul className={styles.features}>
                                    <Divider orientation='vertical' absolute />
                                    <li>
                                        Интерфейсът може да се използва от
                                        всички
                                    </li>
                                    <li>
                                        За разработването на Heggyo са
                                        използвани най-модерните технологии
                                    </li>
                                </ul>
                            </div>
                            <div className={styles['icons-container']}>
                                <DoneOutlineOutlined />
                            </div>
                        </div>
                        <div className={styles['feature-container']}>
                            <div className={styles['text-container']}>
                                <span className={styles.subheader}>
                                    Мултитенант система
                                </span>
                                <span className={styles.header}>
                                    Нашата система работи с множество училища
                                </span>
                                <ul className={styles.features}>
                                    <Divider orientation='vertical' absolute />
                                    <li>
                                        Отворена платформа за Вашето училище
                                    </li>
                                    <li>
                                        Защитено управление на учители, родители
                                        и ученици от администратори
                                    </li>
                                </ul>
                            </div>
                            <div className={styles['icons-container']}>
                                <SchoolOutlined />
                            </div>
                        </div>
                    </section>
                </div>
            </Container>
        </>
    );
};

export default Index;
