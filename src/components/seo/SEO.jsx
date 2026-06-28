import { Helmet } from "react-helmet-async";
import { siteConfig } from "../../data/site";

const siteUrl = "https://mketics.co.za";
const defaultTitle =
  "MKETICS | Software, IT Infrastructure & Digital Business Solutions";
const defaultDescription =
  "MKETICS is a South African technology company providing software development, IT infrastructure, digital business solutions, smart security technology and business readiness support.";
const defaultImage = `${siteUrl}/assets/mketics-og-image.webp`;

export default function SEO({
  title = defaultTitle,
  description = defaultDescription,
  path = "/",
  image = defaultImage,
  type = "website",
}) {
  const canonicalUrl = `${siteUrl}${path}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.legalName,
    alternateName: siteConfig.name,
    description,
    url: siteUrl,
    logo: `${siteUrl}${siteConfig.logo}`,
    image,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      addressCountry: "ZA",
    },
    areaServed: {
      "@type": "Country",
      name: "South Africa",
    },
    sameAs: [],
    slogan: siteConfig.tagline,
    foundingDate: "2026",
    knowsAbout: [
      "Software Development",
      "Website Development",
      "IT Infrastructure",
      "Network Support",
      "Digital Business Solutions",
      "Business Registration Assistance",
      "Digital Marketing",
      "Smart Security Technology",
      "IP Camera Planning",
    ],
  };

  return (
    <Helmet>
      <title>{title}</title>

      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="MKETICS (PTY) LTD" />
      <meta name="theme-color" content="#020B1F" />

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="MKETICS" />
      <meta property="og:locale" content="en_ZA" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content="MKETICS technology solutions preview" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}