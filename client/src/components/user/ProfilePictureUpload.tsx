import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  onImageUpdate?: (imageUrl: string) => void;
  className?: string;
}

export default function ProfilePictureUpload({ 
  currentImageUrl, 
  onImageUpdate,
  className = "" 
}: ProfilePictureUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('profileImage', file);
      formData.append('userId', (user as any)?.id || '');

      // For demo purposes, create a local URL
      // In production, this would upload to a cloud service
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the update callback
      if (onImageUpdate) {
        onImageUpdate(localUrl);
      }

      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been successfully updated",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    try {
      setPreviewUrl(undefined);
      
      if (onImageUpdate) {
        onImageUpdate('');
      }

      toast({
        title: "Profile Picture Removed",
        description: "Your profile picture has been removed",
      });
    } catch (error) {
      toast({
        title: "Remove Failed",
        description: "Failed to remove profile picture. Please try again.",
        variant: "destructive",
      });
    }
  };

  const userInitial = (user as any)?.firstName?.charAt(0) || (user as any)?.email?.charAt(0) || "U";

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage src={previewUrl} />
          <AvatarFallback className="text-2xl">{userInitial}</AvatarFallback>
        </Avatar>
        
        {previewUrl && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Click the camera icon to update your profile picture
        </p>
        <p className="text-xs text-muted-foreground">
          Supports JPG, PNG. Max size 5MB.
        </p>
      </div>

      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        {uploading ? 'Uploading...' : 'Upload New Picture'}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}