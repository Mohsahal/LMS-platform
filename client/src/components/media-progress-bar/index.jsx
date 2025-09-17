import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, FileVideo } from "lucide-react";
import PropTypes from "prop-types";

function MediaProgressbar({ isMediaUploading, progress, error }) {
  const [showProgress, setShowProgress] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (isMediaUploading) {
      setShowProgress(true);
      setAnimatedProgress(progress);
      return;
    }
    // If not uploading anymore, hide immediately when complete, else hide quickly
    if (progress >= 100) {
      setShowProgress(false);
      setAnimatedProgress(0);
    } else {
      const timer = setTimeout(() => setShowProgress(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isMediaUploading, progress]);

  if (!showProgress) return null;

  const isComplete = progress >= 100;
  const hasError = error;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          hasError 
            ? 'bg-red-100 text-red-600' 
            : isComplete 
              ? 'bg-green-100 text-green-600' 
              : 'bg-blue-100 text-blue-600'
        }`}>
          {hasError ? (
            <AlertCircle className="w-6 h-6" />
          ) : isComplete ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <FileVideo className="w-6 h-6" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">
            {hasError 
              ? 'Upload Failed' 
              : isComplete 
                ? 'Upload Complete!' 
                : 'Uploading Video...'
            }
          </h4>
          <p className="text-sm text-gray-600">
            {hasError 
              ? 'Please try again or contact support' 
              : isComplete 
                ? 'Your video has been successfully uploaded to Cloudinary' 
                : `Processing... ${progress}% complete`
            }
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
        <motion.div
          className={`h-3 rounded-full ${
            hasError 
              ? 'bg-red-500' 
              : isComplete 
                ? 'bg-green-500' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
          }`}
          initial={{ width: 0 }}
          animate={{
            width: `${animatedProgress}%`,
            transition: { duration: 0.3, ease: "easeInOut" },
          }}
        >
          {/* Animated Shimmer Effect */}
          {!hasError && !isComplete && (
            <motion.div
              className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-30"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
        </motion.div>
      </div>

      {/* Status Message */}
      <div className="mt-4 text-center">
        {hasError ? (
          <p className="text-sm text-red-600 font-medium">
            ❌ Upload failed. Please try again.
          </p>
        ) : isComplete ? (
          <motion.div 
            className="text-sm text-green-600 font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              ✅ Video uploaded successfully to Cloudinary!
            </div>
            <p className="text-xs text-green-500 mt-1">Your video is now ready for streaming</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-blue-600 font-medium">
              ⏳ Uploading to Cloudinary...
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-blue-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Processing video file
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Details */}
      {!hasError && !isComplete && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between text-xs text-blue-700">
            <span>Upload Speed</span>
            <span>Optimizing for streaming...</span>
          </div>
        </div>
      )}
    </div>
  );
}

MediaProgressbar.propTypes = {
  isMediaUploading: PropTypes.bool.isRequired,
  progress: PropTypes.number.isRequired,
  error: PropTypes.bool,
};



export default MediaProgressbar;
