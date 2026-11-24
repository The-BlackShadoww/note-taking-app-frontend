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

// Scenario 1: users grouped by interest, from ONE aggregate call
export default function InterestsPage() {
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState("");

    const query = new URLSearchParams({ page, limit: 5 });
    if (filter) query.set("interest", filter);
    const { data, error, loading } = useApi(`/users/by-interest?${query}`);

    function handleSubmit(event) {
        event.preventDefault();
        setFilter(new FormData(event.target).get("interest").trim());
        setPage(1);
    }

    function clearFilter(event) {
        event.target.form.reset();
        setFilter("");
        setPage(1);
    }

    return (
        <>
            <PageHeader
                title="Users by interest"
                description="Scenario 1: every interest with the users who share it."
            />
            <InfoBox title="How this works (Scenario 1: one aggregate call)">
                <p>
                    One <code>User.aggregate()</code> call:{" "}
                    <code>$unwind</code> splits each user's interests into one
                    row per interest → <code>$group</code> collects the users of
                    each interest → <code>$sort</code> by user count →{" "}
                    <code>$facet</code> returns this page <em>and</em> the total
                    in the same call.
                </p>
                <p>
                    With a filter, the pipeline starts with a{" "}
                    <code>$match</code> that uses the multikey index{" "}
                    <code>{"{ interests: 1 }"}</code>.
                </p>
            </InfoBox>

            <form className="filter-bar" onSubmit={handleSubmit}>
                <input
                    className="control"
                    name="interest"
                    placeholder="Filter by one interest, e.g. chess"
                />
                <button className="btn btn-primary">Filter</button>
                <button
                    type="button"
                    className="btn btn-outline"
                    onClick={clearFilter}
                >
                    Show all
                </button>
            </form>
            {filter && (
                <p className="muted small">
                    Showing interest: <b>{filter.toLowerCase()}</b>
                </p>
            )}

            <Alert>{error}</Alert>
            {loading && !data && <Loading />}
            {data && data.data.length === 0 && (
                <EmptyState>No users found for this interest.</EmptyState>
            )}
            <div className="stack">
                {data?.data.map((group) => (
                    <div key={group.interest} className="card interest-card">
                        <div className="interest-head">
                            <h2>{group.interest}</h2>
                            <span className="badge">
                                {group.userCount}{" "}
                                {group.userCount === 1 ? "user" : "users"}
                            </span>
                        </div>
                        <div className="chips">
                            {group.users.map((u) => (
                                <Link
                                    key={u._id}
                                    to={`/users/${u._id}/posts`}
                                    className="chip"
                                    title="See this user's posts"
                                >
                                    {u.name}
                                </Link>
                            ))}
                        </div>
                    </div>
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
