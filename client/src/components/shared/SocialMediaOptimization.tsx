import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface SocialMediaOptimizationProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SocialMediaOptimization: React.FC<SocialMediaOptimizationProps> = ({
  title = 'WeParlay - Premier Sports Betting Platform',
  description = 'Live sports, custom peer-to-peer bets, daily tournaments, and one universal bet slip.',
  image = '/weparlaylogo.png',
  url
}) => {
  const [location] = useLocation();
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Get current URL for social sharing
    const currentUrl = url || window.location.href;
    
    // Update or create meta tags for social media sharing
    const updateMetaTag = (property: string, content: string, isName = false) => {
      const attribute = isName ? 'name' : 'property';
      let meta = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Open Graph tags for Facebook and LinkedIn
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', currentUrl);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:site_name', 'WeParlay');
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');
    updateMetaTag('og:image:alt', 'WeParlay Sports Betting Platform');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image, true);
    updateMetaTag('twitter:site', '@WeParlay', true);
    updateMetaTag('twitter:creator', '@WeParlay', true);

    // Standard meta tags
    updateMetaTag('description', description, true);
    updateMetaTag('keywords', 'sports betting, peer-to-peer betting, custom bets, daily tournaments, live games, WeParlay', true);

  }, [title, description, image, url, location]);

  return null;
};

export default SocialMediaOptimization;
