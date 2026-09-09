import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import TopBanner from '@/components/TopBanner';

export default function GlobalBanner() {
  const [text, setText] = useState('');
  useEffect(() => {
    let alive = true;
    base44.entities.SystemSetting.list(1)
      .then((list) => {
        if (alive) setText((list[0] && list[0].top_alert_banner) || '');
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  return <TopBanner text={text} />;
}