// Real-time Odds Prediction Algorithm
// Advanced analytics engine for predicting odds movements and betting insights

interface OddsData {
  eventId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  currentOdds: {
    home: number;
    away: number;
    total?: number;
  };
  timestamp: Date;
  volume?: number;
  marketSentiment?: number;
}

interface PredictionResult {
  eventId: string;
  predictedOdds: {
    home: number;
    away: number;
    total?: number;
  };
  confidence: number;
  movementDirection: 'up' | 'down' | 'stable';
  factors: string[];
  recommendation: 'buy' | 'sell' | 'hold';
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface MarketTrend {
  sport: string;
  averageMovement: number;
  volatility: number;
  volume: number;
  momentum: number;
}

export class OddsPredictionAlgorithm {
  private historicalData: Map<string, OddsData[]> = new Map();
  private marketTrends: Map<string, MarketTrend> = new Map();
  private predictionCache: Map<string, PredictionResult> = new Map();

  constructor() {
    this.initializeAlgorithm();
  }

  private initializeAlgorithm() {
    console.log('🔮 Initializing Real-time Odds Prediction Algorithm...');
    
    // Initialize market trends for different sports
    const sports = ['football_nfl', 'basketball_nba', 'baseball_mlb', 'hockey_nhl', 'soccer_epl'];
    sports.forEach(sport => {
      this.marketTrends.set(sport, {
        sport,
        averageMovement: 0,
        volatility: 0.15,
        volume: 1000,
        momentum: 0
      });
    });
  }

  // Main prediction engine
  async predictOddsMovement(currentOdds: OddsData): Promise<PredictionResult> {
    const cacheKey = `${currentOdds.eventId}_${Date.now()}`;
    
    // Check cache first
    if (this.predictionCache.has(cacheKey)) {
      return this.predictionCache.get(cacheKey)!;
    }

    // Store current odds in historical data
    this.addToHistoricalData(currentOdds);

    // Run prediction algorithms
    const technicalAnalysis = this.performTechnicalAnalysis(currentOdds);
    const sentimentAnalysis = this.analyzeBettingsentiment(currentOdds);
    const volumeAnalysis = this.analyzeVolumeTrends(currentOdds);
    const marketFactors = this.analyzeMarketFactors(currentOdds);

    // Combine all factors using weighted algorithm
    const prediction = this.combinePredictionFactors({
      technical: technicalAnalysis,
      sentiment: sentimentAnalysis,
      volume: volumeAnalysis,
      market: marketFactors,
      currentOdds
    });

    // Cache the result
    this.predictionCache.set(cacheKey, prediction);

    return prediction;
  }

  private performTechnicalAnalysis(odds: OddsData) {
    const history = this.historicalData.get(odds.eventId) || [];
    
    if (history.length < 3) {
      return {
        trend: 'neutral',
        strength: 0.5,
        support: odds.currentOdds.home,
        resistance: odds.currentOdds.away
      };
    }

    // Calculate moving averages
    const recentOdds = history.slice(-5);
    const homeMA = recentOdds.reduce((sum, data) => sum + data.currentOdds.home, 0) / recentOdds.length;
    const awayMA = recentOdds.reduce((sum, data) => sum + data.currentOdds.away, 0) / recentOdds.length;

    // Determine trend direction
    const homeTrend = odds.currentOdds.home > homeMA ? 'up' : 'down';
    const awayTrend = odds.currentOdds.away > awayMA ? 'up' : 'down';

    // Calculate trend strength
    const homeStrength = Math.abs(odds.currentOdds.home - homeMA) / homeMA;
    const awayStrength = Math.abs(odds.currentOdds.away - awayMA) / awayMA;

    return {
      trend: homeTrend === awayTrend ? homeTrend : 'mixed',
      strength: (homeStrength + awayStrength) / 2,
      support: Math.min(...recentOdds.map(d => d.currentOdds.home)),
      resistance: Math.max(...recentOdds.map(d => d.currentOdds.away))
    };
  }

  private analyzeBettingsentiment(odds: OddsData) {
    // Simulate market sentiment analysis
    const marketSentiment = odds.marketSentiment || Math.random();
    
    // Convert sentiment to odds impact
    const sentimentImpact = {
      bullish: marketSentiment > 0.6,
      bearish: marketSentiment < 0.4,
      neutral: marketSentiment >= 0.4 && marketSentiment <= 0.6
    };

    return {
      sentiment: marketSentiment,
      impact: sentimentImpact,
      strength: Math.abs(marketSentiment - 0.5) * 2
    };
  }

