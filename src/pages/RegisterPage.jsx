import { useState } from "react";
import { useAuth } from "../auth.jsx";
import { Link, useRouter } from "../router.jsx";
import Field from "../components/Field.jsx";
import { Alert } from "../components/Feedback.jsx";
import { parseInterests } from "../utils.js";

export default function RegisterPage() {
    const { register } = useAuth();
    const { navigate } = useRouter();
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        const form = Object.fromEntries(new FormData(event.target));
        setBusy(true);
        setError("");
        try {
            // New accounts are always role "user": the server ignores any role sent
            await register({
                name: form.name,
                email: form.email,
                password: form.password,
                interests: parseInterests(form.interests),
            });
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
                <p className="muted">Create a new account</p>
                <Alert>{error}</Alert>
                <form onSubmit={handleSubmit} className="form">
                    <Field label="Name" name="name" required />
                    <Field label="Email" name="email" type="email" required />
                    <Field
                        label="Password"
                        name="password"
                        type="password"
                        minLength={8}
                        hint="At least 8 characters"
                        required
                    />
                    <Field
                        label="Interests"
                        name="interests"
                        placeholder="chess, reading, hiking"
                        hint="Comma separated. Used by the 'Interests' page."
                    />
                    <button className="btn btn-primary" disabled={busy}>
                        {busy ? "Creating account…" : "Create account"}
                    </button>
                </form>
                <p className="muted small">
                    Already registered? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}
