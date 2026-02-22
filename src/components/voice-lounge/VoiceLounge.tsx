import { useState } from 'react';
import RoomList from './RoomList';
import ChatRoom from './ChatRoom';
import type { ConversationLevelId } from '../../data/conversationData';

interface Props {
  userId: string;
  userName: string;
  isPremium?: boolean;
  autoLevel?: ConversationLevelId | null;
}

export default function VoiceLounge({ userId, userName, isPremium, autoLevel }: Props) {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeRoomName, setActiveRoomName] = useState('');

  const handleJoinRoom = (roomId: string, roomName: string) => {
    setActiveRoomId(roomId);
    setActiveRoomName(roomName);
  };

  const handleLeaveRoom = () => {
    setActiveRoomId(null);
    setActiveRoomName('');
  };

  if (activeRoomId) {
    return (
      <ChatRoom
        roomId={activeRoomId}
        roomName={activeRoomName}
        userId={userId}
        userName={userName}
        onLeave={handleLeaveRoom}
        isPremium={isPremium}
        autoLevel={autoLevel}
      />
    );
  }

  return <RoomList onJoinRoom={handleJoinRoom} />;
}
