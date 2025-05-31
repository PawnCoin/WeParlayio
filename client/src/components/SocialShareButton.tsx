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
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: description,
        url
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${title} - ${url}`);
    }
  };

  return (
    <Button 
      onClick={handleShare} 
      variant="outline" 
      size="sm"
      className={className}
    >
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  );
};

export default SocialShareButton;