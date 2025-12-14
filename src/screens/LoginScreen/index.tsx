import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, Alert, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import Wrapper from '$components/Wrapper';
import { IMAGES } from '$assets/images';
import { COLORS } from '$constants/colors';
import { DEVICE_WIDTH, DEVICE_HEIGHT } from '$constants/dimensions';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '$hooks/useAuth';
import { resetAndNavigate } from '$helpers/navigationUtils';
import { playSound } from '$helpers/SoundUtils';
import { styles } from './styles';

const LoginScreen: React.FC = () => {
  const { loginAsGuest, loginWithGoogle, loginWithApple, loginWithFacebook, loading, error } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Error', error, [{ text: 'OK' }]);
    }
  }, [error]);

  const handleGuestLogin = async () => {
    try {
      setIsLoggingIn(true);
      playSound('ui');
      const success = await loginAsGuest();
      if (success) {
        resetAndNavigate('HomeScreen');
      }
    } catch (err) {
      console.error('Guest login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      playSound('ui');
      const success = await loginWithGoogle();
      if (success) {
        resetAndNavigate('HomeScreen');
      }
    } catch (err) {
      console.error('Google login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setIsLoggingIn(true);
      playSound('ui');
      const success = await loginWithApple();
      if (success) {
        resetAndNavigate('HomeScreen');
      }
    } catch (err) {
      console.error('Apple login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsLoggingIn(true);
      playSound('ui');
      const success = await loginWithFacebook();
      if (success) {
        resetAndNavigate('HomeScreen');
      }
    } catch (err) {
      console.error('Facebook login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Wrapper>
      <View style={styles.container}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image 
            source={IMAGES.Logo} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.welcomeText}>Welcome to Ludo</Text>
          <Text style={styles.subtitleText}>Choose your login method</Text>
        </View>

        {/* Login Buttons Section */}
        <View style={styles.buttonsContainer}>
          {/* Guest Login - Primary */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGuestLogin}
            disabled={isLoggingIn || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.gradientPurple}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.primaryButtonText}>
                {isLoggingIn ? 'Logging in...' : 'Play as Guest'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtonsContainer}>
            {/* Google Login */}
            <View style={styles.socialButtonWrapper}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleLogin}
              disabled={isLoggingIn || loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.white, COLORS.lightGrey]}
                style={styles.socialGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.socialButtonText}>🔵 Continue with Google                </Text>
              </LinearGradient>
            </TouchableOpacity>
            </View>

            {/* Apple Login - iOS only */}
            {Platform.OS === 'ios' && (
              <View style={styles.socialButtonWrapper}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleAppleLogin}
                disabled={isLoggingIn || loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.black, COLORS.darkGrey]}
                  style={styles.socialGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[styles.socialButtonText, { color: COLORS.white }]}>
                    ⚫ Continue with Apple
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              </View>
            )}

            {/* Facebook Login */}
            <View style={styles.socialButtonWrapper}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleFacebookLogin}
              disabled={isLoggingIn || loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#1877F2', '#0C63D4']}
                style={styles.socialGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.socialButtonText, { color: COLORS.white }]}>
                  📘 Continue with Facebook
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Loading Indicator */}
        {(isLoggingIn || loading) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Authenticating...</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service
          </Text>
        </View>
      </View>
    </Wrapper>
  );
};

export default LoginScreen;


