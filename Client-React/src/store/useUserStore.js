import { create } from "zustand";

export const useUserStore = create((set, get) => ({
  users: [],
  setUsers: (newUsers) => {
    set({ users: [...newUsers] }); // Actualizar el estado con una nueva copia del array
    const state = get();
    console.log("establecido: ", state.users);
  },
  logUsers: () => {
    const state = get(); // Obtener el estado actual
    console.log(
      "Estado global de usuarios (zustand):",
      JSON.stringify(state.users)
    );
  },
}));
