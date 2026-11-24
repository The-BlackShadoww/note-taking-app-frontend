import { useState } from "react";
import { useAuth } from "../auth.jsx";
import { Link, useRouter } from "../router.jsx";
import Field from "../components/Field.jsx";
import { Alert } from "../components/Feedback.jsx";

export default function LoginPage() {
    const { login } = useAuth();
    const { navigate } = useRouter();
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        const { email, password } = Object.fromEntries(
            new FormData(event.target),
        );
        setBusy(true);
        setError("");
        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card card">
                <h1>📝 Notes</h1>
                <p className="muted">Log in to your account</p>
                <Alert>{error}</Alert>
                <form onSubmit={handleSubmit} className="form">
                    <Field label="Email" name="email" type="email" required />
                    <Field
                        label="Password"
                        name="password"
                        type="password"
                        required
                    />
                    <button className="btn btn-primary" disabled={busy}>
                        {busy ? "Logging in…" : "Log in"}
                    </button>
                </form>
                <p className="muted small">
                    No account yet? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    );
}
