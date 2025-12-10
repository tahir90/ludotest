import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';
import Wrapper from '$components/Wrapper';
import TopNav from '$components/layout/TopNav';
import BottomNav from '$components/layout/BottomNav';
import {
  UserIcon,
  LockClosedIcon,
  ArrowRightOnRectangleIcon,
  SpeakerWaveIcon,
  MusicalNoteIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
} from 'react-native-heroicons/solid';

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  showArrow?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  onPress,
  showArrow = true,
}) => {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.settingItemLeft}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {showArrow && <Text style={styles.arrow}>›</Text>}
    </TouchableOpacity>
  );
};

interface ToggleItemProps {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

const ToggleItem: React.FC<ToggleItemProps> = ({ icon, label, value, onToggle }) => {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.grey, true: COLORS.success }}
        thumbColor={COLORS.white}
      />
    </View>
  );
};

const SettingsScreen: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [chatNotifEnabled, setChatNotifEnabled] = useState(true);

  return (
    <Wrapper style={{ justifyContent: 'flex-start', paddingTop: 0 }}>
      <TopNav title="Settings" showBack={true} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<UserIcon size={24} color={COLORS.white} />}
              label="Edit Profile"
              onPress={() => {}}
            />
            <SettingItem
              icon={<LockClosedIcon size={24} color={COLORS.white} />}
              label="Change Password"
              onPress={() => {}}
            />
            <SettingItem
              icon={<ArrowRightOnRectangleIcon size={24} color={COLORS.error} />}
              label="Logout"
              onPress={() => {}}
              showArrow={false}
            />
          </View>
        </View>

        {/* Game Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game</Text>
          <View style={styles.sectionContent}>
            <ToggleItem
              icon={<SpeakerWaveIcon size={24} color={COLORS.white} />}
              label="Sound Effects"
              value={soundEnabled}
              onToggle={setSoundEnabled}
            />
            <ToggleItem
              icon={<MusicalNoteIcon size={24} color={COLORS.white} />}
              label="Music"
              value={musicEnabled}
              onToggle={setMusicEnabled}
            />
            <ToggleItem
              icon={<Text style={styles.vibrationIcon}>📳</Text>}
              label="Vibration"
              value={vibrationEnabled}
              onToggle={setVibrationEnabled}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            <ToggleItem
              icon={<BellIcon size={24} color={COLORS.white} />}
              label="Push Notifications"
              value={notifEnabled}
              onToggle={setNotifEnabled}
            />
            <ToggleItem
              icon={<ChatBubbleLeftRightIcon size={24} color={COLORS.white} />}
              label="Chat Notifications"
              value={chatNotifEnabled}
              onToggle={setChatNotifEnabled}
            />
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
  section: {
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.gold,
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionContent: {
    backgroundColor: COLORS.cardBackground + '80',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.goldBorder + '20',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.darkPurpleBg + '80',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  vibrationIcon: {
    fontSize: RFValue(20),
  },
  settingLabel: {
    color: COLORS.white,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    flex: 1,
  },
  arrow: {
    color: COLORS.gold,
    fontSize: RFValue(24),
    fontFamily: 'Philosopher-Bold',
  },
});

export default SettingsScreen;

