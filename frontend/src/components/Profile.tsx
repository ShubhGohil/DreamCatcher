import { useEffect, useState } from 'react';
import { User, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface ProfileData {
  username: string;
  full_name: string | null;
  bio: string | null;
  created_at: Date | null;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editedProfile, setEditedProfile] = useState<ProfileData>({
    username: '',
    full_name: '',
    bio: '',
    created_at: null,
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);


    const loadProfile = async () => {
        if (!user) return;
        try {
          const data = await api.get('/auth/profile/'); // Adjust endpoint
          setProfile(data);
          setEditedProfile(data);
        } catch (error) {
          console.error('Error loading profile:', error);
          setError('Failed to load profile');
        } finally {
          setLoading(false);
        }
    };


    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        setError('');

        try {
          const data = await api.put('/auth/profile/', {
            full_name: editedProfile.full_name,
            bio: editedProfile.bio,
          });

          setProfile(data);
          setIsEditing(false);
        } catch (error) {
          console.error('Error updating profile:', error);
          setError('Failed to update profile');
        } finally {
          setSaving(false);
        }
    };


  const handleCancel = () => {
    setEditedProfile(profile || {
      username: '',
      full_name: '',
      bio: '',
      created_at: null,
    });
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-purple-600 text-lg">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-purple-500 to-purple-700"></div>

        <div className="px-8 pb-8">
          <div className="flex items-end justify-between -mt-16 mb-6">
            <div className="flex items-end space-x-4">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                <User className="w-16 h-16 text-white" />
              </div>
              <div className="pb-2">
                <h2 className="text-2xl font-bold text-purple-900">{profile.username}</h2>
                {profile.full_name && (
                  <p className="text-purple-600">{profile.full_name}</p>
                )}
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {isEditing ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-purple-900 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editedProfile.username}
                  disabled
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl bg-gray-50 cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-purple-500">Username cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editedProfile.full_name || ''}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, full_name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-900 mb-2">
                  Bio
                </label>
                <textarea
                  value={editedProfile.bio || ''}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, bio: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-none"
                  placeholder="Tell us about yourself and your dreams..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-purple-900 uppercase tracking-wide mb-2">
                  About
                </h3>
                {profile.bio ? (
                  <p className="text-purple-700 leading-relaxed">{profile.bio}</p>
                ) : (
                  <p className="text-purple-400 italic">No bio added yet</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-purple-100">
                <div>
                  <p className="text-sm text-purple-600 mb-1">Email</p>
                  <p className="text-purple-900 font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-purple-600 mb-1">Member Since</p>
                  <p className="text-purple-900 font-medium">
                    {new Date(profile.created_at || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
