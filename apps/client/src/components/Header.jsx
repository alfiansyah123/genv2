import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const { isDark, toggleTheme } = useTheme();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (
        <header className={`w-full border-b border-solid px-6 py-4 sticky top-0 z-50 ${isDark ? 'bg-[#111122] border-[#232448]' : 'bg-white border-gray-200 shadow-sm'}`}>
            <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="size-8 text-primary">
                        <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
                    </div>
                    <h2 className={`text-xl font-bold leading-tight tracking-[-0.015em] ${isDark ? 'text-white' : 'text-gray-900'}`}>CPA Generator</h2>
                </div>
                <nav className="hidden md:flex flex-1 justify-center">
                    <div className={`flex items-center gap-1 p-1 rounded-full border ${isDark ? 'bg-[#16172b]/50 border-[#323367]' : 'bg-gray-100 border-gray-200'}`}>
                        <NavLink
                            to="/"
                            className={({ isActive }) => `px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? 'text-white bg-primary shadow-lg shadow-primary/25' : isDark ? 'text-[#9293c9] hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                        >
                            Dashboard
                        </NavLink>
                        <NavLink
                            to="/campaigns"
                            className={({ isActive }) => `px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? 'text-white bg-primary shadow-lg shadow-primary/25' : isDark ? 'text-[#9293c9] hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                        >
                            Campaigns
                        </NavLink>
                        <NavLink
                            to="/addon-domains"
                            className={({ isActive }) => `px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? 'text-white bg-primary shadow-lg shadow-primary/25' : isDark ? 'text-[#9293c9] hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                        >
                            Addon Domain
                        </NavLink>
                    </div>
                </nav>
                <div className="flex items-center justify-end gap-6 flex-1 md:flex-none">
                    <div className="flex items-center gap-3">
                        <button onClick={toggleTheme} className={`transition-colors ${isDark ? 'text-[#9293c9] hover:text-white' : 'text-gray-500 hover:text-gray-900'}`} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
                        </button>
                        <button onClick={handleLogout} className={`transition-colors ${isDark ? 'text-[#9293c9] hover:text-red-500' : 'text-gray-500 hover:text-red-600'}`} title="Logout">
                            <span className="material-symbols-outlined">logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
