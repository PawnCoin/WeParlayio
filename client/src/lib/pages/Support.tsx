import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';

// Form schema
const supportTicketSchema = z.object({
  subject: z.string().min(5, {
    message: 'Subject must be at least 5 characters.',
  }).max(100, {
    message: 'Subject must be less than 100 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }).max(2000, {
    message: 'Description must be less than 2000 characters.',
  }),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

type SupportTicketFormValues = z.infer<typeof supportTicketSchema>;

// Ticket interface
interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'processing' | 'resolved' | 'escalated';
  createTime: string;
  updateTime: string;
  isResolved: boolean;
  resolution?: string;
}

// Status badge color mapper
const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  escalated: 'bg-red-100 text-red-800'
};

// Status icon mapper
const StatusIcon = ({ status }: { status: string }) => {
  switch(status) {
    case 'resolved':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'processing':
      return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
    case 'escalated':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Clock className="w-5 h-5 text-blue-500" />;
  }
};

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export default function Support() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<SupportTicketFormValues>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      subject: '',
      description: '',
      priority: 'medium',
    },
  });

  // Fetch tickets
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['/api/support/tickets'],
    enabled: isAuthenticated,
  });

  // Submit ticket
  const createTicketMutation = useMutation({
    mutationFn: async (values: SupportTicketFormValues) => {
      return await apiRequest('POST', '/api/support/tickets', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      form.reset();
      toast({
        title: 'Support ticket submitted',
        description: "We've received your support request and will address it promptly.",
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to submit ticket',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    },
  });

  // Get ticket details
  const { data: activeTicketData, isLoading: ticketDetailsLoading } = useQuery({
    queryKey: ['/api/support/tickets', activeTicket],
    enabled: !!activeTicket,
  });

  const onSubmit = (values: SupportTicketFormValues) => {
    createTicketMutation.mutate(values);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please log in to access the support system.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Support Center</h1>
      
      <Tabs defaultValue="new-ticket">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="new-ticket">New Support Request</TabsTrigger>
          <TabsTrigger value="my-tickets">My Tickets {tickets?.tickets?.length > 0 && `(${tickets.tickets.length})`}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new-ticket">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Request</CardTitle>
              <CardDescription>
                Describe your issue in detail to help us resolve it quickly.
                Our AI-powered system can automatically resolve common technical issues.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief summary of your issue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How urgent is this issue?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detailed Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, and what you were trying to accomplish." 
                            className="min-h-[150px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={createTicketMutation.isPending}
                    >
                      {createTicketMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Submit Request
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="my-tickets">
          <Card>
            <CardHeader>
              <CardTitle>My Support Tickets</CardTitle>
              <CardDescription>
                View and track your support requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : tickets?.tickets?.length > 0 ? (
                <Table>
                  <TableCaption>Your support ticket history</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.tickets.map((ticket: Ticket) => (
                      <TableRow 
                        key={ticket.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setActiveTicket(ticket.id)}
                      >
                        <TableCell>{ticket.id}</TableCell>
                        <TableCell>{ticket.subject}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon status={ticket.status} />
                            <Badge variant="outline" className={statusColors[ticket.status]}>
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(ticket.createTime)}</TableCell>
                        <TableCell>{formatDate(ticket.updateTime)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You have no support tickets yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {activeTicket && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>Ticket Details: {activeTicket}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTicket(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {ticketDetailsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : activeTicketData ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">{activeTicketData.subject}</h3>
                      <p className="text-sm text-muted-foreground">
                        Category: {activeTicketData.category}
                      </p>
                      <Badge variant="outline" className={statusColors[activeTicketData.status]}>
                        {activeTicketData.status.charAt(0).toUpperCase() + activeTicketData.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <Accordion type="single" collapsible>
                      <AccordionItem value="description">
                        <AccordionTrigger>Description</AccordionTrigger>
                        <AccordionContent>
                          <div className="whitespace-pre-wrap bg-muted p-3 rounded-md">
                            {activeTicketData.description}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      {activeTicketData.isResolved && (
                        <AccordionItem value="resolution">
                          <AccordionTrigger>Resolution</AccordionTrigger>
                          <AccordionContent>
                            <Alert variant="default" className="bg-green-50 border-green-200">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <AlertTitle>Issue Resolved</AlertTitle>
                              <AlertDescription>
                                {activeTicketData.resolution?.message || "This issue has been resolved."}
                              </AlertDescription>
                            </Alert>
                            
                            {activeTicketData.resolution?.steps && activeTicketData.resolution.steps.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-semibold mb-2">Steps Taken:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  {activeTicketData.resolution.steps.map((step, index) => (
                                    <li key={index} className="text-sm">{step}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>Created: {formatDate(activeTicketData.createTime)}</p>
                      <p>Last Updated: {formatDate(activeTicketData.updateTime)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Could not load ticket details.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Common Issues & Solutions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="login-issues">
            <AccordionTrigger>Login Problems</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p>If you're having trouble logging in, try these steps:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Clear your browser cookies and cache</li>
                  <li>Make sure you're using the correct email and password</li>
                  <li>Try using a different browser</li>
                  <li>Check if you have any browser extensions that might be blocking cookies</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="odds-not-updating">
            <AccordionTrigger>Odds Not Updating</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p>If betting odds aren't refreshing properly:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Try refreshing the page using the refresh button</li>
                  <li>Check your internet connection</li>
                  <li>Clear your browser cache</li>
                  <li>Ensure you don't have any ad blockers that might be preventing the odds feed</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="live-event-lag">
            <AccordionTrigger>Live Event Display Lag</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p>If you're experiencing delays in live event updates:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Check your internet connection speed</li>
                  <li>Close other bandwidth-intensive applications</li>
                  <li>Try refreshing the page</li>
                  <li>Use a wired connection instead of WiFi if possible</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="notification-issues">
            <AccordionTrigger>Notification Problems</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p>If you're not receiving bet notifications:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Check your browser notification settings</li>
                  <li>Ensure notifications are enabled for WeParlay.io</li>
                  <li>Check your account notification preferences</li>
                  <li>Make sure you're not in Do Not Disturb mode</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}