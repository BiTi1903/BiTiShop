"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Heart, Minimize2, Maximize2, X, Music } from "lucide-react";

// 🎵 playlist mẫu
const playlist = [
  { 
    title: "Lofi Chill Vibes", 
    artist: "None", 
    src: "audio/background.mp3", 
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center",
    duration: "3:45"
  },
  { 
    title: "Bên trên tầng lầu", 
    artist: "Tăng Duy Tân", 
    src: "/audio/bentrentanglau.mp3", 
    cover: "https://photo-zmp3.zadn.vn/avatars/b/5/a/8/b5a8579c44d3e1b1319edf1ad48e41e4.jpg",
    duration: "4:12"
  },
  { 
    title: "Cắt đôi nỗi sầu", 
    artist: "Tăng Duy Tân", 
    src: "/audio/catdoinoisau.mp3", 
    cover: "https://photo-zmp3.zadn.vn/avatars/b/5/a/8/b5a8579c44d3e1b1319edf1ad48e41e4.jpg",
    duration: "5:03"
  },
  { 
    title: "EDM", 
    artist: "None", 
    src: "/audio/EDM.mp3", 
    cover: "https://yt3.googleusercontent.com/jtNDNDRZn71amRa5P1PuOAUe865ZlaeKQpC-Oq6lP3ihBlSx2IHBII1B1iQT-eKruXNyOGKF=s900-c-k-c0x00ffffff-no-rj",
    duration: "5:03"
  },{ 
    title: "Hãy trao cho anh", 
    artist: "Sơn Tùng M-TP", 
    src: "/audio/haytraochoanh.mp3", 
    cover: "https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2019/7/1/741911/Hay-Trao-Cho-Anh.jpg",
    duration: "5:03"
  },{ 
    title: "Salt", 
    artist: "Ava Max", 
    src: "/audio/salt.mp3", 
    cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop&crop=center",
    duration: "5:03"
  },
  { 
    title: "Tái sinh", 
    artist: "Remix", 
    src: "/audio/taisinh.mp3", 
    cover: "https://i.ytimg.com/vi/Jy6jJGIIUos/maxresdefault.jpg",
    duration: "5:03"
  },{ 
    title: "The Spectre", 
    artist: "Alan Walker", 
    src: "/audio/thespectre.mp3", 
    cover: "https://i.ytimg.com/vi/wJnBTPUQS5A/sddefault.jpg",
    duration: "5:03"
  },
];
interface MusicPlayerProps {
  isMinimized: boolean;
  onToggleMinimize: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
}

