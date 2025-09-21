import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import gsap from "gsap";

function VideoPlayer({
  width = "100%",
  height = "100%",
  url,
  onVideoEnded = () => {},
}) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const controlsRef = useRef(null); // Ref for controls div

  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function handlePlayAndPause() {
    setPlaying(!playing);
  }

  function handleProgress(state) {
    if (!seeking) {
      setPlayed(state.played);
      setCurrentTime(state.playedSeconds);
    }
  }

  function handleDuration(newDuration) {
    setDuration(newDuration);
  }

  function handleVideoEnded() {
    console.log("Video ended - calling onVideoEnded callback");
    if (onVideoEnded && typeof onVideoEnded === 'function') {
      onVideoEnded();
    }
  }


  function handleRewind() {
    const currentTime = playerRef?.current?.getCurrentTime();
    if (currentTime && isFinite(currentTime)) {
      playerRef?.current?.seekTo(currentTime - 5);
    }
  }

  function handleForward() {
    const currentTime = playerRef?.current?.getCurrentTime();
    if (currentTime && isFinite(currentTime)) {
      playerRef?.current?.seekTo(currentTime + 5);
    }
  }

  function handleToggleMute() {
    setMuted(!muted);
  }

  function handleSeekChange(newValue) {
    const seekValue = newValue[0];
    if (isFinite(seekValue)) {
      setPlayed(seekValue);
      setCurrentTime(seekValue * duration);
    }
    setSeeking(true);
  }

  function handleSeekMouseUp() {
    setSeeking(false);
    if (isFinite(played)) {
      playerRef.current?.seekTo(played);
      setCurrentTime(played * duration);
    }
  }

  function handleVolumeChange(newValue) {
    const volumeValue = newValue[0];
    if (isFinite(volumeValue)) {
      setVolume(volumeValue);
    }
  }

  function pad(string) {
    return ("0" + string).slice(-2);
  }


  const handleFullScreen = useCallback(() => {
    if (!isFullScreen) {
      if (playerContainerRef?.current?.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullScreen]);

  function handleMouseMove() {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  }

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    // Animate controls visibility with a more pronounced effect
    if (controlsRef.current) {
      gsap.to(controlsRef.current, {
        opacity: showControls ? 1 : 0,
        y: showControls ? 0 : 30, // Slide up/down effect
        scale: showControls ? 1 : 0.95, // Slight scale effect
        duration: 0.4,
        ease: "power3.out",
        pointerEvents: showControls ? "auto" : "none",
      });
    }
  }, [showControls]);


  // Reset progress when URL changes (new lecture)
  useEffect(() => {
    setPlayed(0);
    setCurrentTime(0);
    console.log("Video URL changed, resetting progress to 0");
  }, [url]);

  return (
    <div
      ref={playerContainerRef}
      className={`relative bg-black rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ease-in-out 
      ${isFullScreen ? "w-screen h-screen" : ""}
      `}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={() => setShowControls(true)}
    >
      <ReactPlayer
        ref={playerRef}
        className="absolute top-0 left-0"
        width="100%"
        height="100%"
        url={url}
        playing={playing}
        volume={volume}
        muted={muted}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={handleVideoEnded}
        config={{
          file: {
            attributes: {
              playsInline: true,
            },
          },
        }}
      />
      <div
        ref={controlsRef}
        className={`absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-black/80 to-transparent`}
        style={{ opacity: 0, pointerEvents: "none" }}
      >
        <Slider
          value={[played * 100]}
          max={100}
          step={0.1}
          onValueChange={(value) => handleSeekChange([value[0] / 100])}
          onValueCommit={handleSeekMouseUp}
          className="w-full mb-2 sm:mb-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-runnable-track]:bg-gray-600"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayAndPause}
              className="text-white hover:bg-white/20 transition-colors duration-200 h-8 w-8 sm:h-10 sm:w-10"
            >
              {playing ? (
                <Pause className="h-4 w-4 sm:h-6 sm:w-6" />
              ) : (
                <Play className="h-4 w-4 sm:h-6 sm:w-6" />
              )}
            </Button>
            <Button
              onClick={handleRewind}
              className="text-white hover:bg-white/20 transition-colors duration-200 h-8 w-8 sm:h-10 sm:w-10"
              variant="ghost"
              size="icon"
            >
              <RotateCcw className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>
            <Button
              onClick={handleForward}
              className="text-white hover:bg-white/20 transition-colors duration-200 h-8 w-8 sm:h-10 sm:w-10"
              variant="ghost"
              size="icon"
            >
              <RotateCw className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>
            <Button
              onClick={handleToggleMute}
              className="text-white hover:bg-white/20 transition-colors duration-200 h-8 w-8 sm:h-10 sm:w-10"
              variant="ghost"
              size="icon"
            >
              {muted ? (
                <VolumeX className="h-4 w-4 sm:h-6 sm:w-6" />
              ) : (
                <Volume2 className="h-4 w-4 sm:h-6 sm:w-6" />
              )}
            </Button>
            <div className="hidden sm:block">
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={(value) => handleVolumeChange([value[0] / 100])}
                className="w-20 sm:w-24 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-runnable-track]:bg-gray-600"
              />
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="text-white text-xs sm:text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <Button
              className="text-white hover:bg-white/20 transition-colors duration-200 h-8 w-8 sm:h-10 sm:w-10"
              variant="ghost"
              size="icon"
              onClick={handleFullScreen}
            >
              {isFullScreen ? (
                <Minimize className="h-4 w-4 sm:h-6 sm:w-6" />
              ) : (
                <Maximize className="h-4 w-4 sm:h-6 sm:w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;