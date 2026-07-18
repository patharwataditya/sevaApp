import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Gender = 'male' | 'female' | 'other';

export type UserProfile = {
  name: string;
  gender: Gender;
  ageGroup: string; // e.g. "18-25"
  phone?: string;
  bloodGroup?: string;
};

export type LocationInfo = {
  stateCode: string | null;
  stateName: string | null;
  district: string | null;
  city: string | null;
  detected: boolean; // true if from GPS, false if manually picked
};

type AppState = {
  ready: boolean;
  onboarded: boolean;
  profile: UserProfile | null;
  location: LocationInfo | null;
  saveProfile: (p: UserProfile) => Promise<void>;
  saveLocation: (l: LocationInfo) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetAll: () => Promise<void>;
};

const STORAGE_KEYS = {
  profile: 'seva.profile',
  location: 'seva.location',
  onboarded: 'seva.onboarded',
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [location, setLocation] = useState<LocationInfo | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [[, p], [, l], [, o]] = await AsyncStorage.multiGet([
          STORAGE_KEYS.profile,
          STORAGE_KEYS.location,
          STORAGE_KEYS.onboarded,
        ]);
        if (p) setProfile(JSON.parse(p));
        if (l) setLocation(JSON.parse(l));
        if (o === 'true') setOnboarded(true);
      } catch (e) {
        // ignore corrupt storage — user just re-onboards
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const saveProfile = useCallback(async (p: UserProfile) => {
    setProfile(p);
    await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(p));
  }, []);

  const saveLocation = useCallback(async (l: LocationInfo) => {
    setLocation(l);
    await AsyncStorage.setItem(STORAGE_KEYS.location, JSON.stringify(l));
  }, []);

  const completeOnboarding = useCallback(async () => {
    setOnboarded(true);
    await AsyncStorage.setItem(STORAGE_KEYS.onboarded, 'true');
  }, []);

  const resetAll = useCallback(async () => {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    setProfile(null);
    setLocation(null);
    setOnboarded(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        ready,
        onboarded,
        profile,
        location,
        saveProfile,
        saveLocation,
        completeOnboarding,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
