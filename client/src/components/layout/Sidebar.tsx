import { Link, useLocation } from "wouter";
import { CalendarDays, CircleDollarSign, History, Radio, ShieldCheck, Trophy, UserRound, UsersRound, X } from "lucide-react";

const sections = [
  { href: "/", label: "Today's Games", icon: CalendarDays },
  { href: "/custom-bets", label: "Custom Bet Rooms", icon: UsersRound },
  { href: "/tournaments", label: "Daily Tournament", icon: Trophy },
  { href: "/live-tv", label: "Live TV", icon: Radio },
  { href: "/my-bets", label: "My Bets & Results", icon: History },
  { href: "/profile", label: "Profile & Rewards", icon: UserRound },
  { href: "/banking", label: "Wallet & Cashier", icon: CircleDollarSign },
  { href: "/security-settings", label: "Identity & Security", icon: ShieldCheck },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();
  return (
    <aside className="h-full bg-background border-r border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Link href="/" className="font-black text-xl tracking-tight"><span className="text-blue-500">We</span>Parlay<span className="text-emerald-500">.io</span></Link>
        {onClose && <button aria-label="Close menu" onClick={onClose}><X className="h-5 w-5" /></button>}
      </div>
      <div className="px-4 pt-5 pb-2 text-[11px] uppercase tracking-[.2em] text-muted-foreground">Betting</div>
      <nav className="px-3 space-y-1">
        {sections.map(({ href, label, icon: Icon }) => {
          const active = location === href;
          return <Link key={href} href={href} onClick={onClose} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${active ? "bg-emerald-500 text-black" : "hover:bg-muted"}`}><Icon className="h-5 w-5" />{label}</Link>;
        })}
      </nav>
      <div className="m-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
        <div className="font-bold text-amber-500">10,000 WeParlay Cash</div>
        <p className="mt-1 text-xs text-muted-foreground">Every verified new account starts with play cash at a 1:1 display value with USD.</p>
      </div>
    </aside>
  );
}
