const includeHeader = async (attempt = 1) => {
    const container = document.getElementById("header_id");
    if (!container) return console.warn("No header container found (id=header_id)");

    try {
        const res = await fetch("../../html/components/header.html");
        if (!res.ok) throw new Error(`Network response failed: ${res.status} ${res.statusText}`);
        const html = await res.text();
        container.innerHTML = html;
    } catch (error) {
        console.error("Error fetching the header:", error);
        // Provide a user-friendly fallback and a retry button
        container.innerHTML = "<div class=\"header-error\">Failed to load the header. <button id=\"retry-header\">Retry</button></div>";
        const btn = document.getElementById("retry-header");
        if (btn) {
            btn.addEventListener("click", () => {
                // disable button briefly to avoid spam
                btn.disabled = true;
                btn.innerText = `Retrying...`;
                // exponential backoff simple: wait then retry
                setTimeout(() => includeHeader(attempt + 1), Math.min(2000 * attempt, 10000));
            });
        }
    }
};

document.addEventListener("DOMContentLoaded", () => includeHeader());