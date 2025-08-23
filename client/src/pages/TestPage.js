import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Test Page</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Test</CardTitle>
              <CardDescription>Testing our shadcn/ui components</CardDescription>
            </CardHeader>
            <CardContent className="space-x-4">
              <Button>Default Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badge Test</CardTitle>
            </CardHeader>
            <CardContent className="space-x-4">
              <Badge>Default Badge</Badge>
              <Badge variant="secondary">Secondary Badge</Badge>
              <Badge variant="destructive">Destructive Badge</Badge>
              <Badge variant="outline">Outline Badge</Badge>
            </CardContent>
          </Card>

          <div className="bg-blue-500 text-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Tailwind CSS Test</h2>
            <p>If you can see this blue box with white text, Tailwind CSS is working!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
