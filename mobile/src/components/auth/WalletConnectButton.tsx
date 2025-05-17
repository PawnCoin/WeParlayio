import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  Alert
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface WalletOption {
  id: string;
  name: string;
  image: any;
  color: string;
}

const WalletConnectButton = () => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  // List of supported wallets
  const wallets: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      image: require('../../assets/icons/metamask.png'),
      color: '#E2761B'
    },
    {
      id: 'trustwallet',
      name: 'Trust Wallet',
      image: require('../../assets/icons/trustwallet.png'),
      color: '#3375BB'
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      image: require('../../assets/icons/coinbase.png'),
      color: '#0052FF'
    },
    {
      id: 'binance',
      name: 'Binance Wallet',
      image: require('../../assets/icons/binance.png'),
      color: '#F0B90B'
    },
    {
      id: 'phantom',
      name: 'Phantom',
      image: require('../../assets/icons/phantom.png'),
      color: '#4A46D6'
    }
  ];

  // Handle wallet connection
  const connectWallet = (wallet: WalletOption) => {
    setModalVisible(false);
    
    // In a real implementation, we would integrate with the wallet's SDK
    Alert.alert(
      'Wallet Connection',
      `Connecting to ${wallet.name}... This would trigger the native wallet connection flow.`,
      [{ text: 'OK' }]
    );
  };

  // Render wallet option
  const renderWalletOption = ({ item }: { item: WalletOption }) => (
    <TouchableOpacity
      style={[styles.walletOption, { borderColor: colors.border }]}
      onPress={() => connectWallet(item)}
    >
      <Image source={item.image} style={styles.walletIcon} />
      <Text style={[styles.walletName, { color: colors.text }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.connectButton, { backgroundColor: colors.accent }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.connectButtonText}>Connect Wallet</Text>
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Connect Your Wallet
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: colors.text, fontSize: 24 }}>×</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalDescription, { color: colors.text }]}>
              Connect with one of our available wallet providers or create a new one.
            </Text>
            
            <FlatList
              data={wallets}
              renderItem={renderWalletOption}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.walletList}
            />
            
            <Text style={[styles.disclaimer, { color: `${colors.text}90` }]}>
              By connecting your wallet, you agree to WeParlay's Terms of Service and Privacy Policy.
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  connectButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  walletList: {
    paddingBottom: 20,
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  walletIcon: {
    width: 36,
    height: 36,
    marginRight: 16,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default WalletConnectButton;