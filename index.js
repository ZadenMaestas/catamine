const API = "https://cataas.com/api";
const $ = (id) => document.getElementById(id);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Practice xss good habits ^

const ACTIVE = "px-4 py-2 text-sm text-white bg-amber-500 hover:bg-amber-400";
const INACTIVE = "px-4 py-2 text-sm text-gray-300 bg-gray-800 hover:bg-gray-700";

function setActiveTab(activeId) {
    ["rdm-img__tab__btn", "browse__tab__btn", "img-gen__tab__btn"].forEach(id => {
        $(id).className = (id === activeId ? ACTIVE : INACTIVE) +
            (id !== "img-gen__tab__btn" ? " border-r border-gray-700" : "");
    });
}

async function renderCats(tag) {
    const cats = await fetch(`${API}/cats?tags=${tag}`).then(r => r.json());
    const app = $("app");
    app.innerHTML = cats.map(cat => `
        <div class="overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
            <div class="aspect-square bg-gray-800">
                <img src="https://cataas.com/cat/${encodeURIComponent(cat.id)}?width=300&height=300"
                     class="w-full h-full object-cover" alt="cute cat" loading="lazy">
            </div>
            <div class="px-2 py-1.5">
                <p class="text-xs text-gray-400 truncate">${esc(cat.tags?.join(", ") || "Cat")}</p>
            </div>
        </div>
    `).join("");
}

function renderRandomImage() {
    const app = $("app");
    const ts = Date.now();
    app.innerHTML = `
        <div class="col-span-full flex flex-col items-center gap-4">
            <div class="w-96 aspect-square bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                <img src="https://cataas.com/cat?${ts}" class="w-full h-full object-cover" alt="random cat">
            </div>
            <button id="new-random" class="px-4 py-2 text-sm text-white bg-amber-500 hover:bg-amber-400 rounded">New Random Cat</button>
        </div>
    `;
    $("new-random").addEventListener("click", renderRandomImage);
}

function renderGenerateImage() {
    const app = $("app");
    app.innerHTML = `
        <div class="col-span-full flex flex-col items-center gap-4">
            <input id="gen-text" type="text" placeholder="Enter text for cat image..."
                   class="w-96 px-3 py-2 border border-gray-700 rounded text-gray-100 bg-gray-800 focus:outline-none focus:border-amber-500">
            <button id="gen-btn" class="px-4 py-2 text-sm text-white bg-amber-500 hover:bg-amber-400 rounded">Generate</button>
            <div id="gen-result"></div>
        </div>
    `;
    $("gen-btn").addEventListener("click", () => {
        const text = $("gen-text").value.trim() || "meow";
        $("gen-result").innerHTML = `
            <div class="w-full max-w-2xl bg-gray-800 rounded-lg overflow-hidden border border-gray-700 mt-2">
                <img src="https://cataas.com/cat/says/${encodeURIComponent(text)}?fontSize=50&fontColor=white&width=800&height=600" class="w-full h-auto" alt="cat says ${esc(text)}">
            </div>
        `;
    });
}

function showTab(tab) {
    $("filters").classList.toggle("hidden", tab !== "browse");
    if (tab === "random") {
        setActiveTab("rdm-img__tab__btn");
        renderRandomImage();
    } else if (tab === "browse") {
        setActiveTab("browse__tab__btn");
        renderCats($("tag-filter").value || "cat");
    } else if (tab === "generate") {
        setActiveTab("img-gen__tab__btn");
        renderGenerateImage();
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await renderCats("cat");

    const tags = (await fetch(`${API}/tags`).then(r => r.json()))
        .filter(e => String(e).trim())
        .slice(0, 20);

    const filter = $("tag-filter");
    filter.innerHTML += tags.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join("");
    filter.addEventListener("change", () => renderCats(filter.value));

    $("rdm-img__tab__btn").addEventListener("click", () => showTab("random"));
    $("browse__tab__btn").addEventListener("click", () => showTab("browse"));
    $("img-gen__tab__btn").addEventListener("click", () => showTab("generate"));
});
