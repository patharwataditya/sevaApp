import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';

// A tiny stack navigator — enough for this app's linear flow, with no extra
// native dependencies. Each entry is a route name plus optional params.

export type Route = { name: string; params?: Record<string, any> };

type NavState = {
  stack: Route[];
  current: Route;
  navigate: (name: string, params?: Record<string, any>) => void;
  replace: (name: string, params?: Record<string, any>) => void;
  goBack: () => void;
  reset: (name: string, params?: Record<string, any>) => void;
  canGoBack: boolean;
};

const NavContext = createContext<NavState | undefined>(undefined);

export function NavProvider({
  initial,
  children,
}: {
  initial: Route;
  children: React.ReactNode;
}) {
  const [stack, setStack] = useState<Route[]>([initial]);

  const navigate = useCallback((name: string, params?: Record<string, any>) => {
    setStack((s) => [...s, { name, params }]);
  }, []);

  const replace = useCallback((name: string, params?: Record<string, any>) => {
    setStack((s) => [...s.slice(0, -1), { name, params }]);
  }, []);

  const goBack = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  const reset = useCallback((name: string, params?: Record<string, any>) => {
    setStack([{ name, params }]);
  }, []);

  const current = stack[stack.length - 1];

  // Android hardware back button mirrors the in-app back navigation.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) {
        setStack((s) => s.slice(0, -1));
        return true; // handled
      }
      return false; // let the OS exit the app
    });
    return () => sub.remove();
  }, [stack.length]);

  return (
    <NavContext.Provider
      value={{ stack, current, navigate, replace, goBack, reset, canGoBack: stack.length > 1 }}
    >
      {children}
    </NavContext.Provider>
  );
}

export function useNav(): NavState {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
