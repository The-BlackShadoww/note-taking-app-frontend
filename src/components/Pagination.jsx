// Prev / Next for a paginated list. Works with both pagination styles the API uses:
// { page, totalPages } (most lists) and { page, hasNextPage } (Scenario 2).
export default function Pagination({ pagination, onPageChange }) {
    if (!pagination) return null;
    const { page, totalPages } = pagination;
    const hasNext =
        "hasNextPage" in pagination
            ? pagination.hasNextPage
            : page < totalPages;
    const label =
        totalPages !== undefined
            ? `Page ${page} of ${Math.max(totalPages, 1)}`
            : `Page ${page}`;

    return (
        <div className="pagination">
            <button
                type="button"
                className="btn btn-outline"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                ← Prev
            </button>
            <span className="muted">{label}</span>
            <button
                type="button"
                className="btn btn-outline"
                disabled={!hasNext}
                onClick={() => onPageChange(page + 1)}
            >
                Next →
            </button>
        </div>
    );
}
