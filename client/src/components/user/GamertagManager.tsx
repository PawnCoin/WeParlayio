import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Crown, Star, Edit3, Check, X, Gamepad2 } from 'lucide-react';
import { canUserAccess } from '@shared/tierSystem';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface GamertagManagerProps {
  user: {
    id: string;
    gamertag?: string | null;
    subscriptionTier: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}

const gamertagSchema = z.object({
  gamertag: z.string()
    .min(3, 'Gamertag must be at least 3 characters')
    .max(20, 'Gamertag must be 20 characters or less')
    .regex(/^[a-zA-Z0-9_]+$/, 'Gamertag can only contain letters, numbers, and underscores')
    .refine((val) => !val.includes('__'), 'Cannot contain consecutive underscores')
});

type GamertagForm = z.infer<typeof gamertagSchema>;

export default function GamertagManager({ user }: GamertagManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const canUseGamertag = canUserAccess(user.subscriptionTier as any, 'customGamertag');

  const form = useForm<GamertagForm>({
    resolver: zodResolver(gamertagSchema),
    defaultValues: {
      gamertag: user.gamertag || ''
    }
  });

  const updateGamertagMutation = useMutation({
    mutationFn: async (data: GamertagForm) => {
      return apiRequest('PATCH', '/api/user/gamertag', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsEditing(false);
      toast({
        title: "Gamertag Updated! 🎮",
        description: "Your new gamertag has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update gamertag. It might already be taken.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: GamertagForm) => {
    updateGamertagMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset({ gamertag: user.gamertag || '' });
    setIsEditing(false);
  };

  if (!canUseGamertag) {
    return (
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Crown className="h-5 w-5" />
            Custom Gamertag
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Premium Feature
            </Badge>
          </CardTitle>
          <CardDescription className="text-amber-700">
            Create a unique gamertag for custom betting challenges and social interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Crown className="h-12 w-12 text-amber-500 mx-auto mb-3" />
            <h3 className="font-semibold text-amber-800 mb-2">Upgrade to Bronze Tier or Higher</h3>
            <p className="text-amber-600 mb-4">
              Get a custom gamertag and unlock custom betting challenges with WeParlay Cash
            </p>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Gamepad2 className="h-5 w-5" />
          Your Gamertag
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            Premium
          </Badge>
        </CardTitle>
        <CardDescription className="text-blue-700">
          Used in custom betting challenges and WeParlay Cash competitions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <div className="flex items-center justify-between p-4 rounded-lg bg-white border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {user.gamertag?.[0]?.toUpperCase() || user.firstName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {user.gamertag || 'No gamertag set'}
                </div>
                {!user.gamertag && (
                  <div className="text-sm text-gray-500">
                    Set a custom gamertag for betting challenges
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {user.gamertag ? 'Edit' : 'Set Gamertag'}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="gamertag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gamertag</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your gamertag"
                        {...field}
                        className="border-blue-300 focus:border-blue-500"
                      />
                    </FormControl>
                    <FormDescription>
                      3-20 characters, letters, numbers, and underscores only
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={updateGamertagMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {updateGamertagMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateGamertagMutation.isPending}
                  className="border-gray-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        )}

        {user.gamertag && (
          <div className="mt-4 p-3 rounded-lg bg-blue-100 border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Where your gamertag appears:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Custom betting challenges with friends</li>
              <li>• WeParlay Cash competitions and tournaments</li>
              <li>• Social betting interactions and groups</li>
              <li>• Leaderboards and achievement unlocks</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}