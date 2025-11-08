import { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

export default function Image({ fallbackSrc = 'https://picsum.photos/800/1200?blur=1', onError, referrerPolicy = 'no-referrer', loading = 'lazy', decoding = 'async', fetchPriority = 'auto' as any, ...rest }: Props) {
  const [errored, setErrored] = useState(false);
  const safe = (() => {
    try { return new URLSearchParams(window.location.search).get('safe') === '1'; } catch { return false; }
  })();
  const effLoading = safe ? ('eager' as any) : (loading as any);
  const effDecoding = safe ? ('sync' as any) : (decoding as any);
  const effPriority = safe ? ('high' as any) : (fetchPriority as any);
  return (
    <img
      {...rest}
      loading={effLoading}
      decoding={effDecoding}
      fetchPriority={effPriority}
      referrerPolicy={referrerPolicy as any}
      onError={(e) => {
        if (!errored && fallbackSrc) {
          setErrored(true);
          (e.currentTarget as HTMLImageElement).src = fallbackSrc;
          return;
        }
        onError?.(e);
      }}
    />
  );
}
