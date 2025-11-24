'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/utils/i18n';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    i18n.on('initialized', () => setReady(true));
    if (!i18n.isInitialized) i18n.init();
    else setReady(true);
  }, []);

  if (!ready) return null; // optionally show a loader

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
