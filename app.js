// ================================
// LUFFY STORE
// ================================

let products = [];

// ================================
// LOAD PRODUCTS
// ================================

function loadProducts() {
  const grid = document.getElementById("productGrid");

  grid.innerHTML = `
    <div class="empty">
      <h3>Store Ready</h3>
      <p>Products will appear here.</p>
    </div>
  `;
}

// ================================
// SEARCH
// ================================

function searchProducts() {
  const input = document
    .getElementById("searchInput")
    .value
    .toLowerCase();

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(input)
  );

  displayProducts(filtered);
}

// ================================
// CATEGORY FILTER
// ================================

function filterProducts(category) {

  if (category === "all") {
    displayProducts(products);
    return;
  }

  const filtered = products.filter(product =>
    product.category.toLowerCase() === category.toLowerCase()
  );

  displayProducts(filtered);
}

// ================================
// DISPLAY PRODUCTS
// ================================

function displayProducts(items) {

  const grid = document.getElementById("productGrid");

  if (!items.length) {
    grid.innerHTML = `
      <div class="empty">
        <h3>No products found</h3>
        <p>Try another search or category.</p>
      </div>
    `;

    return;
  }

  grid.innerHTML = items.map(product => `

    <div class="product-card">

      ${
        product.image_url
          ? `<img src="${product.image_url}" alt="${product.name}">`
          : `<div class="product-image">No Image</div>`
      }

      <div class="product-info">

        <span class="product-category">
          ${product.category}
        </span>

        <h3>${product.name}</h3>

        <p>${product.description || ""}</p>

        <div class="product-bottom">

          <strong>
            RM ${Number(product.price).toFixed(2)}
          </strong>

          <button onclick="orderProduct('${product.name}')">
            Order
          </button>

        </div>

      </div>

    </div>

  `).join("");
}

// ================================
// ORDER
// ================================

function orderProduct(productName) {

  const message =
    `Hi Luffy Store, saya berminat dengan produk: ${productName}`;

  const whatsappNumber = "601XXXXXXXXX";

  window.open(
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

// ================================
// START
// ================================

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});
