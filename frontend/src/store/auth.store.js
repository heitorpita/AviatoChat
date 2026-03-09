import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      usuario: null,
      token: null,

      setAuth: (usuario, token) => set({ usuario, token }),

      updateUsuario: (data) =>
        set((state) => ({ usuario: { ...state.usuario, ...data } })),

      logout: () => set({ usuario: null, token: null }),
    }),
    {
      name: 'auth-store',
    }
  )
)
