import React from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import CollaborationHome from './collaboration/CollaborationHome';

interface CollaborationSectionProps {
  user: FirebaseUser | null;
  onSignIn: () => void;
  onNavigateToConsole?: () => void;
}

export default function CollaborationSection({ user, onSignIn, onNavigateToConsole }: CollaborationSectionProps) {
  return (
    <div id="collaboration_wrapper">
      <CollaborationHome user={user} onSignIn={onSignIn} onNavigateToConsole={onNavigateToConsole} />
    </div>
  );
}
