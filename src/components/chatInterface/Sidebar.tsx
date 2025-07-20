
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../lib/supabase';

const sportsCategories = ['MLB', 'NBA', 'NFL', 'NHL'];

const Sidebar: React.FC = () => {
  const { user } = useUser();
  const [chatHistory, setChatHistory] = useState<Array<{ id: string; title: string; date: string }>>([]);
  const [favorites, setFavorites] = useState<Array<{ id: string; name: string; logoUrl?: string }>>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    "use client";
    async function loadSidebarData() {
      if (!user?.id) return;
      // Load chat history
      const { data: chatData } = await supabase
        .from('chat_history')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setChatHistory(
        (chatData || []).map((c: any) => ({
          id: c.id,
          title: c.title || 'Untitled',
          date: c.created_at ? new Date(c.created_at).toLocaleDateString() : '',
        }))
      );
      // Load favorites
      const { data: favData } = await supabase
        .from('favorites')
        .select('id, name, logo_url')
        .eq('user_id', user.id);
      setFavorites(
        (favData || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          logoUrl: f.logo_url,
        }))
      );
      // Load recent searches
      const { data: searchData } = await supabase
        .from('recent_searches')
        .select('query')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setRecentSearches((searchData || []).map((s: any) => s.query));
    }
    loadSidebarData();
  }, [user]);

  return (
    <aside className="w-64 bg-[#181a20] bg-opacity-80 backdrop-blur-lg border-r border-[#23272f] flex flex-col p-4 text-white">
      <div className="font-bold text-lg mb-4 flex items-center justify-between">
        Chat History
        <button className="text-[#00d4ff] hover:text-[#ff6b35] transition-colors text-sm">Collapse</button>
      </div>
      <div className="flex-1 overflow-y-auto mb-4">
        {chatHistory.length === 0 ? (
          <span className="block text-xs text-gray-500 mt-2">No chat history yet.</span>
        ) : (
          chatHistory.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-[#23272f] transition-colors cursor-pointer">
              <span className="font-semibold">{item.title}</span>
              <span className="text-xs text-[#ffd700]">{item.date}</span>
            </div>
          ))
        )}
      </div>
      <div className="mb-4">
        <div className="font-bold text-md mb-2">Sports Categories</div>
        <div className="flex gap-2 flex-wrap">
          {sportsCategories.map((cat) => (
            <button key={cat} className="px-3 py-1 rounded-lg bg-[#23272f] text-[#00d4ff] hover:bg-[#00d4ff] hover:text-[#181a20] transition-colors font-bold text-xs">
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <div className="font-bold text-md mb-2">Favorites</div>
        <div className="flex gap-2 flex-wrap">
          {favorites.length === 0 ? (
            <span className="block text-xs text-gray-500">No favorites yet.</span>
          ) : (
            favorites.map((fav) => (
              <div key={fav.id} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#23272f] hover:bg-[#00d4ff] hover:text-[#181a20] transition-colors cursor-pointer">
                <img src={fav.logoUrl} alt={fav.name} className="w-5 h-5 rounded-full border border-[#00d4ff]" />
                <span className="font-semibold">{fav.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
      <div>
        <div className="font-bold text-md mb-2">Recent Searches</div>
        <div className="flex flex-col gap-1">
          {recentSearches.length === 0 ? (
            <span className="block text-xs text-gray-500">No recent searches yet.</span>
          ) : (
            recentSearches.map((search, idx) => (
              <button key={idx} className="text-xs text-[#ffd700] hover:text-[#ff6b35] text-left transition-colors px-2 py-1">
                {search}
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
