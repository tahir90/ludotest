import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Club, ClubMember, MicSlot, ClubMessage } from '$types';
import { mockMyClub, mockClubMembers, mockMicSlots, mockClubMessages } from '$services/mockData';

interface ClubState {
  myClub: Club | null;
  clubs: Club[];
  currentClubRoom: Club | null;
  giftingThreshold: number;
  currentThreshold: number;
  members: ClubMember[];
  micSlots: MicSlot[];
  messages: ClubMessage[];
  loading: boolean;
}

const initialState: ClubState = {
  myClub: mockMyClub,
  clubs: [],
  currentClubRoom: null,
  giftingThreshold: 15000,
  currentThreshold: 8500,
  members: mockClubMembers,
  micSlots: mockMicSlots,
  messages: mockClubMessages,
  loading: false,
};

const clubSlice = createSlice({
  name: 'club',
  initialState,
  reducers: {
    joinClub: (state, action: PayloadAction<Club>) => {
      state.myClub = action.payload;
    },
    leaveClub: (state) => {
      state.myClub = null;
      state.currentClubRoom = null;
    },
    createClub: (state, action: PayloadAction<Club>) => {
      state.myClub = action.payload;
      state.clubs.push(action.payload);
    },
    setCurrentClubRoom: (state, action: PayloadAction<Club | null>) => {
      state.currentClubRoom = action.payload;
    },
    updateGiftingThreshold: (state, action: PayloadAction<number>) => {
      state.currentThreshold = action.payload;
    },
    addToGiftingThreshold: (state, action: PayloadAction<number>) => {
      state.currentThreshold = Math.min(
        state.currentThreshold + action.payload,
        state.giftingThreshold
      );
    },
    resetGiftingThreshold: (state) => {
      state.currentThreshold = 0;
    },
    loadClubMembers: (state, action: PayloadAction<ClubMember[]>) => {
      state.members = action.payload;
    },
    updateMicSlots: (state, action: PayloadAction<MicSlot[]>) => {
      state.micSlots = action.payload;
    },
    addMessage: (state, action: PayloadAction<ClubMessage>) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<ClubMessage[]>) => {
      state.messages = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  joinClub,
  leaveClub,
  createClub,
  setCurrentClubRoom,
  updateGiftingThreshold,
  addToGiftingThreshold,
  resetGiftingThreshold,
  loadClubMembers,
  updateMicSlots,
  addMessage,
  setMessages,
  setLoading: setClubLoading,
} = clubSlice.actions;

export default clubSlice.reducer;

