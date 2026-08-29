// ==========================================
// LUFFY STORE - APP.JS
// ==========================================

let products = [];


// ==========================================
// LOAD PRODUCTS FROM SUPABASE
// ==========================================

async function loadProducts() {

  const grid = document.getElementById("productGrid");

  grid.innerHTML = `
    <div class="empty">
      <h3>Loading...</h3>
      <p>Loading products...</p>
    </div>
  `;

  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("status", "available")
    .order("created_at", {
      ascending: false
    });

  if (error) {

    console.error("Supabase error:", error);

    grid.innerHTML = `
      <div class="empty">
        <h3>Failed to load products</h3>
        <p>Please try again later.</p>
      </div>
    `;

    return;
  }

  products = data || [];

  displayProducts(products);
}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts(items) {

  const grid = document.getElementById("productGrid");

  if (!items || items.length === 0) {

    grid.innerHTML = `
      <div class="empty">
        <h3>No products found</h3>
        <p>Products will appear here when added.</p>
      </div>
    `;

    return;
  }


  grid.innerHTML = items.map(product => {

    const image = product.image_url
      ? `
        <img
          src="${escapeHTML(product.image_url)}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
        >
      `
      : `
        <div class="product-image">
          No Image
        </div>
      `;


    return `
      <div class="product-card">

        ${image}

        <div class="product-info">

          <span class="product-category">
            ${escapeHTML(product.category || "Other")}
          </span>

          <h3>
            ${escapeHTML(product.name)}
          </h3>

          <p>
            ${escapeHTML(product.description || "No description available.")}
          </p>

          <div class="product-bottom">

            <strong>
              RM ${Number(product.price || 0).toFixed(2)}
            </strong>

            <button
              onclick="orderProduct('${escapeJS(product.name)}')"
            >
              Order
            </button>

          </div>

        </div>

      </div>
    `;

  }).join("");
}


// ==========================================
// SEARCH PRODUCTS
// ==========================================

function searchProducts() {

  const input = document
    .getElementById("searchInput")
    .value
    .trim()
    .toLowerCase();


  if (!input) {

    displayProducts(products);

    return;
  }


  const filtered = products.filter(product => {

    const name = (product.name || "").toLowerCase();

    const category = (product.category || "").toLowerCase();

    const description = (product.description || "").toLowerCase();


    return (
      name.includes(input) ||
      category.includes(input) ||
      description.includes(input)
    );

  });


  displayProducts(filtered);
}


// ==========================================
// CATEGORY FILTER
// ==========================================

function filterProducts(category) {

  if (category === "all") {

    displayProducts(products);

    return;
  }


  const filtered = products.filter(product => {

    return (
      (product.category || "").toLowerCase() ===
      category.toLowerCase()
    );

  });


  displayProducts(filtered);
}


// ==========================================
// ORDER PRODUCT
// ==========================================

function orderProduct(productName) {

  const message =
    `Hi Luffy Store, saya berminat dengan produk: ${productName}`;


  // ========================================
  // TUKAR NOMBOR WHATSAPP KAT SINI
  // Contoh: 60123456789
  // ========================================

  const whatsappNumber = "601XXXXXXXXX";


  if (whatsappNumber.includes("X")) {

    alert(
      "Sila set nombor WhatsApp Luffy Store terlebih dahulu."
    );

    return;
  }


  const url =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;


  window.open(url, "_blank");
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ==========================================
// ESCAPE JAVASCRIPT STRING
// ==========================================

function escapeJS(value) {

  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}


// ==========================================
// START WEBSITE
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadProducts();

  }
);
