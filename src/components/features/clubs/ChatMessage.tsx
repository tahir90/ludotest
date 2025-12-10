import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';
import { ClubMessage } from '$types';
import { UserAvatar } from '$components/common';

interface ChatMessageProps {
  message: ClubMessage;
  isCurrentUser?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isCurrentUser = false,
}) => {
  if (message.type === 'announcement' || message.type === 'system') {
    return (
      <View style={styles.announcementContainer}>
        <Text style={styles.announcementLabel}>ANNOUNCEMENT</Text>
        <Text style={styles.announcementText}>{message.message}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        isCurrentUser && styles.currentUserContainer,
      ]}
    >
      {!isCurrentUser && (
        <UserAvatar
          username={message.username}
          avatar={message.avatar}
          tier="C"
          size={30}
          showTier={false}
        />
      )}
      <View
        style={[
          styles.messageBubble,
          isCurrentUser && styles.currentUserBubble,
        ]}
      >
        {!isCurrentUser && (
          <Text style={styles.username}>{message.username}</Text>
        )}
        <Text
          style={[
            styles.messageText,
            isCurrentUser && styles.currentUserText,
          ]}
        >
          {message.message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  currentUserContainer: {
    flexDirection: 'row-reverse',
  },
  messageBubble: {
    maxWidth: '70%',
    backgroundColor: COLORS.cardBackground + 'CC',
    borderRadius: 15,
    padding: 10,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: COLORS.goldBorder + '40',
  },
  currentUserBubble: {
    backgroundColor: COLORS.primaryPurple + 'CC',
    marginLeft: 0,
    marginRight: 10,
  },
  username: {
    color: COLORS.gold,
    fontSize: RFValue(10),
    fontFamily: 'Philosopher-Bold',
    marginBottom: 4,
  },
  messageText: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
  },
  currentUserText: {
    color: COLORS.white,
  },
  announcementContainer: {
    backgroundColor: COLORS.cardBackground + 'CC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
  },
  announcementLabel: {
    color: COLORS.gold,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  announcementText: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
  },
});

