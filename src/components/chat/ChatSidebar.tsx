import React from 'react';
import { useUser } from '@clerk/nextjs';

interface ChatSidebarProps {
  history: Array<{ id: string; title: string; date: string }>;
  favorites: Array<{ id: string; name: string; logoUrl?: string }>;
  onSelectHistory: (id: string) => void;
  onSelectFavorite: (id: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ history, favorites, onSelectHistory, onSelectFavorite }) => {
  const { user } = useUser();
  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-gradient-to-b from-[#23272f] to-[#1a1a1a] glass-morph px-4 py-6 shadow-xl border-r border-[#23272f]">
      {/* Logo & Title */}
      <div className="flex items-center mb-8">
        <img src={user?.imageUrl || '/window.svg'} alt="Logo" className="w-8 h-8 mr-2 rounded-full" />
        <span className="text-xl font-bold text-electric-blue">{user?.fullName || 'SharpEdge Sports'}</span>
      </div>
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#23272f] scrollbar-track-[#1a1a1a]">
        <div className="mb-4">
          <span className="block text-sm text-gray-400">Recent Chats</span>
          {history.length === 0 ? (
            <span className="block text-xs text-gray-500 mt-2">No chat history yet.</span>
          ) : (
            history.map(chat => (
              <button
                key={chat.id}
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#23272f] transition-colors text-white"
                onClick={() => onSelectHistory(chat.id)}
              >
                {chat.title}
                <span className="ml-2 text-xs text-gray-400">{chat.date}</span>
              </button>
            ))
          )}
        </div>
      </div>
      {/* Favorites */}
      <div className="mt-6">
        <span className="block text-sm text-gray-400 mb-2">Favorites</span>
        {favorites.length === 0 ? (
          <span className="block text-xs text-gray-500">No favorites yet.</span>
        ) : (
          favorites.map(fav => (
            <button
              key={fav.id}
              className="w-full flex items-center gap-2 py-2 px-3 rounded-lg bg-electric-blue text-[#1a1a1a] font-semibold shadow-md hover:bg-[#00b3cc] transition-colors mb-2"
              onClick={() => onSelectFavorite(fav.id)}
            >
              {fav.logoUrl && <img src={fav.logoUrl} alt={fav.name} className="w-6 h-6 rounded-full" />}
              {fav.name}
            </button>
          ))
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;
