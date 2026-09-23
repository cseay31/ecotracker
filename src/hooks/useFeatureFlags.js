import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Single source of truth for feature-flag defaults, shared by the admin
// SettingsTab and any page that reads flags (Scanner, Splash).
export const DEFAULT_FEATURE_FLAGS = {
  photo_gallery: true,
  forums: true,
  audio_enabled: true,
};

// Loads SystemSetting.feature_flags once on mount. SystemSetting has an open
// read policy, so this works for authenticated and public pages alike; on any
// fetch failure the defaults are kept so the app degrades gracefully.
export function useFeatureFlags() {
  const [flags, setFlags] = useState(DEFAULT_FEATURE_FLAGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    base44.entities.SystemSetting.list(1)
      .then((list) => {
        if (!alive) return;
        const s = list[0];
        setFlags({ ...DEFAULT_FEATURE_FLAGS, ...((s && s.feature_flags) || {}) });
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { flags, loading };
}