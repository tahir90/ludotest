import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { DEVICE_WIDTH, DEVICE_HEIGHT } from '$constants/dimensions';
import LottieView from 'lottie-react-native';
import { ANIMATATIONS } from '$assets/animation';
import { ShareIcon } from 'react-native-heroicons/solid';
import { PrimaryButton } from '$components/common';
import { playSound } from '$helpers/SoundUtils';

interface ThresholdCelebrationModalProps {
  visible: boolean;
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  clubName: string;
  rewards: {
    bonus: number;
    duration: number;
    badge?: string;
  };
  onClose: () => void;
  onShare?: () => void;
}

export const ThresholdCelebrationModal: React.FC<ThresholdCelebrationModalProps> = ({
  visible,
  level,
  clubName,
  rewards,
  onClose,
  onShare,
}) => {
  useEffect(() => {
    if (visible) {
      playSound('cheer');
    }
  }, [visible]);

  const getLevelColor = () => {
    switch (level) {
      case 'legendary':
        return COLORS.gradientGold;
      case 'platinum':
        return ['#E5E4E2', '#F5F5F5'];
      case 'gold':
        return COLORS.gradientGold;
      case 'silver':
        return ['#C0C0C0', '#E8E8E8'];
      default:
        return COLORS.gradientPurple;
    }
  };

  const getLevelName = () => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={getLevelColor()}
          style={styles.container}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.content}>
            {/* Fireworks Animation */}
            <View style={styles.animationContainer}>
              <LottieView
                source={ANIMATATIONS.Firework}
                autoPlay
                loop
                style={styles.animation}
              />
            </View>

            {/* Achievement Text */}
            <Text style={styles.achievementText}>
              {getLevelName()} Achievement Unlocked!
            </Text>
            <Text style={styles.clubName}>{clubName}</Text>

            {/* Rewards */}
            <View style={styles.rewardsContainer}>
              <Text style={styles.rewardsTitle}>Rewards:</Text>
              <Text style={styles.rewardItem}>
                {rewards.bonus * 100}% Crown Bonus
              </Text>
              <Text style={styles.rewardItem}>
                Duration: {rewards.duration / 3600} hours
              </Text>
              {rewards.badge && (
                <Text style={styles.rewardItem}>Badge: {rewards.badge}</Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {onShare && (
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={onShare}
                  activeOpacity={0.8}
                >
                  <ShareIcon size={24} color={COLORS.white} />
                  <Text style={styles.shareText}>Share</Text>
                </TouchableOpacity>
              )}
              <PrimaryButton
                title="Awesome!"
                onPress={onClose}
                style={styles.closeButton}
              />
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.darkPurpleBg + 'EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: DEVICE_WIDTH * 0.9,
    borderRadius: 20,
    padding: 3,
    elevation: 10,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  content: {
    backgroundColor: COLORS.cardBackground + 'FF',
    borderRadius: 17,
    borderWidth: 3,
    borderColor: COLORS.goldBorder,
    padding: 30,
    alignItems: 'center',
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  achievementText: {
    color: COLORS.gold,
    fontSize: RFValue(28),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  clubName: {
    color: COLORS.white,
    fontSize: RFValue(20),
    fontFamily: 'Philosopher-Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  rewardsContainer: {
    width: '100%',
    backgroundColor: COLORS.darkPurpleBg + '80',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  rewardsTitle: {
    color: COLORS.gold,
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rewardItem: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    marginBottom: 5,
  },
  actionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.primaryPurple + '80',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.goldBorder,
    marginRight: 10,
  },
  shareText: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    marginLeft: 8,
  },
  closeButton: {
    flex: 1,
  },
});

