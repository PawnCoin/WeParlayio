import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface SocialShareButtonProps {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
}

const SocialShareButton: React.FC<SocialShareButtonProps> = ({
  url = window.location.href,
  title = 'Check out WeParlay!',
  description = 'The best sports betting platform',
  className = ''
}) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard or open Twitter
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <Button 
      onClick={handleShare} 
      variant="outline" 
      size="sm"
      className={`flex items-center gap-2 ${className}`}
    >
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );
};

export default SocialShareButton;