  private analyzeVolumeTrends(odds: OddsData) {
    const baseVolume = 1000;
    const currentVolume = odds.volume || baseVolume;
    
    // Calculate volume momentum
    const volumeRatio = currentVolume / baseVolume;
    const volumeStrength = Math.min(volumeRatio, 2); // Cap at 2x

    return {
      volume: currentVolume,
      momentum: volumeRatio > 1.2 ? 'high' : volumeRatio < 0.8 ? 'low' : 'normal',
      strength: volumeStrength,
      impact: volumeRatio > 1.5 ? 'significant' : 'moderate'
    };
  }

  private analyzeMarketFactors(odds: OddsData) {
    const marketTrend = this.marketTrends.get(odds.sport);
    
    if (!marketTrend) {
      return {
        marketDirection: 'neutral',
        volatility: 0.15,
        momentum: 0,
        factors: ['insufficient_market_data']
      };
    }

    // Update market trend with current data
    this.updateMarketTrend(odds.sport, odds);

    return {
      marketDirection: marketTrend.momentum > 0.1 ? 'bullish' : marketTrend.momentum < -0.1 ? 'bearish' : 'neutral',
      volatility: marketTrend.volatility,
      momentum: marketTrend.momentum,
      factors: this.identifyMarketFactors(marketTrend)
    };
  }

  private combinePredictionFactors(analysis: any): PredictionResult {
    const { technical, sentiment, volume, market, currentOdds } = analysis;

    // Weight different factors
    const weights = {
      technical: 0.3,
      sentiment: 0.25,
      volume: 0.25,
      market: 0.2
    };

    // Calculate predicted odds movement
    let homeMovement = 0;
    let awayMovement = 0;

    // Technical analysis impact
    if (technical.trend === 'up') {
      homeMovement += technical.strength * weights.technical * 10;
      awayMovement -= technical.strength * weights.technical * 8;
    } else if (technical.trend === 'down') {
      homeMovement -= technical.strength * weights.technical * 10;
      awayMovement += technical.strength * weights.technical * 8;
    }

    // Sentiment impact
    if (sentiment.impact.bullish) {
      homeMovement += sentiment.strength * weights.sentiment * 15;
    } else if (sentiment.impact.bearish) {
      awayMovement += sentiment.strength * weights.sentiment * 15;
    }

    // Volume impact
    if (volume.momentum === 'high') {
      const multiplier = volume.strength * weights.volume;
      homeMovement *= (1 + multiplier);
      awayMovement *= (1 + multiplier);
    }

    // Market factors impact
    if (market.marketDirection === 'bullish') {
      homeMovement += market.momentum * weights.market * 20;
    } else if (market.marketDirection === 'bearish') {
      awayMovement += Math.abs(market.momentum) * weights.market * 20;
    }

    // Calculate predicted odds
    const predictedHomeOdds = Math.round(currentOdds.currentOdds.home + homeMovement);
    const predictedAwayOdds = Math.round(currentOdds.currentOdds.away + awayMovement);

    // Determine overall confidence
    const confidence = this.calculateConfidence(technical, sentiment, volume, market);

    // Determine movement direction
    const totalMovement = Math.abs(homeMovement) + Math.abs(awayMovement);
    const movementDirection = totalMovement > 5 ? (homeMovement > awayMovement ? 'up' : 'down') : 'stable';

    // Generate recommendation
    const recommendation = this.generateRecommendation(confidence, movementDirection, currentOdds);

    // Identify key factors
    const factors = this.identifyKeyFactors(technical, sentiment, volume, market);

    return {
      eventId: currentOdds.eventId,
      predictedOdds: {
        home: predictedHomeOdds,
        away: predictedAwayOdds,
        total: currentOdds.currentOdds.total
      },
      confidence: Math.round(confidence * 100) / 100,
      movementDirection,
      factors,
      recommendation,
      timeframe: '15-30 minutes',
      riskLevel: confidence > 0.7 ? 'low' : confidence > 0.5 ? 'medium' : 'high'
    };
  }

