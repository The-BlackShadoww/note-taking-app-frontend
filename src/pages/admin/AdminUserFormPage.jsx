import { useState } from "react";
import { api } from "../../api.js";
import { useAuth } from "../../auth.jsx";
import { useApi } from "../../hooks.js";
import { Link, useRouter } from "../../router.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import Field from "../../components/Field.jsx";
import { Alert, Loading } from "../../components/Feedback.jsx";
import { parseInterests } from "../../utils.js";

// Used for both /admin/users/new (no id) and /admin/users/:id (edit)
export default function AdminUserFormPage({ params }) {
    const isNew = !params.id;
    return isNew ? <UserForm /> : <EditUser id={params.id} />;
}

function EditUser({ id }) {
    const { data, error, loading } = useApi(`/admin/users/${id}`);
    if (loading && !data) return <Loading />;
    if (error) {
        return (
            <>
                <Alert>{error}</Alert>
                <Link to="/admin/users">← Back to users</Link>
            </>
        );
    }
    return <UserForm existing={data.user} />;
}

function UserForm({ existing }) {
    const { user: me, setUser } = useAuth();
    const { navigate } = useRouter();
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const isSelf = existing && existing._id === me._id;

    async function handleSubmit(event) {
        event.preventDefault();
        const form = Object.fromEntries(new FormData(event.target));
        const body = {
            name: form.name,
            email: form.email,
            role: form.role,
            interests: parseInterests(form.interests),
        };
        if (form.password) body.password = form.password;

        setBusy(true);
        setError("");
        try {
            if (existing) {
                const data = await api(`/admin/users/${existing._id}`, {
                    method: "PATCH",
                    body,
                });
                if (isSelf) setUser(data.user); // keep the top bar up to date
            } else {
                await api("/admin/users", { method: "POST", body });
            }
            navigate("/admin/users");
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    }

    async function handleDelete() {
        const ok = confirm(
            `Delete ${existing.name}? Their notes and posts are deleted too.`,
        );
        if (!ok) return;
        try {
            await api(`/admin/users/${existing._id}`, { method: "DELETE" });
            navigate("/admin/users");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <>
            <Link to="/admin/users" className="back-link">
                ← All users
            </Link>
            <PageHeader
                title={existing ? `Edit ${existing.name}` : "New user"}
                description={
                    existing
                        ? "Change any field. Leave the password empty to keep it."
                        : "Admins can create users with any role."
                }
                actions={
                    existing && (
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleDelete}
                        >
                            Delete user
                        </button>
                    )
                }
            />
            <Alert>{error}</Alert>
            <form onSubmit={handleSubmit} className="form card">
                <Field
                    label="Name"
                    name="name"
                    defaultValue={existing?.name}
                    required
                />
                <Field
                    label="Email"
                    name="email"
                    type="email"
                    defaultValue={existing?.email}
                    required
                />
                <Field
                    label={existing ? "New password" : "Password"}
                    name="password"
                    type="password"
                    minLength={8}
                    required={!existing}
                    hint={
                        existing
                            ? "Leave empty to keep the current password"
                            : "At least 8 characters"
                    }
                />
                <Field
                    label="Role"
                    name="role"
                    as="select"
                    defaultValue={existing?.role ?? "user"}
                    hint={
                        isSelf
                            ? "You can't remove your own admin role (the server refuses)."
                            : undefined
                    }
                >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                </Field>
                <Field
                    label="Interests"
                    name="interests"
                    defaultValue={existing?.interests.join(", ")}
                    hint="Comma separated"
                />
                <div className="form-actions">
                    <button className="btn btn-primary" disabled={busy}>
                        {busy
                            ? "Saving…"
                            : existing
                              ? "Save changes"
                              : "Create user"}
                    </button>
                    <Link to="/admin/users" className="btn btn-outline">
                        Cancel
                    </Link>
                </div>
            </form>
        </>
    );
}
