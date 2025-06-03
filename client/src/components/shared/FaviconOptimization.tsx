import { useEffect } from 'react';

interface FaviconOptimizationProps {
  faviconPath?: string;
  appleTouchIconPath?: string;
}

const FaviconOptimization: React.FC<FaviconOptimizationProps> = ({
  faviconPath = '/favicon.ico',
  appleTouchIconPath = '/apple-touch-icon.png'
}) => {
  useEffect(() => {
    // Dynamic favicon loading for browser compatibility
    const updateFavicon = () => {
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll('link[rel*="icon"]');
      existingLinks.forEach(link => link.remove());

      // Add comprehensive favicon support
      const faviconLinks = [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192x192.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ];

      faviconLinks.forEach(linkData => {
        const link = document.createElement('link');
        Object.entries(linkData).forEach(([key, value]) => {
          link.setAttribute(key, value);
        });
        document.head.appendChild(link);
      });
    };

    updateFavicon();
  }, [faviconPath, appleTouchIconPath]);

  return null;
};

export default FaviconOptimization;