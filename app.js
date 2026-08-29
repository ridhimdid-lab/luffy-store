// ==========================================
// LUFFY STORE - APP.JS
// PRODUCTS + ORDER SYSTEM
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
    .from("Products")
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
          alt="${escapeHTML(product.name || "Product")}"
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
            ${escapeHTML(product.name || "Unnamed Product")}
          </h3>

          <p>
            ${escapeHTML(
              product.description ||
              "No description available."
            )}
          </p>

          <div class="product-bottom">

            <strong>
              RM ${Number(product.price || 0).toFixed(2)}
            </strong>

            <button
              type="button"
              onclick="openOrderModal('${escapeJS(String(product.id))}')"
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

    const name =
      (product.name || "").toLowerCase();

    const category =
      (product.category || "").toLowerCase();

    const description =
      (product.description || "").toLowerCase();


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
// OPEN ORDER MODAL
// ==========================================

function openOrderModal(productId) {

  const product =
    products.find(
      item =>
        String(item.id) === String(productId)
    );


  if (!product) {

    alert("Product not found.");

    return;
  }


  document.getElementById(
    "orderProductId"
  ).value =
    product.id;


  document.getElementById(
    "orderProductPrice"
  ).value =
    Number(product.price || 0);


  document.getElementById(
    "orderProductName"
  ).textContent =
    product.name || "Product";


  document.getElementById(
    "orderPrice"
  ).textContent =
    `RM ${Number(product.price || 0).toFixed(2)}`;


  document.getElementById(
    "customerName"
  ).value = "";


  document.getElementById(
    "customerPhone"
  ).value = "";


  document.getElementById(
    "orderMessage"
  ).textContent = "";


  document.getElementById(
    "orderMessage"
  ).className =
    "admin-message";


  document.getElementById(
    "orderModal"
  ).classList.add("show");

}


// ==========================================
// CLOSE ORDER MODAL
// ==========================================

function closeOrderModal() {

  const modal =
    document.getElementById("orderModal");


  modal.classList.remove("show");

}


// ==========================================
// SUBMIT ORDER
// ==========================================

async function submitOrder(event) {

  event.preventDefault();


  const submitButton =
    document.getElementById(
      "submitOrderBtn"
    );


  const message =
    document.getElementById(
      "orderMessage"
    );


  const productId =
    document.getElementById(
      "orderProductId"
    ).value;


  const customerName =
    document.getElementById(
      "customerName"
    ).value.trim();


  const customerPhone =
    document.getElementById(
      "customerPhone"
    ).value.trim();


  const product =
    products.find(
      item =>
        String(item.id) ===
        String(productId)
    );


  if (!product) {

    message.textContent =
      "Product not found.";

    message.className =
      "admin-message error";

    return;
  }


  if (!customerName) {

    message.textContent =
      "Please enter your name.";

    message.className =
      "admin-message error";

    return;
  }


  if (!customerPhone) {

    message.textContent =
      "Please enter your WhatsApp number.";

    message.className =
      "admin-message error";

    return;
  }


  submitButton.disabled = true;

  submitButton.textContent =
    "Submitting...";


  message.textContent = "";


  try {

    const orderData = {

      product_id:
        product.id,

      product_name:
        product.name,

      customer_name:
        customerName,

      customer_phone:
        customerPhone,

      price:
        Number(product.price || 0),

      status:
        "pending"

    };


    const {
      data,
      error
    } =
      await supabaseClient
        .from("Orders")
        .insert([
          orderData
        ])
        .select();


    if (error) {

      console.error(
        "ORDER ERROR:",
        error
      );

      throw error;
    }


    console.log(
      "Order created:",
      data
    );


    message.textContent =
      "Order submitted successfully! Admin will contact you.";

    message.className =
      "admin-message success";


    submitButton.textContent =
      "Order Submitted ✓";


    setTimeout(
      () => {

        closeOrderModal();

        submitButton.disabled =
          false;

        submitButton.textContent =
          "Submit Order";

      },
      1800
    );

  }

  catch (error) {

    console.error(
      "ORDER ERROR:",
      error
    );


    message.textContent =
      error.message ||
      "Failed to submit order.";

    message.className =
      "admin-message error";


    submitButton.disabled =
      false;

    submitButton.textContent =
      "Submit Order";

  }

}


// ==========================================
// ORDER EVENTS
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const orderForm =
      document.getElementById(
        "orderForm"
      );


    const closeButton =
      document.getElementById(
        "closeOrderModal"
      );


    const modal =
      document.getElementById(
        "orderModal"
      );


    if (orderForm) {

      orderForm.addEventListener(
        "submit",
        submitOrder
      );

    }


    if (closeButton) {

      closeButton.addEventListener(
        "click",
        closeOrderModal
      );

    }


    if (modal) {

      modal.addEventListener(
        "click",
        event => {

          if (
            event.target === modal
          ) {

            closeOrderModal();

          }

        }
      );

    }


    // LOAD PRODUCTS

    loadProducts();

  }
);


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

  return String(value ?? "")
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

  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");

}
