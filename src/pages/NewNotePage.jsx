import { api } from "../api.js";
import { useRouter } from "../router.jsx";
import PageHeader from "../components/PageHeader.jsx";
import TitleContentForm from "../components/TitleContentForm.jsx";

export default function NewNotePage() {
    const { navigate } = useRouter();

    async function createNote(fields) {
        const { note } = await api("/notes", { method: "POST", body: fields });
        navigate(`/notes/${note._id}`);
    }

    return (
        <>
            <PageHeader
                title="New note"
                description="The note is saved under your account; only you can read it."
            />
            <TitleContentForm
                submitLabel="Save note"
                onSubmit={createNote}
                onCancel={() => navigate("/notes")}
            />
        </>
    );
}
