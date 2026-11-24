import { createContext, useContext, useEffect, useState } from "react";

// A tiny hand-written router (no react-router): it keeps the current path in state,
// changes the URL with the History API, and listens for the browser's back/forward.

const RouterContext = createContext(null);

export function Router({ children }) {
    const [path, setPath] = useState(window.location.pathname);

    useEffect(() => {
        const onPopState = () => setPath(window.location.pathname);
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, []);

    function navigate(to, { replace = false } = {}) {
        if (to === window.location.pathname) return;
        if (replace) window.history.replaceState(null, "", to);
        else window.history.pushState(null, "", to);
        setPath(window.location.pathname);
        window.scrollTo(0, 0);
    }

    return (
        <RouterContext.Provider value={{ path, navigate }}>
            {children}
        </RouterContext.Provider>
    );
}

export function useRouter() {
    return useContext(RouterContext);
}

// matchPath("/notes/:id", "/notes/abc") → { id: "abc" }; no match → null
export function matchPath(pattern, path) {
    const patternParts = pattern.split("/").filter(Boolean);
    const pathParts = path.split("/").filter(Boolean);
    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
        const part = patternParts[i];
        if (part.startsWith(":")) {
            params[part.slice(1)] = decodeURIComponent(pathParts[i]);
        } else if (part !== pathParts[i]) {
            return null;
        }
    }
    return params;
}

// An <a> that changes page without reloading. Ctrl/Cmd+click still opens a new tab.
export function Link({ to, children, ...props }) {
    const { navigate } = useRouter();

    function handleClick(event) {
        const newTab =
            event.ctrlKey || event.metaKey || event.shiftKey || event.button;
        if (newTab) return;
        event.preventDefault();
        navigate(to);
    }

    return (
        <a href={to} onClick={handleClick} {...props}>
            {children}
        </a>
    );
}

// Like Link, but marked "active" when the current page is inside it
export function NavLink({ to, children, exact = false }) {
    const { path } = useRouter();
    const active = exact
        ? path === to
        : path === to || path.startsWith(`${to}/`);
    return (
        <Link to={to} className={active ? "nav-link active" : "nav-link"}>
            {children}
        </Link>
    );
}

export function Redirect({ to }) {
    const { navigate } = useRouter();
    useEffect(() => navigate(to, { replace: true }), [to]);
    return null;
}
