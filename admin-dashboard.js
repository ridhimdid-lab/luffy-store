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
          alt="${escapeHTML(product.name || "Product")}"
        >
      `;

    } else {

      imageHTML = `
        <div class="admin-no-image">
          No Image
        </div>
      `;

    }


    const status =
      product.status || "available";


    card.innerHTML = `

      ${imageHTML}

      <div class="admin-product-info">

        <div class="admin-category">
          ${escapeHTML(product.category || "Other")}
        </div>

        <h3>
          ${escapeHTML(product.name || "Unnamed")}
        </h3>

        <p>
          ${escapeHTML(product.description || "No description")}
        </p>

        <div class="admin-product-price">
          RM ${Number(product.price || 0).toFixed(2)}
        </div>

        <span class="admin-status status-${escapeHTML(status)}">
          ${escapeHTML(status)}
        </span>

        <div class="admin-actions">

          <button
            class="edit-btn"
            type="button"
            onclick="editProduct('${product.id}')"
          >
            Edit
          </button>

          <button
            class="delete-btn"
            type="button"
            onclick="deleteProduct('${product.id}')"
          >
            Delete
          </button>

        </div>

      </div>
    `;


    grid.appendChild(card);

  });

}


// ==========================================
// STATS
// ==========================================

function updateStats(products) {

  const total =
    products.length;


  const available =
    products.filter(
      product =>
        product.status === "available"
    ).length;


  const sold =
    products.filter(
      product =>
        product.status === "sold"
    ).length;


  const value =
    products.reduce(
      (sum, product) =>
        sum + Number(product.price || 0),
      0
    );


  document.getElementById(
    "totalProducts"
  ).textContent = total;


  document.getElementById(
    "availableProducts"
  ).textContent = available;


  document.getElementById(
    "soldProducts"
  ).textContent = sold;


  document.getElementById(
    "storeValue"
  ).textContent =
    `RM ${value.toFixed(2)}`;

}


// ==========================================
// OPEN MODAL
// ==========================================

function openModal() {

  modal.classList.add("show");

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

  modal.classList.remove("show");

  productForm.reset();


  document.getElementById(
    "productId"
  ).value = "";


  document.getElementById(
    "modalTitle"
  ).textContent =
    "Add Product";


  imagePreview.innerHTML = "";

  imagePreview.classList.remove(
    "show"
  );


  imageInput.required = false;

}


// ==========================================
// ADD PRODUCT
// ==========================================

addProductBtn.addEventListener(
  "click",
  () => {

    productForm.reset();


    document.getElementById(
      "productId"
    ).value = "";


    document.getElementById(
      "modalTitle"
    ).textContent =
      "Add Product";


    imagePreview.innerHTML = "";

    imagePreview.classList.remove(
      "show"
    );


    imageInput.required = true;


    openModal();

  }
);


// ==========================================
// CLOSE
// ==========================================

closeModalBtn.addEventListener(
  "click",
  closeModal
);


modal.addEventListener(
  "click",
  event => {

    if (
      event.target === modal
    ) {

      closeModal();

    }

  }
);


// ==========================================
// IMAGE PREVIEW
// ==========================================

imageInput.addEventListener(
  "change",
  event => {

    const file =
      event.target.files[0];


    if (!file) {

      imagePreview.innerHTML = "";

      imagePreview.classList.remove(
        "show"
      );

      return;

    }


    if (
      !file.type.startsWith("image/")
    ) {

      showMessage(
        "Please select an image.",
        "error"
      );

      imageInput.value = "";

      return;

    }


    if (
      file.size > 5 * 1024 * 1024
    ) {

      showMessage(
        "Image must be below 5MB.",
        "error"
      );

      imageInput.value = "";

      return;

    }


    const reader =
      new FileReader();


    reader.onload =
      event => {

        imagePreview.innerHTML = `

          <img
            src="${event.target.result}"
            alt="Preview"
          >

        `;

        imagePreview.classList.add(
          "show"
        );

      };


    reader.readAsDataURL(file);

  }
);


// ==========================================
// UPLOAD IMAGE
// ==========================================

async function uploadImage(file) {

  if (!file) return null;


  const extension =
    file.name
      .split(".")
      .pop()
      .toLowerCase();


  const fileName =
    `${crypto.randomUUID()}.${extension}`;


  const filePath =
    `products/${fileName}`;


  const {
    error
  } =
    await supabaseClient
      .storage
      .from("product-images")
      .upload(
        filePath,
        file,
        {
          cacheControl: "3600",
          upsert: false
        }
      );


  if (error) {

    console.error(
      "UPLOAD ERROR:",
      error
    );

    throw new Error(
      error.message
    );

  }


  const {
    data
  } =
    supabaseClient
      .storage
      .from("product-images")
      .getPublicUrl(filePath);


  return data.publicUrl;

}


// ==========================================
// SAVE PRODUCT
// ==========================================

productForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    const session =
      await checkAuth();


    if (!session) return;


    saveProductBtn.disabled =
      true;


    saveProductBtn.textContent =
      "Saving...";


    try {

      const id =
        document.getElementById(
          "productId"
        ).value;


      const name =
        document.getElementById(
          "productName"
        ).value.trim();


      const category =
        document.getElementById(
          "productCategory"
        ).value;


      const description =
        document.getElementById(
          "productDescription"
        ).value.trim();


      const price =
        Number(
          document.getElementById(
            "productPrice"
          ).value
        );


      const status =
        document.getElementById(
          "productStatus"
        ).value;


      const file =
        imageInput.files[0];


      let imageUrl =
        null;


      // UPLOAD

      if (file) {

        saveProductBtn.textContent =
          "Uploading...";


        imageUrl =
          await uploadImage(file);

      }


      const productData = {

        name,

        category,

        description,

        price,

        status

      };


      if (imageUrl) {

        productData.image_url =
          imageUrl;

      }


      let result;


      // EDIT

      if (id) {

        result =
          await supabaseClient
            .from("Products")
            .update(productData)
            .eq("id", id);

      }

      // ADD

      else {

        if (!imageUrl) {

          throw new Error(
            "Please select an image."
          );

        }


        result =
          await supabaseClient
            .from("Products")
            .insert([
              productData
            ]);

      }


      if (result.error) {

        throw result.error;

      }


      showMessage(
        id
          ? "Product updated successfully."
          : "Product added successfully.",
        "success"
      );


      closeModal();

      await loadProducts();

    }

    catch (error) {

      console.error(
        "SAVE ERROR:",
        error
      );


      showMessage(
        error.message ||
          "Something went wrong.",
        "error"
      );

    }

    finally {

      saveProductBtn.disabled =
        false;


      saveProductBtn.textContent =
        "Save Product";

    }

  }
);


// ==========================================
// EDIT PRODUCT
// ==========================================

async function editProduct(id) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("Products")
      .select("*")
      .eq("id", id)
      .single();


  if (error) {

    showMessage(
      error.message,
      "error"
    );

    return;

  }


  document.getElementById(
    "productId"
  ).value =
    data.id;


  document.getElementById(
    "productName"
  ).value =
    data.name || "";


  document.getElementById(
    "productCategory"
  ).value =
    data.category || "other";


  document.getElementById(
    "productDescription"
  ).value =
    data.description || "";


  document.getElementById(
    "productPrice"
  ).value =
    data.price || "";


  document.getElementById(
    "productStatus"
  ).value =
    data.status || "available";


  document.getElementById(
    "modalTitle"
  ).textContent =
    "Edit Product";


  imageInput.required =
    false;


  imageInput.value =
    "";


  if (data.image_url) {

    imagePreview.innerHTML = `

      <img
        src="${escapeHTML(data.image_url)}"
        alt="Current image"
      >

    `;

    imagePreview.classList.add(
      "show"
    );

  } else {

    imagePreview.innerHTML = "";

    imagePreview.classList.remove(
      "show"
    );

  }


  openModal();

}


// ==========================================
// DELETE PRODUCT
// ==========================================

async function deleteProduct(id) {

  const confirmed =
    confirm(
      "Delete this product?"
    );


  if (!confirmed) return;


  const {
    error
  } =
    await supabaseClient
      .from("Products")
      .delete()
      .eq("id", id);


  if (error) {

    console.error(error);

    showMessage(
      error.message,
      "error"
    );

    return;

  }


  showMessage(
    "Product deleted successfully.",
    "success"
  );


  await loadProducts();

}


// ==========================================
// LOGOUT
// ==========================================

logoutBtn.addEventListener(
  "click",
  async () => {

    await supabaseClient.auth.signOut();

    window.location.href =
      "/admin";

  }
);


// ==========================================
// MESSAGE
// ==========================================

function showMessage(
  text,
  type
) {

  message.textContent =
    text;


  message.className =
    `admin-message ${type}`;


  setTimeout(
    () => {

      message.textContent =
        "";

      message.className =
        "admin-message";

    },
    4000
  );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ==========================================
// START
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadProducts();

  }
);// CHECK AUTH
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
