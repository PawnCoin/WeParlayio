import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SocialLoginButtons from '../components/auth/SocialLoginButtons';
import WalletConnectButton from '../components/auth/WalletConnectButton';

const AuthScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [loginMethod, setLoginMethod] = useState<'social' | 'wallet'>('social');
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colors.isDark ? 'light-content' : 'dark-content'}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* App Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/weparlay-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          {/* Welcome Text */}
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            Welcome to WeParlay
          </Text>
          <Text style={[styles.subtitleText, { color: colors.textMuted }]}>
            The ultimate sports betting experience
          </Text>
          
          {/* Login Method Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                loginMethod === 'social' && [
                  styles.activeTab,
                  { borderColor: colors.primary }
                ]
              ]}
              onPress={() => setLoginMethod('social')}
            >
              <Icon
                name="account-group"
                size={24}
                color={loginMethod === 'social' ? colors.primary : colors.textMuted}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      loginMethod === 'social' ? colors.primary : colors.textMuted
                  }
                ]}
              >
                Social Login
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tabButton,
                loginMethod === 'wallet' && [
                  styles.activeTab,
                  { borderColor: colors.accent }
                ]
              ]}
              onPress={() => setLoginMethod('wallet')}
            >
              <Icon
                name="wallet"
                size={24}
                color={loginMethod === 'wallet' ? colors.accent : colors.textMuted}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      loginMethod === 'wallet' ? colors.accent : colors.textMuted
                  }
                ]}
              >
                Crypto Wallet
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Login Methods Content */}
          <View style={styles.methodContent}>
            {loginMethod === 'social' ? (
              <View style={styles.socialContent}>
                <Text style={[styles.methodTitle, { color: colors.text }]}>
                  Login with your social accounts
                </Text>
                <SocialLoginButtons />
              </View>
            ) : (
              <View style={styles.walletContent}>
                <Text style={[styles.methodTitle, { color: colors.text }]}>
                  Connect your crypto wallet
                </Text>
                <Text style={[styles.walletInfo, { color: colors.textMuted }]}>
                  Use your cryptocurrency wallet to securely authenticate and place bets with digital currencies.
                </Text>
                <WalletConnectButton />
              </View>
            )}
          </View>
          
          {/* Terms & Privacy */}
          <View style={styles.termsContainer}>
            <Text style={[styles.termsText, { color: colors.textMuted }]}>
              By continuing, you agree to WeParlay's{' '}
              <Text style={[styles.termsLink, { color: colors.primary }]}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={[styles.termsLink, { color: colors.primary }]}>
                Privacy Policy
              </Text>
            </Text>
          </View>
          
          {/* Skip for Now */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('Home' as never)}
          >
            <Text style={[styles.skipText, { color: colors.primary }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  logo: {
    width: 200,
    height: 80,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  methodContent: {
    marginBottom: 32,
  },
  socialContent: {},
  walletContent: {},
  methodTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  walletInfo: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  termsContainer: {
    marginTop: 'auto',
    marginBottom: 16,
  },
  termsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '500',
  },
  skipButton: {
    alignItems: 'center',
    padding: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AuthScreen;