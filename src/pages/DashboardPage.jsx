import { useAuth } from "../auth.jsx";
import { useApi } from "../hooks.js";
import { Link } from "../router.jsx";
import PageHeader from "../components/PageHeader.jsx";

// The home page: a map of the whole app, so anyone can see what it does
export default function DashboardPage() {
    const { user } = useAuth();
    const notes = useApi("/notes?limit=1");
    const posts = useApi("/posts?limit=1");
    const isAdmin = user.role === "admin";

    const sections = [
        {
            to: "/notes",
            icon: "🗒️",
            title: "My notes",
            stat: notes.data && `${notes.data.pagination.total} notes`,
            text: "Create, read, edit and delete your private notes. Nobody else can see them.",
        },
        {
            to: "/posts",
            icon: "📣",
            title: "Posts",
            stat: posts.data && `${posts.data.pagination.total} posts`,
            text: "Public posts from every user. Open an author to see all of their posts.",
        },
        {
            to: "/interests",
            icon: "🧩",
            title: "Interests",
            text: "Users grouped by the interests in their profiles, built with one MongoDB aggregation.",
        },
        {
            to: "/profile",
            icon: "👤",
            title: "My profile",
            text: "Change your name, interests or password.",
        },
    ];

    if (isAdmin) {
        sections.push(
            {
                to: "/admin/users",
                icon: "🛡️",
                title: "Admin: users",
                text: "Create, edit and delete any user, and change roles.",
            },
            {
                to: "/admin/notes",
                icon: "📚",
                title: "Admin: all notes",
                text: "Read every user's notes (read-only).",
            },
        );
    }

    return (
        <>
            <PageHeader
                title={`Welcome, ${user.name}`}
                description={
                    isAdmin
                        ? "You are an admin: you can do everything a user can, plus manage users and read all notes."
                        : "You are a user: your notes are private to you."
                }
            />
            <div className="grid">
                {sections.map((s) => (
                    <Link key={s.to} to={s.to} className="card tile">
                        <span className="tile-icon">{s.icon}</span>
                        <h2>{s.title}</h2>
                        {s.stat && <span className="tile-stat">{s.stat}</span>}
                        <p className="muted">{s.text}</p>
                    </Link>
                ))}
            </div>
        </>
    );
}
