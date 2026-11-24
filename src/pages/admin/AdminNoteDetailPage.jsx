import { useApi } from "../../hooks.js";
import { Link } from "../../router.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import { Alert, Loading } from "../../components/Feedback.jsx";
import { formatDate } from "../../utils.js";

// Read-only view of any note (no edit or delete: by design)
export default function AdminNoteDetailPage({ params }) {
    const { data, error, loading } = useApi(`/admin/notes/${params.id}`);

    if (loading && !data) return <Loading />;
    if (error) {
        return (
            <>
                <Alert>{error}</Alert>
                <Link to="/admin/notes">← Back to all notes</Link>
            </>
        );
    }

    const { note } = data;
    const owner = note.user
        ? `${note.user.name} (${note.user.email})`
        : "unknown";

    return (
        <>
            <Link to="/admin/notes" className="back-link">
                ← All notes
            </Link>
            <PageHeader
                title={note.title}
                description={`Owner: ${owner} · Updated ${formatDate(note.updatedAt)}`}
            />
            <article className="card note-body">
                {note.content || <em className="muted">No content</em>}
            </article>
            <p className="muted small">
                Read-only: admins can view any note but only owners can edit or
                delete it.
            </p>
        </>
    );
}
