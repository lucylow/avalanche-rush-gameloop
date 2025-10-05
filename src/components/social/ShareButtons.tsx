// src/components/social/ShareButtons.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { useSocial, SharePayload } from '@/hooks/useSocial';

interface ShareButtonsProps {
  payload: SharePayload;
  className?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ payload, className }) => {
  const { buildTwitterShare, buildFarcasterShare, buildLensShare, copyLink } = useSocial();

  const onCopy = async () => {
    const ok = await copyLink(payload.url);
    if (ok) {
      // noop visual feedback left to parent/UI toaster
    }
  };

  return (
    <div className={className ? className : 'flex gap-2'}>
      <a href={buildTwitterShare(payload)} target="_blank" rel="noreferrer">
        <Button variant="outline">Share on X</Button>
      </a>
      <a href={buildFarcasterShare(payload)} target="_blank" rel="noreferrer">
        <Button variant="outline">Cast</Button>
      </a>
      <a href={buildLensShare(payload)} target="_blank" rel="noreferrer">
        <Button variant="outline">Post Lens</Button>
      </a>
      <Button variant="outline" onClick={onCopy}>Copy Link</Button>
    </div>
  );
};

export default ShareButtons;
