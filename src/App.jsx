import { useAuth } from "./auth.jsx";
import { matchPath, Redirect, useRouter } from "./router.jsx";
import Layout from "./components/Layout.jsx";
import { Loading } from "./components/Feedback.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import NotesPage from "./pages/NotesPage.jsx";
import NewNotePage from "./pages/NewNotePage.jsx";
import NoteDetailPage from "./pages/NoteDetailPage.jsx";
import PostsPage from "./pages/PostsPage.jsx";
import NewPostPage from "./pages/NewPostPage.jsx";
import UserPostsPage from "./pages/UserPostsPage.jsx";
import InterestsPage from "./pages/InterestsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";
import AdminUserFormPage from "./pages/admin/AdminUserFormPage.jsx";
import AdminNotesPage from "./pages/admin/AdminNotesPage.jsx";
import AdminNoteDetailPage from "./pages/admin/AdminNoteDetailPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Pages for logged-in users. The first pattern that matches wins,
// so "/notes/new" must come before "/notes/:id".
const routes = [
    { path: "/", page: DashboardPage },
    { path: "/notes", page: NotesPage },
    { path: "/notes/new", page: NewNotePage },
    { path: "/notes/:id", page: NoteDetailPage },
    { path: "/posts", page: PostsPage },
    { path: "/posts/new", page: NewPostPage },
    { path: "/users/:id/posts", page: UserPostsPage },
    { path: "/interests", page: InterestsPage },
    { path: "/profile", page: ProfilePage },
    { path: "/admin/users", page: AdminUsersPage, admin: true },
    { path: "/admin/users/new", page: AdminUserFormPage, admin: true },
    { path: "/admin/users/:id", page: AdminUserFormPage, admin: true },
    { path: "/admin/notes", page: AdminNotesPage, admin: true },
    { path: "/admin/notes/:id", page: AdminNoteDetailPage, admin: true },
];

const publicPages = { "/login": LoginPage, "/register": RegisterPage };

export default function App() {
    const { user, checking } = useAuth();
    const { path } = useRouter();

    if (checking) return <Loading text="Checking your session…" />;

    // Logged out: only the login and register pages exist
    if (!user) {
        const PublicPage = publicPages[path];
        return PublicPage ? <PublicPage /> : <Redirect to="/login" />;
    }
    if (publicPages[path]) return <Redirect to="/" />;

    for (const route of routes) {
        const params = matchPath(route.path, path);
        if (!params) continue;

        // Hiding admin pages is only for convenience: the server enforces it (403)
        if (route.admin && user.role !== "admin") {
            return (
                <Layout>
                    <NotFoundPage message="This page is for admins only." />
                </Layout>
            );
        }
        const Page = route.page;
        // key={path}: a new address starts the page with fresh state
        return (
            <Layout>
                <Page key={path} params={params} />
            </Layout>
        );
    }

    return (
        <Layout>
            <NotFoundPage />
        </Layout>
    );
}
