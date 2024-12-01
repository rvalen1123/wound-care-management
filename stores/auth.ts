// src/stores/authStore.ts
import { defineStore } from 'pinia';

interface User {
  id: number;
  name: string;
  email: string;
}
}

  state: (): { user: User | null } => ({
    user: null,
  }),
    user: null,
  }),
    setUser(user: User) {
    setUser(user) {
      this.user = user;
    },
    clearUser() {
      this.user = null;
    },
  },
});
