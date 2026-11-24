import { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Field from "../components/Field.jsx";
import { Alert } from "../components/Feedback.jsx";
import { formatDate, parseInterests } from "../utils.js";

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const [message, setMessage] = useState({ type: "", text: "" });
    const [busy, setBusy] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        const form = Object.fromEntries(new FormData(event.target));
        const body = {
            name: form.name,
            interests: parseInterests(form.interests),
        };
        // Only send a password when the user typed a new one
        if (form.password) body.password = form.password;

        setBusy(true);
        try {
            const data = await api("/users/me", { method: "PATCH", body });
            setUser(data.user);
            event.target.password.value = "";
            setMessage({ type: "success", text: "Profile saved." });
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <PageHeader
                title="My profile"
                description="Your email and role can't be changed here."
            />
            <div className="card profile-summary">
                <div>
                    <span className="muted small">Email</span>
                    <div>{user.email}</div>
                </div>
                <div>
                    <span className="muted small">Role</span>
                    <div>
                        <span className={`badge badge-${user.role}`}>
                            {user.role}
                        </span>
                    </div>
                </div>
                <div>
                    <span className="muted small">Member since</span>
                    <div>{formatDate(user.createdAt)}</div>
                </div>
            </div>

            <Alert type={message.type}>{message.text}</Alert>
            <form onSubmit={handleSubmit} className="form card">
                <Field
                    label="Name"
                    name="name"
                    defaultValue={user.name}
                    required
                />
                <Field
                    label="Interests"
                    name="interests"
                    defaultValue={user.interests.join(", ")}
                    hint="Comma separated"
                />
                <Field
                    label="New password"
                    name="password"
                    type="password"
                    minLength={8}
                    hint="Leave empty to keep your current password"
                />
                <div className="form-actions">
                    <button className="btn btn-primary" disabled={busy}>
                        {busy ? "Saving…" : "Save profile"}
                    </button>
                </div>
            </form>
        </>
    );
}
