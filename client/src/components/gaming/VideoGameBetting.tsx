import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PlusCircle, Trophy, Gamepad2, Users, Coins } from "lucide-react";

// Popular video games for betting
const popularGames = [
  { id: "lol", name: "League of Legends" },
  { id: "dota2", name: "Dota 2" },
  { id: "csgo", name: "CS:GO" },
  { id: "fortnite", name: "Fortnite" },
  { id: "valorant", name: "Valorant" },
  { id: "cod", name: "Call of Duty" },
  { id: "fifa", name: "FIFA" },
  { id: "madden", name: "Madden NFL" },
  { id: "nba2k", name: "NBA 2K" },
  { id: "rocketleague", name: "Rocket League" },
  { id: "apex", name: "Apex Legends" },
  { id: "overwatch", name: "Overwatch" },
  { id: "pubg", name: "PUBG" },
  { id: "undisputed", name: "Undisputed" },
  { id: "custom", name: "Custom Game" }
];

// Currency options
const currencyOptions = [
  { id: "usd", name: "USD ($)", icon: "$" },
  { id: "weparlay", name: "WeParlay Cash", icon: "🎮" },
  { id: "btc", name: "Bitcoin (₿)", icon: "₿" },
  { id: "eth", name: "Ethereum (Ξ)", icon: "Ξ" },
  { id: "sol", name: "Solana (◎)", icon: "◎" },
  { id: "wept", name: "WePlay Token", icon: "🎯" }
];

// Bet types
const betTypes = [
  { id: "match_winner", name: "Match Winner" },
  { id: "player_vs_player", name: "Player vs Player" },
  { id: "tournament_winner", name: "Tournament Winner" },
  { id: "firstblood", name: "First Blood/Kill" },
  { id: "kills", name: "Total Kills" },
  { id: "custom", name: "Custom Condition" }
];

// Form schema for creating a video game bet
const videoGameBetSchema = z.object({
  gameId: z.string().min(1, "Please select a game"),
  customGame: z.string().optional(),
  betType: z.string().min(1, "Please select a bet type"),
  customBetCondition: z.string().optional(),
  team1: z.string().min(1, "Please enter first team/player name"),
  team2: z.string().min(1, "Please enter second team/player name"),
  odds: z.object({
    team1: z.number().min(-10000).max(10000),
    team2: z.number().min(-10000).max(10000)
  }),
  amount: z.number().min(1, "Minimum bet amount is 1"),
  currency: z.string().min(1, "Please select a currency"),
  isPublic: z.boolean(),
  useVirtualCurrency: z.boolean()
});

type VideoGameBetFormValues = z.infer<typeof videoGameBetSchema>;

const VideoGameBetting: React.FC = () => {
  const { toast } = useToast();
  const [isCustomGame, setIsCustomGame] = useState(false);
  const [isCustomBetType, setIsCustomBetType] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>("valorant");
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [playerProps, setPlayerProps] = useState<any[]>([]);

  // Default form values
  const defaultValues: VideoGameBetFormValues = {
    gameId: "",
    customGame: "",
    betType: "match_winner",
    customBetCondition: "",
    team1: "",
    team2: "",
    odds: {
      team1: -110,
      team2: -110
    },
    amount: 10,
    currency: "weparlay",
    isPublic: true,
    useVirtualCurrency: true
  };

  const form = useForm<VideoGameBetFormValues>({
    resolver: zodResolver(videoGameBetSchema),
    defaultValues
  });

  // Form submission handler
  const onSubmit = async (data: VideoGameBetFormValues) => {
    try {
      // Format bet details for API
      const gameName = isCustomGame ? data.customGame : popularGames.find(g => g.id === data.gameId)?.name;
      const betTypeName = isCustomBetType ? data.customBetCondition : betTypes.find(b => b.id === data.betType)?.name;

      const betData = {
        gameType: gameName,
        tournament: `${data.team1} vs ${data.team2}`,
        team: data.team1, // User's selected team
        amount: data.amount,
        currency: data.useVirtualCurrency ? 'WeParlay Cash' : 'USD'
      };

      const response = await apiRequest('POST', '/api/gaming/bets', betData);

      if (response.ok) {
        const result = await response.json();

        toast({
          title: "Gaming Bet Placed Successfully!",
          description: `${gameName}: ${betTypeName} - $${data.amount} bet placed`,
        });

        // Send invite notification if public
        if (data.isPublic) {
          toast({
            title: "Bet Challenge Created",
            description: "Your bet challenge is now visible to other users!",
            variant: "default"
          });
        }

        // Reset form
        form.reset(defaultValues);
      } else {
        throw new Error('Failed to place gaming bet');
      }
    } catch (error) {
      console.error('Error placing gaming bet:', error);
      toast({
        title: "Error Placing Gaming Bet",
        description: "Failed to place your gaming bet. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle game selection changes
  const handleGameChange = (value: string) => {
    form.setValue("gameId", value);
    setIsCustomGame(value === "custom");
  };

  // Handle bet type selection changes
  const handleBetTypeChange = (value: string) => {
    form.setValue("betType", value);
    setIsCustomBetType(value === "custom");
  };

  // Toggle between real and virtual currency
  const handleCurrencyToggle = (checked: boolean) => {
    form.setValue("useVirtualCurrency", checked);
    if (checked) {
      form.setValue("currency", "weparlay");
    } else {
      form.setValue("currency", "usd");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="border border-muted">
        <CardHeader className="bg-muted/50">
          <div className="flex items-center">
            <Gamepad2 className="h-6 w-6 mr-2 text-primary" />
            <CardTitle>Video Game Betting</CardTitle>
          </div>
          <CardDescription>
            Create custom bets for any video game with WeParlay
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Play Money</span>
                  <Switch 
                    checked={form.watch("useVirtualCurrency")}
                    onCheckedChange={handleCurrencyToggle}
                  />
                  <span className="text-sm font-medium ml-2">
                    {form.watch("useVirtualCurrency") ? "WeParlay Cash" : "Real Money"}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Public Challenge</span>
                  <Switch 
                    checked={form.watch("isPublic")}
                    onCheckedChange={(checked) => form.setValue("isPublic", checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="gameId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Game</FormLabel>
                        <Select 
                          onValueChange={handleGameChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a video game" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {popularGames.map((game) => (
                              <SelectItem key={game.id} value={game.id}>
                                {game.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isCustomGame && (
                    <FormField
                      control={form.control}
                      name="customGame"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Game Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter custom game name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="betType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bet Type</FormLabel>
                        <Select 
                          onValueChange={handleBetTypeChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select bet type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {betTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isCustomBetType && (
                    <FormField
                      control={form.control}
                      name="customBetCondition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Bet Condition</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., First to 10 kills" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="team1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team/Player 1</FormLabel>
                          <FormControl>
                            <Input placeholder="Team or player name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="team2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team/Player 2</FormLabel>
                          <FormControl>
                            <Input placeholder="Team or player name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="odds.team1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch("team1") || "Team 1"} Odds
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          American odds format (e.g., -110)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="odds.team2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch("team2") || "Team 2"} Odds
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bet Amount</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field: currencyField }) => (
                            <Select 
                              onValueChange={currencyField.onChange}
                              defaultValue={currencyField.value}
                              disabled={form.watch("useVirtualCurrency")}
                            >
                              <FormControl>
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue placeholder="Currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {currencyOptions.map((currency) => (
                                  <SelectItem key={currency.id} value={currency.id}>
                                    {currency.icon} {currency.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />

                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            className="flex-1"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                {form.watch("isPublic") ? "Create Betting Challenge" : "Create Private Bet"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoGameBetting;