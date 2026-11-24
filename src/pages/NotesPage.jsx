import { useState } from "react";
import { useApi } from "../hooks.js";
import { Link } from "../router.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import {
    Alert,
    EmptyState,
    InfoBox,
    Loading,
} from "../components/Feedback.jsx";
import { formatDate, truncate } from "../utils.js";

export default function NotesPage() {
    const [page, setPage] = useState(1);
    const { data, error, loading } = useApi(`/notes?page=${page}&limit=6`);

    return (
        <>
            <PageHeader
                title="My notes"
                description="Only you can see these notes."
                actions={
                    <Link to="/notes/new" className="btn btn-primary">
                        + New note
                    </Link>
                }
            />
            <InfoBox>
                <p>
                    <code>GET /api/notes?page=&amp;limit=</code> returns only
                    your notes, newest first. The query is{" "}
                    <code>{"find({ user: you }).sort({ _id: -1 })"}</code>,
                    served by the compound index{" "}
                    <code>{"{ user: 1, _id: -1 }"}</code>, so MongoDB never has
                    to sort in memory.
                </p>
            </InfoBox>

            <Alert>{error}</Alert>
            {loading && !data && <Loading />}
            {data && data.data.length === 0 && (
                <EmptyState>
                    No notes yet. <Link to="/notes/new">Write your first note</Link>
                    .
                </EmptyState>
            )}
            <div className="grid">
                {data?.data.map((note) => (
                    <Link
                        key={note._id}
                        to={`/notes/${note._id}`}
                        className="card note-card"
                    >
                        <h2>{note.title}</h2>
                        <p>{truncate(note.content) || <em>No content</em>}</p>
                        <span className="muted small">
                            {formatDate(note.updatedAt)}
                        </span>
                    </Link>
                ))}
            </div>
            {data && data.pagination.total > 0 && (
                <Pagination
                    pagination={data.pagination}
                    onPageChange={setPage}
                />
            )}
        </>
    );
}
