import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const LearnWeb3Page: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Learn Web3 Page</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page is temporarily simplified for build stability.
            The full learning experience will be restored once all TypeScript errors are resolved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearnWeb3Page;