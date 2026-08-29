// ==========================================
// LUFFY STORE - ADMIN DASHBOARD
// PRODUCTS + ORDERS
// ==========================================


// ==========================================
// ELEMENTS
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

    console.error(
      "PRODUCT LOAD ERROR:",
      error
    );

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
// RENDER PRODUCTS
// ==========================================

function renderProducts(products) {

  if (!grid) return;

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
          alt="${escapeHTML(
            product.name || "Product"
          )}"
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
          ${escapeHTML(
            product.category || "Other"
          )}
        </div>

        <h3>
          ${escapeHTML(
            product.name || "Unnamed"
          )}
        </h3>

        <p>
          ${escapeHTML(
            product.description ||
            "No description"
          )}
        </p>

        <div class="admin-product-price">
          RM ${Number(
            product.price || 0
          ).toFixed(2)}
        </div>

        <span class="admin-status status-${escapeHTML(
          status
        )}">
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
// PRODUCT STATS
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
        sum +
        Number(product.price || 0),
      0
    );

  const totalElement =
    document.getElementById(
      "totalProducts"
    );

  const availableElement =
    document.getElementById(
      "availableProducts"
    );

  const soldElement =
    document.getElementById(
      "soldProducts"
    );

  const valueElement =
    document.getElementById(
      "storeValue"
    );

  if (totalElement)
    totalElement.textContent = total;

  if (availableElement)
    availableElement.textContent =
      available;

  if (soldElement)
    soldElement.textContent =
      sold;

  if (valueElement)
    valueElement.textContent =
      `RM ${value.toFixed(2)}`;

}


// ==========================================
// OPEN PRODUCT MODAL
// ==========================================

function openModal() {

  if (!modal) return;

  modal.classList.add("show");

}


// ==========================================
// CLOSE PRODUCT MODAL
// ==========================================

function closeModal() {

  if (!modal) return;

  modal.classList.remove("show");

  if (productForm)
    productForm.reset();

  const id =
    document.getElementById(
      "productId"
    );

  const title =
    document.getElementById(
      "modalTitle"
    );

  if (id)
    id.value = "";

  if (title)
    title.textContent =
      "Add Product";

  if (imagePreview) {

    imagePreview.innerHTML = "";

    imagePreview.classList.remove(
      "show"
    );

  }

  if (imageInput)
    imageInput.required = false;

}


// ==========================================
// ADD PRODUCT BUTTON
// ==========================================

if (addProductBtn) {

  addProductBtn.addEventListener(
    "click",
    () => {

      if (productForm)
        productForm.reset();

      const id =
        document.getElementById(
          "productId"
        );

      const title =
        document.getElementById(
          "modalTitle"
        );

      if (id)
        id.value = "";

      if (title)
        title.textContent =
          "Add Product";

      if (imagePreview) {

        imagePreview.innerHTML = "";

        imagePreview.classList.remove(
          "show"
        );

      }

      if (imageInput)
        imageInput.required = true;

      openModal();

    }
  );

}


// ==========================================
// CLOSE MODAL
// ==========================================

if (closeModalBtn) {

  closeModalBtn.addEventListener(
    "click",
    closeModal
  );

}

if (modal) {

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

}


// ==========================================
// IMAGE PREVIEW
// ==========================================

if (imageInput) {

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
        file.size >
        5 * 1024 * 1024
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

}


// ==========================================
// UPLOAD IMAGE
// ==========================================

async function uploadImage(file) {

  if (!file)
    return null;

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
      .getPublicUrl(
        filePath
      );

  return data.publicUrl;

}


// ==========================================
// SAVE PRODUCT
// ==========================================

if (productForm) {

  productForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      const session =
        await checkAuth();

      if (!session)
        return;

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

        let imageUrl = null;

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

        if (id) {

          result =
            await supabaseClient
              .from("Products")
              .update(productData)
              .eq("id", id);

        }

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

        if (result.error)
          throw result.error;

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

}


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
        src="${escapeHTML(
          data.image_url
        )}"
        alt="Current image"
      >

    `;

    imagePreview.classList.add(
      "show"
    );

  }

  else {

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

  if (!confirmed)
    return;

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
// ORDERS SECTION
// ==========================================

function createOrdersSection() {

  if (
    document.getElementById(
      "adminOrdersSection"
    )
  ) {

    loadOrders();

    return;

  }

  const main =
    document.querySelector(
      ".admin-main"
    );

  if (!main)
    return;


  const section =
    document.createElement(
      "section"
    );

  section.id =
    "adminOrdersSection";

  section.className =
    "products-panel admin-orders-section";


  section.innerHTML = `

    <div class="products-panel-header">

      <div>

        <div class="admin-page-label">
          ORDER MANAGEMENT
        </div>

        <h2>
          Orders
        </h2>

        <p>
          Manage customer orders.
        </p>

      </div>

      <button
        type="button"
        class="add-product-btn"
        id="refreshOrdersBtn"
      >
        ↻ Refresh
      </button>

    </div>


    <div class="order-stats">

      <div class="order-stat">
        <span>Total Orders</span>
        <strong id="orderTotal">
          —
        </strong>
      </div>

      <div class="order-stat">
        <span>Pending</span>
        <strong id="orderPending">
          —
        </strong>
      </div>

      <div class="order-stat">
        <span>Completed</span>
        <strong id="orderCompleted">
          —
        </strong>
      </div>

      <div class="order-stat">
        <span>Cancelled</span>
        <strong id="orderCancelled">
          —
        </strong>
      </div>

    </div>


    <div
      id="ordersAdminGrid"
      class="orders-admin-grid"
    >

      <div class="empty">

        <h3>
          Loading orders...
        </h3>

        <p>
          Please wait.
        </p>

      </div>

    </div>

  `;


  main.appendChild(section);


  const refreshButton =
    document.getElementById(
      "refreshOrdersBtn"
    );

  if (refreshButton) {

    refreshButton.addEventListener(
      "click",
      loadOrders
    );

  }


  loadOrders();

}


// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {

  const ordersGrid =
    document.getElementById(
      "ordersAdminGrid"
    );

  if (!ordersGrid)
    return;


  ordersGrid.innerHTML = `

    <div class="empty">

      <h3>
        Loading...
      </h3>

      <p>
        Loading customer orders.
      </p>

    </div>

  `;


  const {
    data,
    error
  } =
    await supabaseClient
      .from("Orders")
      .select("*")
      .order("id", {
        ascending: false
      });


  if (error) {

    console.error(
      "ORDERS LOAD ERROR:",
      error
    );

    ordersGrid.innerHTML = `

      <div class="empty">

        <h3>
          Failed to load orders
        </h3>

        <p>
          ${escapeHTML(
            error.message
          )}
        </p>

      </div>

    `;

    return;

  }


  updateOrderStats(
    data || []
  );

  renderOrders(
    data || []
  );

}


// ==========================================
// ORDER STATS
// ==========================================

function updateOrderStats(orders) {

  const total =
    orders.length;

  const pending =
    orders.filter(
      order =>
        order.status === "pending"
    ).length;

  const completed =
    orders.filter(
      order =>
        order.status === "completed"
    ).length;

  const cancelled =
    orders.filter(
      order =>
        order.status === "cancelled"
    ).length;


  const totalElement =
    document.getElementById(
      "orderTotal"
    );

  const pendingElement =
    document.getElementById(
      "orderPending"
    );

  const completedElement =
    document.getElementById(
      "orderCompleted"
    );

  const cancelledElement =
    document.getElementById(
      "orderCancelled"
    );


  if (totalElement)
    totalElement.textContent =
      total;

  if (pendingElement)
    pendingElement.textContent =
      pending;

  if (completedElement)
    completedElement.textContent =
      completed;

  if (cancelledElement)
    cancelledElement.textContent =
      cancelled;

}


// ==========================================
// RENDER ORDERS
// ==========================================

function renderOrders(orders) {

  const grid =
    document.getElementById(
      "ordersAdminGrid"
    );

  if (!grid)
    return;


  if (!orders.length) {

    grid.innerHTML = `

      <div class="empty">

        <h3>
          No Orders
        </h3>

        <p>
          Customer orders will appear here.
        </p>

      </div>

    `;

    return;

  }


  grid.innerHTML = "";


  orders.forEach(order => {

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "admin-order-card";


    const status =
      order.status || "pending";


    const date =
      order.created_at
        ? new Date(
            order.created_at
          ).toLocaleString(
            "en-MY",
            {
              dateStyle: "medium",
              timeStyle: "short"
            }
          )
        : "-";


    card.innerHTML = `

      <div class="admin-order-top">

        <div>

          <span class="admin-order-label">
            ORDER #${escapeHTML(
              order.id
            )}
          </span>

          <h3>
            ${escapeHTML(
              order.product_name ||
              "Unknown Product"
            )}
          </h3>

        </div>

        <span class="admin-status status-${escapeHTML(
          status
        )}">
          ${escapeHTML(status)}
        </span>

      </div>


      <div class="admin-order-info">

        <div>

          <span>
            Customer
          </span>

          <strong>
            ${escapeHTML(
              order.customer_name ||
              "-"
            )}
          </strong>

        </div>


        <div>

          <span>
            WhatsApp
          </span>

          <strong>
            ${escapeHTML(
              order.customer_phone ||
              "-"
            )}
          </strong>

        </div>


        <div>

          <span>
            Price
          </span>

          <strong>
            RM ${Number(
              order.price || 0
            ).toFixed(2)}
          </strong>

        </div>


        <div>

          <span>
            Date
          </span>

          <strong>
            ${escapeHTML(date)}
          </strong>

        </div>

      </div>


      <div class="admin-order-actions">

        <button
          type="button"
          class="order-complete-btn"
          onclick="updateOrderStatus('${order.id}', 'completed')"
        >
          ✓ Complete
        </button>


        <button
          type="button"
          class="order-pending-btn"
          onclick="updateOrderStatus('${order.id}', 'pending')"
        >
          Pending
        </button>


        <button
          type="button"
          class="order-cancel-btn"
          onclick="updateOrderStatus('${order.id}', 'cancelled')"
        >
          Cancel
        </button>


        <button
          type="button"
          class="delete-btn"
          onclick="deleteOrder('${order.id}')"
        >
          Delete
        </button>

      </div>

    `;


    grid.appendChild(card);

  });

}


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

async function updateOrderStatus(
  orderId,
  newStatus
) {

  const {
    error
  } =
    await supabaseClient
      .from("Orders")
      .update({
        status: newStatus
      })
      .eq("id", orderId);


  if (error) {

    console.error(
      "ORDER UPDATE ERROR:",
      error
    );

    showMessage(
      error.message,
      "error"
    );

    return;

  }


  showMessage(
    `Order marked as ${newStatus}.`,
    "success"
  );


  await loadOrders();

}


// ==========================================
// DELETE ORDER
// ==========================================

async function deleteOrder(
  orderId
) {

  const confirmed =
    confirm(
      "Delete this order permanently?"
    );

  if (!confirmed)
    return;


  const {
    error
  } =
    await supabaseClient
      .from("Orders")
      .delete()
      .eq("id", orderId);


  if (error) {

    console.error(
      "ORDER DELETE ERROR:",
      error
    );

    showMessage(
      error.message,
      "error"
    );

    return;

  }


  showMessage(
    "Order deleted successfully.",
    "success"
  );


  await loadOrders();

}


// ==========================================
// LOGOUT
// ==========================================

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      await supabaseClient.auth.signOut();

      window.location.href =
        "/admin";

    }
  );

}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(
  text,
  type
) {

  if (!message)
    return;

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
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


// ==========================================
// START DASHBOARD
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await loadProducts();

    createOrdersSection();

  }
);
