import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface SimpleLearningPathProps {
  title?: string;
}

const SimpleLearningPath: React.FC<SimpleLearningPathProps> = ({ title = "Learning Path" }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Learning path component is temporarily simplified for build stability.</p>
      </CardContent>
    </Card>
  );
};

export default SimpleLearningPath;