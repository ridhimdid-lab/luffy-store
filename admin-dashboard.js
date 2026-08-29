// ==========================================
// LUFFY STORE - ADMIN DASHBOARD
// ==========================================

const grid = document.getElementById("productsAdminGrid");
const logoutBtn = document.getElementById("logoutBtn");
const addProductBtn = document.getElementById("addProductBtn");

const modal = document.getElementById("productModal");
const closeModalBtn = document.getElementById("closeModalBtn");

const productForm = document.getElementById("productForm");

const modalTitle = document.getElementById("modalTitle");

const productId = document.getElementById("productId");
const productName = document.getElementById("productName");
const productCategory = document.getElementById("productCategory");
const productDescription = document.getElementById("productDescription");
const productPrice = document.getElementById("productPrice");
const productImage = document.getElementById("productImage");
const productStatus = document.getElementById("productStatus");

const saveProductBtn =
  document.getElementById("saveProductBtn");

const adminEmail =
  document.getElementById("adminEmail");

const adminMessage =
  document.getElementById("adminMessage");


// ==========================================
// AUTH CHECK
// ==========================================

async function checkAdmin() {

  const {
    data: {
      user
    }
  } = await supabaseClient.auth.getUser();


  if (!user) {

    window.location.href = "admin.html";

    return null;
  }


  adminEmail.textContent =
    user.email || "Admin";


  return user;
}


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadAdminProducts() {

  grid.innerHTML = `
    <div class="empty">
      <h3>Loading...</h3>
      <p>Loading products...</p>
    </div>
  `;


  const {
    data,
    error
  } = await supabaseClient
    .from("Products")
    .select("*")
    .order("created_at", {
      ascending: false
    });


  if (error) {

    console.error(error);

    grid.innerHTML = `
      <div class="empty">
        <h3>Failed to load products</h3>
        <p>${escapeHTML(error.message)}</p>
      </div>
    `;

    return;
  }


  if (!data || data.length === 0) {

    grid.innerHTML = `
      <div class="empty">
        <h3>No products yet</h3>
        <p>Click "+ Add Product" to create one.</p>
      </div>
    `;

    return;
  }


  renderProducts(data);
}


// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderProducts(products) {

  grid.innerHTML = products.map(product => {

    const image = product.image_url
      ? `
        <img
          src="${escapeHTML(product.image_url)}"
          alt="${escapeHTML(product.name)}"
        >
      `
      : `
        <div class="admin-no-image">
          No Image
        </div>
      `;


    return `
      <div class="admin-product-card">

        ${image}

        <div class="admin-product-info">

          <span class="admin-category">
            ${escapeHTML(product.category || "other")}
          </span>

          <h3>
            ${escapeHTML(product.name)}
          </h3>

          <p>
            ${escapeHTML(
              product.description || "No description"
            )}
          </p>


          <div class="admin-product-price">
            RM ${Number(product.price || 0).toFixed(2)}
          </div>


          <div class="admin-status ${getStatusClass(product.status)}">
            ${escapeHTML(product.status || "available")}
          </div>


          <div class="admin-actions">

            <button
              onclick="editProduct('${product.id}')"
              class="edit-btn"
            >
              Edit
            </button>

            <button
              onclick="deleteProduct('${product.id}')"
              class="delete-btn"
            >
              Delete
            </button>

          </div>

        </div>

      </div>
    `;

  }).join("");
}


// ==========================================
// OPEN ADD MODAL
// ==========================================

addProductBtn.addEventListener(
  "click",
  () => {

    openAddModal();

  }
);


function openAddModal() {

  modalTitle.textContent =
    "Add Product";

  productForm.reset();

  productId.value = "";

  productStatus.value =
    "available";

  modal.classList.add("show");
}


// ==========================================
// CLOSE MODAL
// ==========================================

closeModalBtn.addEventListener(
  "click",
  closeModal
);


modal.addEventListener(
  "click",
  (event) => {

    if (event.target === modal) {
      closeModal();
    }

  }
);


function closeModal() {

  modal.classList.remove("show");

}


// ==========================================
// ADD / EDIT PRODUCT
// ==========================================

productForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    saveProductBtn.disabled = true;

    saveProductBtn.textContent =
      "Saving...";


    const productData = {

      name:
        productName.value.trim(),

      category:
        productCategory.value,

      description:
        productDescription.value.trim(),

      price:
        Number(productPrice.value),

      image_url:
        productImage.value.trim(),

      status:
        productStatus.value

    };


    let error;


    // EDIT
    if (productId.value) {

      const result =
        await supabaseClient
          .from("Products")
          .update(productData)
          .eq("id", productId.value);

      error = result.error;

    }

    // ADD
    else {

      const result =
        await supabaseClient
          .from("Products")
          .insert([productData]);

      error = result.error;

    }


    if (error) {

      console.error(error);

      showMessage(
        error.message,
        true
      );

      saveProductBtn.disabled = false;

      saveProductBtn.textContent =
        "Save Product";

      return;
    }


    closeModal();

    showMessage(
      "Product saved successfully."
    );


    saveProductBtn.disabled = false;

    saveProductBtn.textContent =
      "Save Product";


    loadAdminProducts();

  }
);


// ==========================================
// EDIT PRODUCT
// ==========================================

async function editProduct(id) {

  const {
    data,
    error
  } = await supabaseClient
    .from("Products")
    .select("*")
    .eq("id", id)
    .single();


  if (error) {

    showMessage(
      error.message,
      true
    );

    return;
  }


  modalTitle.textContent =
    "Edit Product";


  productId.value =
    data.id;

  productName.value =
    data.name || "";

  productCategory.value =
    data.category || "other";

  productDescription.value =
    data.description || "";

  productPrice.value =
    data.price || "";

  productImage.value =
    data.image_url || "";

  productStatus.value =
    data.status || "available";


  modal.classList.add("show");
}


// ==========================================
// DELETE PRODUCT
// ==========================================

async function deleteProduct(id) {

  const confirmDelete =
    confirm(
      "Are you sure you want to delete this product?"
    );


  if (!confirmDelete) {
    return;
  }


  const {
    error
  } = await supabaseClient
    .from("Products")
    .delete()
    .eq("id", id);


  if (error) {

    console.error(error);

    showMessage(
      error.message,
      true
    );

    return;
  }


  showMessage(
    "Product deleted successfully."
  );


  loadAdminProducts();
}


// ==========================================
// LOGOUT
// ==========================================

logoutBtn.addEventListener(
  "click",
  async () => {

    await supabaseClient.auth.signOut();

    window.location.href =
      "admin.html";

  }
);


// ==========================================
// MESSAGE
// ==========================================

function showMessage(
  message,
  error = false
) {

  adminMessage.textContent =
    message;

  adminMessage.className =
    error
      ? "admin-message error"
      : "admin-message success";


  setTimeout(
    () => {

      adminMessage.textContent = "";

      adminMessage.className =
        "admin-message";

    },
    4000
  );
}


// ==========================================
// STATUS CLASS
// ==========================================

function getStatusClass(status) {

  if (status === "sold") {
    return "status-sold";
  }

  if (status === "hidden") {
    return "status-hidden";
  }

  return "status-available";
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
// START
// ==========================================

(async function () {

  const user =
    await checkAdmin();


  if (user) {
    loadAdminProducts();
  }

})();
