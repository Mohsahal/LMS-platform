// import { useCallback, useEffect, useRef, useState } from "react";
// import PropTypes from "prop-types";
// import ReactPlayer from "react-player";
// import { Slider } from "../ui/slider";
// import { Button } from "../ui/button";
// import {
//   Maximize,
//   Minimize,
//   Pause,
//   Play,
//   RotateCcw,
//   RotateCw,
//   Volume2,
//   VolumeX,
// } from "lucide-react";

// function VideoPlayer({
//   width = "100%",
//   height = "100%",
//   url,
//   onProgressUpdate,
//   progressData,
// }) {
//   const [playing, setPlaying] = useState(false);
//   const [volume, setVolume] = useState(0.5);
//   const [muted, setMuted] = useState(false);
//   const [played, setPlayed] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [seeking, setSeeking] = useState(false);
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [showControls, setShowControls] = useState(true);
//   const [isReady, setIsReady] = useState(false);
//   const [hasEnded, setHasEnded] = useState(false);

//   const playerRef = useRef(null);
//   const playerContainerRef = useRef(null);
//   const controlsTimeoutRef = useRef(null);
//   const completionTriggeredRef = useRef(false);
//   const progressUpdateTimeoutRef = useRef(null);

//   function handlePlayAndPause() {
//     setPlaying(!playing);
//   }

//   function handleProgress(state) {
//     if (!seeking) {
//       setPlayed(state.played);
      
//       // Clear any existing timeout
//       if (progressUpdateTimeoutRef.current) {
//         clearTimeout(progressUpdateTimeoutRef.current);
//       }
      
//       // Update progress data immediately
//       if (typeof onProgressUpdate === "function" && progressData) {
//         onProgressUpdate({
//           ...progressData,
//           progressValue: state.played,
//         });
//       }
      
//       // Trigger completion callback when video reaches 90% completion
//       if (state.played >= 0.9 && !completionTriggeredRef.current) {
//         completionTriggeredRef.current = true;
//         console.log("Video completion triggered at:", state.played);
        
//         if (typeof onProgressUpdate === "function" && progressData) {
//           onProgressUpdate({
//             ...progressData,
//             progressValue: state.played,
//             completed: true,
//           });
//         }
//       }
//     }
//   }

//   function handleDuration(duration) {
//     setDuration(duration);
//     console.log("Video duration loaded:", duration, "seconds");
//   }

//   function handleReady() {
//     setIsReady(true);
//     setHasEnded(false);
//     // Reset completion trigger when new video loads
//     completionTriggeredRef.current = false;
    
//     // Get duration when ready
//     const videoDuration = playerRef?.current?.getDuration();
//     if (videoDuration && videoDuration > 0) {
//       setDuration(videoDuration);
//     }
    
//     console.log("Video ready, duration:", videoDuration);
//   }

//   function handleEnded() {
//     console.log("Video ended");
//     setHasEnded(true);
//     setPlaying(false);
    
//     // Ensure completion is triggered when video ends
//     if (!completionTriggeredRef.current) {
//       completionTriggeredRef.current = true;
//       console.log("Triggering completion on video end");
      
//       if (typeof onProgressUpdate === "function" && progressData) {
//         onProgressUpdate({
//           ...progressData,
//           progressValue: 1,
//           completed: true,
//         });
//       }
//     }
//   }

//   function handleRewind() {
//     const currentTime = playerRef?.current?.getCurrentTime() || 0;
//     playerRef?.current?.seekTo(Math.max(0, currentTime - 10));
//   }

//   function handleForward() {
//     const currentTime = playerRef?.current?.getCurrentTime() || 0;
//     const videoDuration = playerRef?.current?.getDuration() || 0;
//     playerRef?.current?.seekTo(Math.min(videoDuration, currentTime + 10));
//   }

//   function handleToggleMute() {
//     setMuted(!muted);
//   }

//   function handleSeekChange(newValue) {
//     setPlayed(newValue[0]);
//     setSeeking(true);
//   }

//   function handleSeekMouseUp() {
//     setSeeking(false);
//     playerRef.current?.seekTo(played, "fraction");
//   }

//   function handleVolumeChange(newValue) {
//     setVolume(newValue[0]);
//   }

//   function pad(string) {
//     return ("0" + string).slice(-2);
//   }

//   function formatTime(seconds) {
//     if (!seconds || isNaN(seconds) || seconds === 0) return "0:00";
    
//     const date = new Date(seconds * 1000);
//     const hh = date.getUTCHours();
//     const mm = date.getUTCMinutes();
//     const ss = pad(date.getUTCSeconds());

//     if (hh) {
//       return `${hh}:${pad(mm)}:${ss}`;
//     }

//     return `${mm}:${ss}`;
//   }

//   const handleFullScreen = useCallback(() => {
//     if (!isFullScreen) {
//       if (playerContainerRef?.current.requestFullscreen) {
//         playerContainerRef?.current?.requestFullscreen();
//       }
//     } else {
//       if (document.exitFullscreen) {
//         document.exitFullscreen();
//       }
//     }
//   }, [isFullScreen]);

//   function handleMouseMove() {
//     setShowControls(true);
//     clearTimeout(controlsTimeoutRef.current);
//     controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
//   }

//   // Reset everything when URL changes
//   useEffect(() => {
//     console.log("Video URL changed to:", url);
//     completionTriggeredRef.current = false;
//     setPlayed(0);
//     setIsReady(false);
//     setDuration(0);
//     setHasEnded(false);
//     setPlaying(false);
    
//     // Clear any pending timeouts
//     if (progressUpdateTimeoutRef.current) {
//       clearTimeout(progressUpdateTimeoutRef.current);
//     }
//   }, [url]);

//   // Try to get duration periodically if not available
//   useEffect(() => {
//     if (isReady && duration === 0) {
//       const interval = setInterval(() => {
//         const videoDuration = playerRef?.current?.getDuration();
//         if (videoDuration && videoDuration > 0) {
//           setDuration(videoDuration);
//           clearInterval(interval);
//         }
//       }, 1000);

//       return () => clearInterval(interval);
//     }
//   }, [isReady, duration]);

//   useEffect(() => {
//     const handleFullScreenChange = () => {
//       setIsFullScreen(document.fullscreenElement);
//     };

//     document.addEventListener("fullscreenchange", handleFullScreenChange);

//     return () => {
//       document.removeEventListener("fullscreenchange", handleFullScreenChange);
//     };
//   }, []);

//   useEffect(() => {
//     const controlsTimeout = controlsTimeoutRef.current;
//     const progressTimeout = progressUpdateTimeoutRef.current;
    
//     return () => {
//       if (controlsTimeout) {
//         clearTimeout(controlsTimeout);
//       }
//       if (progressTimeout) {
//         clearTimeout(progressTimeout);
//       }
//     };
//   }, []);

//   return (
//     <div
//       ref={playerContainerRef}
//       className={`relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ease-in-out 
//       ${isFullScreen ? "w-screen h-screen" : ""}
//       `}
//       style={{ width, height }}
//       onMouseMove={handleMouseMove}
//       onMouseLeave={() => setShowControls(false)}
//     >
//       <ReactPlayer
//         ref={playerRef}
//         className="absolute top-0 left-0"
//         width="100%"
//         height="100%"
//         url={url}
//         playing={playing}
//         volume={volume}
//         muted={muted}
//         onProgress={handleProgress}
//         onDuration={handleDuration}
//         onReady={handleReady}
//         onEnded={handleEnded}
//         onError={(error) => {
//           console.error("Video player error:", error);
//         }}
//         config={{
//           file: {
//             attributes: {
//               crossOrigin: "anonymous",
//             },
//           },
//         }}
//       />
      
//       {/* Loading indicator */}
//       {!isReady && url && (
//         <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
//           <div className="text-white text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
//             <p>Loading video...</p>
//           </div>
//         </div>
//       )}

//       {/* No video placeholder */}
//       {!url && (
//         <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
//           <div className="text-white text-center">
//             <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
//             <p className="text-lg">No video available</p>
//           </div>
//         </div>
//       )}

//       {/* Video ended overlay */}
//       {hasEnded && (
//         <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
//           <div className="text-white text-center">
//             <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Play className="h-8 w-8" />
//             </div>
//             <p className="text-xl font-semibold mb-2">Video Completed!</p>
//             <p className="text-sm opacity-75">Use the Next button to continue</p>
//           </div>
//         </div>
//       )}

//       {showControls && url && !hasEnded && (
//         <div
//           className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
//             showControls ? "opacity-100" : "opacity-0"
//           }`}
//         >
//           {/* Progress Bar */}
//           <div className="mb-4">
//             <Slider
//               value={[played * 100]}
//               max={100}
//               step={0.1}
//               onValueChange={(value) => handleSeekChange([value[0] / 100])}
//               onValueCommit={handleSeekMouseUp}
//               className="w-full"
//             />
//           </div>
          
