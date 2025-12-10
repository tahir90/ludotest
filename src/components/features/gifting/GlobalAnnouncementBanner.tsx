import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { DEVICE_WIDTH } from '$constants/dimensions';
import { FireIcon } from 'react-native-heroicons/solid';

interface GlobalAnnouncementBannerProps {
  visible: boolean;
  clubName: string;
  level: string;
  onPress: () => void;
  onDismiss: () => void;
  autoDismissTime?: number;
}

export const GlobalAnnouncementBanner: React.FC<GlobalAnnouncementBannerProps> = ({
  visible,
  clubName,
  level,
  onPress,
  onDismiss,
  autoDismissTime = 15000,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss timer
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onDismiss();
        });
      }, autoDismissTime);

      return () => clearTimeout(timer);
    }
  }, [visible, slideAnim, opacityAnim, autoDismissTime, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.primaryMagenta, COLORS.primaryPurple]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.content}>
            <FireIcon size={24} color={COLORS.gold} />
            <View style={styles.textContainer}>
              <Text style={styles.text}>
                {clubName} hit {level}!
              </Text>
              <Text style={styles.subtext}>Tap to join the celebration</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onDismiss}
              activeOpacity={0.8}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 2000,
    paddingHorizontal: 15,
  },
  touchable: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  gradient: {
    padding: 2,
    borderRadius: 15,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground + 'FF',
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.goldBorder,
    padding: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  text: {
    color: COLORS.white,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  subtext: {
    color: COLORS.lightText,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
    marginTop: 2,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.error + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  closeText: {
    color: COLORS.white,
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
});

