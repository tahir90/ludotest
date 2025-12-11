import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Modal from 'react-native-modal';
import { COLORS } from '$constants/colors';
import { DEVICE_HEIGHT } from '$constants/dimensions';
import { GiftCard } from '$components/features/shop/GiftCard';
import { TabButton } from '$components/common';
import { GIFT_CATALOG, QUANTITY_OPTIONS } from '$constants/config';
import { Gift } from '$types';
import { useUser } from '$hooks/useUser';
import { XMarkIcon } from 'react-native-heroicons/solid';

interface GiftCatalogBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onGiftSend: (gift: Gift, quantity: number) => void;
  recipient?: { username: string; avatar: string };
}

export const GiftCatalogBottomSheet: React.FC<GiftCatalogBottomSheetProps> = ({
  visible,
  onClose,
  onGiftSend,
  recipient,
}) => {
  const { crowns } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<'Classic' | 'Royalty'>('Classic');
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  const getGiftsForCategory = (): Gift[] => {
    if (selectedCategory === 'Classic') {
      return [...GIFT_CATALOG.basic, ...GIFT_CATALOG.premium];
    }
    return GIFT_CATALOG.ultra;
  };

  const gifts = getGiftsForCategory();
  const selectedGiftData = gifts.find(g => g.id === selectedGift);
  const totalCost = selectedGiftData ? selectedGiftData.price * selectedQuantity : 0;

  const handleGiftSelect = (gift: Gift) => {
    setSelectedGift(gift.id);
  };

  const handleSend = () => {
    if (!selectedGift || !selectedGiftData) {
      return;
    }

    // Check if user has enough crowns
    if (totalCost > crowns) {
      // Could show an error message here
      return;
    }

    // Reset selection first
    setSelectedGift(null);
    setSelectedQuantity(1);
    
    // Close the modal
    onClose();
    
    // Wait for modal animation to complete before triggering gift animation
    setTimeout(() => {
      onGiftSend(selectedGiftData, selectedQuantity);
    }, 300);
  };

  const handleClose = () => {
    setSelectedGift(null);
    setSelectedQuantity(1);
    onClose();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection={['down']}
      style={styles.modal}
      backdropColor={COLORS.black}
      backdropOpacity={0.7}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriverForBackdrop
    >
      <View style={styles.container}>
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Send Gift</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <XMarkIcon size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Crown Balance */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Your Crowns</Text>
          <Text style={styles.balanceAmount}>
            👑 {crowns.toLocaleString()}
          </Text>
        </View>

        {/* Recipient Info (if provided) */}
        {recipient && (
          <View style={styles.recipientContainer}>
            <Text style={styles.recipientLabel}>To: {recipient.username}</Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {/* Category Tabs */}
          <View style={styles.tabContainer}>
            <TabButton
              label="Classic"
              active={selectedCategory === 'Classic'}
              onPress={() => {
                setSelectedCategory('Classic');
                setSelectedGift(null);
              }}
            />
            <TabButton
              label="Royalty"
              active={selectedCategory === 'Royalty'}
              onPress={() => {
                setSelectedCategory('Royalty');
                setSelectedGift(null);
              }}
            />
          </View>

          {/* Gift Grid */}
          <View style={styles.giftsGrid}>
            {gifts.map((gift) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                selected={selectedGift === gift.id}
                onPress={() => handleGiftSelect(gift)}
              />
            ))}
          </View>

          {/* Quantity Selector */}
          {selectedGift && (
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantityButtons}>
                {QUANTITY_OPTIONS.map((qty) => (
                  <TouchableOpacity
                    key={qty}
                    style={[
                      styles.quantityButton,
                      selectedQuantity === qty && styles.quantityButtonActive,
                    ]}
                    onPress={() => setSelectedQuantity(qty)}
                  >
                    <Text
                      style={[
                        styles.quantityText,
                        selectedQuantity === qty && styles.quantityTextActive,
                      ]}
                    >
                      {qty}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Send Button */}
        {selectedGift && (
          <View style={styles.footer}>
            <View style={styles.costContainer}>
              <Text style={styles.costLabel}>Total:</Text>
              <Text style={styles.costAmount}>
                {totalCost} 👑
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.sendButton,
                (totalCost > crowns || !selectedGift) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={totalCost > crowns || !selectedGift}
            >
              <Text style={styles.sendButtonText}>SEND GIFT</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: COLORS.darkPurpleBg,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: DEVICE_HEIGHT * 0.85,
    paddingBottom: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.goldBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.goldBorder + '40',
  },
  title: {
    color: COLORS.white,
    fontSize: RFValue(20),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  balanceContainer: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
    padding: 15,
    backgroundColor: COLORS.cardBackground + '80',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
    alignItems: 'center',
  },
  balanceLabel: {
    color: COLORS.lightText,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
    marginBottom: 5,
  },
  balanceAmount: {
    color: COLORS.gold,
    fontSize: RFValue(20),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  recipientContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 10,
    backgroundColor: COLORS.cardBackground + '60',
    borderRadius: 10,
  },
  recipientLabel: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    justifyContent: 'center',
  },
  giftsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  quantityContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  quantityLabel: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    marginBottom: 10,
  },
  quantityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quantityButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: COLORS.cardBackground + '80',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '40',
    minWidth: 50,
    alignItems: 'center',
  },
  quantityButtonActive: {
    backgroundColor: COLORS.primaryPurple + '80',
    borderColor: COLORS.goldBorder,
  },
  quantityText: {
    color: COLORS.white + '80',
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
  },
  quantityTextActive: {
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: COLORS.goldBorder + '40',
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  costLabel: {
    color: COLORS.white,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
  },
  costAmount: {
    color: COLORS.gold,
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  sendButton: {
    backgroundColor: COLORS.primaryPurple,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.goldBorder,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.darkGrey + '80',
    borderColor: COLORS.darkGrey,
    opacity: 0.5,
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
});

