import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Slider } from './slider';
import { Switch } from './switch';
import { Badge } from './badge';
import { Separator } from './separator';
import { Volume2, VolumeX, Music, Zap, Bell, Settings } from 'lucide-react';

interface AudioSettingsProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const AudioSettings: React.FC<AudioSettingsProps> = ({ isOpen, onClose }) => {
  const [volumes, setVolumes] = useState({
    master: 70,
    sfx: 80,
    music: 60
  });
  const [enabled, setEnabled] = useState({
    sfx: true,
    music: true
  });

  const handleVolumeChange = useCallback((type: 'master' | 'sfx' | 'music', value: number[]) => {
    setVolumes(prev => ({ ...prev, [type]: value[0] }));
  }, []);

  const handleSoundToggle = useCallback((type: 'sfx' | 'music', isEnabled: boolean) => {
    setEnabled(prev => ({ ...prev, [type]: isEnabled }));
  }, []);

  const handlePreviewSound = useCallback((soundName: string) => {
    // Simple sound preview placeholder
    console.log(`Playing sound: ${soundName}`);
  }, []);

  if (isOpen === false) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Audio Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Volume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Master Volume</span>
              <Badge variant="outline">{volumes.master}%</Badge>
            </div>
            <Slider
              value={[volumes.master]}
              onValueChange={(value) => handleVolumeChange('master', value)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Sound Effects */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Sound Effects</span>
              </div>
              <Switch
                checked={enabled.sfx}
                onCheckedChange={(checked) => handleSoundToggle('sfx', checked)}
              />
            </div>
            
            {enabled.sfx && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">SFX Volume</span>
                  <Badge variant="outline">{volumes.sfx}%</Badge>
                </div>
                <Slider
                  value={[volumes.sfx]}
                  onValueChange={(value) => handleVolumeChange('sfx', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />

                <div className="grid grid-cols-2 gap-2 mt-4">
                  {['Button Click', 'Coin Collect', 'Achievement', 'Game Over'].map((label, index) => (
                    <Button
                      key={label}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewSound(label.toLowerCase().replace(' ', ''))}
                      className="justify-start"
                    >
                      <Volume2 className="h-3 w-3 mr-2" />
                      {label}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Background Music */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <span className="text-sm font-medium">Background Music</span>
              </div>
              <Switch
                checked={enabled.music}
                onCheckedChange={(checked) => handleSoundToggle('music', checked)}
              />
            </div>
            
            {enabled.music && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Music Volume</span>
                  <Badge variant="outline">{volumes.music}%</Badge>
                </div>
                <Slider
                  value={[volumes.music]}
                  onValueChange={(value) => handleVolumeChange('music', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />

                <div className="grid grid-cols-1 gap-2 mt-4">
                  {['Menu Theme', 'Gameplay Music', 'Victory Theme'].map((label) => (
                    <Button
                      key={label}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewSound(label.toLowerCase().replace(' ', ''))}
                      className="justify-start"
                    >
                      <Music className="h-3 w-3 mr-2" />
                      {label}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>

          {onClose && (
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioSettings;