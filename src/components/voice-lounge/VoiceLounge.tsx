import { useState } from 'react';
import RoomList from './RoomList';
import ChatRoom from './ChatRoom';

interface Props {
  userId: string;
  userName: string;
}

export default function VoiceLounge({ userId, userName }: Props) {
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
      />
    );
  }

  return <RoomList onJoinRoom={handleJoinRoom} />;
}
