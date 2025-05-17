import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useMutation } from '@tanstack/react-query';
import { login, registerUser } from '../services/apiService';
import SocialLoginButtons from '../components/auth/SocialLoginButtons';
import WalletConnectButton from '../components/auth/WalletConnectButton';

const AuthScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    },
    onError: (error: any) => {
      Alert.alert(
        'Login Failed',
        error.message || 'Please check your credentials and try again.'
      );
    },
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    },
    onError: (error: any) => {
      Alert.alert(
        'Registration Failed',
        error.message || 'Please check your information and try again.'
      );
    },
  });
  
  // Login or register handler
  const handleSubmit = () => {
    if (isLogin) {
      if (!email || !password) {
        Alert.alert('Missing Information', 'Please enter both email and password.');
        return;
      }
      
      loginMutation.mutate({ email, password });
    } else {
      if (!username || !email || !password) {
        Alert.alert('Missing Information', 'Please fill in all required fields.');
        return;
      }
      
      registerMutation.mutate({ username, email, password });
    }
  };
  
  // Logo
  const weparlayLogo = require('../assets/weparlaylogo.png');
  
  // Loading state
  const isLoading = loginMutation.isPending || registerMutation.isPending;
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image source={weparlayLogo} style={styles.logo} />
          <Text style={[styles.tagline, { color: colors.text }]}>
            The Social Sports Betting Platform
          </Text>
        </View>
        
        <View style={[styles.formContainer, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                isLogin && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
              ]}
              onPress={() => setIsLogin(true)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isLogin ? colors.primary : colors.text }
                ]}
              >
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                !isLogin && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
              ]}
              onPress={() => setIsLogin(false)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: !isLogin ? colors.primary : colors.text }
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            {!isLogin && (
              <View style={styles.inputWrapper}>
                <Icon name="account" size={20} color={colors.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Username"
                  placeholderTextColor={`${colors.text}80`}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            )}
            
            <View style={styles.inputWrapper}>
              <Icon name="email" size={20} color={colors.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email"
                placeholderTextColor={`${colors.text}80`}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputWrapper}>
              <Icon name="lock" size={20} color={colors.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={`${colors.text}80`}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            {isLogin && (
              <TouchableOpacity style={styles.forgotPasswordButton}>
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isLogin ? 'Login' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.text }]}>OR</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>
          
          <SocialLoginButtons />
          
          <View style={styles.walletContainer}>
            <Text style={[styles.walletTitle, { color: colors.text }]}>
              Connect with Crypto Wallet
            </Text>
            <WalletConnectButton />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 200,
    height: 70,
    resizeMode: 'contain',
  },
  tagline: {
    fontSize: 16,
    marginTop: 8,
  },
  formContainer: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 40,
    paddingVertical: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  submitButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  walletContainer: {
    marginTop: 16,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default AuthScreen;