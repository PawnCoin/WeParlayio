import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Facebook, Twitter, Mail, Link, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TournamentShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournament: {
    id: number;
    name: string;
  };
}

const TournamentShareModal: React.FC<TournamentShareModalProps> = ({
  open,
  onOpenChange,
  tournament
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const tournamentUrl = `https://weparlay.io/tournaments/${tournament.id}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(tournamentUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Link Copied",
          description: "Tournament link copied to clipboard",
        });
      })
      .catch(err => {
        console.error("Failed to copy link:", err);
        toast({
          title: "Failed to Copy",
          description: "Could not copy link to clipboard",
          variant: "destructive"
        });
      });
  };
  
  const handleShareOnSocial = (platform: string) => {
    let shareUrl = '';
    
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(tournamentUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this tournament on WeParlay: ${tournament.name}`)}&url=${encodeURIComponent(tournamentUrl)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(`WeParlay Tournament: ${tournament.name}`)}&body=${encodeURIComponent(`Check out this tournament on WeParlay: ${tournamentUrl}`)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank');
    
    toast({
      title: "Sharing",
      description: `Opening ${platform} share dialog`,
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Tournament</DialogTitle>
          <DialogDescription>
            Share this tournament bracket with friends and colleagues
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex items-center gap-2">
            <Input 
              className="flex-1"
              value={tournamentUrl}
              readOnly
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button 
              variant={copied ? "success" : "outline"} 
              onClick={handleCopyLink}
            >
              <Link className="h-4 w-4 mr-2" />
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <AnimatePresence>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-16 flex flex-col gap-1 items-center justify-center"
                  onClick={() => handleShareOnSocial('facebook')}
                >
                  <Facebook className="h-5 w-5 text-[#1877F2]" />
                  <span className="text-xs">Facebook</span>
                </Button>
              </motion.div>
            </AnimatePresence>
            
            <AnimatePresence>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-16 flex flex-col gap-1 items-center justify-center"
                  onClick={() => handleShareOnSocial('twitter')}
                >
                  <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                  <span className="text-xs">Twitter</span>
                </Button>
              </motion.div>
            </AnimatePresence>
            
            <AnimatePresence>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-16 flex flex-col gap-1 items-center justify-center"
                  onClick={() => handleShareOnSocial('email')}
                >
                  <Mail className="h-5 w-5 text-gray-500" />
                  <span className="text-xs">Email</span>
                </Button>
              </motion.div>
            </AnimatePresence>
            
            <AnimatePresence>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-16 flex flex-col gap-1 items-center justify-center"
                  onClick={() => {
                    toast({
                      title: "QR Code Generated",
                      description: "Tournament QR code ready for scanning",
                    });
                  }}
                >
                  <QrCode className="h-5 w-5 text-gray-700" />
                  <span className="text-xs">QR Code</span>
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentShareModal;