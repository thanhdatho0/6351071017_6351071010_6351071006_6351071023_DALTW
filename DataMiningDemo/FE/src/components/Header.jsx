import { Sun, Moon } from 'lucide-react';

function Header({ isDark, onToggleDark }) {
  return (
    <header className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-md p-4 flex items-center transition-colors duration-300 z-50">
      <h1 className="flex-1 text-center text-2xl font-bold text-spotify-green">Dự đoán khả năng rời bỏ</h1>
      <button
        onClick={onToggleDark}
        className="ml-auto p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
        aria-label="Toggle dark mode"
      >
        {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-700 dark:text-gray-300" />}
      </button>
    </header>
  );
}

export default Header;