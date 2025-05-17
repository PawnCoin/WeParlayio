import React, { useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  RefreshControl 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../contexts/ThemeContext';
import UpcomingEventCard from '../components/betting/UpcomingEventCard';
import LiveEventBanner from '../components/betting/LiveEventBanner';
import SportsList from '../components/sports/SportsList';
import StatsCarousel from '../components/home/StatsCarousel';
import FeaturedBetCard from '../components/betting/FeaturedBetCard';
import BetSlip from '../components/betting/BetSlip';
import { fetchSports, fetchUpcomingEvents, fetchLiveEvents } from '../services/apiService';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  // Fetch sports data
  const { 
    data: sports,
    isLoading: sportsLoading,
    refetch: refetchSports
  } = useQuery({
    queryKey: ['/api/sports'],
    queryFn: fetchSports
  });
  
  // Fetch upcoming events
  const { 
    data: upcomingEvents, 
    isLoading: upcomingEventsLoading,
    refetch: refetchUpcoming
  } = useQuery({
    queryKey: ['/api/events/upcoming'],
    queryFn: fetchUpcomingEvents
  });
  
  // Fetch live events
  const { 
    data: liveEvents,
    isLoading: liveEventsLoading,
    refetch: refetchLive
  } = useQuery({
    queryKey: ['/api/events/live'],
    queryFn: fetchLiveEvents
  });
  
  // Combined loading state
  const isLoading = sportsLoading || upcomingEventsLoading || liveEventsLoading;
  
  // Refresh all data
  const onRefresh = () => {
    refetchSports();
    refetchUpcoming();
    refetchLive();
  };
  
  // Main logo image
  const weparlayLogo = require('../assets/weparlaylogo.png');
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header with logo */}
        <View style={styles.header}>
          <Image source={weparlayLogo} style={styles.logo} />
        </View>
        
        {/* Stats carousel */}
        <StatsCarousel />
        
        {/* Live events section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Live Now</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {liveEventsLoading ? (
              <View style={[styles.loadingCard, { backgroundColor: colors.cardBackground }]}>
                <Text style={{ color: colors.text }}>Loading live events...</Text>
              </View>
            ) : liveEvents && liveEvents.length > 0 ? (
              liveEvents.map((event) => (
                <LiveEventBanner key={event.id} event={event} />
              ))
            ) : (
              <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
                <Text style={{ color: colors.text }}>No live events currently available</Text>
              </View>
            )}
          </ScrollView>
        </View>
        
        {/* Sports list */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Sports</Text>
          <SportsList sports={sports || []} loading={sportsLoading} />
        </View>
        
        {/* Upcoming events */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Events</Text>
          {upcomingEventsLoading ? (
            <View style={[styles.loadingCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={{ color: colors.text }}>Loading upcoming events...</Text>
            </View>
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <UpcomingEventCard key={event.id} event={event} />
            ))
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={{ color: colors.text }}>No upcoming events available</Text>
            </View>
          )}
        </View>
        
        {/* Featured Bets */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Bets</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <FeaturedBetCard 
              title="NBA Finals Championship" 
              odds="+320" 
              teamLogo={require('../assets/team-logos/lakers.png')}
              backgroundColor={colors.primary}
            />
            <FeaturedBetCard 
              title="UFC Heavyweight Title" 
              odds="+150" 
              teamLogo={require('../assets/team-logos/ufc.png')}
              backgroundColor={colors.secondary}
            />
            <FeaturedBetCard 
              title="Premier League Winner" 
              odds="+450" 
              teamLogo={require('../assets/team-logos/mancity.png')}
              backgroundColor={colors.accent}
            />
          </ScrollView>
        </View>
      </ScrollView>
      
      {/* Fixed bet slip at bottom */}
      <BetSlip />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  logo: {
    width: 180,
    height: 60,
    resizeMode: 'contain',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  loadingCard: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    width: '100%',
  },
  emptyCard: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    width: '100%',
  },
});

export default HomeScreen;