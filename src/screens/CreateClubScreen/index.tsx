import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';
import Wrapper from '$components/Wrapper';
import TopNav from '$components/layout/TopNav';
import { PrimaryButton } from '$components/common';
import { navigate } from '$helpers/navigationUtils';
import { useClubs } from '$hooks/useClubs';
import { Club } from '$types';

const CreateClubScreen: React.FC = () => {
  const [clubName, setClubName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private' | 'invite-only'>('public');
  const { createClub } = useClubs();

  const handleCreate = () => {
    if (!clubName.trim()) {
      Alert.alert('Error', 'Please enter a club name');
      return;
    }

    if (clubName.length < 3) {
      Alert.alert('Error', 'Club name must be at least 3 characters');
      return;
    }

    const newClub: Club = {
      id: `club_${Date.now()}`,
      name: clubName.trim(),
      avatar: 'https://i.pravatar.cc/150?img=65',
      description: description.trim() || 'Welcome to our club!',
      owner: 'user_123', // Current user ID
      ownerUsername: 'YOU',
      memberCount: 1,
      maxMembers: 50,
      totalCrowns: 0,
      level: 1,
      privacy,
      rules: rules.trim() || 'Be respectful and have fun!',
      language: 'English',
      giftingThreshold: 1000,
      currentThreshold: 0,
    };

    createClub(newClub);
    Alert.alert('Success', 'Club created successfully!', [
      {
        text: 'OK',
        onPress: () => navigate('ClubsScreen', {}),
      },
    ]);
  };

  return (
    <Wrapper style={{ justifyContent: 'flex-start', paddingTop: 0 }}>
      <TopNav title="Create Club" showBack={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.header}>Create Your Club</Text>
          <Text style={styles.subheader}>
            Build your own community and invite friends to play together!
          </Text>

          {/* Club Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Club Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter club name..."
              placeholderTextColor={COLORS.lightGrey}
              value={clubName}
              onChangeText={setClubName}
              maxLength={30}
            />
            <Text style={styles.charCount}>{clubName.length}/30</Text>
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your club..."
              placeholderTextColor={COLORS.lightGrey}
              value={description}
              onChangeText={setDescription}
              maxLength={150}
              multiline
              numberOfLines={4}
            />
            <Text style={styles.charCount}>{description.length}/150</Text>
          </View>

          {/* Rules */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Club Rules</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Set your club rules..."
              placeholderTextColor={COLORS.lightGrey}
              value={rules}
              onChangeText={setRules}
              maxLength={200}
              multiline
              numberOfLines={4}
            />
            <Text style={styles.charCount}>{rules.length}/200</Text>
          </View>

          {/* Privacy Settings */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Privacy *</Text>
            <View style={styles.privacyOptions}>
              <TouchableOpacity
                style={[
                  styles.privacyOption,
                  privacy === 'public' && styles.privacyOptionActive,
                ]}
                onPress={() => setPrivacy('public')}
              >
                <Text
                  style={[
                    styles.privacyOptionText,
                    privacy === 'public' && styles.privacyOptionTextActive,
                  ]}
                >
                  🌍 Public
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.privacyOption,
                  privacy === 'private' && styles.privacyOptionActive,
                ]}
                onPress={() => setPrivacy('private')}
              >
                <Text
                  style={[
                    styles.privacyOptionText,
                    privacy === 'private' && styles.privacyOptionTextActive,
                  ]}
                >
                  🔒 Private
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.privacyOption,
                  privacy === 'invite-only' && styles.privacyOptionActive,
                ]}
                onPress={() => setPrivacy('invite-only')}
              >
                <Text
                  style={[
                    styles.privacyOptionText,
                    privacy === 'invite-only' && styles.privacyOptionTextActive,
                  ]}
                >
                  💌 Invite Only
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Creating a club is free! Manage your club, invite friends, and compete together.
            </Text>
          </View>

          {/* Create Button */}
          <PrimaryButton
            title="Create Club"
            onPress={handleCreate}
            style={styles.createButton}
            gradientColors={COLORS.gradientGold}
          />
        </View>
      </ScrollView>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  container: {
    padding: 20,
  },
  header: {
    color: COLORS.gold,
    fontSize: RFValue(24),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subheader: {
    color: COLORS.lightText,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Regular',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: RFValue(20),
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Regular',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  charCount: {
    color: COLORS.lightGrey,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Regular',
    textAlign: 'right',
    marginTop: 5,
  },
  privacyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  privacyOption: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.purpleBorder,
    paddingVertical: 15,
    alignItems: 'center',
  },
  privacyOptionActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.primaryPurple + '40',
  },
  privacyOptionText: {
    color: COLORS.lightText,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
  },
  privacyOptionTextActive: {
    color: COLORS.gold,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryPurple + '40',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
    padding: 15,
    marginBottom: 30,
  },
  infoIcon: {
    fontSize: RFValue(20),
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    color: COLORS.lightText,
    fontSize: RFValue(13),
    fontFamily: 'Philosopher-Regular',
    lineHeight: RFValue(18),
  },
  createButton: {
    marginTop: 10,
  },
});

export default CreateClubScreen;

