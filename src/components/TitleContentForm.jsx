import { useState } from "react";
import Field from "./Field.jsx";
import { Alert } from "./Feedback.jsx";

// The title + content form shared by "new note", "edit note" and "new post".
// onSubmit receives { title, content } and may throw; its message is shown.
export default function TitleContentForm({
    initial = { title: "", content: "" },
    submitLabel,
    onSubmit,
    onCancel,
    contentRequired = false,
}) {
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        const { title, content } = Object.fromEntries(
            new FormData(event.target),
        );
        setBusy(true);
        setError("");
        try {
            await onSubmit({ title, content });
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="form card">
            <Alert>{error}</Alert>
            <Field
                label="Title"
                name="title"
                defaultValue={initial.title}
                maxLength={200}
                required
            />
            <Field
                label="Content"
                name="content"
                as="textarea"
                rows={8}
                defaultValue={initial.content}
                required={contentRequired}
            />
            <div className="form-actions">
                <button className="btn btn-primary" disabled={busy}>
                    {busy ? "Saving…" : submitLabel}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
