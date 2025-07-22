import React, { useState } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import * as Dialog from '@radix-ui/react-dialog';

interface ChatSidebarProps {
  history: Array<{ id: string; title: string; date: string }>;
  favorites: Array<{ id: string; name: string; logoUrl?: string }>;
  onSelectHistory: (id: string) => void;
  onSelectFavorite: (id: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ history, favorites, onSelectHistory, onSelectFavorite }) => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  // Sidebar content as a component
  const sidebarContent = (
    <div className="flex flex-col w-64 h-full bg-gradient-to-b from-[#23272f] to-[#1a1a1a] glass-morph px-4 py-6 shadow-xl border-r border-[#23272f] overflow-y-auto">
      {/* Logo & Title */}
      <div className="flex items-center mb-8">
        <Image src={user?.imageUrl || '/window.svg'} alt="Logo" width={32} height={32} className="w-8 h-8 mr-2 rounded-full" />
        <span className="text-xl font-bold text-electric-blue">{user?.fullName || 'MLB Betting Assistant'}</span>
      </div>
      {/* Chat History */}
      <div className="flex-1">
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
              {fav.logoUrl && <Image src={fav.logoUrl} alt={fav.name} width={24} height={24} className="w-6 h-6 rounded-full" />}
              {fav.name}
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: show button to open sidebar */}
      <div className="flex md:hidden p-2">
        <button
          aria-label="Open chat sidebar"
          className="rounded-full bg-electric-blue text-[#1a1a1a] p-4 shadow-md text-2xl"
          style={{ minWidth: 48, minHeight: 48 }}
          onClick={() => setOpen(true)}
        >
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
      {/* Desktop: sidebar always visible */}
      <aside className="hidden md:flex">
        {sidebarContent}
      </aside>
      {/* Mobile: sidebar as a modal drawer */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />
          <Dialog.Content className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-[#23272f] to-[#1a1a1a] glass-morph px-4 py-6 shadow-xl border-r border-[#23272f] z-50 animate-slide-in overflow-y-auto">
            <button
              aria-label="Close sidebar"
              className="absolute top-2 right-2 text-white text-4xl p-2 bg-black/30 rounded-full shadow-lg"
              style={{ minWidth: 48, minHeight: 48 }}
              onClick={() => setOpen(false)}
            >
              &times;
            </button>
            {sidebarContent}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default ChatSidebar;
