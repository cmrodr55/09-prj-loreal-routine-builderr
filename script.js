
/* L'ORÉAL ROUTINE BUILDER — PROJECT 9 | FREE DEMO */

document.addEventListener("DOMContentLoaded", async () => {
  const $ = id => document.getElementById(id);

  const productGrid = $("productGrid");
  const searchInput = $("searchInput");
  const categoryFilter = $("categoryFilter");
  const selectedContainer = $("selectedProducts");
  const showMoreBtn = $("showMoreBtn");
  const generateBtn = $("generateRoutineBtn");
  const clearBtn = $("clearSelectionsBtn");
  const routineOutput = $("routineOutput");
  const chatForm = $("chatForm");
  const userInput = $("userInput");
  const chatWindow = $("chatWindow");

  const STORAGE_KEY = "loreal-project9-products";

  let products = [];
  let visibleCount = 6;
  let lastRoutine = "";

  let savedIds = [];

  try {
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    if (Array.isArray(stored)) savedIds = stored;
  } catch (error) {
    console.warn("Could not restore selections:", error);
  }

  const selectedIds = new Set(savedIds.map(Number));

  function getSelected() {
    return products.filter(product =>
      selectedIds.has(Number(product.id))
    );
  }

  function saveSelections() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...selectedIds])
    );
  }

  function makeButton(label, callback) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", callback);
    return button;
  }

  function productText(product) {
    return [
      product.name,
      product.brand,
      product.category,
      product.description
    ].join(" ").toLowerCase();
  }

  function addMessage(role, message) {
    const bubble = document.createElement("div");
    bubble.className = "message " + role;
    bubble.textContent = message;
    bubble.style.whiteSpace = "pre-wrap";
    bubble.style.padding = "12px";
    bubble.style.margin = "10px 0";
    bubble.style.borderRadius = "12px";
    bubble.style.background =
      role === "user" ? "#fff0f3" : "#fff7e7";

    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function resetRoutine() {
    lastRoutine = "";
    routineOutput.textContent =
      "Generate a routine using your selected products.";

    chatWindow.replaceChildren();

    addMessage(
      "assistant",
      "Your selections changed. Generate a new routine."
    );
  }

  function toggleProduct(id) {
    const numericId = Number(id);

    if (selectedIds.has(numericId)) {
      selectedIds.delete(numericId);
    } else {
      selectedIds.add(numericId);
    }

    saveSelections();
    resetRoutine();
    renderProducts();
    renderSelected();
  }

  function renderProducts() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value.toLowerCase();

    const filtered = products.filter(product => {
      const matchesSearch =
        productText(product).includes(query);

      const matchesCategory =
        category === "all" ||
        String(product.category).toLowerCase() === category;

      return matchesSearch && matchesCategory;
    });

    productGrid.replaceChildren();

    filtered.slice(0, visibleCount).forEach(product => {
      const selected = selectedIds.has(Number(product.id));

      const card = document.createElement("article");
      card.className = "product-card";

      if (selected) {
        card.classList.add("selected");
        card.style.border = "2px solid #ff003b";
      }

      if (product.image) {
        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;
        image.loading = "lazy";
        image.style.width = "100%";
        image.style.height = "150px";
        image.style.objectFit = "contain";
        card.appendChild(image);
      }

      const title = document.createElement("h3");
      title.textContent = product.name;

      const brand = document.createElement("p");
      brand.textContent = product.brand;

      const categoryText = document.createElement("p");
      categoryText.textContent = product.category;

      const description = document.createElement("p");
      description.textContent = product.description;
      description.hidden = true;

      const detailsButton = makeButton(
        "View Description",
        () => {
          description.hidden = !description.hidden;
          detailsButton.textContent = description.hidden
            ? "View Description"
            : "Hide Description";
        }
      );

      const selectButton = makeButton(
        selected ? "Remove Product" : "Add to Routine",
        () => toggleProduct(product.id)
      );

      card.append(
        title,
        brand,
        categoryText,
        detailsButton,
        description,
        selectButton
      );

      productGrid.appendChild(card);
    });

    if (!filtered.length) {
      productGrid.textContent =
        "No matching products found.";
    }

    showMoreBtn.hidden =
      visibleCount >= filtered.length;
  }

  function renderSelected() {
    selectedContainer.replaceChildren();

    const selected = getSelected();

    if (!selected.length) {
      selectedContainer.textContent =
        "No products selected yet.";
      return;
    }

    selected.forEach(product => {
      const item = document.createElement("div");
      item.className = "selected-item";

      const name = document.createElement("p");
      name.textContent = product.name;

      const remove = makeButton(
        "Remove ×",
        () => toggleProduct(product.id)
      );

      item.append(name, remove);
      selectedContainer.appendChild(item);
    });
  }

  function getOrder(product) {
    const text = productText(product);

    if (/cleanser|face wash|shampoo/.test(text)) return 1;
    if (/toner|essence/.test(text)) return 2;
    if (/serum|treatment|retinol/.test(text)) return 3;
    if (/conditioner|hair mask/.test(text)) return 4;
    if (/moisturiz|cream|lotion/.test(text)) return 5;
    if (/sunscreen|spf/.test(text)) return 6;
    if (/makeup|mascara|foundation/.test(text)) return 7;

    return 5;
  }

  function getUsage(product) {
    const text = productText(product);

    if (/shampoo/.test(text)) {
      return "Massage into wet hair and rinse.";
    }

    if (/conditioner/.test(text)) {
      return "Apply after shampoo and rinse.";
    }

    if (/cleanser|face wash/.test(text)) {
      return "Gently cleanse the skin and rinse.";
    }

    if (/sunscreen|spf/.test(text)) {
      return "Apply as the last morning skincare step.";
    }

    if (/retinol/.test(text)) {
      return "Use at night as directed on the label.";
    }

    if (/serum/.test(text)) {
      return "Apply after cleansing and before moisturizer.";
    }

    if (/moisturiz|cream|lotion/.test(text)) {
      return "Apply after lighter skincare products.";
    }

    if (/makeup|mascara|foundation/.test(text)) {
      return "Apply after your morning skincare.";
    }

    return "Follow the product label for proper use.";
  }

  function buildRoutine() {
    const selected = [...getSelected()].sort(
      (a, b) => getOrder(a) - getOrder(b)
    );

    if (!selected.length) {
      return "Please select at least one product first.";
    }

    const isMorningOnly = product =>
      /sunscreen|spf|makeup|mascara|foundation/.test(
        productText(product)
      );

    const isNightOnly = product =>
      /retinol|night cream|pm facial/.test(
        productText(product)
      );

    const morning = selected.filter(
      product => !isNightOnly(product)
    );

    const evening = selected.filter(
      product => !isMorningOnly(product)
    );

    function formatSteps(items) {
      if (!items.length) {
        return "No products selected for this section.";
      }

      return items.map((product, index) =>
        `${index + 1}. ${product.name} (${product.brand})\n` +
        `   ${getUsage(product)}`
      ).join("\n\n");
    }

    let routine =
      "YOUR PERSONALIZED ROUTINE — FREE DEMO\n\n" +
      "☀️ MORNING ROUTINE\n\n" +
      formatSteps(morning) +
      "\n\n🌙 NIGHT ROUTINE\n\n" +
      formatSteps(evening);

    const hasSunscreen = selected.some(
      product => /sunscreen|spf/.test(productText(product))
    );

    if (!hasSunscreen) {
      routine +=
        "\n\n☀️ Reminder: Consider using broad-spectrum " +
        "SPF 30+ sunscreen during the day. " +
        "This is not one of your selected products.";
    }

    routine +=
      "\n\nIntroduce new products gradually and " +
      "follow their instructions." +
      "\n\nThis routine is generated by a rule-based " +
      "demo, not a live AI model.";

    return routine;
  }

  function getDemoResponse(message) {
    const text = message.toLowerCase();
    const selected = getSelected();

    if (/hello|hi|hey|hola/.test(text)) {
      return "Hello! I can help explain your beauty routine.";
    }

    if (/selected|chosen|my products/.test(text)) {
      return selected.length
        ? "Your selected products are:\n" +
          selected.map(p => "• " + p.name).join("\n")
        : "You haven't selected any products yet.";
    }

    if (/routine|morning|night|order|steps/.test(text)) {
      return lastRoutine || buildRoutine();
    }

    const matched = selected.find(product =>
      text.includes(product.name.toLowerCase())
    );

    if (matched) {
      return matched.name + "\n\n" +
        matched.description + "\n\n" +
        "How to use: " + getUsage(matched);
    }

    if (/dry|hydration/.test(text)) {
      return "For dry skin, consider a gentle cleanser, " +
        "moisturizer, and daytime sunscreen.";
    }

    if (/oily|acne/.test(text)) {
      return "For oily skin, consider gentle cleansing " +
        "and a lightweight moisturizer.";
    }

    if (/sensitive|irritation/.test(text)) {
      return "Introduce new products gradually " +
        "and patch-test when appropriate.";
    }

    if (/hair|shampoo|conditioner/.test(text)) {
      return "For haircare, shampoo generally comes " +
        "before conditioner.";
    }

    return "I can explain your selected products, " +
      "their descriptions, and your routine. " +
      "Try asking: What is my routine?";
  }

  generateBtn.addEventListener("click", () => {
    lastRoutine = buildRoutine();

    routineOutput.style.whiteSpace = "pre-wrap";
    routineOutput.textContent = lastRoutine;

    chatWindow.replaceChildren();
    addMessage("assistant", lastRoutine);
  });

  chatForm.addEventListener("submit", event => {
    event.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    addMessage("user", message);
    userInput.value = "";

    const response = getDemoResponse(message);
    addMessage("assistant", response);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      selectedIds.clear();
      saveSelections();
      resetRoutine();
      renderProducts();
      renderSelected();
    });
  }

  searchInput.addEventListener("input", () => {
    visibleCount = 6;
    renderProducts();
  });

  categoryFilter.addEventListener("change", () => {
    visibleCount = 6;
    renderProducts();
  });

  showMoreBtn.addEventListener("click", () => {
    visibleCount += 6;
    renderProducts();
  });

  addMessage(
    "assistant",
    "Welcome to L'Oréal Routine Builder! 💛 " +
    "This free demo helps you build routines " +
    "and explore beauty products."
  );

  try {
    const response = await fetch("products.json");

    if (!response.ok) {
      throw new Error("Could not load products.json");
    }

    const data = await response.json();

    if (!Array.isArray(data.products)) {
      throw new Error("Invalid product catalog.");
    }

    products = data.products;

    const validIds = new Set(
      products.map(product => Number(product.id))
    );

    for (const id of selectedIds) {
      if (!validIds.has(id)) {
        selectedIds.delete(id);
      }
    }

    saveSelections();
    renderProducts();
    renderSelected();

  } catch (error) {
    console.error(error);

    productGrid.textContent =
      "Unable to load products. Please check products.json.";
  }
});
