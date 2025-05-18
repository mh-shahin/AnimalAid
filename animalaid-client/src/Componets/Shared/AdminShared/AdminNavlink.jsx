import { NavLink } from 'react-router-dom';
import { memo } from 'react';

const AdminNavLink = memo(({ to, collapsed, icon, label }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => {
                const baseClasses = 'flex items-center p-3 rounded-lg transition-colors';
                const activeClasses = 'bg-white text-blue-700 font-medium shadow-md';
                const inactiveClasses = 'text-white hover:bg-blue-500/30';

                return `${baseClasses} ${collapsed ? 'justify-center' : 'space-x-3'} ${isActive ? activeClasses : inactiveClasses}`;
            }}
            end
        >
            {({ isActive }) => (
                <>
                    <span className={`${isActive ? 'text-blue-700' : 'text-white/90'}`}>
                        {icon}
                    </span>
                    {!collapsed && (
                        <span className={`${isActive ? 'font-semibold' : 'font-normal'}`}>
                            {label}
                        </span>
                    )}
                </>
            )}
        </NavLink>
    );
});

export default AdminNavLink;
