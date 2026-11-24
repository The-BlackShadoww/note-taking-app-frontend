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
import { formatDate } from "../utils.js";

// Scenario 2: one user and a page of their posts, from a single $lookup pipeline
export default function UserPostsPage({ params }) {
    const [page, setPage] = useState(1);
    const { data, error, loading } = useApi(
        `/users/${params.id}/posts?page=${page}&limit=5`,
    );

    return (
        <>
            <Link to="/posts" className="back-link">
                ← All posts
            </Link>
            <PageHeader
                title={data ? `Posts by ${data.user.name}` : "Posts"}
                description="Scenario 2: a user's posts, newest first."
            />
            <InfoBox title="How this works (Scenario 2: $lookup)">
                <p>
                    One aggregation on <code>users</code>:{" "}
                    <code>$match</code> the user by <code>_id</code> →{" "}
                    <code>$lookup</code> into <code>posts</code> where{" "}
                    <code>author</code> = that user, sorted and paginated{" "}
                    <em>inside</em> the lookup → <code>$project</code>.
                </p>
                <p>
                    It asks for one extra post to know whether a next page
                    exists (<code>hasNextPage</code>), so no count is needed.
                    The index <code>{"{ author: 1, _id: -1 }"}</code> serves the
                    join and the sort.
                </p>
            </InfoBox>

            <Alert>{error}</Alert>
            {loading && !data && <Loading />}
            {data && data.data.length === 0 && (
                <EmptyState>This user hasn't posted yet.</EmptyState>
            )}
            <div className="stack">
                {data?.data.map((post) => (
                    <article key={post._id} className="card post-card">
                        <h2>{post.title}</h2>
                        <p>{post.content}</p>
                        <div className="muted small">
                            {formatDate(post.createdAt)}
                        </div>
                    </article>
                ))}
            </div>
            {data && (data.data.length > 0 || page > 1) && (
                <Pagination
                    pagination={data.pagination}
                    onPageChange={setPage}
                />
            )}
        </>
    );
}
