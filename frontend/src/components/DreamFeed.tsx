import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Moon, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface Dream {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  tags: string[];
  created_at: string;
  profiles: {
    username: string;
    // avatar_url: string | null;
  };
  reactions: { count: number }[];
}

export default function DreamFeed() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

    useEffect(() => {
        loadDreams();
    }, []);

    const loadDreams = async () => {
        try {
          const data = await api.get('/dreams/public/'); // Adjust endpoint
            console.log(data)
          setDreams(data || []);
        } catch (error) {
          console.error('Error loading dreams:', error);
        } finally {
          setLoading(false);
        }
    };


    const handleReaction = async (dreamId: string) => {
        if (!user) return;
        try {
          // Assumes a toggle endpoint for liking
          await api.post(`/dreams/${dreamId}/react/`, { type: 'heart' });
          loadDreams(); // Reload to get updated counts
        } catch (error) {
          console.error('Error handling reaction:', error);
        }
    };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  console.log(loading)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-purple-900">Dream Feed</h2>
        <Moon className="w-8 h-8 text-purple-600" />
      </div>

      {dreams.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-purple-200">
          <Moon className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <p className="text-purple-600 text-lg">No dreams yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dreams.map((dream) => (
            <div
              key={dream.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {dream.profiles.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-purple-900">{dream.profiles.username}</p>
                    <p className="text-sm text-purple-500">{formatDate(dream.created_at)}</p>
                  </div>
                </div>
                {dream.mood && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {dream.mood}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-purple-900 mb-2">{dream.title}</h3>
              <p className="text-purple-700 leading-relaxed mb-4">{dream.content}</p>

              {dream.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {dream.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center space-x-1 px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-4 pt-4 border-t border-purple-100">
                <button
                  onClick={() => handleReaction(dream.id)}
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {dream.reactions[0]?.count || 0}
                  </span>
                </button>
                <button className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
