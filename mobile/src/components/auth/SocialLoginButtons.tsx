import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Alert
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const SocialLoginButtons = () => {
  const { colors } = useTheme();
  
  // Handle social login
  const handleSocialLogin = (provider: string) => {
    // In the actual implementation, we'll integrate with the respective platform's SDK
    Alert.alert(
      'Social Login',
      `Login with ${provider} will be integrated here using the native SDK.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Facebook Login */}
      <TouchableOpacity
        style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
        onPress={() => handleSocialLogin('Facebook')}
      >
        <Image
          source={require('../../assets/icons/facebook.png')}
          style={styles.socialIcon}
        />
        <Text style={styles.socialButtonText}>Facebook</Text>
      </TouchableOpacity>

      {/* Google Login */}
      <TouchableOpacity
        style={[styles.socialButton, { backgroundColor: '#FFFFFF', borderColor: '#DDDDDD', borderWidth: 1 }]}
        onPress={() => handleSocialLogin('Google')}
      >
        <Image
          source={require('../../assets/icons/google.png')}
          style={styles.socialIcon}
        />
        <Text style={[styles.socialButtonText, { color: '#757575' }]}>Google</Text>
      </TouchableOpacity>

      {/* Apple Login (iOS only) */}
      {Platform.OS === 'ios' && (
        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: '#000000' }]}
          onPress={() => handleSocialLogin('Apple')}
        >
          <Image
            source={require('../../assets/icons/apple.png')}
            style={styles.socialIcon}
          />
          <Text style={styles.socialButtonText}>Apple</Text>
        </TouchableOpacity>
      )}

      {/* Twitter Login */}
      <TouchableOpacity
        style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
        onPress={() => handleSocialLogin('Twitter')}
      >
        <Image
          source={require('../../assets/icons/twitter.png')}
          style={styles.socialIcon}
        />
        <Text style={styles.socialButtonText}>Twitter</Text>
      </TouchableOpacity>

      {/* Discord Login */}
      <TouchableOpacity
        style={[styles.socialButton, { backgroundColor: '#5865F2' }]}
        onPress={() => handleSocialLogin('Discord')}
      >
        <Image
          source={require('../../assets/icons/discord.png')}
          style={styles.socialIcon}
        />
        <Text style={styles.socialButtonText}>Discord</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SocialLoginButtons;