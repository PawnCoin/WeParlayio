
import { Channel } from '../types';

const parseAttribute = (line: string, attributeName: string): string => {
  const match = line.match(new RegExp(`${attributeName}="(.*?)"`));
  return match ? match[1] : '';
};

export const parseM3U = (m3uContent: string): Channel[] => {
  const lines = m3uContent.split('\n').filter(line => line.trim() !== '');
  const channels: Channel[] = [];

  if (!lines[0] || !lines[0].startsWith('#EXTM3U')) {
    console.warn('M3U file does not start with #EXTM3U');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF')) {
      const nextLine = lines[i + 1];
      if (nextLine && !nextLine.startsWith('#')) {
        const nameMatch = line.match(/,(.+)$/);
        const name = nameMatch ? nameMatch[1].trim() : 'Unknown Channel';
        const logo = parseAttribute(line, 'tvg-logo');
        const tvgId = parseAttribute(line, 'tvg-id');
        const group = parseAttribute(line, 'group-title');
        const url = nextLine.trim();

        if (url) {
            channels.push({ name, logo, url, tvgId, group });
        }
        
        i++; // Skip the URL line in the next iteration
      }
    }
  }

  return channels;
};
