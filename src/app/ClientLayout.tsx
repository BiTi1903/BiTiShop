"use client";

import { useState } from "react";
import MusicPlayer from "../components/MusicPlayer";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [showMusicPlayer, setShowMusicPlayer] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true);

  const handleCloseMusicPlayer = () => {
    setShowMusicPlayer(false);
  };

  return (
    <>
      {children}
      
      {/* Music Player - luôn hiển thị */}
      {showMusicPlayer && (
        <MusicPlayer
          isMinimized={isMinimized}
          onToggleMinimize={setIsMinimized}
          onClose={handleCloseMusicPlayer}
        />
      )}

      {/* Button để bật lại Music Player nếu đã đóng */}
      {!showMusicPlayer && (
        <button
          onClick={() => setShowMusicPlayer(true)}
          className="fixed bottom-6 right-6 p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:scale-110 transition-all duration-300 z-50"
          title="Mở Music Player"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12 6-12 6z" />
          </svg>
        </button>
      )}
    </>
  );
}