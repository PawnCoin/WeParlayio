import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfilePictureUpload from "@/components/user/ProfilePictureUpload";
import { AlertTriangle, Check, Copy, Gift, History, MessageCircle, Search, ShieldCheck, Trophy, UserMinus, UserPlus, Users, X } from "lucide-react";

const zones = ["America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Australia/Sydney"];

export default function UserProfile() {
  const { user } = useAuth();
  const currentUser = (user || {}) as any;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [profileImage, setProfileImage] = useState(currentUser.profileImageUrl || "");
  const [search, setSearch] = useState("");
  const [timeZone, setTimeZone] = useState(() => localStorage.getItem("weparlay-time-zone") || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [chatFriend, setChatFriend] = useState<any>(null);
  const [temporaryMessages, setTemporaryMessages] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [social, setSocial] = useState(() => JSON.parse(localStorage.getItem("weparlay-social-links") || '{"instagram":"","x":"","tiktok":""}'));
  const { data: friendData = { friends: [], pending: [] } } = useQuery<any>({ queryKey: ["/api/profile/friends"], enabled: Boolean(user) });
  const { data: searchData = { users: [] } } = useQuery<any>({
    queryKey: ["/api/profile/friends/search", search],
    queryFn: async () => {
      if (search.trim().length < 2) return { users: [] };
      const response = await apiRequest("GET", "/api/profile/friends/search?q=" + encodeURIComponent(search.trim()));
      return response.json();
    },
    enabled: Boolean(user) && search.trim().length >= 2,
  });
  const { data: betData = { challenges: [] } } = useQuery<any>({ queryKey: ["/api/p2p-betting/challenges/mine"], enabled: Boolean(user) });
  const { data: p2pData = { stats: {} } } = useQuery<any>({ queryKey: ["/api/p2p-betting/stats"], enabled: Boolean(user) });
  const friendAction = useMutation({
    mutationFn: ({ method, id, action = "" }: { method: "POST" | "DELETE"; id: string; action?: string }) => apiRequest(method, "/api/profile/friends/" + id + action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/profile/friends"] }),
    onError: (error: Error) => toast({ title: "Friend action failed", description: error.message, variant: "destructive" }),
  });
  if (!user) return <Card className="m-6"><CardContent className="p-10 text-center"><h1 className="text-xl font-bold">Sign in to open your profile</h1><Link href="/auth"><Button className="mt-4">Sign in</Button></Link></CardContent></Card>;

  const wins = Number(currentUser.wins ?? currentUser.winsCount ?? 0);
  const totalBets = Number(currentUser.totalBets ?? currentUser.betsCount ?? 0);
  const losses = Math.max(0, totalBets - wins);
  const won = Number(currentUser.totalWinnings || 0);
  const wagered = Number(currentUser.totalWagered || (currentUser.averageBet || 0) * totalBets);
  const referralCode = currentUser.inviteCode || currentUser.referralCode || currentUser.id || "";
  const referralLink = window.location.origin + "/signup?ref=" + encodeURIComponent(referralCode);
  const receivedBets = (betData.challenges || []).filter((item: any) => item.challengeeId === currentUser.id || (item.status === "open" && !item.isPublic));
  const privateStats = p2pData.stats || {};
  const stats = [
    ["Record", wins + "–" + losses], ["Challenges", String(privateStats.totalChallenges || 0)],
    ["Challenge wins", String(privateStats.wonChallenges || 0)], ["Win rate", ((Number(privateStats.winRate) || 0) * 100).toFixed(1) + "%"],
    ["Total winnings", "USD " + Number(privateStats.totalWinnings || won).toLocaleString()], ["Wagered", "USD " + wagered.toLocaleString()],
    ["WeParlay Cash", Number(currentUser.weparlayCashBalance || currentUser.balance || 10000).toLocaleString()],
    ["Cash", "USD " + Number(currentUser.cashBalance || 0).toLocaleString()], ["Friends", String(friendData.friends?.length || 0)]
  ];
  const savePreferences = () => {
    localStorage.setItem("weparlay-time-zone", timeZone);
    localStorage.setItem("weparlay-social-links", JSON.stringify(social));
    toast({ title: "Profile preferences saved" });
  };
  const closeConversation = () => { setChatFriend(null); setTemporaryMessages([]); setDraft(""); };

  return <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
    <Card><CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center">
      <ProfilePictureUpload currentImageUrl={profileImage} onImageUpdate={setProfileImage} />
      <div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="text-3xl font-black">@{currentUser.username || currentUser.firstName || "player"}</h1><Badge>{currentUser.tier || "Bronze"} tier</Badge>{currentUser.emailVerified && <Badge variant="outline"><ShieldCheck className="mr-1 h-3 w-3" />Verified</Badge>}</div><p className="mt-1 text-muted-foreground">{currentUser.firstName} {currentUser.lastName} · {timeZone.replaceAll("_", " ")}</p></div>
      <Link href="/support"><Button variant="outline"><AlertTriangle className="mr-2 h-4 w-4" />Report a problem</Button></Link>
    </CardContent></Card>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{stats.map(([label, value]) => <Card key={label}><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">{label}</div><div className="mt-1 text-lg font-black">{value}</div></CardContent></Card>)}</div>
    <Tabs defaultValue="overview">
      <TabsList className="grid h-auto grid-cols-2 md:grid-cols-5"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="bets">Bet inbox</TabsTrigger><TabsTrigger value="friends">Friends</TabsTrigger><TabsTrigger value="rewards">Rewards</TabsTrigger><TabsTrigger value="settings">Settings</TabsTrigger></TabsList>
      <TabsContent value="overview" className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Balances and verification</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex justify-between"><span>WeParlay Cash</span><strong>{Number(currentUser.weparlayCashBalance || currentUser.balance || 10000).toLocaleString()}</strong></div><div className="flex justify-between"><span>Debit-card balance</span><strong>USD {Number(currentUser.cashBalance || 0).toLocaleString()}</strong></div><p className="text-xs text-muted-foreground">Debit-card wagering requires your real identity, legal age, location, and jurisdiction to be verified. It remains disabled until payment and compliance approval are complete.</p><Link href="/security-settings" className="text-emerald-500">Manage identity and verification →</Link></CardContent></Card>
        <Card><CardHeader><CardTitle>Contact and social</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>{currentUser.email || "No email added"}</p><p>{currentUser.phone || currentUser.phoneNumber || "No phone added"}</p><p>Instagram: {social.instagram || "Not added"}</p><p>X: {social.x || "Not added"}</p><p>TikTok: {social.tiktok || "Not added"}</p></CardContent></Card>
      </TabsContent>
      <TabsContent value="bets"><Card><CardHeader><CardTitle>Received and recent bets</CardTitle></CardHeader><CardContent className="space-y-3">{receivedBets.length ? receivedBets.map((bet: any) => <div key={bet.id} className="flex justify-between rounded-lg border p-3"><div><strong>{bet.gameDetails?.awayTeam} at {bet.gameDetails?.homeTeam}</strong><p className="text-sm text-muted-foreground">{bet.betAmount} WeParlay Cash</p></div><Badge>{bet.status}</Badge></div>) : <p className="py-8 text-center text-muted-foreground">No received bets yet.</p>}<Link href="/my-bets" className="inline-flex items-center text-sm text-emerald-500"><History className="mr-2 h-4 w-4" />Complete bet history</Link></CardContent></Card></TabsContent>
      <TabsContent value="friends" className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle><Search className="mr-2 inline h-5 w-5" />Find players</CardTitle></CardHeader><CardContent><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search username or email" /><div className="mt-3 space-y-2">{searchData.users?.map((person: any) => <div key={person.id} className="flex items-center justify-between rounded-lg border p-3"><span>@{person.username || person.email}</span><Button size="sm" onClick={() => friendAction.mutate({ method: "POST", id: person.id, action: "/request" })}><UserPlus className="mr-1 h-4 w-4" />Add</Button></div>)}</div></CardContent></Card>
        <Card><CardHeader><CardTitle><Users className="mr-2 inline h-5 w-5" />Friends and requests</CardTitle></CardHeader><CardContent className="space-y-2">{friendData.pending?.map((person: any) => <div key={person.id} className="flex items-center justify-between rounded-lg border p-3"><span>@{person.username || person.email}</span><Button size="sm" onClick={() => friendAction.mutate({ method: "POST", id: person.id, action: "/accept" })}><Check className="mr-1 h-4 w-4" />Accept</Button></div>)}{friendData.friends?.map((person: any) => <div key={person.id} className="flex items-center justify-between rounded-lg border p-3"><div className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarImage src={person.profileImageUrl} /><AvatarFallback>{(person.username || "U")[0]}</AvatarFallback></Avatar><span>@{person.username || person.email}</span></div><div><Button size="icon" variant="ghost" onClick={() => setChatFriend(person)}><MessageCircle className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => friendAction.mutate({ method: "DELETE", id: person.id })}><UserMinus className="h-4 w-4" /></Button></div></div>)}{!friendData.pending?.length && !friendData.friends?.length && <p className="py-8 text-center text-muted-foreground">Add your first friend.</p>}</CardContent></Card>
      </TabsContent>
      <TabsContent value="rewards" className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle><Gift className="mr-2 inline h-5 w-5" />Referral link</CardTitle></CardHeader><CardContent><div className="flex gap-2"><Input readOnly value={referralLink} /><Button size="icon" onClick={() => { navigator.clipboard.writeText(referralLink); toast({ title: "Referral link copied" }); }}><Copy className="h-4 w-4" /></Button></div><p className="mt-3 text-sm text-muted-foreground">Tier-purchase reward: 10,000 WeParlay Cash, USD 5 locked cash, and one tier increase.</p></CardContent></Card>
        <Card><CardHeader><CardTitle><Trophy className="mr-2 inline h-5 w-5" />Rewards</CardTitle></CardHeader><CardContent className="space-y-2"><Reward label="Welcome reward" value="10,000 WeParlay Cash" earned /><Reward label="Successful referral" value="10,000 WeParlay Cash" earned={Number(currentUser.inviteCount || 0) > 0} /><Reward label="Tier purchase referral" value="USD 5 + tier increase" /></CardContent></Card>
      </TabsContent>
      <TabsContent value="settings"><Card><CardHeader><CardTitle>Social links and time zone</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><select value={timeZone} onChange={event => setTimeZone(event.target.value)} className="rounded-md border bg-background p-2">{zones.map(zone => <option key={zone}>{zone}</option>)}</select>{["instagram", "x", "tiktok"].map(network => <Input key={network} value={social[network]} onChange={event => setSocial((value: any) => ({ ...value, [network]: event.target.value }))} placeholder={"Your " + network + " profile"} />)}<Button onClick={savePreferences}>Save preferences</Button></CardContent></Card></TabsContent>
    </Tabs>
    {chatFriend && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"><Card className="w-full max-w-md"><CardHeader className="flex-row items-center justify-between"><CardTitle>Temporary chat with @{chatFriend.username}</CardTitle><Button size="icon" variant="ghost" onClick={closeConversation}><X /></Button></CardHeader><CardContent><p className="mb-3 text-xs text-muted-foreground">Messages are deleted from this device when this conversation closes.</p><div className="mb-3 space-y-2">{temporaryMessages.map((message, index) => <div key={index} className="rounded-lg bg-muted p-2 text-sm">{message}</div>)}</div><div className="flex gap-2"><Input value={draft} maxLength={200} onChange={event => setDraft(event.target.value)} /><Button onClick={() => { if (draft.trim()) setTemporaryMessages(items => [...items, draft.trim()]); setDraft(""); }}>Send</Button></div></CardContent></Card></div>}
  </div>;
}

function Reward({ label, value, earned = false }: { label: string; value: string; earned?: boolean }) {
  return <div className="flex items-center justify-between rounded-lg border p-3"><div><strong>{label}</strong><p className="text-xs text-muted-foreground">{value}</p></div><Badge variant={earned ? "default" : "outline"}>{earned ? "Earned" : "Available"}</Badge></div>;
}
