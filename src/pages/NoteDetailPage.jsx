import { useState } from "react";
import { api } from "../api.js";
import { useApi } from "../hooks.js";
import { Link, useRouter } from "../router.jsx";
import PageHeader from "../components/PageHeader.jsx";
import TitleContentForm from "../components/TitleContentForm.jsx";
import { Alert, InfoBox, Loading } from "../components/Feedback.jsx";
import { formatDate } from "../utils.js";

export default function NoteDetailPage({ params }) {
    const { navigate } = useRouter();
    const { data, error, loading, reload } = useApi(`/notes/${params.id}`);
    const [editing, setEditing] = useState(false);
    const [actionError, setActionError] = useState("");

    if (loading && !data) return <Loading />;
    if (error) {
        return (
            <>
                <Alert>{error}</Alert>
                <Link to="/notes">← Back to my notes</Link>
            </>
        );
    }

    const { note } = data;

    async function saveNote(fields) {
        await api(`/notes/${note._id}`, { method: "PATCH", body: fields });
        setEditing(false);
        reload();
    }

    async function deleteNote() {
        if (!confirm(`Delete "${note.title}"? This cannot be undone.`)) return;
        try {
            await api(`/notes/${note._id}`, { method: "DELETE" });
            navigate("/notes");
        } catch (err) {
            setActionError(err.message);
        }
    }

    return (
        <>
            <Link to="/notes" className="back-link">
                ← My notes
            </Link>
            {editing ? (
                <>
                    <PageHeader title="Edit note" />
                    <TitleContentForm
                        initial={note}
                        submitLabel="Save changes"
                        onSubmit={saveNote}
                        onCancel={() => setEditing(false)}
                    />
                </>
            ) : (
                <>
                    <PageHeader
                        title={note.title}
                        description={`Created ${formatDate(note.createdAt)} · Updated ${formatDate(note.updatedAt)}`}
                        actions={
                            <>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setEditing(true)}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={deleteNote}
                                >
                                    Delete
                                </button>
                            </>
                        }
                    />
                    <Alert>{actionError}</Alert>
                    <article className="card note-body">
                        {note.content || <em className="muted">No content</em>}
                    </article>
                    <InfoBox>
                        <p>
                            Every query for one note includes your id:{" "}
                            <code>{"findOne({ _id, user: you })"}</code>. Another
                            user opening this address gets <b>404 Not found</b>,
                            so they can't even tell the note exists.
                        </p>
                    </InfoBox>
                </>
            )}
        </>
    );
}
