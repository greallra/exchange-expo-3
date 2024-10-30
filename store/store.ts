import { create } from "zustand";
import { esGetCollection } from "exchanges-shared";
type Language = {
  name: string;
  url: boolean;
};
type User = {
  id: string;
  uid: string;
  username: string;
  email: string;
  teachingLanguageId: string;
  learningLanguageId: string;
};

import {
  signInWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import {
  appendAuthDataToUser,
  esGetDoc,
  formatUserData,
} from "exchanges-shared";
import { FIREBASE_DB } from "@/firebase/firebaseConfig";

type Store = {
  loading: boolean;
  setLoading: () => void;
  user: User;
  users: User[];
  languages: Language[];
  getData: () => void;
  fetchCurrentUser: () => void;
  setNav: () => void;
  navOpen: boolean;
  activePage: "";
  setActivePage: () => void;
};

export const useStore = create<Store>()((set) => ({
  loading: true,
  setLoading: (bool: boolean): void => {
    set({ loading: bool });
  },
  user: undefined, // <-- initially "unknown"
  signIn: async (username: string, password: string): Promise<void> => {
    // login process
  },
  getData: async (): Promise<void> => {
    try {
      const { data: languages } = await esGetCollection(
        FIREBASE_DB,
        "languages"
      );
      const { data: users } = await esGetCollection(FIREBASE_DB, "users");
      await set(() => ({ languages, users }));
      set((store) => ({ user: formatUserData(store.user, store.languages) }));
    } catch (error) {
      console.log("getData err", error);
    }
  },
  fetchCurrentUser: async (): Promise<void> => {
    try {
      // const response: AxiosResponse<AuthResponse> = await apiSecure.get(`/auth/currentuser`);

      // const { data } = response.data;
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        console.log("onAuthStateChanged");

        //admin
        // if (location.pathname.includes('admin')) {
        //   return;
        // }
        // if no user setUser(LS) to null
        if (!user) {
          return set({ user: null });
          // return navigate('/', { replace: true });
        }
        console.log("zus auth user", user);
        const userData = appendAuthDataToUser(user);

        return esGetDoc(FIREBASE_DB, "users", user.uid)
          .then(({ docSnap }) => {
            const combinedAuthAndCollection = {
              ...userData,
              ...docSnap.data(),
            };
            set((store) => {
              return { user: combinedAuthAndCollection };
            });

            // login(combinedAuthAndCollection);
          })
          .catch((e) => console.log(e));
      });
    } catch (error: unknown) {
      // Handle authentication errors
      set({ user: null }); // <-- auth failed, set null
    }
  },
  languages: [],
  navOpen: false,
  setNav: (bool: boolean): void => {
    set({ navOpen: bool });
  },
  activePage: "",
  setActivePage: (page: string): void => {
    set({ activePage: page });
  },
}));
