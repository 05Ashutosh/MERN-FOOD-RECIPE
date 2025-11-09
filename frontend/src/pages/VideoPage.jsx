import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import VideoCard from '../components/videoCard.jsx';
import { apiRequest } from '../utils/api';

const VideoPage = () => {
    const dispatch = useDispatch();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiRequest('/videos', 'GET', null, dispatch);
                console.log('Videos response:', response);
                setVideos(response.data?.videos || []);
            } catch (error) {
                console.error('Failed to fetch videos:', error);
                setError(error.message || 'Failed to load videos');
                setVideos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [dispatch]);

    return (
        <div className="container mx-auto px-4 py-6 overflow-x-hidden max-w-full">
            <header className="mb-6">
                <h1 className="text-3xl font-bold">Trending Videos</h1>
            </header>

            {error ? (
                <div className="text-center py-12">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                        <p className="text-red-600 font-semibold mb-2">Error loading videos</p>
                        <p className="text-red-500 text-sm">{error}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            ) : loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading videos...</p>
                </div>
            ) : videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No videos found</p>
                    <p className="text-sm mt-2">Upload some videos to get started!</p>
                </div>
            )}
        </div>
    );
};

export default VideoPage;
