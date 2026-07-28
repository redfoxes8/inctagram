import { create } from "zustand"
import { ProfileStore } from "./user.types"

export const useProfileStore = create<ProfileStore>((set) => ({
  cachedProfile: null,
  setCachedProfile: (profile) => set({ cachedProfile: profile }),
}))
