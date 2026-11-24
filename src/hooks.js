import { useEffect, useState } from "react";
import { api } from "./api.js";

// Loads data from the API whenever `path` changes.
// Returns { data, error, loading, reload }. While a new page loads, the old data stays
// on screen so lists don't flicker.
export function useApi(path) {
    const [state, setState] = useState({
        data: null,
        error: "",
        loading: true,
    });
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setState((prev) => ({ ...prev, error: "", loading: true }));
        api(path)
            .then((data) => {
                if (!cancelled) setState({ data, error: "", loading: false });
            })
            .catch((err) => {
                if (!cancelled) {
                    setState({
                        data: null,
                        error: err.message,
                        loading: false,
                    });
                }
            });
        return () => {
            cancelled = true;
        };
    }, [path, version]);

    return { ...state, reload: () => setVersion((v) => v + 1) };
}
