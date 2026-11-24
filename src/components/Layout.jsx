import { useAuth } from "../auth.jsx";
import { Link, NavLink, useRouter } from "../router.jsx";

// The frame around every logged-in page: top bar, navigation and the page itself
export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const { navigate } = useRouter();
    const isAdmin = user.role === "admin";

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className="app">
            <header className="topbar">
                <div className="topbar-inner">
                    <Link to="/" className="brand">
                        📝 Notes
                    </Link>
                    <div className="user-box">
                        <Link to="/profile" className="user-name">
                            {user.name}
                        </Link>
                        <span className={`badge badge-${user.role}`}>
                            {user.role}
                        </span>
                        <button
                            type="button"
                            className="btn btn-light"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
                <nav className="nav">
                    <NavLink to="/" exact>
                        Dashboard
                    </NavLink>
                    <NavLink to="/notes">My notes</NavLink>
                    <NavLink to="/posts">Posts</NavLink>
                    <NavLink to="/interests">Interests</NavLink>
                    <NavLink to="/profile">Profile</NavLink>
                    {isAdmin && (
                        <NavLink to="/admin/users">Admin: users</NavLink>
                    )}
                    {isAdmin && (
                        <NavLink to="/admin/notes">Admin: notes</NavLink>
                    )}
                </nav>
            </header>
            <main className="container">{children}</main>
        </div>
    );
}
