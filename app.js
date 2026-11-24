// Where the API lives. Locally it's your dev server; once deployed (Phase 13), your Render URL.
const API_URL = ["localhost", "127.0.0.1"].includes(location.hostname)
    ? "http://localhost:3000/api"
    : "https://note-taking-app-backend-lac.vercel.app/api"; // deployed backend (Vercel)

let token = localStorage.getItem("token");
let currentUser = null;
// The current page of each list, so it can be reloaded after a change
const pages = {};
let interestFilter = "";

const $ = (selector) => document.querySelector(selector);

// ---------------- Helpers ----------------

// One helper for every API call: adds the token, parses JSON, turns errors into exceptions
async function api(path, { method = "GET", body } = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
}

function showMessage(text, isError = false) {
    const box = $("#message");
    box.textContent = text;
    box.className = isError ? "error" : "info";
}

// Wraps an event handler: stops the form's page reload and shows any error on the page
function handle(action) {
    return async (event) => {
        event?.preventDefault();
        try {
            await action(event);
        } catch (err) {
            showMessage(err.message, true);
        }
    };
}

const formData = (form) => Object.fromEntries(new FormData(form));

const parseInterests = (text = "") =>
    text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

// variant: "secondary" (outlined) or "danger" (red), see styles.css
function button(label, onClick, variant = "secondary") {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `small ${variant}`;
    b.textContent = label;
    b.onclick = handle(onClick);
    return b;
}

// textContent, never innerHTML, so user-written text can't inject HTML/JS (XSS-safe)
function listItem(text, ...buttons) {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = text;
    li.append(label);
    if (buttons.length) {
        const actions = document.createElement("div");
        actions.className = "actions";
        actions.append(...buttons);
        li.append(actions);
    }
    return li;
}

// A placeholder row for an empty list
function emptyItem(text) {
    const li = listItem(text);
    li.className = "empty";
    return li;
}

// Prev/Next/label for a list. Works with both { totalPages } and { hasNextPage } pagination.
function renderPager(name, pagination, load) {
    const { page } = pagination;
    pages[name] = page;
    const hasNext =
        "hasNextPage" in pagination
            ? pagination.hasNextPage
            : page < pagination.totalPages;
    $(`#${name}-page`).textContent =
        "totalPages" in pagination
            ? `Page ${page} of ${Math.max(pagination.totalPages, 1)}`
            : `Page ${page}`;
    $(`#${name}-prev`).disabled = page <= 1;
    $(`#${name}-next`).disabled = !hasNext;
    $(`#${name}-prev`).onclick = handle(() => load(page - 1));
    $(`#${name}-next`).onclick = handle(() => load(page + 1));
}

// ---------------- Auth ----------------

function saveToken(newToken) {
    token = newToken;
    localStorage.setItem("token", newToken);
}

$("#login-form").onsubmit = handle(async (e) => {
    const { token: t } = await api("/auth/login", {
        method: "POST",
        body: formData(e.target),
    });
    saveToken(t);
    e.target.reset();
    await start();
});

$("#register-form").onsubmit = handle(async (e) => {
    const form = formData(e.target);
    const { token: t } = await api("/auth/register", {
        method: "POST",
        body: { ...form, interests: parseInterests(form.interests) },
    });
    saveToken(t);
    e.target.reset();
    await start();
});

$("#logout").onclick = () => {
    localStorage.removeItem("token");
    location.reload();
};

// After login (or on page load with a saved token): load the user, then every list
async function start() {
    try {
        ({ user: currentUser } = await api("/users/me"));
    } catch {
        // An expired or invalid token sends you back to the login screen
        localStorage.removeItem("token");
        token = null;
        return;
    }
    showProfile();
    $("#auth-section").hidden = true;
    $("#app-section").hidden = false;
    $("#user-box").hidden = false;
    const isAdmin = currentUser.role === "admin";
    // UX only: the SERVER enforces admin access (try the admin API with a user token: 403)
    $("#admin-section").hidden = !isAdmin;
    showMessage("");

    await Promise.all([
        loadNotes(1),
        loadPosts(1),
        loadInterests(1),
        ...(isAdmin ? [loadUsers(1), loadAllNotes(1)] : []),
    ]);
}

