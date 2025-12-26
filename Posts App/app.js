const postsContainer = document.getElementById("postsContainer");
const tagsContainer = document.getElementById("tagsContainer");
const searchInput = document.getElementById("searchInput");

let allPosts = [];
let activeTag = null;

async function getPosts() {
    try {
    const res = await fetch("https://dummyjson.com/posts");
    const data = await res.json();
    allPosts = data.posts;
    renderTags();
    applyFilters();
    } catch (error) {
    postsContainer.innerHTML = "<p>Error loading posts</p>";
    }
}

function displayPosts(posts) {
    postsContainer.innerHTML = "";

    if (posts.length === 0) {
    postsContainer.innerHTML = "<p>No posts found</p>";
    return;
    }

    posts.forEach(post => {
    const likes =
        typeof post.reactions === "object"
        ? post.reactions.likes
        : post.reactions;

    const dislikes =
        typeof post.reactions === "object"
        ? post.reactions.dislikes
        : Math.floor(likes / 5);

    const views = post.views ?? Math.floor(likes * 8);

    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.body}</p>

        <div class="post-tags">
        ${post.tags.map(tag => `<span>#${tag}</span>`).join("")}
        </div>

        <div class="actions">
        <span><i class="fa-solid fa-eye"></i> ${views}</span>
        <span><i class="fa-solid fa-thumbs-up"></i> ${likes}</span>
        <span><i class="fa-solid fa-thumbs-down"></i> ${dislikes}</span>
        </div>
    `;

    postsContainer.appendChild(div);
    });
}

function renderTags() {
    const tags = [...new Set(allPosts.flatMap(post => post.tags))];

    tagsContainer.innerHTML = "";

    tags.forEach(tag => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = `#${tag}`;

    span.addEventListener("click", () => {
        document.querySelectorAll(".tag").forEach(t => t.classList.remove("active"));
        span.classList.add("active");
        activeTag = tag;
        applyFilters();
    });

    tagsContainer.appendChild(span);
    });
}

function applyFilters() {
    const value = searchInput.value.toLowerCase();

    const filtered = allPosts.filter(post => {
    const matchText =
        post.title.toLowerCase().includes(value) ||
        post.body.toLowerCase().includes(value);

    const matchTag = activeTag ? post.tags.includes(activeTag) : true;

    return matchText && matchTag;
    });

    displayPosts(filtered);
}

searchInput.addEventListener("input", applyFilters);

getPosts();
