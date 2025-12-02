import { useEffect, useState } from 'react';
import { Calendar, TrendingUp, Tag, Moon, BarChart3, Sparkles } from 'lucide-react';
// import { supabase } from '../lib/supabase';
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext';

interface AnalyticsData {
  totalDreams: number;
  thisMonth: number;
  mostCommonMood: string;
  topTags: { tag: string; count: number }[];
  moodDistribution: { mood: string; count: number }[];
  recentActivity: { date: string; count: number }[];
}

export default function Analytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalDreams: 0,
    thisMonth: 0,
    mostCommonMood: 'N/A',
    topTags: [],
    moodDistribution: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  // const loadAnalytics = async () => {
  //   if (!user) return;
  //
  //   try {
  //     const { data: dreams, error } = await supabase
  //       .from('dreams')
  //       .select('*')
  //       .eq('user_id', user.id);
  //
  //     if (error) throw error;
  //     if (!dreams) return;
  //
  //     const now = new Date();
  //     const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  //
  //     const thisMonthDreams = dreams.filter(
  //       (d) => new Date(d.created_at) >= thisMonthStart
  //     );
  //
  //     const moodCounts: { [key: string]: number } = {};
  //     dreams.forEach((dream) => {
  //       if (dream.mood) {
  //         moodCounts[dream.mood] = (moodCounts[dream.mood] || 0) + 1;
  //       }
  //     });
  //
  //     const moodDistribution = Object.entries(moodCounts)
  //       .map(([mood, count]) => ({ mood, count }))
  //       .sort((a, b) => b.count - a.count);
  //
  //     const mostCommonMood = moodDistribution[0]?.mood || 'N/A';
  //
  //     const tagCounts: { [key: string]: number } = {};
  //     dreams.forEach((dream) => {
  //       dream.tags.forEach((tag: string) => {
  //         tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  //       });
  //     });
  //
  //     const topTags = Object.entries(tagCounts)
  //       .map(([tag, count]) => ({ tag, count }))
  //       .sort((a, b) => b.count - a.count)
  //       .slice(0, 10);
  //
  //     const last30Days = new Date();
  //     last30Days.setDate(last30Days.getDate() - 30);
  //
  //     const recentDreams = dreams.filter((d) => new Date(d.created_at) >= last30Days);
  //
  //     const dateCounts: { [key: string]: number } = {};
  //     recentDreams.forEach((dream) => {
  //       const date = new Date(dream.created_at).toLocaleDateString();
  //       dateCounts[date] = (dateCounts[date] || 0) + 1;
  //     });
  //
  //     const recentActivity = Object.entries(dateCounts)
  //       .map(([date, count]) => ({ date, count }))
  //       .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  //       .slice(-14);
  //
  //     setAnalytics({
  //       totalDreams: dreams.length,
  //       thisMonth: thisMonthDreams.length,
  //       mostCommonMood,
  //       topTags,
  //       moodDistribution,
  //       recentActivity,
  //     });
  //   } catch (error) {
  //     console.error('Error loading analytics:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

    const loadAnalytics = async () => {
        if (!user) return;
        try {
          // You can implement this as a single API endpoint in Django
          const data = await api.get('/analytics/');

          // If the API returns raw dreams, you'd calculate stats here like before.
          // But ideally, the backend should return the calculated stats.
          setAnalytics(data);
        } catch (error) {
          console.error('Error loading analytics:', error);
        } finally {
          setLoading(false);
        }
    };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-purple-900">Dream Analytics</h2>
        <BarChart3 className="w-8 h-8 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Moon className="w-8 h-8 opacity-80" />
            <Sparkles className="w-6 h-6 opacity-60" />
          </div>
          <p className="text-purple-100 text-sm font-medium mb-1">Total Dreams</p>
          <p className="text-4xl font-bold">{analytics.totalDreams}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-purple-600" />
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-purple-600 text-sm font-medium mb-1">This Month</p>
          <p className="text-4xl font-bold text-purple-900">{analytics.thisMonth}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-purple-600 text-sm font-medium mb-1">Most Common Mood</p>
          <p className="text-2xl font-bold text-purple-900">{analytics.mostCommonMood}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
          <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span>Mood Distribution</span>
          </h3>
          {analytics.moodDistribution.length === 0 ? (
            <p className="text-purple-400 italic">No mood data yet</p>
          ) : (
            <div className="space-y-3">
              {analytics.moodDistribution.map((item) => {
                const percentage = (item.count / analytics.totalDreams) * 100;
                return (
                  <div key={item.mood}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-purple-900 font-medium">{item.mood}</span>
                      <span className="text-purple-600 text-sm">
                        {item.count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-purple-100 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
          <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center space-x-2">
            <Tag className="w-5 h-5" />
            <span>Top Tags</span>
          </h3>
          {analytics.topTags.length === 0 ? (
            <p className="text-purple-400 italic">No tags used yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {analytics.topTags.map((item) => (
                <div
                  key={item.tag}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200"
                >
                  <span className="text-purple-900 font-medium">{item.tag}</span>
                  <span className="px-2 py-0.5 bg-purple-200 text-purple-700 rounded-full text-xs font-semibold">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
        <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>Recent Activity (Last 12 Days)</span>
        </h3>
        {analytics.recentActivity.length === 0 ? (
          <p className="text-purple-400 italic">No recent activity</p>
        ) : (
          <div className="flex items-end space-x-2 h-48">
            {analytics.recentActivity.map((item) => {
              const maxCount = Math.max(...analytics.recentActivity.map((a) => a.count))-1;
              const height = (item.count / maxCount) * 100;
              return (
                <div key={item.date} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-end flex-1">
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-purple-600 rounded-t-lg transition-all hover:from-purple-600 hover:to-purple-700 relative group"
                      style={{ height: `${height}%`, minHeight: item.count > 0 ? '20px' : '0' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.count} {item.count === 1 ? 'dream' : 'dreams'}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-purple-600 mt-2 transform -rotate-45 origin-top-left w-20">
                    {new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {analytics.totalDreams === 0 && (
        <div className="bg-purple-50 border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center">
          <Moon className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <p className="text-purple-600 text-lg">
            Start logging your dreams to see analytics and insights!
          </p>
        </div>
      )}
    </div>
  );
}