export default function MusicPlayer({ isMinimized, onToggleMinimize, onClose }: MusicPlayerProps) {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSong = playlist[currentSongIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [currentSongIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => console.log("Không thể phát nhạc"));
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMutedState = !isMuted;
    audioRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      audioRef.current.muted = newVolume === 0;
    }
  };

  const handleNext = () => {
    setCurrentSongIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(false);
    setTimeout(() => {
      audioRef.current?.play().catch(() => console.log("Không thể phát nhạc"));
      setIsPlaying(true);
    }, 200);
  };

  const handlePrev = () => {
    setCurrentSongIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(false);
    setTimeout(() => {
      audioRef.current?.play().catch(() => console.log("Không thể phát nhạc"));
      setIsPlaying(true);
    }, 200);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <>
      {/* Audio element - luôn render để duy trì phát nhạc */}
      <audio 
        ref={audioRef} 
        src={currentSong.src}
        onEnded={handleNext}
        preload="metadata"
      />

      {/* Phiên bản thu nhỏ */}
      {isMinimized ? (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full p-3 text-white transition-all duration-500 hover:scale-110 group z-50">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-50 group-hover:opacity-70 transition-all duration-300"></div>
          
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <img 
                src={currentSong.cover} 
                alt={currentSong.title}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                onError={(e) => {
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolygon points='10,8 16,12 10,16 10,8'/%3E%3C/svg%3E";
                }}
              />
              {isPlaying && (
                <div className="absolute inset-0 border-2 border-white/60 rounded-full animate-pulse"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 hidden sm:block">
              <p className="text-sm font-semibold truncate">{currentSong.title}</p>
              <p className="text-xs text-white/70 truncate">{currentSong.artist}</p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 hover:scale-110"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              <button 
                onClick={() => onToggleMinimize(false)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 hover:scale-110"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Phiên bản đầy đủ */
        <div className="fixed bottom-6 right-6 w-80 bg-gradient-to-br from-gray-900/95 via-purple-900/95 to-indigo-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden text-white transition-all duration-500 z-50">
          {/* Background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-50 animate-pulse"></div>
          
          {/* Header Controls */}
          <div className="relative z-10 flex justify-between items-center p-4 pb-0">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-white/80">Now Playing</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onToggleMinimize(true)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110 group"
              >
                <Minimize2 className="w-4 h-4 group-hover:text-purple-300" />
              </button>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative z-10 p-6 pt-4">
            {/* Album Art & Song Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative group">
                <img 
                  src={currentSong.cover} 
                  alt={currentSong.title}
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolygon points='10,8 16,12 10,16 10,8'/%3E%3C/svg%3E";
                  }}
                />
                {isPlaying && (
                  <div className="absolute inset-0 border-2 border-purple-400/60 rounded-2xl animate-pulse"></div>
                )}
                {/* Floating music notes animation */}
                {isPlaying && (
                  <div className="absolute -top-2 -right-2 text-purple-400 animate-bounce">♪</div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl truncate bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  {currentSong.title}
                </h3>
                <p className="text-white/70 text-sm truncate mb-2">{currentSong.artist}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">{formatTime(currentTime)}</span>
                  <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-white/50">{formatTime(duration)}</span>
                </div>
              </div>
              
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110"
              >
                <Heart 
                  className={`w-5 h-5 transition-all duration-300 ${
                    isLiked ? 'fill-red-500 text-red-500 animate-pulse' : 'text-white/70 hover:text-white'
                  }`} 
                />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <input
                type="range"
                min={0}
                max={100}
                value={duration ? (currentTime / duration) * 100 : 0}
                onChange={handleProgressChange}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <button 
                onClick={handlePrev}
                className="p-3 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 group"
              >
                <SkipBack className="w-6 h-6 group-hover:text-purple-300" />
              </button>

              <button 
                onClick={togglePlay}
                className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-full shadow-lg hover:shadow-purple-500/25 transition-all duration-200 hover:scale-110 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 animate-ping rounded-full opacity-0 hover:opacity-100"></div>
                {isPlaying ? <Pause className="w-6 h-6 relative z-10" /> : <Play className="w-6 h-6 ml-1 relative z-10" />}
              </button>

              <button 
                onClick={handleNext}
                className="p-3 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 group"
              >
                <SkipForward className="w-6 h-6 group-hover:text-purple-300" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleMute}
                onMouseEnter={() => setShowVolume(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-all duration-200"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-white/70" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white/70" />
                )}
              </button>
              
              <div 
                className={`flex-1 transition-all duration-300 ${showVolume ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
              >
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
              </div>
              
              <span className="text-xs text-white/50 w-8 text-right font-mono">
                {Math.round((isMuted ? 0 : volume) * 100)}
              </span>
            </div>

            {/* Playlist indicator */}
            <div className="mt-4 flex justify-center gap-2">
              {playlist.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSongIndex(index);
                    setIsPlaying(false);
                    setTimeout(() => {
                      audioRef.current?.play();
                      setIsPlaying(true);
                    }, 200);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSongIndex 
                      ? 'bg-purple-400 scale-125' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Custom slider styles */}
          <style jsx>{`
            .slider::-webkit-slider-thumb {
              appearance: none;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: linear-gradient(45deg, #8b5cf6, #ec4899);
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
              transition: all 0.2s ease;
              border: 2px solid white;
            }
            
            .slider::-webkit-slider-thumb:hover {
              transform: scale(1.3);
              box-shadow: 0 6px 16px rgba(139, 92, 246, 0.6);
            }
            
            .slider::-moz-range-thumb {
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: linear-gradient(45deg, #8b5cf6, #ec4899);
              cursor: pointer;
              border: 2px solid white;
              box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
            }
          `}</style>
        </div>
      )}
    </>
  );
}