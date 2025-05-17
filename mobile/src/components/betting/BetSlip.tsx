import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import BetConfetti from './BetConfetti';

interface BetItem {
  id: string;
  type: string;
  game: string;
  selection: string;
  odds: string;
  stake?: number;
}

const BetSlip = () => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Mock bet items - in a real app, this would come from state management
  const [betItems, setBetItems] = useState<BetItem[]>([
    {
      id: '1',
      type: 'Moneyline',
      game: 'Lakers vs Warriors',
      selection: 'Lakers',
      odds: '+150'
    },
    {
      id: '2',
      type: 'Spread',
      game: 'Celtics vs Bucks',
      selection: 'Celtics -4.5',
      odds: '-110'
    }
  ]);
  
  // Calculate total potential winnings
  const calculatePotentialWinnings = () => {
    const amount = parseFloat(betAmount) || 0;
    let totalWinnings = 0;
    
    betItems.forEach(bet => {
      const odds = bet.odds;
      if (odds.startsWith('+')) {
        // Positive odds (e.g. +150 means bet 100 to win 150)
        const oddsValue = parseInt(odds.substring(1));
        totalWinnings += amount * (oddsValue / 100);
      } else if (odds.startsWith('-')) {
        // Negative odds (e.g. -110 means bet 110 to win 100)
        const oddsValue = parseInt(odds.substring(1));
        totalWinnings += amount * (100 / oddsValue);
      }
    });
    
    return totalWinnings + amount; // Return stake plus winnings
  };
  
  // Handle bet slip expansion
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Remove bet from slip
  const removeBet = (id: string) => {
    setBetItems(betItems.filter(bet => bet.id !== id));
  };
  
  // Place bet
  const placeBet = () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid bet amount');
      return;
    }
    
    if (betItems.length === 0) {
      Alert.alert('Error', 'Your bet slip is empty');
      return;
    }
    
    // Show bet placement confirmation
    Alert.alert(
      'Confirm Bet',
      `Are you sure you want to place a ${betAmount} bet with potential winnings of $${calculatePotentialWinnings().toFixed(2)}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Place Bet',
          onPress: () => {
            // Show confetti animation
            setShowConfetti(true);
            
            // In a real app, we would call the API to place the bet
            setTimeout(() => {
              Alert.alert('Success', 'Your bet has been placed successfully!');
              // Reset bet slip
              setBetAmount('');
              setBetItems([]);
              setShowConfetti(false);
            }, 2000);
          }
        }
      ]
    );
  };
  
  // Screen dimensions
  const { height } = Dimensions.get('window');
  
  // Animated value for the panel
  const panelHeight = new Animated.Value(expanded ? height * 0.7 : 60);
  
  // Pan responder for dragging
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (expanded) {
        // Only allow dragging down when expanded
        const newHeight = Math.max(60, height * 0.7 - gestureState.dy);
        panelHeight.setValue(newHeight);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (expanded && gestureState.dy > 50) {
        // If dragged down significantly, collapse the panel
        Animated.timing(panelHeight, {
          toValue: 60,
          duration: 300,
          useNativeDriver: false
        }).start();
        setExpanded(false);
      } else {
        // Otherwise, expand it fully again
        Animated.timing(panelHeight, {
          toValue: expanded ? height * 0.7 : 60,
          duration: 300,
          useNativeDriver: false
        }).start();
      }
    }
  });
  
  return (
    <>
      {showConfetti && <BetConfetti />}
      
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.cardBackground,
            height: panelHeight,
            borderColor: colors.border
          }
        ]}
        {...panResponder.panHandlers}
      >
        {/* Header/Collapsed view */}
        <TouchableOpacity
          style={styles.header}
          onPress={toggleExpanded}
          activeOpacity={0.8}
        >
          <View style={styles.headerContent}>
            <Icon
              name="receipt"
              size={24}
              color={colors.primary}
              style={styles.icon}
            />
            <Text style={[styles.title, { color: colors.text }]}>
              Bet Slip {betItems.length > 0 && `(${betItems.length})`}
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            {betItems.length > 0 && !expanded && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{betItems.length}</Text>
              </View>
            )}
            <Icon
              name={expanded ? 'chevron-down' : 'chevron-up'}
              size={24}
              color={colors.text}
            />
          </View>
        </TouchableOpacity>
        
        {/* Expanded content */}
        {expanded && (
          <View style={styles.expandedContent}>
            <ScrollView style={styles.betList}>
              {betItems.length === 0 ? (
                <Text style={[styles.emptyMessage, { color: colors.text }]}>
                  Your bet slip is empty. Add some selections to place a bet.
                </Text>
              ) : (
                betItems.map(bet => (
                  <View
                    key={bet.id}
                    style={[styles.betItem, { borderBottomColor: colors.border }]}
                  >
                    <View style={styles.betInfo}>
                      <Text style={[styles.betGame, { color: colors.text }]}>
                        {bet.game}
                      </Text>
                      <Text style={[styles.betSelection, { color: colors.text }]}>
                        {bet.selection} ({bet.type})
                      </Text>
                      <Text
                        style={[
                          styles.betOdds,
                          {
                            color: bet.odds.startsWith('+')
                              ? colors.secondary
                              : colors.accent
                          }
                        ]}
                      >
                        {bet.odds}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeBet(bet.id)}
                    >
                      <Icon name="close" size={20} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
            
            {betItems.length > 0 && (
              <View style={styles.betControls}>
                <View style={styles.amountContainer}>
                  <Text style={[styles.amountLabel, { color: colors.text }]}>
                    Bet Amount:
                  </Text>
                  <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                    <Text style={{ color: colors.text }}>$</Text>
                    <TextInput
                      style={[styles.amountInput, { color: colors.text }]}
                      value={betAmount}
                      onChangeText={setBetAmount}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor={`${colors.text}80`}
                    />
                  </View>
                </View>
                
                <View style={styles.quickAmounts}>
                  {[5, 10, 20, 50, 100].map(amount => (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.quickAmountButton,
                        { backgroundColor: colors.primary + '30' }
                      ]}
                      onPress={() => setBetAmount(amount.toString())}
                    >
                      <Text style={[styles.quickAmountText, { color: colors.primary }]}>
                        ${amount}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.text }]}>
                      Total Bets:
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      {betItems.length}
                    </Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.text }]}>
                      Potential Winnings:
                    </Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        styles.winningsValue,
                        { color: colors.secondary }
                      ]}
                    >
                      ${calculatePotentialWinnings().toFixed(2)}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[styles.placeButton, { backgroundColor: colors.primary }]}
                  onPress={placeBet}
                >
                  <Text style={styles.placeButtonText}>Place Bet</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandedContent: {
    flex: 1,
    padding: 16,
  },
  betList: {
    flex: 1,
    marginBottom: 16,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  betItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  betInfo: {
    flex: 1,
  },
  betGame: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  betSelection: {
    fontSize: 14,
    marginBottom: 4,
  },
  betOdds: {
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
  betControls: {
    marginTop: 'auto',
  },
  amountContainer: {
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  amountInput: {
    flex: 1,
    height: 48,
    marginLeft: 8,
    fontSize: 18,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickAmountButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
    width: '18%',
    alignItems: 'center',
  },
  quickAmountText: {
    fontWeight: '600',
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  winningsValue: {
    fontSize: 18,
  },
  placeButton: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BetSlip;