'use client';

import React from 'react';
import { Conversation } from '@elevenlabs/react';

interface ElevenLabsConversationProps {
  agentId: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
  clientTools?: Record<string, (parameters: unknown) => any>;
  children: (conversation: any) => React.ReactNode;
}

export default function ElevenLabsConversation({ 
  agentId, 
  onConnect, 
  onDisconnect, 
  onMessage, 
  onError, 
  clientTools,
  children 
}: ElevenLabsConversationProps) {
  return (
    <Conversation
      agentId={agentId}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
      onMessage={onMessage}
      onError={onError}
      clientTools={clientTools}
    >
      {children}
    </Conversation>
  );
}