  private calculateConfidence(technical: any, sentiment: any, volume: any, market: any): number {
    let confidence = 0.5; // Base confidence

    // Technical analysis confidence
    if (technical.strength > 0.1) confidence += 0.15;
    if (technical.trend !== 'mixed') confidence += 0.1;

    // Sentiment confidence
    if (sentiment.strength > 0.3) confidence += 0.1;

    // Volume confidence
    if (volume.impact === 'significant') confidence += 0.1;

    // Market confidence
    if (market.marketDirection !== 'neutral') confidence += 0.05;

    return Math.min(confidence, 0.95); // Cap at 95%
  }

  private generateRecommendation(confidence: number, direction: string, odds: OddsData): 'buy' | 'sell' | 'hold' {
    if (confidence < 0.4) return 'hold';
    
    if (direction === 'up' && confidence > 0.6) return 'buy';
    if (direction === 'down' && confidence > 0.6) return 'sell';
    
    return 'hold';
  }

  private identifyKeyFactors(technical: any, sentiment: any, volume: any, market: any): string[] {
    const factors = [];

    if (technical.strength > 0.15) factors.push('strong_technical_trend');
    if (sentiment.strength > 0.4) factors.push('market_sentiment_shift');
    if (volume.momentum === 'high') factors.push('high_betting_volume');
    if (market.volatility > 0.2) factors.push('market_volatility');
    if (technical.trend === 'up') factors.push('upward_price_momentum');
    if (technical.trend === 'down') factors.push('downward_price_momentum');

    return factors.length > 0 ? factors : ['normal_market_conditions'];
  }

  private addToHistoricalData(odds: OddsData) {
    if (!this.historicalData.has(odds.eventId)) {
      this.historicalData.set(odds.eventId, []);
    }
    
    const history = this.historicalData.get(odds.eventId)!;
    history.push(odds);
    
    // Keep only last 50 entries
    if (history.length > 50) {
      history.shift();
    }
  }

  private updateMarketTrend(sport: string, odds: OddsData) {
    const trend = this.marketTrends.get(sport);
    if (!trend) return;

    // Update momentum based on odds movement
    const history = this.historicalData.get(odds.eventId) || [];
    if (history.length > 1) {
      const lastOdds = history[history.length - 2];
      const movement = odds.currentOdds.home - lastOdds.currentOdds.home;
      trend.momentum = trend.momentum * 0.9 + movement * 0.1;
    }

    // Update volatility
    trend.volatility = trend.volatility * 0.95 + Math.random() * 0.05;
    
    // Update volume
    trend.volume = trend.volume * 0.9 + (odds.volume || 1000) * 0.1;
  }

  private identifyMarketFactors(trend: MarketTrend): string[] {
    const factors = [];
    
    if (trend.momentum > 0.1) factors.push('bullish_market_momentum');
    if (trend.momentum < -0.1) factors.push('bearish_market_momentum');
    if (trend.volatility > 0.2) factors.push('high_market_volatility');
    if (trend.volume > 1500) factors.push('high_market_volume');
    
    return factors.length > 0 ? factors : ['stable_market_conditions'];
  }

  // Public method to get market insights
  async getMarketInsights(sport: string): Promise<any> {
    const trend = this.marketTrends.get(sport);
    
    if (!trend) {
      return {
        sport,
        status: 'insufficient_data',
        recommendations: []
      };
    }

    return {
      sport,
      momentum: trend.momentum,
      volatility: trend.volatility,
      volume: trend.volume,
      marketDirection: trend.momentum > 0.1 ? 'bullish' : trend.momentum < -0.1 ? 'bearish' : 'neutral',
      recommendations: this.generateMarketRecommendations(trend)
    };
  }

  private generateMarketRecommendations(trend: MarketTrend): string[] {
    const recommendations = [];

    if (trend.momentum > 0.15) {
      recommendations.push('Consider betting on favorites in this market');
    } else if (trend.momentum < -0.15) {
      recommendations.push('Look for value in underdog bets');
    }

    if (trend.volatility > 0.25) {
      recommendations.push('High volatility - consider smaller bet sizes');
    }

    if (trend.volume > 2000) {
      recommendations.push('High volume indicates strong market interest');
    }

    return recommendations.length > 0 ? recommendations : ['Monitor market for opportunities'];
  }

  // Method to clear old cache entries
  clearCache() {
    this.predictionCache.clear();
    console.log('🧹 Prediction cache cleared');
  }
}

export const oddsPredictionAlgorithm = new OddsPredictionAlgorithm();