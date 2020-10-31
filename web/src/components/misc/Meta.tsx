import Head from 'next/head';
import React from 'react';

interface MetaProps {
  title?: string;
  image?: string;
}

export const defaultInfo = {
  site: 'Definitely Not Reddit',
  desc:
    'The front page of the internet - someday | Coding project by Michael W. Lu',
  img: 'banner.png', // don't include slash
  url: process.env.NEXT_PUBLIC_WEB_URL.replace(/\/$/, ''), // regex to remove possible slash at end
  favicon: 'favicon.png',
};

const Meta: React.FC<MetaProps> = ({ title, image }) => {
  if (image) {
    image = image.replace(/^\//, '');
  }
  return (
    <Head>
      <title>{(title ? `${title} | ` : '') + defaultInfo.site}</title>
      <meta name="description" content={defaultInfo.desc} />
      <meta property="og:type" content="website" />
      <meta name="og:title" property="og:title" content={title} />
      <meta
        name="og:description"
        property="og:description"
        content={defaultInfo.desc}
      />
      <meta property="og:site_name" content={`${defaultInfo.site}`} />
      <meta property="og:url" content={`${defaultInfo.url}`} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={defaultInfo.desc} />
      <link rel="canonical" href={`${defaultInfo.url}`} />
      <link rel="icon" type="image/png" href={`${defaultInfo.img}`} />
      <link rel="apple-touch-icon" href={`${defaultInfo.img}`} />
      {image ? (
        <meta property="og:image" content={`${defaultInfo.url}/${image}`} />
      ) : (
        <meta
          property="og:image"
          content={`${defaultInfo.url}/${defaultInfo.img}`}
        />
      )}
      {image ? (
        <meta name="twitter:image" content={`${defaultInfo.url}/${image}`} />
      ) : (
        <meta
          property="twitter:image"
          content={`${defaultInfo.url}/${defaultInfo.img}`}
        />
      )}
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
  );
};

export default Meta;
