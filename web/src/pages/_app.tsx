import * as React from 'react';
import 'react-placeholder/lib/reactPlaceholder.css';
import '../styles/tailwind.css';

function MyApp({ Component, pageProps }: any) {
  return (
    <div>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
