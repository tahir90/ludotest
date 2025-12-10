import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import Wrapper from '$components/Wrapper';
import TopNav from '$components/layout/TopNav';
import BottomNav from '$components/layout/BottomNav';
import { RoyaltyBanner } from '$components/features/shop/RoyaltyBanner';
import { BundleCard } from '$components/features/shop/BundleCard';
import { CROWN_BUNDLES } from '$constants/config';
import { CrownBundle } from '$types';
import { navigate } from '$helpers/navigationUtils';
import { useUser } from '$hooks/useUser';

const ShopScreen: React.FC = () => {
  const { crowns } = useUser();
  
  const handlePurchase = (bundle: CrownBundle) => {
    // Mock purchase - will be replaced with real purchase flow
    console.log('Purchasing bundle:', bundle);
    // Show purchase modal or navigate to payment
  };

  return (
    <Wrapper style={{ justifyContent: 'flex-start', paddingTop: 0 }}>
      <TopNav title="Shop" showBack={true} />
      
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

        {/* Royalty Banner */}
        <RoyaltyBanner />

        {/* Gifts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🎁</Text>
            <Text style={styles.sectionTitle}>GIFTS</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Send special gifts to your friends and club members!
          </Text>
          <TouchableOpacity
            style={styles.giftsButton}
            onPress={() => navigate('GiftShopScreen', {})}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.gradientGold}
              style={styles.giftsButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.giftsButtonText}>Browse Gifts Shop</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Crown Bundles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>👑</Text>
            <Text style={styles.sectionTitle}>CROWNS</Text>
          </View>
          
          <View style={styles.bundlesGrid}>
            {CROWN_BUNDLES.map((bundle) => (
              <BundleCard
                key={bundle.id}
                bundle={bundle}
                onPurchase={handlePurchase}
              />
            ))}
          </View>
        </View>
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
  section: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    fontSize: RFValue(24),
    marginRight: 10,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: RFValue(20),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  bundlesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionDescription: {
    color: COLORS.lightText,
    fontSize: RFValue(13),
    fontFamily: 'Philosopher-Regular',
    marginBottom: 15,
    lineHeight: RFValue(18),
  },
  giftsButton: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  giftsButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftsButtonText: {
    color: COLORS.darkPurpleBg,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
});

export default ShopScreen;

