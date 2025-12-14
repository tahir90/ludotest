import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';
import Wrapper from '$components/Wrapper';
import TopNav from '$components/layout/TopNav';
import { PlayerSlot } from '$components/features/lobby/PlayerSlot';
import { PrimaryButton } from '$components/common';
import { useUser } from '$hooks/useUser';
import { User } from '$types';
import { navigate } from '$helpers/navigationUtils';
import { useGame } from '$hooks/useGame';
import { CrownCard } from '$components/common';
import { ChatMessage } from '$components/features/clubs/ChatMessage';
import { ClubMessage } from '$types';
import { PlayIcon, ArrowLeftIcon } from 'react-native-heroicons/solid';

interface PlayerSlotData {
  player?: User;
  ready: boolean;
  isHost: boolean;
}

const LobbyScreen: React.FC = () => {
  const { user: currentUser } = useUser();
  const { gameState } = useGame();
  const [playerSlots, setPlayerSlots] = useState<PlayerSlotData[]>([
    { player: currentUser || undefined, ready: false, isHost: true },
    { player: undefined, ready: false, isHost: false },
    { player: undefined, ready: false, isHost: false },
    { player: undefined, ready: false, isHost: false },
  ]);
  const [isReady, setIsReady] = useState(false);
  const [entryFee] = useState(50);
  
  // Load players from game state if available
  useEffect(() => {
    // Game state should contain player information when in lobby
    // For now, initialize with current user only
    // TODO: Load from game state API when available
    if (currentUser) {
      setPlayerSlots([
        { player: currentUser, ready: false, isHost: true },
        { player: undefined, ready: false, isHost: false },
        { player: undefined, ready: false, isHost: false },
        { player: undefined, ready: false, isHost: false },
      ]);
    }
  }, [currentUser]);
  const [lobbyChat, setLobbyChat] = useState<ClubMessage[]>([
    {
      id: 'lobby_msg_1',
      userId: 'system',
      username: 'System',
      avatar: 'system',
      message: 'Welcome to the lobby!',
      timestamp: new Date().toISOString(),
      type: 'system',
    },
  ]);
  const [messageText, setMessageText] = useState('');

  const isHost = playerSlots[0]?.isHost || false;
  const allReady = playerSlots.every(
    (slot) => !slot.player || slot.ready
  );
  const allSlotsFilled = playerSlots.every((slot) => slot.player);

  const handleToggleReady = () => {
    setIsReady(!isReady);
    const newSlots = [...playerSlots];
    if (newSlots[0]?.player) {
      newSlots[0].ready = !isReady;
    }
    setPlayerSlots(newSlots);
  };

  const handleStartGame = () => {
    if (allReady && allSlotsFilled) {
      navigate('LudoBoardScreen', {});
    }
  };

  const handleLeave = () => {
    navigate('HomeScreen', {});
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      if (!currentUser) return;
      
      const newMessage: ClubMessage = {
        id: `lobby_msg_${Date.now()}`,
        userId: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
        message: messageText,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      setLobbyChat([...lobbyChat, newMessage]);
      setMessageText('');
    }
  };

  return (
    <Wrapper style={{ justifyContent: 'flex-start', paddingTop: 0 }}>
      <TopNav title="Lobby" showBack={true} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Game Mode Header */}
        <View style={styles.modeHeader}>
          <View style={styles.modeIcon}>
            <Text style={styles.modeNumber}>4</Text>
          </View>
          <View style={styles.modeInfo}>
            <Text style={styles.modeTitle}>4 Player Match</Text>
            <View style={styles.entryFeeRow}>
              <Text style={styles.entryFeeLabel}>Entry Fee:</Text>
              <CrownCard crowns={entryFee} size="small" />
            </View>
          </View>
        </View>

        {/* Player Slots */}
        <View style={styles.playerSlotsContainer}>
          <View style={styles.playerSlotsGrid}>
            {playerSlots.map((slot, index) => (
              <PlayerSlot
                key={index}
                player={slot.player}
                ready={slot.ready}
                isHost={slot.isHost}
                slotNumber={index + 1}
              />
            ))}
          </View>
        </View>

        {/* Chat Box */}
        <View style={styles.chatContainer}>
          <Text style={styles.chatTitle}>Lobby Chat</Text>
          <ScrollView
            style={styles.chatScroll}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {lobbyChat.map((message) => (
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
              placeholder="Type a message..."
              placeholderTextColor={COLORS.lightGrey}
              value={messageText}
              onChangeText={setMessageText}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionsContainer}>
          {isHost ? (
            <PrimaryButton
              title="Start Game"
              onPress={handleStartGame}
              disabled={!allReady || !allSlotsFilled}
              style={styles.actionButton}
            />
          ) : (
            <PrimaryButton
              title={isReady ? 'Ready ✓' : 'Ready'}
              onPress={handleToggleReady}
              style={styles.actionButton}
              gradientColors={isReady ? [COLORS.success, COLORS.success + 'DD'] : undefined}
            />
          )}
          <PrimaryButton
            title="Leave"
            onPress={handleLeave}
            style={[styles.actionButton, styles.leaveButton]}
            gradientColors={[COLORS.error, COLORS.error + 'DD']}
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
    paddingBottom: 100,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    backgroundColor: COLORS.cardBackground + '80',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
  },
  modeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryPurple,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.goldBorder,
  },
  modeNumber: {
    color: COLORS.white,
    fontSize: RFValue(32),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  modeInfo: {
    flex: 1,
    marginLeft: 15,
  },
  modeTitle: {
    color: COLORS.white,
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  entryFeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryFeeLabel: {
    color: COLORS.lightText,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    marginRight: 8,
  },
  playerSlotsContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  playerSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chatContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
    backgroundColor: COLORS.cardBackground + '80',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
    padding: 15,
    maxHeight: 250,
  },
  chatTitle: {
    color: COLORS.gold,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chatScroll: {
    maxHeight: 150,
    marginBottom: 10,
  },
  chatContent: {
    paddingBottom: 10,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkPurpleBg + '80',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chatInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
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
  actionsContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 10,
  },
  leaveButton: {
    marginBottom: 0,
  },
});

export default LobbyScreen;

