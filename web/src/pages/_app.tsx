import * as React from 'react';
import Head from 'next/head';
import '../styles/tailwind.css';
import 'react-placeholder/lib/reactPlaceholder.css';

function MyApp({ Component, pageProps }: any) {
  return (
    <div>
      <Head>
        <link rel="shortcut icon" href="/favicon.png" />
      </Head>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
