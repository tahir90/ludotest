import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';
import Wrapper from '$components/Wrapper';
import TopNav from '$components/layout/TopNav';
import BottomNav from '$components/layout/BottomNav';
import { GiftCard } from '$components/features/shop/GiftCard';
import { TabButton } from '$components/common';
import { PrimaryButton } from '$components/common';
import { GIFT_CATALOG, QUANTITY_OPTIONS } from '$constants/config';
import { Gift } from '$types';
import { useUser } from '$hooks/useUser';

const GiftShopScreen: React.FC = () => {
  const { crowns } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<'Classic' | 'Royalty'>('Classic');
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('Select Friends');

  const getGiftsForCategory = (): Gift[] => {
    if (selectedCategory === 'Classic') {
      return [...GIFT_CATALOG.basic, ...GIFT_CATALOG.premium];
    }
    return GIFT_CATALOG.ultra;
  };

  const gifts = getGiftsForCategory();
  const selectedGiftData = gifts.find(g => g.id === selectedGift);
  const totalCost = selectedGiftData ? selectedGiftData.price * selectedQuantity : 0;

  const handleSend = () => {
    if (!selectedGift || !selectedGiftData) {
      return;
    }
    // Mock send gift - will be replaced with real gifting flow
    console.log('Sending gift:', {
      gift: selectedGiftData,
      quantity: selectedQuantity,
      recipient: selectedRecipient,
      totalCost,
    });
  };

  return (
    <Wrapper style={{ justifyContent: 'flex-start', paddingTop: 0 }}>
      <TopNav title="Gifts" showBack={true} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Crown Balance */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Your Crowns</Text>
          <Text style={styles.balanceAmount}>
            👑 {crowns.toLocaleString()}
          </Text>
        </View>

        {/* Recipient Selector */}
        <View style={styles.recipientContainer}>
          <Text style={styles.recipientLabel}>To:</Text>
          <TouchableOpacity
            style={styles.recipientButton}
            onPress={() => {
              // Navigate to friend selector
            }}
          >
            <Text style={styles.recipientText}>{selectedRecipient}</Text>
            <Text style={styles.recipientArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabContainer}>
          <TabButton
            label="Classic"
            active={selectedCategory === 'Classic'}
            onPress={() => setSelectedCategory('Classic')}
          />
          <TabButton
            label="Royalty"
            active={selectedCategory === 'Royalty'}
            onPress={() => setSelectedCategory('Royalty')}
          />
        </View>

        {/* Gift Grid */}
        <View style={styles.giftsGrid}>
          {gifts.map((gift) => (
            <GiftCard
              key={gift.id}
              gift={gift}
              selected={selectedGift === gift.id}
              onPress={() => setSelectedGift(gift.id)}
            />
          ))}
        </View>

        {/* Quantity Selector */}
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

        {/* Send Button */}
        <PrimaryButton
          title={`SEND${totalCost > 0 ? ` (${totalCost} 👑)` : ''}`}
          onPress={handleSend}
          disabled={!selectedGift || totalCost > crowns}
          style={styles.sendButton}
        />
      </ScrollView>

      <BottomNav />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  balanceContainer: {
    marginHorizontal: 15,
    marginTop: 10,
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
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    marginBottom: 5,
  },
  balanceAmount: {
    color: COLORS.gold,
    fontSize: RFValue(24),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  recipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  recipientLabel: {
    color: COLORS.white,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    marginRight: 10,
  },
  recipientButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.cardBackground + '80',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
  },
  recipientText: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
  },
  recipientArrow: {
    color: COLORS.gold,
    fontSize: RFValue(12),
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 15,
    justifyContent: 'center',
  },
  giftsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginBottom: 20,
  },
  quantityContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  quantityLabel: {
    color: COLORS.white,
    fontSize: RFValue(16),
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
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
  },
  quantityTextActive: {
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  sendButton: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
});

export default GiftShopScreen;

