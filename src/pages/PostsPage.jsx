import { useState } from "react";
import { useAuth } from "../auth.jsx";
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

// The public feed: everyone's posts, newest first
export default function PostsPage() {
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const { data, error, loading } = useApi(`/posts?page=${page}&limit=5`);

    return (
        <>
            <PageHeader
                title="Posts"
                description="Public posts from every user."
                actions={
                    <>
                        <Link
                            to={`/users/${user._id}/posts`}
                            className="btn btn-outline"
                        >
                            My posts
                        </Link>
                        <Link to="/posts/new" className="btn btn-primary">
                            + New post
                        </Link>
                    </>
                }
            />
            <InfoBox>
                <p>
                    The feed is <code>{"find().sort({ _id: -1 })"}</code>. It
                    needs no extra index: an ObjectId starts with its creation
                    time, so the automatic <code>_id</code> index already lists
                    posts newest first. Click an author to see Scenario 2.
                </p>
            </InfoBox>

            <Alert>{error}</Alert>
            {loading && !data && <Loading />}
            {data && data.data.length === 0 && (
                <EmptyState>No posts yet.</EmptyState>
            )}
            <div className="stack">
                {data?.data.map((post) => (
                    <article key={post._id} className="card post-card">
                        <h2>{post.title}</h2>
                        <p>{post.content}</p>
                        <div className="post-meta muted small">
                            by{" "}
                            <Link to={`/users/${post.author._id}/posts`}>
                                {post.author.name}
                            </Link>{" "}
                            · {formatDate(post.createdAt)}
                        </div>
                    </article>
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
