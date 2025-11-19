import AuthGate from '../AuthGate';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AuthGateExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>Show Auth Gate</Button>
      <AuthGate
        isOpen={isOpen}
        onClose={() => {
          console.log('Auth gate closed');
          setIsOpen(false);
        }}
        onSignIn={() => {
          console.log('Sign in clicked');
          setIsOpen(false);
        }}
      />
    </div>
  );
}
