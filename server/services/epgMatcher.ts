import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

type Channel = { id: string; name: string; url: string; logo?: string; group: string };
type Programme = { channel: string; start: Date; stop: Date; title: string };
let channelCache: Channel[] | undefined;
let guideCache: Programme[] | undefined;

const decode = (value: string) => value.replace(/&amp;/g, "&").replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const xmlTime = (value: string) => new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(8, 10)}:${value.slice(10, 12)}:${value.slice(12, 14)}${value.includes("-") ? "-" : "+"}${value.slice(-5, -2)}:${value.slice(-2)}`);

async function channels() {
  if (channelCache) return channelCache;
  const playlist = await readFile(resolve(process.cwd(), "server/data/authorized-sports.m3u"), "utf8");
  const lines = playlist.split(/\r?\n/); const result: Channel[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!lines[i].startsWith("#EXTINF:")) continue;
    const url = lines[i + 1]?.trim(); if (!url || url.startsWith("#")) continue;
    const meta = lines[i], id = /tvg-id="([^"]+)"/.exec(meta)?.[1]; if (!id) continue;
    result.push({ id, url, name: meta.slice(meta.lastIndexOf(",") + 1).trim(), logo: /tvg-logo="([^"]+)"/.exec(meta)?.[1], group: /group-title="([^"]+)"/.exec(meta)?.[1] ?? "Sports" }); i += 1;
  }
  return channelCache = result;
}

async function guide() {
  if (guideCache) return guideCache;
  const path = process.env.WEPARLAY_EPG_PATH;
  if (!path) return [];
  const xml = await readFile(resolve(path), "utf8"); const result: Programme[] = [];
  for (const match of xml.matchAll(/<programme\s+([^>]+)>([\s\S]*?)<\/programme>/g)) {
    const attrs = match[1], channel = /channel="([^"]+)"/.exec(attrs)?.[1], start = /start="(\d{14}\s*[+-]\d{4})"/.exec(attrs)?.[1], stop = /stop="(\d{14}\s*[+-]\d{4})"/.exec(attrs)?.[1], title = /<title[^>]*>([\s\S]*?)<\/title>/.exec(match[2])?.[1];
    if (channel && start && stop && title) result.push({ channel, start: xmlTime(start.replace(/\s/g, "")), stop: xmlTime(stop.replace(/\s/g, "")), title: decode(title.replace(/<[^>]+>/g, "").trim()) });
  }
  return guideCache = result;
}

export async function matchLiveBroadcast(homeTeam: string, awayTeam: string, at = new Date()) {
  const [allChannels, programs] = await Promise.all([channels(), guide()]);
  const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const home = normalized(homeTeam), away = normalized(awayTeam);
  const program = programs.find(item => item.start <= at && item.stop >= at && normalized(item.title).includes(home) && normalized(item.title).includes(away));
  if (!program) return null;
  const channel = allChannels.find(item => item.id === program.channel);
  return channel ? { ...channel, programme: program.title, startsAt: program.start, endsAt: program.stop } : null;
}
