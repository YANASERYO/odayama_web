document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.querySelector("[data-product-grid]");
  const productTemplate = document.querySelector("#product-card-template");
  const productCount = document.querySelector("[data-product-count]");
  const categoryFilter = document.querySelector("[data-category-filter]");
  const cartList = document.querySelector("[data-cart-list]");
  const cartEmpty = document.querySelector("[data-cart-empty]");
  const checkoutForm = document.querySelector("[data-checkout-form]");
  const checkoutSubmit = document.querySelector("[data-checkout-submit]");
  const checkoutStatus = document.querySelector("[data-checkout-status]");

  if (!productGrid || !productTemplate || !cartList || !cartEmpty || !checkoutForm || !checkoutSubmit) {
    return;
  }

  const cart = new Map();
  const productsById = new Map();
  let products = [];

  const setStatus = (message, type = "") => {
    if (!checkoutStatus) return;
    checkoutStatus.textContent = message;
    checkoutStatus.dataset.status = type;
  };

  const formatInitialOffering = (product) => {
    if (product.initialOfferingLabel) {
      return product.initialOfferingLabel;
    }

    const value = Number(product.initialOffering);

    if (!Number.isFinite(value) || value <= 0) {
      return "後で入力";
    }

    return `${value.toLocaleString("ja-JP")}円`;
  };

  const isVisibleProduct = (product) => product && product.visible !== false && product.status !== "draft";
  const isPurchasableProduct = (product) => product.status === "available";

  const getProductsFromResponse = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.products)) {
      return data.products;
    }

    return [];
  };

  const loadProducts = async () => {
    const source = productGrid.dataset.productsSource;

    if (source) {
      const response = await fetch(source);

      if (!response.ok) {
        throw new Error(`Product source returned ${response.status}`);
      }

      return getProductsFromResponse(await response.json());
    }

    return Array.isArray(window.ODAYAMA_PRODUCTS) ? window.ODAYAMA_PRODUCTS : [];
  };

  const normalizeProducts = (productList) =>
    productList
      .filter(isVisibleProduct)
      .filter((product) => product.id && product.name)
      .map((product) => ({
        ...product,
        category: product.category || "その他",
        fulfillment: product.fulfillment || "郵送対応",
        status: product.status || "available",
        statusLabel: product.statusLabel || "授与可",
        sortOrder: Number.isFinite(Number(product.sortOrder)) ? Number(product.sortOrder) : 9999,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "ja"));

  const renderCategoryOptions = () => {
    if (!categoryFilter) return;

    const selectedValue = categoryFilter.value || "all";
    const categories = [...new Set(products.map((product) => product.category))];

    categoryFilter.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "すべて";
    categoryFilter.append(allOption);

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilter.append(option);
    });

    categoryFilter.value = categories.includes(selectedValue) ? selectedValue : "all";
  };

  const setImage = (card, product) => {
    const imageWrap = card.querySelector("[data-product-image-wrap]");
    const image = card.querySelector("[data-product-image]");
    const placeholder = card.querySelector("[data-product-image-placeholder]");

    if (!imageWrap || !image || !placeholder) return;

    if (product.image) {
      image.src = product.image;
      image.alt = product.imageAlt || product.name;
      image.hidden = false;
      placeholder.hidden = true;
      imageWrap.classList.remove("product-image--placeholder");
      return;
    }

    image.removeAttribute("src");
    image.alt = "";
    image.hidden = true;
    placeholder.hidden = false;
    imageWrap.classList.add("product-image--placeholder");
  };

  const renderProducts = () => {
    const selectedCategory = categoryFilter ? categoryFilter.value : "all";
    const filteredProducts = products.filter((product) => {
      return selectedCategory === "all" || product.category === selectedCategory;
    });

    productGrid.innerHTML = "";
    productsById.clear();

    filteredProducts.forEach((product) => {
      productsById.set(product.id, product);

      const fragment = productTemplate.content.cloneNode(true);
      const card = fragment.querySelector(".juyo-card");
      const name = fragment.querySelector("[data-product-name]");
      const status = fragment.querySelector("[data-product-status]");
      const category = fragment.querySelector("[data-product-category]");
      const description = fragment.querySelector("[data-product-description]");
      const offering = fragment.querySelector("[data-product-offering]");
      const fulfillment = fragment.querySelector("[data-product-fulfillment]");
      const addButton = fragment.querySelector("[data-add-to-cart]");

      setImage(fragment, product);

      if (card) {
        card.dataset.productId = product.id;
      }

      if (name) {
        name.textContent = product.name;
      }

      if (status) {
        status.textContent = product.statusLabel;
        status.dataset.productStatus = product.status;
      }

      if (category) {
        category.textContent = product.category;
      }

      if (description) {
        description.textContent = product.description || "";
      }

      if (offering) {
        offering.textContent = formatInitialOffering(product);
      }

      if (fulfillment) {
        fulfillment.textContent = product.fulfillment;
      }

      if (addButton) {
        addButton.dataset.productId = product.id;
        addButton.disabled = !isPurchasableProduct(product);
        addButton.textContent = isPurchasableProduct(product) ? "選択する" : "準備中";
      }

      productGrid.append(fragment);
    });

    if (productCount) {
      productCount.textContent = `${filteredProducts.length}件の商品を表示中`;
    }

    if (!filteredProducts.length) {
      const empty = document.createElement("p");
      empty.className = "product-empty";
      empty.textContent = "表示できる授与品がありません。";
      productGrid.append(empty);
    }
  };

  const getCartItems = () => Array.from(cart.values());

  const createControlButton = (label, action, itemId) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cart-control";
    button.dataset.cartAction = action;
    button.dataset.itemId = itemId;
    button.textContent = label;
    return button;
  };

  const renderCart = () => {
    const items = getCartItems();
    cartList.innerHTML = "";
    cartEmpty.hidden = items.length > 0;
    checkoutSubmit.disabled = items.length === 0;

    items.forEach((item) => {
      const row = document.createElement("li");
      row.className = "cart-item";

      const details = document.createElement("div");
      details.className = "cart-item__details";

      const name = document.createElement("strong");
      name.textContent = item.name;

      const meta = document.createElement("span");
      meta.textContent = `${item.category} / ${formatInitialOffering(item)} / 数量 ${item.quantity}`;

      details.append(name, meta);

      const controls = document.createElement("div");
      controls.className = "cart-item__controls";
      controls.append(
        createControlButton("-", "decrease", item.id),
        createControlButton("+", "increase", item.id),
        createControlButton("削除", "remove", item.id)
      );

      row.append(details, controls);
      cartList.append(row);
    });
  };

  productGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-to-cart]");
    if (!button || button.disabled) return;

    const product = productsById.get(button.dataset.productId);
    if (!product || !isPurchasableProduct(product)) return;

    const current = cart.get(product.id);
    const quantity = current ? current.quantity + 1 : 1;
    cart.set(product.id, { ...product, quantity });
    setStatus(`${product.name}を選択内容に追加しました。`, "success");
    renderCart();
  });

  cartList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;

    const itemId = button.dataset.itemId;
    const action = button.dataset.cartAction;
    const item = cart.get(itemId);
    if (!item) return;

    if (action === "increase") {
      item.quantity += 1;
      cart.set(itemId, item);
    }

    if (action === "decrease") {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        cart.delete(itemId);
      } else {
        cart.set(itemId, item);
      }
    }

    if (action === "remove") {
      cart.delete(itemId);
    }

    renderCart();
  });

  if (categoryFilter) {
    categoryFilter.addEventListener("change", renderProducts);
  }

  checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (cart.size === 0) {
      setStatus("授与品を選択してください。", "error");
      return;
    }

    if (!checkoutForm.reportValidity()) {
      setStatus("未入力の項目を確認してください。", "error");
      return;
    }

    const formData = new FormData(checkoutForm);
    const endpoint = checkoutForm.dataset.checkoutEndpoint || "/api/create-checkout-session";
    const payload = {
      items: getCartItems().map((item) => ({
        id: item.id,
        sku: item.sku,
        quantity: item.quantity,
      })),
      customer: {
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        postalCode: String(formData.get("postalCode") || "").trim(),
        address: String(formData.get("address") || "").trim(),
      },
      note: String(formData.get("note") || "").trim(),
      successUrl: `${window.location.origin}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/checkout-cancel.html`,
    };

    checkoutSubmit.disabled = true;
    setStatus("決済ページを準備しています。", "loading");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Checkout endpoint returned ${response.status}`);
      }

      const data = await response.json();
      const checkoutUrl = data.url || data.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error("Checkout URL was not returned");
      }

      window.location.assign(checkoutUrl);
    } catch (error) {
      console.warn(error);
      setStatus(
        "決済APIはまだ未接続です。/api/create-checkout-session を実装すると、このボタンから決済画面へ進めます。",
        "error"
      );
      checkoutSubmit.disabled = false;
    }
  });

  try {
    products = normalizeProducts(await loadProducts());
    renderCategoryOptions();
    renderProducts();
  } catch (error) {
    console.warn(error);
    productGrid.innerHTML = "";
    const empty = document.createElement("p");
    empty.className = "product-empty";
    empty.textContent = "授与品を読み込めませんでした。";
    productGrid.append(empty);
    if (productCount) {
      productCount.textContent = "商品を読み込めませんでした。";
    }
  }

  renderCart();
});