// ---------------- My profile ----------------

function showProfile() {
    $("#me").textContent = `${currentUser.name} (${currentUser.role})`;
    const fields = $("#profile-form").elements;
    fields.namedItem("name").value = currentUser.name;
    fields.namedItem("interests").value = currentUser.interests.join(", ");
    fields.namedItem("password").value = "";
}

$("#profile-form").onsubmit = handle(async (e) => {
    const form = formData(e.target);
    const body = { name: form.name, interests: parseInterests(form.interests) };
    if (form.password) body.password = form.password; // only when changing it
    ({ user: currentUser } = await api("/users/me", { method: "PATCH", body }));
    showProfile();
    showMessage("Profile saved");
    await loadInterests(1); // my interests may have changed the groups
});

// ---------------- My notes ----------------

async function loadNotes(page) {
    const { data, pagination } = await api(`/notes?page=${page}&limit=5`);
    // An empty page after deleting its last note: step back one page
    if (!data.length && page > 1) return loadNotes(page - 1);
    $("#notes-list").replaceChildren(
        ...(data.length ? data.map(noteItem) : [emptyItem("No notes yet.")]),
    );
    renderPager("notes", pagination, loadNotes);
}

function noteItem(note) {
    return listItem(
        `${note.title}: ${note.content}`,
        button("Edit", async () => {
            const title = prompt("Title", note.title);
            if (title === null) return; // cancelled
            const content = prompt("Content", note.content) ?? note.content;
            await api(`/notes/${note._id}`, {
                method: "PATCH",
                body: { title, content },
            });
            showMessage("Note updated");
            await refreshNotes();
        }),
        button(
            "Delete",
            async () => {
                await api(`/notes/${note._id}`, { method: "DELETE" });
                showMessage("Note deleted");
                await refreshNotes();
            },
            "danger",
        ),
    );
}

$("#note-form").onsubmit = handle(async (e) => {
    await api("/notes", { method: "POST", body: formData(e.target) });
    e.target.reset();
    showMessage("Note added");
    await loadNotes(1); // newest first, so the new note is on page 1
    if (currentUser.role === "admin") await loadAllNotes(1);
});

async function refreshNotes() {
    await loadNotes(pages.notes);
    if (currentUser.role === "admin") await loadAllNotes(pages["all-notes"]);
}

// ---------------- Posts ----------------

async function loadPosts(page) {
    const { data, pagination } = await api(`/posts?page=${page}&limit=5`);
    $("#posts-list").replaceChildren(
        ...data.map((post) =>
            listItem(
                `${post.title}: ${post.content} (by ${post.author.name})`,
                button(`View ${post.author.name}'s posts`, () =>
                    loadUserPosts(post.author._id, 1),
                ),
            ),
        ),
    );
    renderPager("posts", pagination, loadPosts);
}

$("#post-form").onsubmit = handle(async (e) => {
    await api("/posts", { method: "POST", body: formData(e.target) });
    e.target.reset();
    showMessage("Post published");
    await loadPosts(1);
});

$("#my-posts").onclick = handle(() => loadUserPosts(currentUser._id, 1));

// ---------------- Scenario 2: one user's posts ($lookup) ----------------

async function loadUserPosts(userId, page) {
    const { user, data, pagination } = await api(
        `/users/${userId}/posts?page=${page}&limit=5`,
    );
    $("#user-posts-title").textContent = `Posts by ${user.name}`;
    $("#user-posts-list").replaceChildren(
        ...data.map((post) =>
            listItem(
                `${post.title}: ${post.content} ` +
                    `(${new Date(post.createdAt).toLocaleString()})`,
            ),
        ),
    );
    if (!data.length) {
        $("#user-posts-list").replaceChildren(emptyItem("No posts yet."));
    }
    // This endpoint pages with hasNextPage (no total), so the pager shows no "of N"
    renderPager("user-posts", pagination, (p) => loadUserPosts(userId, p));
    $("#user-posts-section").hidden = false;
    $("#user-posts-section").scrollIntoView();
}