//           {/* Controls */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={handlePlayAndPause}
//                 className="text-white bg-transparent hover:text-white hover:bg-white/20 rounded-full"
//               >
//                 {playing ? (
//                   <Pause className="h-6 w-6" />
//                 ) : (
//                   <Play className="h-6 w-6" />
//                 )}
//               </Button>
//               <Button
//                 onClick={handleRewind}
//                 className="text-white bg-transparent hover:text-white hover:bg-white/20 rounded-full"
//                 variant="ghost"
//                 size="icon"
//               >
//                 <RotateCcw className="h-5 w-5" />
//               </Button>
//               <Button
//                 onClick={handleForward}
//                 className="text-white bg-transparent hover:text-white hover:bg-white/20 rounded-full"
//                 variant="ghost"
//                 size="icon"
//               >
//                 <RotateCw className="h-5 w-5" />
//               </Button>
//               <Button
//                 onClick={handleToggleMute}
//                 className="text-white bg-transparent hover:text-white hover:bg-white/20 rounded-full"
//                 variant="ghost"
//                 size="icon"
//               >
//                 {muted ? (
//                   <VolumeX className="h-5 w-5" />
//                 ) : (
//                   <Volume2 className="h-5 w-5" />
//                 )}
//               </Button>
//               <div className="w-20">
//                 <Slider
//                   value={[volume * 100]}
//                   max={100}
//                   step={1}
//                   onValueChange={(value) => handleVolumeChange([value[0] / 100])}
//                   className="w-full"
//                 />
//               </div>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               {/* Time Display */}
//               <div className="text-white text-sm font-mono">
//                 {duration > 0 ? (
//                   <>
//                     {formatTime(played * duration)} / {formatTime(duration)}
//                   </>
//                 ) : (
//                   <>
//                     {formatTime(played * (playerRef?.current?.getDuration() || 0))} / {playerRef?.current?.getDuration() > 0 ? formatTime(playerRef?.current?.getDuration()) : "Loading..."}
//                   </>
//                 )}
//               </div>
              
//               {/* Fullscreen Button */}
//               <Button
//                 className="text-white bg-transparent hover:text-white hover:bg-white/20 rounded-full"
//                 variant="ghost"
//                 size="icon"
//                 onClick={handleFullScreen}
//               >
//                 {isFullScreen ? (
//                   <Minimize className="h-5 w-5" />
//                 ) : (
//                   <Maximize className="h-5 w-5" />
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// export default VideoPlayer;

// VideoPlayer.propTypes = {
//   width: PropTypes.string,
//   height: PropTypes.string,
//   url: PropTypes.string,
//   onProgressUpdate: PropTypes.func,
//   progressData: PropTypes.object,
// };

// VideoPlayer.defaultProps = {
//   width: "100%",
//   height: "100%",
//   url: "",
//   onProgressUpdate: undefined,
//   progressData: undefined,
// };


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

function VideoPlayer({
  width = "100%",
  height = "100%",
  url,
  onProgressUpdate,
  progressData,
}) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  function handlePlayAndPause() {
    setPlaying(!playing);
  }

  function handleProgress(state) {
    if (!seeking) {
      setPlayed(state.played);
    }
  }

  function handleRewind() {
    playerRef?.current?.seekTo(playerRef?.current?.getCurrentTime() - 5);
  }

  function handleForward() {
    playerRef?.current?.seekTo(playerRef?.current?.getCurrentTime() + 5);
  }

  function handleToggleMute() {
    setMuted(!muted);
  }

  function handleSeekChange(newValue) {
    setPlayed(newValue[0]);
    setSeeking(true);
  }

  function handleSeekMouseUp() {
    setSeeking(false);
    playerRef.current?.seekTo(played);
  }

  function handleVolumeChange(newValue) {
    setVolume(newValue[0]);
  }

  function pad(string) {
    return ("0" + string).slice(-2);
  }

  function formatTime(seconds) {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = pad(date.getUTCSeconds());

    if (hh) {
      return `${hh}:${pad(mm)}:${ss}`;
    }

    return `${mm}:${ss}`;
  }

  const handleFullScreen = useCallback(() => {
    if (!isFullScreen) {
      if (playerContainerRef?.current.requestFullscreen) {
        playerContainerRef?.current?.requestFullscreen();
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
    if (played === 1) {
      onProgressUpdate({
        ...progressData,
        progressValue: played,
      });
    }
  }, [played]);

  return (
    <div
      ref={playerContainerRef}
      className={`relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ease-in-out 
      ${isFullScreen ? "w-screen h-screen" : ""}
      `}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
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
      />
      {showControls && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-75 p-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <Slider
            value={[played * 100]}
            max={100}
            step={0.1}
            onValueChange={(value) => handleSeekChange([value[0] / 100])}
            onValueCommit={handleSeekMouseUp}
            className="w-full mb-4"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayAndPause}
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
              >
                {playing ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>
              <Button
                onClick={handleRewind}
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                variant="ghost"
                size="icon"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
              <Button
                onClick={handleForward}
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                variant="ghost"
                size="icon"
              >
                <RotateCw className="h-6 w-6" />
              </Button>
              <Button
                onClick={handleToggleMute}
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                variant="ghost"
                size="icon"
              >
                {muted ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </Button>
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={(value) => handleVolumeChange([value[0] / 100])}
                className="w-24 "
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-white">
                {formatTime(played * (playerRef?.current?.getDuration() || 0))}/{" "}
                {formatTime(playerRef?.current?.getDuration() || 0)}
              </div>
              <Button
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                variant="ghost"
                size="icon"
                onClick={handleFullScreen}
              >
                {isFullScreen ? (
                  <Minimize className="h-6 w-6" />
                ) : (
                  <Maximize className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;

