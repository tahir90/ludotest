import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';
import Wrapper from '$components/Wrapper';
import BottomNav from '$components/layout/BottomNav';
import { TabButton } from '$components/common';
import { MicSlot } from '$components/features/clubs/MicSlot';
import { ThresholdBar } from '$components/features/clubs/ThresholdBar';
import { ChatMessage } from '$components/features/clubs/ChatMessage';
import {
  mockMyClub,
  mockMicSlots,
  mockClubMessages,
  mockClubMembers,
} from '$services/mockData';
import { ClubMessage, MicSlot as MicSlotType } from '$types';
import { navigate } from '$helpers/navigationUtils';
import {
  HeartIcon,
  UserPlusIcon,
  ShareIcon,
  ArrowRightOnRectangleIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  GiftIcon,
  SpeakerXMarkIcon,
} from 'react-native-heroicons/solid';
import { useRoute, useIsFocused } from '@react-navigation/native';
import { useUser } from '$hooks/useUser';
import { playSound, toggleMusicMute, getMusicMuted, stopSound, setMusicVolume } from '$helpers/SoundUtils';

const ClubRoomScreen: React.FC = () => {
  const route = useRoute();
  const { user: currentUser } = useUser();
  const clubId = (route.params as any)?.clubId || mockMyClub.id;
  const club = mockMyClub;

  const [activeTab, setActiveTab] = useState<'Chat' | 'Info'>('Chat');
  const [micSlots, setMicSlots] = useState<MicSlotType[]>(mockMicSlots);
  const [messages, setMessages] = useState<ClubMessage[]>(mockClubMessages);
  const [messageText, setMessageText] = useState('');
  const [isMuted, setIsMuted] = useState(false); // Voice chat mute
  const [isMicOn, setIsMicOn] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const isFocused = useIsFocused();

  const handleSendMessage = () => {
    if (messageText.trim()) {
      if (!currentUser) return;
      
      const newMessage: ClubMessage = {
        id: `msg_${Date.now()}`,
        userId: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
        message: messageText,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      setMessages([...messages, newMessage]);
      setMessageText('');
    }
  };

  const handleGiftPress = () => {
    navigate('GiftShopScreen', { clubId: club.id });
  };

  // Music control
  useEffect(() => {
    if (isFocused) {
      // Initialize mute state
      setIsMusicMuted(getMusicMuted());
      
      // Just adjust volume to 40% without restarting music
      // If music is already playing, it will just change volume
      // If not playing, it will start
      playSound('home', true, 0.4).catch(err => console.error('Error adjusting music:', err));
    } else {
      // Restore full volume when leaving this screen
      setMusicVolume(1.0).catch(err => console.error('Error restoring volume:', err));
    }
  }, [isFocused]);

  const handleMusicMuteToggle = async () => {
    const muted = await toggleMusicMute();
    setIsMusicMuted(muted);
  };

  return (
    <Wrapper style={{ justifyContent: 'flex-start', paddingTop: 0 }}>
      {/* Club Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.clubAvatar}>
            <Text style={styles.clubAvatarText}>
              {club.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.clubInfo}>
            <Text style={styles.clubName}>{club.name}</Text>
            <Text style={styles.clubId}>ID: {club.id}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerButton, isMusicMuted && styles.musicMutedButton]}
            onPress={handleMusicMuteToggle}
          >
            {isMusicMuted ? (
              <SpeakerXMarkIcon size={24} color={COLORS.error} />
            ) : (
              <SpeakerWaveIcon size={24} color={COLORS.gold} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <HeartIcon size={24} color={COLORS.error} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <UserPlusIcon size={24} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <ShareIcon size={24} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigate('HomeScreen', {})}
          >
            <ArrowRightOnRectangleIcon size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mic Slots Grid */}
      <View style={styles.micSlotsContainer}>
        <View style={styles.micSlotsGrid}>
          {micSlots.map((slot) => (
            <MicSlot key={slot.id} slot={slot} />
          ))}
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        <TabButton
          label="Chat"
          active={activeTab === 'Chat'}
          onPress={() => setActiveTab('Chat')}
        />
        <TabButton
          label="Info"
          active={activeTab === 'Info'}
          onPress={() => setActiveTab('Info')}
        />
      </View>

      {/* Content */}
      {activeTab === 'Chat' && (
        <View style={styles.chatContainer}>
          <ScrollView
            style={styles.chatScroll}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            <ThresholdBar current={club.currentThreshold || 0} />
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isCurrentUser={message.userId === currentUser?.id}
              />
            ))}
          </ScrollView>
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Tap here to type..."
              placeholderTextColor={COLORS.lightGrey}
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeTab === 'Info' && (
        <ScrollView
          style={styles.infoScroll}
          contentContainerStyle={styles.infoContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoSection}>
            <Text style={styles.infoSectionTitle}>Owner</Text>
            <View style={styles.memberRow}>
              <Text style={styles.memberName}>{club.ownerUsername || 'KING'}</Text>
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerBadgeText}>OWNER</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={styles.statLabel}>Admins</Text>
                <Text style={styles.statValue}>1</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>👥</Text>
                <Text style={styles.statLabel}>Members</Text>
                <Text style={styles.statValue}>{club.memberCount}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoSectionTitle}>Description</Text>
            <Text style={styles.description}>{club.description}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoSectionTitle}>Rules</Text>
            <Text style={styles.rules}>{club.rules || 'No rules set'}</Text>
          </View>
        </ScrollView>
      )}

      {/* Bottom Action Bar */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.actionButton, isMuted && styles.actionButtonActive]}
          onPress={() => setIsMuted(!isMuted)}
        >
          <SpeakerWaveIcon size={24} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, isMicOn && styles.actionButtonActive]}
          onPress={() => setIsMicOn(!isMicOn)}
        >
          <MicrophoneIcon size={24} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.giftButton]}
          onPress={handleGiftPress}
        >
          <GiftIcon size={24} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      <BottomNav />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.cardBackground + '80',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.goldBorder + '40',
    marginTop: 60,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clubAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryPurple,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.goldBorder,
  },
  clubAvatarText: {
    color: COLORS.white,
    fontSize: RFValue(20),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  clubInfo: {
    marginLeft: 10,
  },
  clubName: {
    color: COLORS.white,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  clubId: {
    color: COLORS.lightText,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.darkPurpleBg + '80',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: COLORS.goldBorder + '40',
  },
  micSlotsContainer: {
    padding: 15,
  },
  micSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 15,
    justifyContent: 'center',
  },
  chatContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  chatScroll: {
    flex: 1,
    maxHeight: 300,
  },
  chatContent: {
    paddingBottom: 10,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground + '80',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
  },
  chatInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    maxHeight: 80,
  },
  sendButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: COLORS.primaryPurple + '80',
    borderRadius: 10,
    marginLeft: 10,
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  infoScroll: {
    flex: 1,
  },
  infoContent: {
    padding: 15,
    paddingBottom: 100,
  },
  infoSection: {
    marginBottom: 20,
    backgroundColor: COLORS.cardBackground + '80',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
    padding: 15,
  },
  infoSectionTitle: {
    color: COLORS.gold,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberName: {
    color: COLORS.white,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
  },
  ownerBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  ownerBadgeText: {
    color: COLORS.white,
    fontSize: RFValue(10),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: RFValue(24),
    marginBottom: 5,
  },
  statLabel: {
    color: COLORS.lightText,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
    marginBottom: 5,
  },
  statValue: {
    color: COLORS.gold,
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  description: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    lineHeight: RFValue(20),
  },
  rules: {
    color: COLORS.lightText,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    lineHeight: RFValue(20),
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.cardBackground + 'CC',
    borderTopWidth: 2,
    borderTopColor: COLORS.goldBorder + '40',
    marginBottom: 70,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.darkPurpleBg + '80',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '40',
  },
  actionButtonActive: {
    backgroundColor: COLORS.success + '80',
    borderColor: COLORS.success,
  },
  giftButton: {
    backgroundColor: COLORS.primaryPurple + '80',
    borderColor: COLORS.goldBorder,
  },
  musicMutedButton: {
    backgroundColor: COLORS.error + '40',
    borderColor: COLORS.error,
  },
});

export default ClubRoomScreen;

