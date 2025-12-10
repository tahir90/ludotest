import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';
import { DEVICE_WIDTH, DEVICE_HEIGHT } from '$constants/dimensions';
import LottieView from 'lottie-react-native';
import { Gift } from '$types';
import { UserAvatar } from '$components/common';
import { playSound } from '$helpers/SoundUtils';

interface GiftAnimationModalProps {
  visible: boolean;
  gift: Gift | null;
  sender: { username: string; avatar: string };
  receiver: { username: string; avatar: string };
  onClose: () => void;
}

export const GiftAnimationModal: React.FC<GiftAnimationModalProps> = ({
  visible,
  gift,
  sender,
  receiver,
  onClose,
}) => {
  useEffect(() => {
    if (visible && gift) {
      playSound('cheer');
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, gift, onClose]);

  if (!gift) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.animationContainer}>
            <Text style={styles.giftIcon}>
              {gift.icon === 'rose' ? '🌹' :
               gift.icon === 'heart' ? '❤️' :
               gift.icon === 'star' ? '⭐' :
               gift.icon === 'crown' ? '👑' :
               gift.icon === 'diamond' ? '💎' :
               gift.icon === 'trophy' ? '🏆' :
               gift.icon === 'mega_crown' ? '👑' : '🎁'}
            </Text>
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.userRow}>
              <UserAvatar
                username={sender.username}
                avatar={sender.avatar}
                tier="C"
                size={40}
                showTier={false}
              />
              <Text style={styles.arrow}>→</Text>
              <UserAvatar
                username={receiver.username}
                avatar={receiver.avatar}
                tier="C"
                size={40}
                showTier={false}
              />
            </View>
            <Text style={styles.giftName}>{gift.name}</Text>
            <Text style={styles.giftPrice}>{gift.price} 👑</Text>
          </View>
        </View>
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
    width: DEVICE_WIDTH * 0.8,
    backgroundColor: COLORS.cardBackground + 'FF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.goldBorder,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  animationContainer: {
    marginBottom: 20,
  },
  giftIcon: {
    fontSize: RFValue(80),
  },
  infoContainer: {
    alignItems: 'center',
    width: '100%',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  arrow: {
    color: COLORS.gold,
    fontSize: RFValue(24),
    marginHorizontal: 15,
  },
  giftName: {
    color: COLORS.white,
    fontSize: RFValue(20),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  giftPrice: {
    color: COLORS.gold,
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
  },
});

