import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const SimpleAudioSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audio Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Audio settings are temporarily disabled for build stability.</p>
      </CardContent>
    </Card>
  );
};

export default SimpleAudioSettings;