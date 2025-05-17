import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BetSlip from '../components/betting/BetSlip';

// In a real implementation, these would be fetched from the API
const MOCK_SPORTS = [
  { id: 'nba', name: 'NBA', icon: 'basketball', color: '#FF6B00' },
  { id: 'nfl', name: 'NFL', icon: 'football', color: '#0056B3' },
  { id: 'mlb', name: 'MLB', icon: 'baseball', color: '#1976D2' },
  { id: 'nhl', name: 'NHL', icon: 'hockey-sticks', color: '#D50000' },
  { id: 'soccer', name: 'Soccer', icon: 'soccer', color: '#00C853' },
  { id: 'ufc', name: 'UFC', icon: 'mixed-martial-arts', color: '#9C27B0' }
];

// Mock live events
const MOCK_LIVE_EVENTS = [
  {
    id: '1',
    sport: 'nba',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Boston Celtics',
    homeScore: 78,
    awayScore: 82,
    period: '3rd Quarter',
    timeRemaining: '4:23',
    homeMoneyline: '+110',
    awayMoneyline: '-130',
    homeSpread: '+2.5',
    awaySpread: '-2.5',
    over: 'O 205.5',
    under: 'U 205.5',
    overOdds: '-110',
    underOdds: '-110'
  },
  {
    id: '2',
    sport: 'nfl',
    homeTeam: 'Kansas City Chiefs',
    awayTeam: 'Buffalo Bills',
    homeScore: 24,
    awayScore: 21,
    period: '3rd Quarter',
    timeRemaining: '8:12',
    homeMoneyline: '-120',
    awayMoneyline: '+100',
    homeSpread: '-1.5',
    awaySpread: '+1.5',
    over: 'O 48.5',
    under: 'U 48.5',
    overOdds: '-110',
    underOdds: '-110'
  },
  {
    id: '3',
    sport: 'mlb',
    homeTeam: 'New York Yankees',
    awayTeam: 'Boston Red Sox',
    homeScore: 3,
    awayScore: 2,
    period: '6th Inning',
    timeRemaining: 'Top',
    homeMoneyline: '-150',
    awayMoneyline: '+130',
    homeSpread: '-1.5',
    awaySpread: '+1.5',
    over: 'O 8.5',
    under: 'U 8.5',
    overOdds: '-110',
    underOdds: '-110'
  }
];

const LiveBettingScreen = () => {
  const { colors } = useTheme();
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [liveEvents, setLiveEvents] = useState(MOCK_LIVE_EVENTS);
  
  // Filter events by selected sport
  const filteredEvents = selectedSport
    ? liveEvents.filter(event => event.sport === selectedSport)
    : liveEvents;
  
  // Simulate refresh
  const onRefresh = () => {
    setRefreshing(true);
    
    // Simulate API fetch delay
    setTimeout(() => {
      // In a real app, this would fetch fresh data from the API
      setRefreshing(false);
      
      // Simulate score updates
      const updatedEvents = liveEvents.map(event => ({
        ...event,
        homeScore: event.homeScore + Math.floor(Math.random() * 3),
        awayScore: event.awayScore + Math.floor(Math.random() * 3),
        homeMoneyline: Math.random() > 0.5 ? `+${Math.floor(Math.random() * 40) + 100}` : `-${Math.floor(Math.random() * 40) + 100}`,
        awayMoneyline: Math.random() > 0.5 ? `+${Math.floor(Math.random() * 40) + 100}` : `-${Math.floor(Math.random() * 40) + 100}`
      }));
      
      setLiveEvents(updatedEvents);
    }, 1500);
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colors.isDark ? 'light-content' : 'dark-content'}
      />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Live Betting
        </Text>
        <TouchableOpacity>
          <Icon name="bell-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Sport filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sportTabs}
      >
        <TouchableOpacity
          style={[
            styles.sportTab,
            !selectedSport && { backgroundColor: colors.primary }
          ]}
          onPress={() => setSelectedSport(null)}
        >
          <Text
            style={[
              styles.sportTabText,
              { color: !selectedSport ? '#FFFFFF' : colors.text }
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        {MOCK_SPORTS.map(sport => (
          <TouchableOpacity
            key={sport.id}
            style={[
              styles.sportTab,
              selectedSport === sport.id && { backgroundColor: sport.color }
            ]}
            onPress={() => setSelectedSport(sport.id)}
          >
            <Icon
              name={sport.icon}
              size={20}
              color={selectedSport === sport.id ? '#FFFFFF' : colors.text}
              style={styles.sportIcon}
            />
            <Text
              style={[
                styles.sportTabText,
                { color: selectedSport === sport.id ? '#FFFFFF' : colors.text }
              ]}
            >
              {sport.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Live events list */}
      <ScrollView
        contentContainerStyle={styles.eventsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              name="timer-sand-empty"
              size={64}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No live events available
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
              Check back soon for live betting opportunities
            </Text>
          </View>
        ) : (
          filteredEvents.map(event => (
            <View
              key={event.id}
              style={[styles.eventCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            >
              {/* Event header with scores */}
              <View style={styles.eventHeader}>
                <View style={styles.teamScores}>
                  <View style={styles.teamScore}>
                    <Text style={[styles.teamName, { color: colors.text }]}>
                      {event.homeTeam}
                    </Text>
                    <Text style={[styles.score, { color: colors.primary }]}>
                      {event.homeScore}
                    </Text>
                  </View>
                  <View style={styles.teamScore}>
                    <Text style={[styles.teamName, { color: colors.text }]}>
                      {event.awayTeam}
                    </Text>
                    <Text style={[styles.score, { color: colors.primary }]}>
                      {event.awayScore}
                    </Text>
                  </View>
                </View>
                <View style={styles.gameInfo}>
                  <Text style={[styles.periodText, { color: colors.textMuted }]}>
                    {event.period}
                  </Text>
                  <Text style={[styles.timeText, { color: colors.accent }]}>
                    {event.timeRemaining}
                  </Text>
                </View>
              </View>
              
              {/* Betting markets */}
              <View style={styles.bettingMarkets}>
                {/* Moneyline */}
                <View style={styles.marketSection}>
                  <Text style={[styles.marketTitle, { color: colors.textMuted }]}>
                    Moneyline
                  </Text>
                  <View style={styles.marketOptions}>
                    <TouchableOpacity 
                      style={[styles.betOption, { borderColor: colors.border }]}
                      onPress={() => {/* Add to bet slip */}}
                    >
                      <Text style={[styles.betOptionTeam, { color: colors.text }]}>
                        {event.homeTeam.split(' ').pop()}
                      </Text>
                      <Text 
                        style={[
                          styles.betOptionOdds, 
                          { 
                            color: event.homeMoneyline.startsWith('+') 
                              ? colors.secondary 
                              : colors.accent 
                          }
                        ]}
                      >
                        {event.homeMoneyline}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.betOption, { borderColor: colors.border }]}
                      onPress={() => {/* Add to bet slip */}}
                    >
                      <Text style={[styles.betOptionTeam, { color: colors.text }]}>
                        {event.awayTeam.split(' ').pop()}
                      </Text>
                      <Text 
                        style={[
                          styles.betOptionOdds, 
                          { 
                            color: event.awayMoneyline.startsWith('+') 
                              ? colors.secondary 
                              : colors.accent 
                          }
                        ]}
                      >
                        {event.awayMoneyline}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Spread */}
                <View style={styles.marketSection}>
                  <Text style={[styles.marketTitle, { color: colors.textMuted }]}>
                    Spread
                  </Text>
                  <View style={styles.marketOptions}>
                    <TouchableOpacity 
                      style={[styles.betOption, { borderColor: colors.border }]}
                      onPress={() => {/* Add to bet slip */}}
                    >
                      <Text style={[styles.betOptionTeam, { color: colors.text }]}>
                        {event.homeTeam.split(' ').pop()}
                      </Text>
                      <Text style={[styles.betOptionOdds, { color: colors.text }]}>
                        {event.homeSpread}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.betOption, { borderColor: colors.border }]}
                      onPress={() => {/* Add to bet slip */}}
                    >
                      <Text style={[styles.betOptionTeam, { color: colors.text }]}>
                        {event.awayTeam.split(' ').pop()}
                      </Text>
                      <Text style={[styles.betOptionOdds, { color: colors.text }]}>
                        {event.awaySpread}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Total */}
                <View style={styles.marketSection}>
                  <Text style={[styles.marketTitle, { color: colors.textMuted }]}>
                    Total
                  </Text>
                  <View style={styles.marketOptions}>
                    <TouchableOpacity 
                      style={[styles.betOption, { borderColor: colors.border }]}
                      onPress={() => {/* Add to bet slip */}}
                    >
                      <Text style={[styles.betOptionTeam, { color: colors.text }]}>
                        {event.over}
                      </Text>
                      <Text style={[styles.betOptionOdds, { color: colors.text }]}>
                        {event.overOdds}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.betOption, { borderColor: colors.border }]}
                      onPress={() => {/* Add to bet slip */}}
                    >
                      <Text style={[styles.betOptionTeam, { color: colors.text }]}>
                        {event.under}
                      </Text>
                      <Text style={[styles.betOptionOdds, { color: colors.text }]}>
                        {event.underOdds}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* More bets button */}
                <TouchableOpacity 
                  style={[styles.moreBetsButton, { backgroundColor: colors.primary + '15' }]}
                  onPress={() => {/* Navigate to full game view */}}
                >
                  <Text style={[styles.moreBetsText, { color: colors.primary }]}>
                    More Bets
                  </Text>
                  <Icon name="chevron-right" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      
      {/* Bet Slip */}
      <BetSlip />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sportTabs: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sportTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  sportIcon: {
    marginRight: 6,
  },
  sportTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventsList: {
    padding: 16,
    paddingBottom: 80, // Space for bet slip
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  eventCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  eventHeader: {
    padding: 12,
  },
  teamScores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  teamScore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    marginRight: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bettingMarkets: {
    padding: 12,
  },
  marketSection: {
    marginBottom: 12,
  },
  marketTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  marketOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  betOption: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginHorizontal: 4,
  },
  betOptionTeam: {
    fontSize: 14,
  },
  betOptionOdds: {
    fontSize: 14,
    fontWeight: '600',
  },
  moreBetsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  moreBetsText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
});

export default LiveBettingScreen;