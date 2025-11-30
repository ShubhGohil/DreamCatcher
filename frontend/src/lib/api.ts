// const BASE_URL = 'http://127.0.0.1:8000/api'; // Adjust to match your Django URL
//
// const getHeaders = () => {
//   const token = localStorage.getItem('authToken');
//   const headers: HeadersInit = {
//     'Content-Type': 'application/json',
//   };
//   if (token) {
//     headers['Authorization'] = `Token ${token}`; // Use 'Token' or 'Bearer' based on your Django Auth setup
//   }
//   return headers;
// };
//
// export const api = {
//   get: async (endpoint: string) => {
//     try {
//       const response = await fetch(`${BASE_URL}${endpoint}`, {
//         method: 'GET',
//         headers: getHeaders(),
//       });
//       if (!response.ok) throw new Error('API request failed');
//       return response.json();
//     } catch (error) {
//       console.error(`GET ${endpoint} failed:`, error);
//       throw error;
//     }
//   },
//
//   post: async (endpoint: string, body: any) => {
//     try {
//       const response = await fetch(`${BASE_URL}${endpoint}`, {
//         method: 'POST',
//         headers: getHeaders(),
//         body: JSON.stringify(body),
//       });
//       if (!response.ok) {
//          const errorData = await response.json().catch(() => ({}));
//          throw new Error(errorData.detail || 'API request failed');
//       }
//       return response.json();
//     } catch (error) {
//       console.error(`POST ${endpoint} failed:`, error);
//       throw error;
//     }
//   },
//
//   put: async (endpoint: string, body: any) => {
//     try {
//       const response = await fetch(`${BASE_URL}${endpoint}`, {
//         method: 'PUT',
//         headers: getHeaders(),
//         body: JSON.stringify(body),
//       });
//       if (!response.ok) throw new Error('API request failed');
//       return response.json();
//     } catch (error) {
//       console.error(`PUT ${endpoint} failed:`, error);
//       throw error;
//     }
//   },
//
//   delete: async (endpoint: string) => {
//     try {
//       const response = await fetch(`${BASE_URL}${endpoint}`, {
//         method: 'DELETE',
//         headers: getHeaders(),
//       });
//       if (!response.ok) throw new Error('API request failed');
//       return true;
//     } catch (error) {
//       console.error(`DELETE ${endpoint} failed:`, error);
//       throw error;
//     }
//   },
// };


// MOCK DATA STORE
const MOCK_DB = {
  user: {
    id: 'mock-user-1',
    username: 'DreamExplorer',
    email: 'test@example.com',
  },
  profile: {
    username: 'DreamExplorer',
    full_name: 'Test User',
    bio: 'I love exploring the subconscious mind!',
    avatar_url: null,
  },
  analytics: {
    totalDreams: 12,
    thisMonth: 4,
    mostCommonMood: 'Mysterious',
    topTags: [{ tag: 'flying', count: 5 }, { tag: 'ocean', count: 3 }],
    moodDistribution: [{ mood: 'Happy', count: 5 }, { mood: 'Scary', count: 2 }],
    recentActivity: [
      { date: new Date().toISOString(), count: 2 },
      { date: new Date(Date.now() - 86400000).toISOString(), count: 1 }
    ],
  },
  dreams: [
    {
      id: '1',
      title: 'Flying over mountains',
      content: 'I was soaring high above snowy peaks...',
      mood: 'Peaceful',
      tags: ['flying', 'nature'],
      created_at: new Date().toISOString(),
      is_public: true,
      profiles: { username: 'DreamExplorer' },
      reactions: [{count: 5}],
    },
    {
      id: '2',
      title: 'Late for exam',
      content: 'I could not find the classroom...',
      mood: 'Anxious',
      tags: ['school', 'stress'],
      created_at: new Date(Date.now() - 100000000).toISOString(),
      is_public: false,
      username: 'DreamExplorer',
      reactions_count: 0,
    }
  ]
};

// SIMULATE NETWORK DELAY
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  get: async (endpoint: string) => {
    await delay(500); // Fake loading time
    console.log(`[MOCK API] GET request to: ${endpoint}`);

    // Normalize path to lowercase and check inclusion to avoid trailing slash issues
    const path = endpoint.toLowerCase();

    if (path.includes('/auth/me')) {
      return MOCK_DB.user;
    }

    if (path.includes('/auth/profile')) {
      return MOCK_DB.profile;
    }

    if (path.includes('/analytics')) {
      return MOCK_DB.analytics;
    }

    // Check /public first because it's more specific than /dreams
    if (path.includes('/dreams/public')) {
      console.log('[MOCK API] Returning public dreams');
      return MOCK_DB.dreams.filter(d => d.is_public);
    }

    if (path.includes('/dreams')) {
      console.log('[MOCK API] Returning all dreams (My Dreams)');
      return MOCK_DB.dreams;
    }

    console.warn(`[MOCK API] No handler found for GET ${endpoint}`);
    return [];
  },

  post: async (endpoint: string, body: any) => {
    await delay(500);
    console.log(`[MOCK API] POST ${endpoint}`, body);

    if (endpoint.includes('/auth/login') || endpoint.includes('/auth/register')) {
      return { token: 'mock-token-123', user: MOCK_DB.user };
    }
    if (endpoint.includes('/react')) {
       return { success: true };
    }
    return { success: true, ...body };
  },

  put: async (endpoint: string, body: any) => {
    await delay(500);
    console.log(`[MOCK API] PUT ${endpoint}`, body);
    return body; // Return updated data
  },

  delete: async (endpoint: string) => {
    await delay(500);
    console.log(`[MOCK API] DELETE ${endpoint}`);
    return true;
  },
};