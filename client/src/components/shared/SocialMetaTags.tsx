import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SocialMetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SocialMetaTags: React.FC<SocialMetaTagsProps> = ({
  title = "WeParlay - The Future of Sports Betting",
  description = "A cutting-edge sports betting platform with cryptocurrency integration, social features, and interactive tournaments. Join now and get 1,000 WeParlay Cash free!",
  image = "https://weparlay.io/weparlaylogo.png",
  url = "https://weparlay.io",
  type = "website"
}) => {
  const fullImageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`;

  return (
    <Helmet>
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image.startsWith('http') ? image : `https://weparlay.io${image}`} />
      <meta property="og:image:secure_url" content={fullImageUrl} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="WeParlay - Live Sports Betting Platform with Real Team Logos" />
      <meta property="og:site_name" content="WeParlay" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@WeParlay" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `https://weparlay.io${image}`} />
      <meta name="twitter:image:alt" content="WeParlay - Mobile Sports Betting with Live Odds" />
    </Helmet>
  );
};

export default SocialMetaTags;