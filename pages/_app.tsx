import React from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { ThemeProvider, StylesProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from 'components/theme';
import 'styles/global.scss';
import graphQLClient from 'utils/graphqlclient';
import { SWRConfig } from 'swr';
import 'react-big-calendar/lib/css/react-big-calendar.css';

export default function MyApp(props: AppProps) {
    const { Component, pageProps } = props;

    React.useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles) {
            jssStyles.parentElement?.removeChild(jssStyles);
        }
    }, []);

    return (
        <React.Fragment>
            <Head>
                <title>My page</title>
                <meta
                    name='viewport'
                    content='minimum-scale=1, initial-scale=1, width=device-width'
                />
            </Head>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <StylesProvider injectFirst>
                    <SWRConfig
                        value={{
                            fetcher: (query: string, variables?: any) =>
                                graphQLClient.request(query, variables),
                        }}
                    >
                        <Component {...pageProps} />
                    </SWRConfig>
                </StylesProvider>
            </ThemeProvider>
        </React.Fragment>
    );
}
