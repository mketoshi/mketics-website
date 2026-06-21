import { Helmet } from "react-helmet-async";

const defaultTitle =
  "MKETICS | Software, IT Infrastructure & Digital Business Solutions";

const defaultDescription =
  "MKETICS is a South African technology company providing software development, IT infrastructure, digital business solutions, smart security technology and business readiness support.";

const siteUrl = "https://mketics.co.za";
const defaultImage = `${siteUrl}/assets/mketics-logo.webp`;

export default function SEO({
  title = defaultTitle,
  description = defaultDescription,
  path = "/",
  image = defaultImage,
}) {
  const canonicalUrl = `${siteUrl}${path}`;

  return (
    <Helmet>
      <title>{title}</title>

      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="MKETICS" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}