import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import LiveScoresTicker from "@/components/LiveScoresTicker";
import { CalendarDays, Clock3, Radio, ShieldCheck, Trophy, UsersRound, WalletCards } from "lucide-react";

const sports = ["All", "NFL", "NBA", "MLB", "NHL", "Soccer", "Tennis", "Golf", "Combat"];

function isToday(value: string | undefined, timeZone: string) {
  if (!value) return true;
  const date = new Date(value);
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone });
  return formatter.format(date) === formatter.format(now);
}

export default function Home() {
  const [sport, setSport] = useState("All");
  const [timeZone, setTimeZone] = useState(() => localStorage.getItem("weparlay-time-zone") || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const { data: scheduleResponse, isLoading } = useQuery<any>({
    queryKey: ["/api/events/today"],
    refetchInterval: 30_000,
  });
  const rawGames = scheduleResponse?.events || [];
  const games = useMemo(() => (Array.isArray(rawGames) ? rawGames : []).filter((game: any) => {
    const matchesDate = isToday(game.startTime || game.date, timeZone);
    const matchesSport = sport === "All" || String(game.sport || game.league || "").toLowerCase().includes(sport.toLowerCase());
    return matchesDate && matchesSport;
  }), [rawGames, sport, timeZone]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 p-6 text-white">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <Badge className="mb-3 bg-emerald-400 text-black">TODAY ONLY</Badge>
            <h1 className="text-3xl font-black md:text-4xl">Today’s games. One slip. Live results.</h1>
            <p className="mt-2 max-w-2xl text-slate-300">Bet spreads, moneylines, totals, or create a challenge for one or many opponents. Stakes are reserved before a bet can go live.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/custom-bets"><Button className="bg-emerald-400 text-black hover:bg-emerald-300"><UsersRound className="mr-2 h-4 w-4" />Create custom bet</Button></Link>
            <Link href="/live-tv"><Button variant="outline" className="border-white/30 bg-white/5 text-white"><Radio className="mr-2 h-4 w-4" />Live TV</Button></Link>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-2">
        <Clock3 className="h-4 w-4 text-muted-foreground" />
        <label htmlFor="profile-time-zone" className="text-xs text-muted-foreground">Profile time zone</label>
        <select id="profile-time-zone" value={timeZone} onChange={(event) => {
          setTimeZone(event.target.value);
          localStorage.setItem("weparlay-time-zone", event.target.value);
        }} className="rounded-md border bg-background px-2 py-1 text-sm">
          {["America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Australia/Sydney"].map(zone => <option key={zone} value={zone}>{zone.replaceAll("_", " ")}</option>)}
        </select>
      </div>
      <LiveScoresTicker timeZone={timeZone} />

      <section className="grid gap-3 md:grid-cols-3">
        <Link href="/tournaments"><Card className="h-full border-amber-500/30 bg-amber-500/5 transition hover:-translate-y-0.5"><CardContent className="p-5"><Trophy className="mb-3 text-amber-500" /><h2 className="font-bold">Daily bookie tournament</h2><p className="mt-1 text-sm text-muted-foreground">The only mode where players bet against the house. One customizable tournament per day.</p></CardContent></Card></Link>
        <Link href="/custom-bets"><Card className="h-full border-blue-500/30 bg-blue-500/5 transition hover:-translate-y-0.5"><CardContent className="p-5"><UsersRound className="mb-3 text-blue-500" /><h2 className="font-bold">Open custom bets</h2><p className="mt-1 text-sm text-muted-foreground">Browse rooms by category, see the join deadline, chat up to 200 characters, then challenge.</p></CardContent></Card></Link>
        <Link href="/security-settings"><Card className="h-full border-emerald-500/30 bg-emerald-500/5 transition hover:-translate-y-0.5"><CardContent className="p-5"><ShieldCheck className="mb-3 text-emerald-500" /><h2 className="font-bold">Verified play</h2><p className="mt-1 text-sm text-muted-foreground">Identity, age, location, sanctions, and payment checks are required before real-money or crypto play.</p></CardContent></Card></Link>
      </section>

      <section>
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div><h2 className="text-2xl font-black">Games on {new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric" }).format(new Date())}</h2><p className="text-sm text-muted-foreground">Times display in your profile time zone.</p></div>
          <div className="flex flex-wrap gap-2">{sports.map(name => <Button key={name} size="sm" variant={sport === name ? "default" : "outline"} onClick={() => setSport(name)}>{name}</Button>)}</div>
        </div>
        {isLoading ? <div className="space-y-3"><Skeleton className="h-40" /><Skeleton className="h-40" /></div> : games.length ? (
          <div className="grid gap-4 xl:grid-cols-2">{games.map((game: any) => {
            const home = game.homeTeam?.name || "Home";
            const away = game.awayTeam?.name || "Away";
            const live = game.status === "live";
            const final = game.status === "final";
            return <Card key={game.id} className="overflow-hidden"><CardContent className="p-0"><div className="flex items-center justify-between border-b p-4"><div><div className="flex items-center gap-2"><Badge variant={live ? "destructive" : "secondary"}>{live ? "LIVE" : final ? "FINAL" : "UPCOMING"}</Badge><span className="text-xs text-muted-foreground">{game.sport}</span></div><h3 className="mt-2 text-lg font-bold">{away} <span className="text-muted-foreground">@</span> {home}</h3>{(live || final) && game.homeTeam?.score !== null && game.awayTeam?.score !== null && <p className="mt-1 text-sm font-semibold">{away} {game.awayTeam.score} – {home} {game.homeTeam.score} <span className="text-muted-foreground">· {game.statusDetail}</span></p>}</div><Link href="/live-tv"><Button size="sm" variant="outline"><Radio className="mr-2 h-4 w-4" />Watch</Button></Link></div><div className="p-4 text-sm text-muted-foreground">Verified game data from {game.source}. Betting lines appear only when a licensed odds provider is connected.</div></CardContent></Card>;
          })}</div>
        ) : <Card><CardContent className="flex flex-col items-center py-12 text-center"><CalendarDays className="mb-3 h-8 w-8 text-muted-foreground" /><h3 className="font-bold">No games returned for this filter</h3><p className="text-sm text-muted-foreground">The live sports provider will populate today’s schedule here.</p></CardContent></Card>}
      </section>

      <section className="rounded-xl border bg-card p-5"><div className="flex gap-3"><WalletCards className="text-emerald-500" /><div><h3 className="font-bold">Accepted value</h3><p className="text-sm text-muted-foreground">$PC on supported EVM, Solana and other configured chains; $DIG and $Ru on Polygon. Final token logos, contract addresses, confirmations, and risk information must be supplied before activation.</p></div></div></section>
    </div>
  );
}