$("#user-posts-close").onclick = () => {
    $("#user-posts-section").hidden = true;
};

// ---------------- Scenario 1: users grouped by interest ----------------

async function loadInterests(page) {
    const query = new URLSearchParams({ page, limit: 5 });
    if (interestFilter) query.set("interest", interestFilter);
    const { data, pagination } = await api(`/users/by-interest?${query}`);
    $("#interests-list").replaceChildren(
        ...data.map((group) =>
            listItem(
                `${group.interest} (${group.userCount}): ` +
                    group.users.map((u) => u.name).join(", "),
            ),
        ),
    );
    if (!data.length) {
        $("#interests-list").replaceChildren(emptyItem("No users found."));
    }
    renderPager("interests", pagination, loadInterests);
}

$("#interest-form").onsubmit = handle(async (e) => {
    interestFilter = formData(e.target).interest.trim();
    await loadInterests(1);
});

$("#interest-clear").onclick = handle(async () => {
    interestFilter = "";
    $("#interest-form").reset();
    await loadInterests(1);
});

// ---------------- Admin: users ----------------

async function loadUsers(page) {
    const { data, pagination } = await api(
        `/admin/users?page=${page}&limit=5`,
    );
    if (!data.length && page > 1) return loadUsers(page - 1);
    $("#users-list").replaceChildren(...data.map(userItem));
    renderPager("users", pagination, loadUsers);
}

function userItem(user) {
    const interests = user.interests.join(", ") || "-";
    return listItem(
        `${user.name} <${user.email}> [${user.role}] interests: ${interests}`,
        button("Edit", () => editUser(user)),
        button("Delete", () => deleteUser(user), "danger"),
    );
}

async function editUser(user) {
    const name = prompt("Name", user.name);
    if (name === null) return;
    const role = prompt("Role (user or admin)", user.role);
    if (role === null) return;
    const interests = prompt(
        "Interests, comma separated",
        user.interests.join(", "),
    );
    if (interests === null) return;
    const password = prompt("New password (leave empty to keep it)", "");

    const body = {
        name,
        role: role.trim(),
        interests: parseInterests(interests),
    };
    if (password) body.password = password;
    await api(`/admin/users/${user._id}`, { method: "PATCH", body });
    showMessage(`Saved ${name}`);
    await Promise.all([loadUsers(pages.users), loadInterests(1)]);
}

async function deleteUser(user) {
    if (!confirm(`Delete ${user.name} and all their notes and posts?`)) return;
    await api(`/admin/users/${user._id}`, { method: "DELETE" });
    showMessage(`Deleted ${user.name}`);
    $("#user-posts-section").hidden = true;
    await Promise.all([
        loadUsers(pages.users),
        loadAllNotes(1),
        loadPosts(1),
        loadInterests(1),
    ]);
}

$("#user-form").onsubmit = handle(async (e) => {
    const form = formData(e.target);
    await api("/admin/users", {
        method: "POST",
        body: { ...form, interests: parseInterests(form.interests) },
    });
    e.target.reset();
    showMessage(`Created ${form.name}`);
    await Promise.all([loadUsers(1), loadInterests(1)]);
});

// ---------------- Admin: everyone's notes (read-only) ----------------

async function loadAllNotes(page) {
    const { data, pagination } = await api(
        `/admin/notes?page=${page}&limit=5`,
    );
    if (!data.length && page > 1) return loadAllNotes(page - 1);
    $("#all-notes-list").replaceChildren(
        ...data.map((note) => {
            const owner = note.user
                ? `${note.user.name} <${note.user.email}>`
                : "unknown";
            return listItem(`${note.title}: ${note.content} (owner: ${owner})`);
        }),
    );
    renderPager("all-notes", pagination, loadAllNotes);
}

// ---------------- Go ----------------

if (token) handle(start)();
