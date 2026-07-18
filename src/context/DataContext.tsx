import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  categories as bundledCategories,
  services as bundledServices,
  Category,
  Service,
} from '../data/services';
import { fetchBootstrap } from '../data/api';
import { REFRESH_INTERVAL_MS } from '../config';

type DataSource = 'bundled' | 'cache' | 'network';

type DataState = {
  categories: Category[];
  services: Service[];
  source: DataSource;
  lastSync: number | null;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const CACHE_KEY = 'seva.data.cache.v1';

const DataContext = createContext<DataState | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Start from the bundled snapshot so the app (and emergency numbers) work
  // instantly and fully offline, even on a first launch with no network.
  const [categories, setCategories] = useState<Category[]>(bundledCategories);
  const [services, setServices] = useState<Service[]>(bundledServices);
  const [source, setSource] = useState<DataSource>('bundled');
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyData = useCallback(
    (cats: Category[], svcs: Service[], src: DataSource, syncedAt: number | null) => {
      if (Array.isArray(cats) && cats.length) setCategories(cats);
      if (Array.isArray(svcs) && svcs.length) setServices(svcs);
      setSource(src);
      setLastSync(syncedAt);
    },
    []
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const data = await fetchBootstrap();
      const now = Date.now();
      applyData(data.categories, data.services, 'network', now);
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ ...data, syncedAt: now })
      );
    } catch (e: any) {
      setError(e?.message ?? 'Network error');
    } finally {
      setRefreshing(false);
    }
  }, [applyData]);

  useEffect(() => {
    (async () => {
      // 1) Hydrate from cache immediately (better than bundled if present).
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw);
          applyData(cached.categories, cached.services, 'cache', cached.syncedAt ?? null);
          // 2) Only hit the network if the cache is stale.
          if (!cached.syncedAt || Date.now() - cached.syncedAt > REFRESH_INTERVAL_MS) {
            refresh();
          }
          return;
        }
      } catch {
        // fall through to network
      }
      // No cache yet → fetch in background.
      refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<DataState>(
    () => ({ categories, services, source, lastSync, refreshing, error, refresh }),
    [categories, services, source, lastSync, refreshing, error, refresh]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataState {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
