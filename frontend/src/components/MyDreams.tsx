import { useEffect, useState } from 'react';
import { Plus, Tag, Trash2, Edit2, Eye, EyeOff, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface Dream {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  tags: string[];
  is_public: boolean;
  created_at: string;
}

export default function MyDreams() {
  const { user } = useAuth();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDream, setEditingDream] = useState<Dream | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: '',
    tags: '',
    is_public: true,
  });

  useEffect(() => {
      console.log(user)
    if (user) {
      loadDreams();
    }
  }, [user]);

    const loadDreams = async () => {
        if (!user) return;
        try {
          const data = await api.get('/dreams/');
          console.log(data)
          setDreams(data || []);
        } catch (error) {
          console.error('Error loading dreams:', error);
        } finally {
          setLoading(false);
        }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const payload = {
        title: formData.title,
        content: formData.content,
        mood: formData.mood || null,
        tags,
        is_public: formData.is_public,
      };


        if (editingDream) {
            await api.put(`/dreams/${editingDream.id}/`, payload);
        } else {
            await api.post('/dreams/', payload);
        }

      setFormData({ title: '', content: '', mood: '', tags: '', is_public: true });
      setShowForm(false);
      setEditingDream(null);
      loadDreams();
    } catch (error) {
      console.error('Error saving dream:', error);
    }
  };

  const handleEdit = (dream: Dream) => {
    setEditingDream(dream);
    setFormData({
      title: dream.title,
      content: dream.content,
      mood: dream.mood || '',
      tags: dream.tags ? dream.tags.join(', ') : '',
      is_public: dream.is_public,
    });
    setShowForm(true);
  };

  // const handleDelete = async (id: string) => {
  //   if (!confirm('Are you sure you want to delete this dream?')) return;
  //
  //   try {
  //     const { error } = await supabase.from('dreams').delete().eq('id', id);
  //
  //     if (error) throw error;
  //     loadDreams();
  //   } catch (error) {
  //     console.error('Error deleting dream:', error);
  //   }
  // };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this dream?')) return;
        try {
          await api.delete(`/dreams/${id}/`);
          loadDreams();
        } catch (error) {
          console.error('Error deleting dream:', error);
        }
    };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDream(null);
    setFormData({ title: '', content: '', mood: '', tags: '', is_public: true });
  };

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
        <h2 className="text-3xl font-bold text-purple-900">My Dreams</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Log Dream</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
          <h3 className="text-2xl font-bold text-purple-900 mb-6">
            {editingDream ? 'Edit Dream' : 'Log New Dream'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-purple-900 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Give your dream a title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-900 mb-2">
                Dream Description
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-none"
                placeholder="Describe your dream in detail..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-900 mb-2">
                  Mood
                </label>
                <select
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                >
                  <option value="">Select mood...</option>
                  <option value="Peaceful">Peaceful</option>
                  <option value="Exciting">Exciting</option>
                  <option value="Scary">Scary</option>
                  <option value="Confusing">Confusing</option>
                  <option value="Happy">Happy</option>
                  <option value="Sad">Sad</option>
                  <option value="Mysterious">Mysterious</option>
                  <option value="Anxious">Anxious</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-900 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="flying, water, animals"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="w-5 h-5 text-purple-600 border-2 border-purple-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="is_public" className="text-purple-900 font-medium">
                Share publicly in dream feed
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                {editingDream ? 'Update Dream' : 'Save Dream'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {dreams.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-purple-200">
          <Moon className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <p className="text-purple-600 text-lg mb-4">You haven't logged any dreams yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Log Your First Dream</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {dreams.map((dream) => (
            <div
              key={dream.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-purple-900">{dream.title}</h3>
                    {dream.mood && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {dream.mood}
                      </span>
                    )}
                    <div className="flex items-center space-x-1 text-purple-600">
                      {dream.is_public ? (
                        <>
                          <Eye className="w-4 h-4" />
                          <span className="text-xs">Public</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span className="text-xs">Private</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-purple-500">
                    {new Date(dream.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(dream)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dream.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-purple-700 leading-relaxed mb-4">{dream.content}</p>

              {dream.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
