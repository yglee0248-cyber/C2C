import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      memberId: null,
      memberGrade: null,
      memberName: null,
      memberThumb: null,
      memberAddr: null,
      token: null,
      endTime: null,
      isReady: false,
      currentColorId: null,
      hexCode: null,

      login: ({
        memberId,
        memberGrade,
        memberName,
        memberThumb,
        memberAddr,
        token,
        endTime,
        currentColorId,
        hexCode,
      }) => {
        set({
          memberId,
          memberGrade,
          memberName,
          memberThumb,
          memberAddr,
          token,
          endTime,
          currentColorId,
          hexCode,
        });
      },
      logout: (isNotLogout = false) => {
        set({
          memberId: null,
          memberGrade: null,
          memberName: null,
          memberThumb: null,
          memberAddr: null,
          token: null,
          endTime: null,
          currentColorId: null,
          hexCode: null,
          isNotLogout,
        });
      },
      setReady: (ready) => {
        set({ isReady: ready });
      },
      setThumb: (thumb) => {
        set({ memberThumb: thumb });
      },
      setAddr: (addr) => {
        set({ memberAddr: addr });
      },
      setName: (name) => {
        set({ memberName: name });
      },
      setHexCode: (color) => {
        set({ hexCode: color });
      },
    }),
    {
      name: "auth-key",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        return {
          memberId: state.memberId,
          memberGrade: state.memberGrade,
          memberName: state.memberName,
          memberThumb: state.memberThumb,
          memberAddr: state.memberAddr,
          token: state.token,
          endTime: state.endTime,
          currentColorId: state.currentColorId,
          hexCode: state.hexCode,
        };
      },
    },
  ),
);

export default useAuthStore;
