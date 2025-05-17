import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Sample stats data - would come from API in real implementation
const statsData = [
  {
    id: '1',
    title: 'NBA Championship Odds',
    stats: [
      { team: 'Boston Celtics', value: '+350' },
      { team: 'Los Angeles Lakers', value: '+450' },
      { team: 'Milwaukee Bucks', value: '+600' },
      { team: 'Denver Nuggets', value: '+800' },
      { team: 'Phoenix Suns', value: '+900' }
    ],
    icon: 'basketball',
    color: '#FF6B00'
  },
  {
    id: '2',
    title: 'NFL Most Passing Yards',
    stats: [
      { team: 'Patrick Mahomes', value: '+300' },
      { team: 'Josh Allen', value: '+450' },
      { team: 'Joe Burrow', value: '+550' },
      { team: 'Justin Herbert', value: '+700' },
      { team: 'Dak Prescott', value: '+900' }
    ],
    icon: 'football',
    color: '#0056B3'
  },
  {
    id: '3',
    title: 'UFC Heavyweight Title Fight',
    stats: [
      { team: 'Jon Jones', value: '-160' },
      { team: 'Stipe Miocic', value: '+140' },
      { team: 'Fight to go the distance', value: '+275' },
      { team: 'Jon Jones by KO/TKO', value: '+190' },
      { team: 'Stipe Miocic by Submission', value: '+550' }
    ],
    icon: 'mixed-martial-arts',
    color: '#D50000'
  },
  {
    id: '4',
    title: 'MLB World Series Odds',
    stats: [
      { team: 'Los Angeles Dodgers', value: '+400' },
      { team: 'New York Yankees', value: '+450' },
      { team: 'Atlanta Braves', value: '+650' },
      { team: 'Houston Astros', value: '+750' },
      { team: 'Philadelphia Phillies', value: '+900' }
    ],
    icon: 'baseball',
    color: '#1976D2'
  }
];

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width - 32; // Full width minus padding

const StatsCarousel = () => {
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollX] = useState(new Animated.Value(0));
  
  // Auto scroll the carousel
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % statsData.length;
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: nextIndex * ITEM_WIDTH, animated: true });
        setCurrentIndex(nextIndex);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentIndex]);
  
  // Handle scroll events
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );
  
  // Handle scroll end
  const handleScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / ITEM_WIDTH);
    setCurrentIndex(index);
  };
  
  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={ITEM_WIDTH}
        snapToAlignment="center"
        contentContainerStyle={styles.scrollContent}
      >
        {statsData.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.card,
              { backgroundColor: colors.cardBackground }
            ]}
          >
            <View style={[styles.cardHeader, { backgroundColor: item.color }]}>
              <Icon name={item.icon} size={24} color="#FFFFFF" />
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
            <View style={styles.statsContainer}>
              {item.stats.map((stat, statIndex) => (
                <View
                  key={`${item.id}-${statIndex}`}
                  style={[
                    styles.statRow,
                    statIndex < item.stats.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border
                    }
                  ]}
                >
                  <Text style={[styles.statTeam, { color: colors.text }]}>
                    {stat.team}
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      {
                        color: stat.value.startsWith('+')
                          ? colors.secondary
                          : stat.value.startsWith('-')
                          ? colors.accent
                          : colors.text
                      }
                    ]}
                  >
                    {stat.value}
                  </Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.viewMoreButton, { backgroundColor: item.color + '20' }]}
            >
              <Text style={[styles.viewMoreText, { color: item.color }]}>
                View More
              </Text>
              <Icon name="chevron-right" size={16} color={item.color} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      
      {/* Carousel indicators */}
      <View style={styles.indicatorContainer}>
        {statsData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor:
                  index === currentIndex ? colors.primary : colors.border,
                width: index === currentIndex ? 16 : 8
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  card: {
    width: ITEM_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    padding: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  statTeam: {
    fontSize: 14,
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 4,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
});

export default StatsCarousel;