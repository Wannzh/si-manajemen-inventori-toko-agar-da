import { useAuth } from '../context/AuthContext';
import { Menu, User } from 'lucide-react';

export default function Navbar({ onMenuClick, title }) {
  const { username } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-xl">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-primary-700 hidden sm:block">
              {username || 'Pemilik'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
