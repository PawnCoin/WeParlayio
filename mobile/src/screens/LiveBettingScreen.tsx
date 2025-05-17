import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LiveEventCard from '../components/betting/LiveEventCard';
import LiveScoreBoard from '../components/betting/LiveScoreBoard';
import OddsComparisonTable from '../components/betting/OddsComparisonTable';
import LiveEventFilter from '../components/betting/LiveEventFilter';
import BetSlip from '../components/betting/BetSlip';
import { fetchLiveEvents, fetchOdds } from '../services/apiService';

const LiveBettingScreen = () => {
  const { colors } = useTheme();
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Fetch live events
  const { 
    data: liveEvents,
    isLoading: eventsLoading,
    refetch: refetchEvents
  } = useQuery({
    queryKey: ['/api/events/live'],
    queryFn: fetchLiveEvents
  });
  
  // Fetch odds for selected event
  const { 
    data: eventOdds,
    isLoading: oddsLoading,
    refetch: refetchOdds
  } = useQuery({
    queryKey: ['/api/odds', selectedEvent?.id],
    queryFn: () => selectedEvent ? fetchOdds(selectedEvent.id) : null,
    enabled: !!selectedEvent
  });
  
  // Select first event by default when data loads
  useEffect(() => {
    if (liveEvents && liveEvents.length > 0 && !selectedEvent) {
      setSelectedEvent(liveEvents[0]);
    }
  }, [liveEvents]);
  
  // Filter events by sport
  const filteredEvents = liveEvents ? 
    (selectedSport === 'all' ? 
      liveEvents : 
      liveEvents.filter(event => event.sport?.key === selectedSport)
    ) : [];
  
  // Refresh all data
  const onRefresh = () => {
    refetchEvents();
    if (selectedEvent) {
      refetchOdds();
    }
  };
  
  // Handle event selection
  const handleEventSelect = (event) => {
    setSelectedEvent(event);
  };
  
  // Determine if there are live events
  const hasLiveEvents = filteredEvents && filteredEvents.length > 0;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LiveEventFilter 
        selectedSport={selectedSport} 
        onSelectSport={setSelectedSport} 
      />
      
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={eventsLoading}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {eventsLoading ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.cardBackground }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Loading live events...
            </Text>
          </View>
        ) : !hasLiveEvents ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.cardBackground }]}>
            <Icon name="calendar-remove" size={48} color={colors.primary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No live events are currently available
            </Text>
            <TouchableOpacity 
              style={[styles.refreshButton, { backgroundColor: colors.primary }]}
              onPress={onRefresh}
            >
              <Text style={styles.refreshButtonText}>Check Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Live events scrollable section */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.eventsScroll}
              contentContainerStyle={styles.eventsScrollContent}
            >
              {filteredEvents.map(event => (
                <TouchableOpacity 
                  key={event.id} 
                  onPress={() => handleEventSelect(event)}
                  style={[
                    styles.eventButton,
                    selectedEvent?.id === event.id && { 
                      borderColor: colors.primary,
                      backgroundColor: `${colors.primary}20`, // 20% opacity
                    }
                  ]}
                >
                  <LiveEventCard 
                    event={event} 
                    isSelected={selectedEvent?.id === event.id} 
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Selected event details */}
            {selectedEvent && (
              <View style={styles.eventDetailsContainer}>
                {/* Live scoreboard */}
                <LiveScoreBoard event={selectedEvent} />
                
                {/* Odds comparison */}
                <View style={[styles.oddsContainer, { backgroundColor: colors.cardBackground }]}>
                  <Text style={[styles.oddsTitle, { color: colors.text }]}>
                    Live Odds Comparison
                  </Text>
                  {oddsLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <OddsComparisonTable odds={eventOdds} event={selectedEvent} />
                  )}
                </View>
                
                {/* Bet placement section */}
                <View style={[styles.betPlacementContainer, { backgroundColor: colors.cardBackground }]}>
                  <Text style={[styles.betPlacementTitle, { color: colors.text }]}>
                    Quick Bet
                  </Text>
                  <View style={styles.betTypeContainer}>
                    <TouchableOpacity 
                      style={[styles.betTypeButton, { backgroundColor: colors.primary }]}
                    >
                      <Text style={styles.betTypeText}>Moneyline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.betTypeButton, { backgroundColor: colors.secondary }]}
                    >
                      <Text style={styles.betTypeText}>Spread</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.betTypeButton, { backgroundColor: colors.accent }]}
                    >
                      <Text style={styles.betTypeText}>Over/Under</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    margin: 16,
    borderRadius: 8,
    height: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    margin: 16,
    borderRadius: 8,
    height: 200,
  },
  emptyText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  refreshButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  eventsScroll: {
    marginVertical: 12,
  },
  eventsScrollContent: {
    paddingHorizontal: 16,
  },
  eventButton: {
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 8,
  },
  eventDetailsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  oddsContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  oddsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  betPlacementContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  betPlacementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  betTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  betTypeButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  betTypeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default LiveBettingScreen;