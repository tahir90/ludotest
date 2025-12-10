import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, GiftTransaction } from '$types';

interface Message {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: string;
  type?: 'text' | 'gift' | 'system';
}

interface SocialState {
  friends: User[];
  friendRequests: User[];
  messages: Message[];
  gifts: GiftTransaction[];
  loading: boolean;
}

const initialState: SocialState = {
  friends: [],
  friendRequests: [],
  messages: [],
  gifts: [],
  loading: false,
};

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    addFriend: (state, action: PayloadAction<User>) => {
      if (!state.friends.find((f) => f.id === action.payload.id)) {
        state.friends.push(action.payload);
      }
    },
    removeFriend: (state, action: PayloadAction<string>) => {
      state.friends = state.friends.filter((f) => f.id !== action.payload);
    },
    setFriends: (state, action: PayloadAction<User[]>) => {
      state.friends = action.payload;
    },
    addFriendRequest: (state, action: PayloadAction<User>) => {
      if (!state.friendRequests.find((f) => f.id === action.payload.id)) {
        state.friendRequests.push(action.payload);
      }
    },
    removeFriendRequest: (state, action: PayloadAction<string>) => {
      state.friendRequests = state.friendRequests.filter(
        (f) => f.id !== action.payload
      );
    },
    setFriendRequests: (state, action: PayloadAction<User[]>) => {
      state.friendRequests = action.payload;
    },
    sendGift: (state, action: PayloadAction<GiftTransaction>) => {
      state.gifts.unshift(action.payload);
    },
    addGift: (state, action: PayloadAction<GiftTransaction>) => {
      state.gifts.unshift(action.payload);
    },
    sendMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    loadFriendRequests: (state, action: PayloadAction<User[]>) => {
      state.friendRequests = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  addFriend,
  removeFriend,
  setFriends,
  addFriendRequest,
  removeFriendRequest,
  setFriendRequests,
  sendGift,
  addGift,
  sendMessage,
  addMessage,
  setMessages,
  loadFriendRequests,
  setLoading: setSocialLoading,
} = socialSlice.actions;

export default socialSlice.reducer;

