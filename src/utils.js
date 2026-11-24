// "chess, Reading" → ["chess", "Reading"] (the server lowercases them)
export function parseInterests(text = "") {
    return text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

export function formatDate(value) {
    if (!value) return "";
    return new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

// Keep a preview short in lists
export function truncate(text = "", max = 140) {
    return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
