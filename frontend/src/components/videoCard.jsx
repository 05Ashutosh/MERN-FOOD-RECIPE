import React from 'react';
import { Play, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VideoCard = ({ video }) => {
    const navigate = useNavigate();

    // Handle both Video model and Recipe model (type: "video")
    const videoData = {
        id: video._id || video.id,
        title: video.title,
        description: video.description,
        category: video.category,
        duration: typeof video.duration === 'number' 
            ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` 
            : `${video.prepTime + video.cookTime} min` || video.duration,
        thumbnail: video.thumbnail || video.mediaFile, // Support both thumbnail and mediaFile
        channel: video.owner?.username || video.channel || 'Unknown',
        channelAvatar: video.owner?.avatar || video.channelAvatar || 'https://via.placeholder.com/40',
        videoFile: video.videoFile || video.mediaFile || video.videoUrl, // Support both videoFile and mediaFile
        prepTime: video.prepTime,
        cookTime: video.cookTime,
        difficulty: video.difficulty,
        ingredients: video.ingredients || [],
        steps: video.steps || [],
    };

    const getBgColor = (category) => {
        switch (category.toLowerCase()) {
            case 'music':
                return 'bg-blue-50';
            case 'gaming':
                return 'bg-purple-50';
            case 'education':
                return 'bg-green-50';
            default:
                return 'bg-gray-50';
        }
    };

    const handleCardClick = () => {
        navigate(`/video/${videoData.id}`, { state: { video: videoData } });
    };

    return (
        <div
            className={`relative overflow-hidden rounded-xl shadow-md transition-all duration-300 ${getBgColor(
                videoData.category
            )} group hover:bg-gray-100 cursor-pointer`}
            onClick={handleCardClick}
        >
            <div className="relative aspect-[16/12] px-2 pt-2 pb-4">
                <div className="relative h-full w-full rounded-lg overflow-hidden">
                    {videoData.thumbnail && (videoData.thumbnail.includes('.mp4') || videoData.thumbnail.includes('video')) ? (
                        <video
                            src={videoData.thumbnail}
                            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-70"
                            muted
                            playsInline
                            preload="metadata"
                            onError={(e) => {
                                console.error('Thumbnail video error:', e);
                                e.target.style.display = 'none';
                            }}
                        >
                            <source src={videoData.thumbnail} type="video/mp4" />
                        </video>
                    ) : (
                        <img
                            src={videoData.thumbnail}
                            alt={videoData.title}
                            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-70"
                        />
                    )}
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-500" />

                    <div className="absolute top-3 left-3 flex items-center bg-white/90 group-hover:bg-white/70 px-3 py-1.5 rounded-full shadow-sm">
                        <Play className="h-4 w-4 mr-1.5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{videoData.duration}</span>
                    </div>

                    <div className="absolute -bottom-5 left-3 right-3 z-10">
                        <h3
                            className="text-lg font-semibold text-white transition-transform duration-700 group-hover:-translate-y-8"
                        >
                            {videoData.title}
                        </h3>
                        <p
                            className="text-sm text-white/90 line-clamp-2 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-1000 group-hover:-translate-y-8"
                        >
                            {videoData.description}
                        </p>
                    </div>

                    <button
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
                        onClick={(e) => e.stopPropagation()} // Prevent card click when clicking heart
                    >
                        <Heart className="h-5 w-5 text-rose-400 hover:text-rose-600" />
                    </button>
                </div>
            </div>

            <div className="p-4 flex items-center space-x-3 border-t border-gray-100">
                <div className="relative h-10 w-10 flex-shrink-0">
                    <img
                        src={videoData.channelAvatar}
                        alt={videoData.channel}
                        className="rounded-full object-cover w-full h-full"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{videoData.channel}</h4>
                    <p className="text-xs text-gray-500 font-medium">Channel</p>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;