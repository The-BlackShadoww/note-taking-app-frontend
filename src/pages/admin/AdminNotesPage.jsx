import { useState } from "react";
import { useApi } from "../../hooks.js";
import { Link } from "../../router.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import Pagination from "../../components/Pagination.jsx";
import { Alert, InfoBox, Loading } from "../../components/Feedback.jsx";
import { formatDate, truncate } from "../../utils.js";

const ownerLabel = (owner) =>
    owner ? `${owner.name} (${owner.email})` : "unknown";

export default function AdminNotesPage() {
    const [page, setPage] = useState(1);
    const { data, error, loading } = useApi(
        `/admin/notes?page=${page}&limit=8`,
    );

    return (
        <>
            <PageHeader
                title="Admin: all notes"
                description="Every user's notes, newest first. Admins can read them but not change them."
            />
            <InfoBox>
                <p>
                    <code>{"Note.find().sort({ _id: -1 })"}</code> uses the
                    automatic <code>_id</code> index. The owner's name and email
                    are attached with <code>populate("user")</code>.
                </p>
            </InfoBox>

            <Alert>{error}</Alert>
            {loading && !data && <Loading />}
            {data && (
                <div className="card table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Content</th>
                                <th>Owner</th>
                                <th>Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.data.map((note) => (
                                <tr key={note._id}>
                                    <td>
                                        <Link to={`/admin/notes/${note._id}`}>
                                            {note.title}
                                        </Link>
                                    </td>
                                    <td className="muted">
                                        {truncate(note.content, 60) || "-"}
                                    </td>
                                    <td>{ownerLabel(note.user)}</td>
                                    <td className="muted small">
                                        {formatDate(note.updatedAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {data && (
                <Pagination
                    pagination={data.pagination}
                    onPageChange={setPage}
                />
            )}
        </>
    );
}
