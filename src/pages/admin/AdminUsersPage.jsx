import { useState } from "react";
import { useApi } from "../../hooks.js";
import { Link } from "../../router.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import Pagination from "../../components/Pagination.jsx";
import { Alert, InfoBox, Loading } from "../../components/Feedback.jsx";
import { formatDate } from "../../utils.js";

export default function AdminUsersPage() {
    const [page, setPage] = useState(1);
    const { data, error, loading } = useApi(
        `/admin/users?page=${page}&limit=8`,
    );

    return (
        <>
            <PageHeader
                title="Admin: users"
                description="Every account in the system, newest first."
                actions={
                    <Link to="/admin/users/new" className="btn btn-primary">
                        + New user
                    </Link>
                }
            />
            <InfoBox>
                <p>
                    All <code>/api/admin/*</code> routes are guarded by{" "}
                    <code>authorize("admin")</code> on the server. A normal user
                    calling them gets <b>403 Forbidden</b>; hiding these pages in
                    the menu is only for convenience.
                </p>
            </InfoBox>

            <Alert>{error}</Alert>
            {loading && !data && <Loading />}
            {data && (
                <div className="card table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Interests</th>
                                <th>Joined</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {data.data.map((u) => (
                                <tr key={u._id}>
                                    <td>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span
                                            className={`badge badge-${u.role}`}
                                        >
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>{u.interests.join(", ") || "-"}</td>
                                    <td className="muted small">
                                        {formatDate(u.createdAt)}
                                    </td>
                                    <td>
                                        <Link
                                            to={`/admin/users/${u._id}`}
                                            className="btn btn-outline btn-small"
                                        >
                                            Edit
                                        </Link>
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
