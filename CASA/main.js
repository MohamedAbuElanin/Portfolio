const productsContainer = document.getElementById("products");
const categoriesContainer = document.getElementById("categories");
const searchInput = document.getElementById("searchInput");

let allProducts = [];

/* Fetch Products */
fetch("https://dummyjson.com/products?limit=100")
  .then(res => res.json())
  .then(data => {
    allProducts = data.products;
    renderProducts(allProducts);
    renderCategories(allProducts);
  });

/* Render Products */
function renderProducts(products) {
  productsContainer.innerHTML = "";

  products.forEach(product => {
    productsContainer.innerHTML += `
      <div class="card">
        <img src="${product.thumbnail}" alt="${product.title}">
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <div class="card-footer">
          <div class="price">$${product.price}</div>
          <button class="buy-btn">
            <i class="fa fa-cart-shopping"></i>
            Buy Now
          </button>
        </div>
      </div>
    `;
  });
}

/* Render Categories */
function renderCategories(products) {
  const categories = [...new Set(products.map(p => p.category))];

  categoriesContainer.innerHTML = `<button onclick="filterCategory('all')">All</button>`;

  categories.forEach(cat => {
    categoriesContainer.innerHTML += `
      <button onclick="filterCategory('${cat}')">${cat}</button>
    `;
  });
}

/* Filter by Category */
function filterCategory(category) {
  if (category === "all") {
    renderProducts(allProducts);
  } else {
    const filtered = allProducts.filter(p => p.category === category);
    renderProducts(filtered);
  }
}

/* Search */
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.title.toLowerCase().includes(value)
  );
  renderProducts(filtered);
});
