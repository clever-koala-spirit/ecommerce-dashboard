import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://slayseason.com';

export default function SEO({ title, description, path = '/', image = '/og-image.jpg' }) {
  const url = `${BASE_URL}${path}`;
  const fullTitle = title.includes('Slay Season') ? title : `${title} | Slay Season`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${BASE_URL}${image}`} />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${BASE_URL}${image}`} />
    </Helmet>
  );
}
