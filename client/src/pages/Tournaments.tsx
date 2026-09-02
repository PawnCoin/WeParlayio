import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Radio, MessageCircle, Trophy, Users, WalletCards, AlertTriangle, Clock3 } from "lucide-react";

const excluded = /golf|nascar|formula|racing|cycling/i;
const teamName = (value: any, side: "home" | "away") => value?.[side + "Team"]?.name || value?.competitors?.find((item: any) => item.homeAway === side)?.name || value?.[side + "Team"] || (side === "home" ? "Home" : "Away");

export default function Tournaments() {
  const params = useParams<{ id?: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const currentUser = (user || {}) as any;
  const [name, setName] = useState("Today's Pick Tournament");
  const [format, setFormat] = useState<"daily" | "march_madness">("daily");
  const [entryFee, setEntryFee] = useState("100");
  const [selectedEvents, setSelectedEvents] = useState<any[]>([]);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [chat, setChat] = useState("");
  const { data: games = [] } = useQuery<any[]>({ queryKey: ["/api/events/live"], refetchInterval: 30000 });
  const { data: listData = { tournaments: [] } } = useQuery<any>({ queryKey: ["/api/tournaments"], refetchInterval: 30000 });
  const { data: detailData } = useQuery<any>({ queryKey: ["/api/tournaments", params.id], queryFn: async () => {
    const response = await apiRequest("GET", "/api/tournaments/" + params.id); return response.json();
  }, enabled: Boolean(params.id), refetchInterval: 15000 });
  const tournament = detailData?.tournament;
  const today = new Date().toISOString().slice(0, 10);
  const eligibleGames = useMemo(() => (Array.isArray(games) ? games : []).filter((game: any) => {
    const time = game.startTime || game.date;
    return time && new Date(time).toISOString().slice(0, 10) === today && !excluded.test(game.sport || game.league || "") && teamName(game, "home") && teamName(game, "away");
  }), [games, today]);
  const mutate = useMutation({
    mutationFn: async ({ method, url, data }: any) => apiRequest(method, url, data),
    onSuccess: async response => {
      const body = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      if (body.tournament?.id && !params.id) window.location.href = "/tournaments/" + body.tournament.id;
      else queryClient.invalidateQueries({ queryKey: ["/api/tournaments", params.id] });
    },
    onError: (error: Error) => toast({ title: "Tournament action failed", description: error.message, variant: "destructive" }),
  });
  const create = () => mutate.mutate({ method: "POST", url: "/api/tournaments", data: {
    name, format, entryFee: Number(entryFee), currency: "weparlay_cash",
    events: selectedEvents.map(game => ({ id: String(game.id), sport: game.sport || game.league || "Sports", startTime: game.startTime || game.date, homeTeam: teamName(game, "home"), awayTeam: teamName(game, "away"), status: game.status, homeScore: game.homeScore, awayScore: game.awayScore }))
  }});
  const max = format === "march_madness" ? 68 : 8;

  if (!params.id) return <div className="mx-auto max-w-7xl space-y-6 p-4">
    <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-950 via-amber-950 to-slate-950 p-6 text-white"><Badge className="bg-amber-400 text-black">HOUSE MODE · ONCE DAILY</Badge><h1 className="mt-3 text-3xl font-black">Daily prediction tournaments</h1><p className="mt-2 text-slate-300">Fund the shared pot first, then predict each same-day match. Most correct picks win; tied leaders split the verified pot.</p></section>
    <div className="grid gap-5 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Create today’s tournament</CardTitle></CardHeader><CardContent className="space-y-4"><Input value={name} onChange={event => setName(event.target.value)} placeholder="Tournament name" /><div className="grid grid-cols-2 gap-2"><Button variant={format === "daily" ? "default" : "outline"} onClick={() => setFormat("daily")}>Up to 8 events</Button><Button variant={format === "march_madness" ? "default" : "outline"} onClick={() => setFormat("march_madness")}>March Madness · 68</Button></div><Input type="number" min="1" value={entryFee} onChange={event => setEntryFee(event.target.value)} placeholder="Entry fee" /><div className="rounded-lg border bg-muted/30 p-3 text-sm"><WalletCards className="mr-2 inline h-4 w-4" />Creator entry of {entryFee || "0"} WeParlay Cash is reserved on creation. Real money and crypto remain locked pending compliance.</div><div><div className="mb-2 flex justify-between text-sm font-bold"><span>Today’s eligible head-to-head events</span><span>{selectedEvents.length}/{max}</span></div><div className="max-h-80 space-y-2 overflow-y-auto">{eligibleGames.map((game: any) => { const checked = selectedEvents.some(item => item.id === game.id); return <button key={game.id} onClick={() => setSelectedEvents(items => checked ? items.filter(item => item.id !== game.id) : items.length < max ? [...items, game] : items)} className={"w-full rounded-lg border p-3 text-left " + (checked ? "border-emerald-500 bg-emerald-500/10" : "")}><strong>{teamName(game, "away")} at {teamName(game, "home")}</strong><p className="text-xs text-muted-foreground">{game.sport || game.league} · {new Date(game.startTime || game.date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p></button>})}</div></div><Button className="w-full" disabled={!selectedEvents.length || mutate.isPending} onClick={create}>Fund entry and create tournament</Button></CardContent></Card>
      <Card><CardHeader><CardTitle>Today’s tournament pages</CardTitle></CardHeader><CardContent className="space-y-3">{listData.tournaments.length ? listData.tournaments.map((item: any) => <Link key={item.id} href={"/tournaments/" + item.id} className="block rounded-xl border p-4 transition hover:border-amber-500"><div className="flex justify-between"><strong>{item.name}</strong><Badge>{item.status}</Badge></div><div className="mt-2 flex gap-4 text-sm text-muted-foreground"><span>{item.events.length} events</span><span>{item.entries.length} players</span><span>{item.pot} pot</span></div></Link>) : <p className="py-12 text-center text-muted-foreground">No tournament created today.</p>}</CardContent></Card>
    </div>
  </div>;

  if (!tournament) return <div className="p-10 text-center">Loading tournament…</div>;
  const currentEntry = tournament.entries?.find((item: any) => item.userId === currentUser.id);
  const locked = Date.now() >= new Date(tournament.lockAt).getTime();
  return <div className="mx-auto max-w-7xl space-y-5 p-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><Badge>{locked ? "picks locked" : tournament.status}</Badge><h1 className="mt-2 text-3xl font-black">{tournament.name}</h1><p className="text-sm text-muted-foreground">Picks lock {new Date(tournament.lockAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · settlement after {new Date(tournament.settleAfter).toLocaleTimeString()} · verification required</p></div><div className="flex gap-2"><Link href="/support"><Button variant="outline"><AlertTriangle className="mr-2 h-4 w-4" />Report problem</Button></Link><Link href="/"><Button variant="outline">Bet other games</Button></Link></div></div>
    <div className="grid gap-4 md:grid-cols-4">{[["Pot", tournament.pot + " " + tournament.currency], ["Players", tournament.entries.length], ["Events", tournament.events.length], ["Payout", "Most wins · ties split"]].map(([label, value]) => <Card key={label}><CardContent className="p-4"><div className="text-xs text-muted-foreground">{label}</div><strong>{value}</strong></CardContent></Card>)}</div>
    <Card><CardHeader><CardTitle><Trophy className="mr-2 inline h-5 w-5" />Live standings</CardTitle></CardHeader><CardContent className="space-y-2">{[...tournament.entries].sort((a: any, b: any) => (b.wins || 0) - (a.wins || 0)).map((entry: any, index: number) => <div key={entry.userId} className="flex items-center justify-between rounded-lg border p-3"><div><strong>#{index + 1} {entry.userId === currentUser.id ? "You" : `Player ${entry.userId.slice(-6)}`}</strong><p className="text-xs text-muted-foreground">{entry.status === "submitted" ? "Predictions submitted" : entry.status}</p></div><div className="text-right"><strong>{entry.wins || 0} wins</strong>{entry.payout != null && <p className="text-xs text-emerald-500">+{entry.payout} WeParlay Cash</p>}</div></div>)}</CardContent></Card>
    {!currentEntry && <Button disabled={locked} onClick={() => mutate.mutate({ method: "POST", url: "/api/tournaments/" + tournament.id + "/fund", data: { currency: "weparlay_cash" } })}>{locked ? "Tournament entry is locked" : `Fund ${tournament.entryFee} WeParlay Cash before picks`}</Button>}
    <div className="grid gap-4 lg:grid-cols-3"><div className="space-y-3 lg:col-span-2">{tournament.events.map((storedEvent: any, index: number) => { const live = (games as any[]).find(game => String(game.id) === storedEvent.id) || {}; const event = { ...storedEvent, status: live.status || storedEvent.status, homeScore: live.homeScore ?? live.competitors?.find((item: any) => item.homeAway === "home")?.score ?? storedEvent.homeScore, awayScore: live.awayScore ?? live.competitors?.find((item: any) => item.homeAway === "away")?.score ?? storedEvent.awayScore }; return <Card key={event.id} className="cursor-pointer hover:border-emerald-500" onClick={() => setSelectedMatch(event)}><CardContent className="p-4"><div className="flex justify-between"><div><Badge variant={/live|progress/i.test(event.status || "") ? "destructive" : "secondary"}>{event.status || "upcoming"}</Badge><h3 className="mt-2 font-bold">Match {index + 1}: {event.awayTeam} at {event.homeTeam}</h3><p className="text-xs text-muted-foreground">{event.sport} · {new Date(event.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · Score {event.awayScore ?? "–"}:{event.homeScore ?? "–"}</p></div><Link href="/live-tv" onClick={click => click.stopPropagation()}><Button size="sm" variant="outline"><Radio className="mr-1 h-4 w-4" />Watch live</Button></Link></div>{currentEntry && <div className="mt-3 grid grid-cols-2 gap-2">{[event.awayTeam, event.homeTeam].map((team: string) => <Button key={team} disabled={locked || currentEntry.status === "submitted"} variant={(currentEntry.picks?.[event.id] || picks[event.id]) === team ? "default" : "outline"} onClick={click => { click.stopPropagation(); setPicks(value => ({ ...value, [event.id]: team })); }}>{team}</Button>)}</div>}</CardContent></Card>; })}{currentEntry?.status !== "submitted" && currentEntry && <Button className="w-full" disabled={locked || Object.keys(picks).length !== tournament.events.length} onClick={() => mutate.mutate({ method: "PUT", url: "/api/tournaments/" + tournament.id + "/picks", data: { picks } })}>{locked ? "Predictions locked" : "Submit all predictions"}</Button>}</div>
      <Card><CardHeader><CardTitle><MessageCircle className="mr-2 inline h-5 w-5" />Watcher group chat</CardTitle></CardHeader><CardContent><div className="mb-3 max-h-80 space-y-2 overflow-y-auto">{tournament.chat?.map((item: any) => <div key={item.id} className="rounded-lg bg-muted p-2 text-sm">{item.message}</div>)}</div><Input value={chat} maxLength={200} onChange={event => setChat(event.target.value)} placeholder="Chat with tournament watchers" /><Button className="mt-2 w-full" disabled={!chat.trim()} onClick={() => { mutate.mutate({ method: "POST", url: "/api/tournaments/" + tournament.id + "/chat", data: { message: chat } }); setChat(""); }}>Send</Button><p className="mt-2 text-xs text-muted-foreground">Watching live requires the eligible paid tier. Tournament scores remain visible to everyone.</p></CardContent></Card>
    </div>
    <Dialog open={Boolean(selectedMatch)} onOpenChange={open => !open && setSelectedMatch(null)}><DialogContent><DialogHeader><DialogTitle>{selectedMatch?.awayTeam} at {selectedMatch?.homeTeam}</DialogTitle></DialogHeader>{selectedMatch && <div className="space-y-3"><Badge>{selectedMatch.status || "upcoming"}</Badge><p>{selectedMatch.sport} · {new Date(selectedMatch.startTime).toLocaleString()}</p><p className="text-2xl font-black">{selectedMatch.awayScore ?? "–"} : {selectedMatch.homeScore ?? "–"}</p><Link href="/live-tv"><Button className="w-full"><Radio className="mr-2 h-4 w-4" />Watch live</Button></Link></div>}</DialogContent></Dialog>
  </div>;
}
