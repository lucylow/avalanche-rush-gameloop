// src/hooks/useSocial.ts
import { useCallback, useMemo, useState } from 'react';

export interface SocialProfile {
  address: string;
  username?: string;
  lens?: string;
  farcaster?: string;
}

export interface SharePayload {
  title: string;
  url: string;
  text?: string;
  hashtags?: string[];
}

export function useSocial(currentUser?: SocialProfile) {
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  const follow = useCallback((address: string) => {
    setFollowing(prev => ({ ...prev, [address.toLowerCase()]: true }));
  }, []);

  const unfollow = useCallback((address: string) => {
    setFollowing(prev => {
      const copy = { ...prev };
      delete copy[address.toLowerCase()];
      return copy;
    });
  }, []);

  const isFollowing = useCallback((address: string) => !!following[address.toLowerCase()], [following]);

  const buildTwitterShare = useCallback((p: SharePayload) => {
    const params = new URLSearchParams({
      url: p.url,
      text: p.text ?? p.title,
      hashtags: (p.hashtags ?? []).join(',')
    });
    return `https://twitter.com/intent/tweet?${params.toString()}`;
  }, []);

  const buildFarcasterShare = useCallback((p: SharePayload) => {
    const cast = `${p.title} ${p.url} ${p.hashtags && p.hashtags.length ? '#' + p.hashtags.join(' #') : ''}`.trim();
    return `https://warpcast.com/~/compose?text=${encodeURIComponent(cast)}`;
  }, []);

  const buildLensShare = useCallback((p: SharePayload) => {
    // Generic lens share deeplink (varies by client)
    const text = `${p.title}\n${p.url}`;
    return `https://hey.xyz/?text=${encodeURIComponent(text)}`;
  }, []);

  const copyLink = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const shareBuilders = useMemo(() => ({ buildTwitterShare, buildFarcasterShare, buildLensShare }), [buildTwitterShare, buildFarcasterShare, buildLensShare]);

  return {
    currentUser,
    follow,
    unfollow,
    isFollowing,
    following,
    copyLink,
    ...shareBuilders,
  };
}
