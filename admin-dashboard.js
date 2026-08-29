// ==========================================
// ADMIN DASHBOARD
// ==========================================

const grid =
  document.getElementById("productsAdminGrid");

const logoutBtn =
  document.getElementById("logoutBtn");

const addProductBtn =
  document.getElementById("addProductBtn");

const modal =
  document.getElementById("productModal");

const closeModalBtn =
  document.getElementById("closeModalBtn");

const productForm =
  document.getElementById("productForm");

const imageInput =
  document.getElementById("productImage");

const imagePreview =
  document.getElementById("imagePreview");

const saveProductBtn =
  document.getElementById("saveProductBtn");

const message =
  document.getElementById("adminMessage");


// ==========================================
// CHECK AUTH
// ==========================================

async function checkAuth() {

  const {
    data: {
      session
    }
  } = await supabaseClient.auth.getSession();


  if (!session) {

    window.location.href = "/admin";

    return null;

  }


  const email =
    document.getElementById("adminEmail");


  if (email) {

    email.textContent =
      session.user.email || "";

  }


  return session;

}


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

  const session =
    await checkAuth();


  if (!session) return;


  const {
    data,
    error
  } = await supabaseClient
    .from("Products")
    .select("*")
    .order("id", {
      ascending: false
    });


  if (error) {

    console.error(error);

    showMessage(
      error.message,
      "error"
    );

    return;

  }


  renderProducts(data || []);

  updateStats(data || []);

}


// ==========================================
// RENDER
// ==========================================

function renderProducts(products) {

  if (!products.length) {

    grid.innerHTML = `
      <div class="empty">

        <h3>
          No Products
        </h3>

        <p>
          Add your first product.
        </p>

      </div>
    `;

    return;

  }


  grid.innerHTML = "";


  products.forEach(product => {

    const card =
      document.createElement("div");

    card.className =
      "admin-product-card";


    let imageHTML;


    if (product.image_url) {

      imageHTML = `
        <img
          src="${escapeHTML(product.image_url)}"
          alt="${escapeHTML(product.name || "
