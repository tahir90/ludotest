import { useAppSelector, useAppDispatch } from './useAppStore';
import {
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
  setClubLoading,
} from '$redux/reducers/clubSlice';
import { Club, ClubMember, MicSlot, ClubMessage } from '$types';

export const useClubs = () => {
  const dispatch = useAppDispatch();
  const myClub = useAppSelector((state) => state.club.myClub);
  const clubs = useAppSelector((state) => state.club.clubs);
  const currentClubRoom = useAppSelector((state) => state.club.currentClubRoom);
  const giftingThreshold = useAppSelector((state) => state.club.giftingThreshold);
  const currentThreshold = useAppSelector((state) => state.club.currentThreshold);
  const members = useAppSelector((state) => state.club.members);
  const micSlots = useAppSelector((state) => state.club.micSlots);
  const messages = useAppSelector((state) => state.club.messages);
  const loading = useAppSelector((state) => state.club.loading);

  return {
    myClub,
    clubs,
    currentClubRoom,
    giftingThreshold,
    currentThreshold,
    members,
    micSlots,
    messages,
    loading,
    joinClub: (club: Club) => dispatch(joinClub(club)),
    leaveClub: () => dispatch(leaveClub()),
    createClub: (club: Club) => dispatch(createClub(club)),
    setCurrentClubRoom: (club: Club | null) => dispatch(setCurrentClubRoom(club)),
    updateGiftingThreshold: (amount: number) => dispatch(updateGiftingThreshold(amount)),
    addToGiftingThreshold: (amount: number) => dispatch(addToGiftingThreshold(amount)),
    resetGiftingThreshold: () => dispatch(resetGiftingThreshold()),
    loadClubMembers: (newMembers: ClubMember[]) => dispatch(loadClubMembers(newMembers)),
    updateMicSlots: (slots: MicSlot[]) => dispatch(updateMicSlots(slots)),
    addMessage: (message: ClubMessage) => dispatch(addMessage(message)),
    setMessages: (newMessages: ClubMessage[]) => dispatch(setMessages(newMessages)),
    setLoading: (isLoading: boolean) => dispatch(setClubLoading(isLoading)),
  };
};

