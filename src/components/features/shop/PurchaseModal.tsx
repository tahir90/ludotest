import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { DEVICE_WIDTH } from '$constants/dimensions';
import { CrownBundle } from '$types';
import { XMarkIcon, CheckCircleIcon } from 'react-native-heroicons/solid';
import { PrimaryButton } from '$components/common';
import { playSound } from '$helpers/SoundUtils';

interface PurchaseModalProps {
  visible: boolean;
  bundle: CrownBundle | null;
  onConfirm: () => void;
  onCancel: () => void;
  success?: boolean;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  visible,
  bundle,
  onConfirm,
  onCancel,
  success = false,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, scaleAnim]);

  if (!bundle) return null;

  const formatCrowns = (crowns: number): string => {
    if (crowns >= 1000) {
      return `${(crowns / 1000).toFixed(1)}k`;
    }
    return crowns.toString();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={COLORS.gradientPurple}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.content}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <XMarkIcon size={24} color={COLORS.white} />
              </TouchableOpacity>

              {success ? (
                <View style={styles.successContainer}>
                  <CheckCircleIcon size={60} color={COLORS.success} />
                  <Text style={styles.successTitle}>Purchase Successful!</Text>
                  <Text style={styles.successText}>
                    You received {formatCrowns(bundle.crowns + bundle.bonus)} Crowns
                  </Text>
                  <PrimaryButton
                    title="Awesome!"
                    onPress={onCancel}
                    style={styles.confirmButton}
                  />
                </View>
              ) : (
                <>
                  <Text style={styles.title}>Purchase Crowns</Text>
                  <View style={styles.bundleInfo}>
                    <Text style={styles.crownIcon}>👑</Text>
                    <Text style={styles.crownAmount}>
                      {formatCrowns(bundle.crowns)}
                    </Text>
                    {bundle.bonus > 0 && (
                      <View style={styles.bonusContainer}>
                        <Text style={styles.bonusText}>
                          +{formatCrowns(bundle.bonus)} Bonus
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Price:</Text>
                    <Text style={styles.price}>
                      {bundle.price} {bundle.currency}
                    </Text>
                  </View>
                  <View style={styles.buttonsContainer}>
                    <PrimaryButton
                      title="Cancel"
                      onPress={onCancel}
                      style={[styles.button, styles.cancelButton]}
                      gradientColors={[COLORS.grey, COLORS.darkGrey]}
                    />
                    <PrimaryButton
                      title="Confirm Purchase"
                      onPress={onConfirm}
                      style={[styles.button, styles.confirmButton]}
                      gradientColors={[COLORS.success, COLORS.success + 'DD']}
                    />
                  </View>
                </>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
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
    width: DEVICE_WIDTH * 0.85,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  gradient: {
    padding: 3,
    borderRadius: 20,
  },
  content: {
    backgroundColor: COLORS.cardBackground + 'FF',
    borderRadius: 17,
    borderWidth: 3,
    borderColor: COLORS.goldBorder,
    padding: 25,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: COLORS.error + '40',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    color: COLORS.white,
    fontSize: RFValue(24),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  bundleInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  crownIcon: {
    fontSize: RFValue(50),
    marginBottom: 10,
  },
  crownAmount: {
    color: COLORS.gold,
    fontSize: RFValue(32),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bonusContainer: {
    backgroundColor: COLORS.success + '40',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bonusText: {
    color: COLORS.success,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    padding: 15,
    backgroundColor: COLORS.darkPurpleBg + '80',
    borderRadius: 10,
  },
  priceLabel: {
    color: COLORS.lightText,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    marginRight: 10,
  },
  price: {
    color: COLORS.gold,
    fontSize: RFValue(20),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    marginRight: 5,
  },
  confirmButton: {
    marginLeft: 5,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successTitle: {
    color: COLORS.success,
    fontSize: RFValue(24),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  successText: {
    color: COLORS.white,
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    textAlign: 'center',
    marginBottom: 25,
  },
});

