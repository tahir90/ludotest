import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import ResourceBar from './ResourceBar';

interface TopNavProps {
  title: string;
  showBack?: boolean;
  rightComponent?: React.ReactNode;
}

const TopNav: React.FC<TopNavProps> = ({ title, showBack = true, rightComponent }) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <ResourceBar />
      <View style={styles.navBar}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <ArrowLeftIcon size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
        {rightComponent ? (
          <View style={styles.rightContainer}>{rightComponent}</View>
        ) : (
          <View style={styles.rightContainer} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 60,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: COLORS.darkPurpleBg + '80',
  },
  backButton: {
    padding: 5,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.white,
    fontSize: RFValue(20),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  rightContainer: {
    width: 34, // Same width as back button for centering
    alignItems: 'flex-end',
  },
});

export default TopNav;

