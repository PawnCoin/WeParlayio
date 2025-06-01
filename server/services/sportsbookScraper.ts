import { chromium, Browser, Page } from 'playwright';

export interface SportsbookParlay {
  id: string;
  sport: string;
  teams: string;
  legs: {
    team: string;
    pick: string;
    odds: number;
  }[];
  combinedOdds: number;
  minBet: number;
  maxBet: number;
  timestamp: string;
}

export interface PlayerProp {
  id: string;
  sport: string;
  player: string;
  team: string;
  propType: string; // points, rebounds, assists, etc.
  line: number;
  overOdds: number;
  underOdds: number;
  timestamp: string;
}

export class SportsbookScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set user agent and headers to avoid detection
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  }

  async scrapeParlays(): Promise<SportsbookParlay[]> {
    if (!this.page) {
      throw new Error('Scraper not initialized');
    }

    try {
      await this.page.goto('https://sportsbook.ag', { waitUntil: 'networkidle' });
      
      // Wait for parlay section to load
      const parlaySelector = 'div[data-section="parlay"], .parlay-section, .parlays-container';
      
      try {
        await this.page.waitForSelector(parlaySelector, { timeout: 10000 });
      } catch {
        // If specific selector doesn't exist, try generic selectors
        const fallbackSelectors = [
          '.betting-parlays',
          '[data-testid="parlays"]',
          '.parlay-builder',
          '.parlay-odds'
        ];
        
        for (const selector of fallbackSelectors) {
          try {
            await this.page.waitForSelector(selector, { timeout: 5000 });
            break;
          } catch {
            continue;
          }
        }
      }

      // Extract parlay data
      const parlayData = await this.page.evaluate(() => {
        const parlays: any[] = [];
        
        // Look for parlay containers
        const parlayContainers = document.querySelectorAll(
          '.parlay-item, .parlay-option, [data-parlay], .betting-parlay'
        );

        parlayContainers.forEach((container, index) => {
          try {
            const teamsElement = container.querySelector('.teams, .matchup, .game-teams');
            const oddsElement = container.querySelector('.odds, .parlay-odds, .combined-odds');
            const sportElement = container.querySelector('.sport, .league, .sport-name');

            const teams = teamsElement?.textContent?.trim() || `Game ${index + 1}`;
            const oddsText = oddsElement?.textContent?.trim() || '+100';
            const sport = sportElement?.textContent?.trim() || 'Unknown Sport';

            // Parse odds (remove + and convert to number)
            const odds = parseInt(oddsText.replace(/[+\-]/g, '')) || 100;

            parlays.push({
              id: `sportsbook-parlay-${index}`,
              sport: sport,
              teams: teams,
              legs: [
                {
                  team: teams.split(' vs ')[0] || teams,
                  pick: 'Moneyline',
                  odds: odds
                }
              ],
              combinedOdds: odds,
              minBet: 1,
              maxBet: 1000,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.error('Error parsing parlay item:', error);
          }
        });

        return parlays;
      });

      return parlayData;
    } catch (error) {
      console.error('Error scraping parlays:', error);
      return [];
    }
  }

  async scrapePlayerProps(): Promise<PlayerProp[]> {
    if (!this.page) {
      throw new Error('Scraper not initialized');
    }

    try {
      // Look for player props section
      const propsSelector = 'div[data-section="props"], .player-props, .props-section';
      
      try {
        await this.page.waitForSelector(propsSelector, { timeout: 10000 });
      } catch {
        // Try alternative selectors for player props
        const fallbackSelectors = [
          '.betting-props',
          '[data-testid="props"]',
          '.player-betting',
          '.prop-bets'
        ];
        
        for (const selector of fallbackSelectors) {
          try {
            await this.page.waitForSelector(selector, { timeout: 5000 });
            break;
          } catch {
            continue;
          }
        }
      }

      // Extract player props data
      const propsData = await this.page.evaluate(() => {
        const props: any[] = [];
        
        const propContainers = document.querySelectorAll(
          '.prop-item, .player-prop, [data-prop], .betting-prop'
        );

        propContainers.forEach((container, index) => {
          try {
            const playerElement = container.querySelector('.player, .player-name');
            const teamElement = container.querySelector('.team, .team-name');
            const propTypeElement = container.querySelector('.prop-type, .bet-type');
            const lineElement = container.querySelector('.line, .prop-line');
            const overOddsElement = container.querySelector('.over-odds, .over');
            const underOddsElement = container.querySelector('.under-odds, .under');

            const player = playerElement?.textContent?.trim() || `Player ${index + 1}`;
            const team = teamElement?.textContent?.trim() || 'Unknown Team';
            const propType = propTypeElement?.textContent?.trim() || 'Points';
            const line = parseFloat(lineElement?.textContent?.trim() || '0') || 20.5;
            const overOdds = parseInt(overOddsElement?.textContent?.replace(/[+\-]/g, '') || '100') || 100;
            const underOdds = parseInt(underOddsElement?.textContent?.replace(/[+\-]/g, '') || '100') || 100;

            props.push({
              id: `sportsbook-prop-${index}`,
              sport: 'Basketball', // Default, could be parsed from context
              player: player,
              team: team,
              propType: propType,
              line: line,
              overOdds: overOdds,
              underOdds: underOdds,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.error('Error parsing prop item:', error);
          }
        });

        return props;
      });

      return propsData;
    } catch (error) {
      console.error('Error scraping player props:', error);
      return [];
    }
  }

  async scrapeFullSectionData(): Promise<{ parlays: SportsbookParlay[], props: PlayerProp[] }> {
    if (!this.page) {
      await this.initialize();
    }

    // Use your original approach to get raw section data
    try {
      await this.page!.goto('https://sportsbook.ag', { waitUntil: 'networkidle' });
      
      // Extract raw section content using your method
      const rawData = await this.page!.evaluate(() => {
        // Try to find parlay and props sections
        const sections = {
          parlaySection: '',
          propsSection: ''
        };

        // Look for parlay section
        const parlaySelectors = [
          'div[data-section="parlay"]',
          '.parlay-section',
          '.parlays-container',
          '.betting-parlays'
        ];

        for (const selector of parlaySelectors) {
          const element = document.querySelector(selector);
          if (element) {
            sections.parlaySection = element.textContent || '';
            break;
          }
        }

        // Look for props section
        const propsSelectors = [
          'div[data-section="props"]',
          '.props-section', 
          '.player-props',
          '.betting-props'
        ];

        for (const selector of propsSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            sections.propsSection = element.textContent || '';
            break;
          }
        }

        return sections;
      });

      console.log('Scraped Section Data:\n', rawData);

      // Parse the raw data into structured format
      const parlays = await this.scrapeParlays();
      const props = await this.scrapePlayerProps();

      return { parlays, props };
    } catch (error) {
      console.error('Error scraping sportsbook data:', error);
      return { parlays: [], props: [] };
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

// Cache for scraped data
class SportsbookCache {
  private parlaysCache: { data: SportsbookParlay[], timestamp: number } | null = null;
  private propsCache: { data: PlayerProp[], timestamp: number } | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  isParlaysCacheValid(): boolean {
    return this.parlaysCache !== null && 
           (Date.now() - this.parlaysCache.timestamp) < this.CACHE_DURATION;
  }

  isPropsCacheValid(): boolean {
    return this.propsCache !== null && 
           (Date.now() - this.propsCache.timestamp) < this.CACHE_DURATION;
  }

  setParlaysCache(data: SportsbookParlay[]): void {
    this.parlaysCache = { data, timestamp: Date.now() };
  }

  setPropsCache(data: PlayerProp[]): void {
    this.propsCache = { data, timestamp: Date.now() };
  }

  getParlaysCache(): SportsbookParlay[] | null {
    return this.isParlaysCacheValid() ? this.parlaysCache!.data : null;
  }

  getPropsCache(): PlayerProp[] | null {
    return this.isPropsCacheValid() ? this.propsCache!.data : null;
  }
}

export const sportsbookCache = new SportsbookCache();
export const sportsbookScraper = new SportsbookScraper();