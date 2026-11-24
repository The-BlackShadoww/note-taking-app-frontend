// Small presentational pieces used on many pages

export function Alert({ type = "error", children }) {
    if (!children) return null;
    return (
        <div className={`alert alert-${type}`} role="alert">
            {children}
        </div>
    );
}

export function Loading({ text = "Loading…" }) {
    return <p className="muted loading">{text}</p>;
}

export function EmptyState({ children }) {
    return <div className="empty">{children}</div>;
}

// A highlighted box that explains what a page does and which API/index it uses,
// so a reviewer can follow the backend logic from the UI
export function InfoBox({ title = "How this works", children }) {
    return (
        <details className="info-box">
            <summary>{title}</summary>
            <div className="info-body">{children}</div>
        </details>
    );
}
