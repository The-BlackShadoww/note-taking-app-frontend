import { api } from "../api.js";
import { useRouter } from "../router.jsx";
import PageHeader from "../components/PageHeader.jsx";
import TitleContentForm from "../components/TitleContentForm.jsx";

export default function NewPostPage() {
    const { navigate } = useRouter();

    async function createPost(fields) {
        await api("/posts", { method: "POST", body: fields });
        navigate("/posts");
    }

    return (
        <>
            <PageHeader
                title="New post"
                description="Posts are public: every logged-in user can read them."
            />
            <TitleContentForm
                submitLabel="Publish"
                contentRequired
                onSubmit={createPost}
                onCancel={() => navigate("/posts")}
            />
        </>
    );
}
