import { Link } from "../router.jsx";

export default function NotFoundPage({ message = "This page doesn't exist." }) {
    return (
        <div className="empty">
            <h1>Not found</h1>
            <p>{message}</p>
            <Link to="/" className="btn btn-primary">
                Go to the dashboard
            </Link>
        </div>
    );
}
