
/* L'OREAL ROUTINE BUILDER — PROJECT 9 */

document.addEventListener("DOMContentLoaded", () => {
  const productGrid = document.getElementById("productGrid");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedContainer = document.getElementById("selectedProducts");
  const showMoreBtn = document.getElementById("showMoreBtn");
  const generateBtn = document.getElementById("generateRoutineBtn");
  const routineOutput = document.getElementById("routineOutput");
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const chatWindow = document.getElementById("chatWindow");

  // Demo catalog: replace or expand with the
  // assignment's products.json if required.
  const products = [
    {
      id: 1,
      brand: "L'Oréal Paris",
      name: "Revitalift 1.5% Hyaluronic Acid Serum",
      category: "serum",
      description: "Hydrating facial serum.",
      step: "Apply after cleansing, before moisturizer.",
      time: "both"
    },
    {
      id: 2,
      brand: "L'Oréal Paris",
      name: "Revitalift Triple Power Moisturizer",
      category: "moisturizer",
      description: "Daily facial moisturizer.",
      step: "Apply after serum.",
      time: "both"
    },
    {
      id: 3,
      brand: "CeraVe",
      name: "Hydrating Facial Cleanser",
      category: "cleanser",
      description: "Gentle facial cleanser.",
      step: "Use first to cleanse the skin.",
      time: "both"
    },
    {
      id: 4,
      brand: "CeraVe",
      name: "Foaming Facial Cleanser",
      category: "cleanser",
      description: "Facial cleanser for normal to oily skin.",
      step: "Use first to cleanse the skin.",
      time: "both"
    },
    {
      id: 5,
      brand: "CeraVe",
      name: "AM Facial Moisturizing Lotion SPF 30",
      category: "sunscreen",
      description: "Morning moisturizer with SPF.",
      step: "Apply as the final morning skincare step.",
      time: "morning"
    },
    {
      id: 6,
      brand: "CeraVe",
      name: "PM Facial Moisturizing Lotion",
      category: "moisturizer",
      description: "Lightweight nighttime moisturizer.",
      step: "Apply at the end of your nighttime routine.",
      time: "night"
    },
    {
      id: 7,
      brand: "L'Oréal Paris",
      name: "Elvive Hyaluron Plump Shampoo",
      category: "haircare",
      description: "Hydrating hair shampoo.",
      step: "Massage into wet hair and rinse.",
      time: "both"
    },
    {
      id: 8,
      brand: "L'Oréal Paris",
      name: "Elvive Hyaluron Plump Conditioner",
      category: "haircare",
      description: "Conditioner for dry hair.",
      step: "Use after shampoo and rinse.",
      time: "both"
    },
    {
      id: 9,
      brand: "L'Oréal Paris",
      name: "True Match Foundation",
      category: "makeup",
      description: "Complexion makeup.",
      step: "Apply after your morning skincare.",
      time: "morning"
    },
    {
      id: 10,
      brand: "L'Oréal Paris",
      name: "Lash Paradise Mascara",
      category: "makeup",
      description: "Volumizing mascara.",
      step: "Apply to eyelashes after other face makeup.",
      time: "morning"
    }
  ];

  const selectedIds = new Set();
  let visibleCount = 6;
  let lastRoutine = "";

  const order = {
    cleanser: 1,
    serum: 2,
    moisturizer: 3,
    sunscreen: 4,
    haircare: 5,
    makeup: 6
  };

  function getSelected() {
    return products.filter(p => selectedIds.has(p.id));
  }

  function makeButton(label, handler, className = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className = className;
    button.addEventListener("click", handler);
    return button;
  }

  function renderProducts() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;

    const filtered = products.filter(product => {
      const matchesSearch =
        `${product.brand} ${product.name} ${product.description}`
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "all" || product.category === category;

      return matchesSearch && matchesCategory;
    });

    productGrid.replaceChildren();

    filtered.slice(0, visibleCount).forEach(product => {
      const card = document.createElement("article");
      card.className = "product-card";

      const title = document.createElement("h3");
      title.textContent = product.name;

      const brand = document.createElement("p");
      brand.textContent = product.brand;

      const description = document.createElement("p");
      description.textContent = product.description;

      const categoryText = document.createElement("p");
      categoryText.textContent = `Category: ${product.category}`;

      const selected = selectedIds.has(product.id);

      const button = makeButton(
        selected ? "Remove Product" : "Add to Routine",
        () => toggleProduct(product.id)
      );

      card.append(
        title,
        brand,
        description,
        categoryText,
        button
      );

      productGrid.appendChild(card);
    });

    if (filtered.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No matching products found.";
      productGrid.appendChild(empty);
    }

    showMoreBtn.hidden = visibleCount >= filtered.length;
  }

  function toggleProduct(id) {
    if (selectedIds.has(id)) {
      selectedIds.delete(id);
    } else {
      selectedIds.add(id);
    }

    lastRoutine = "";
    routineOutput.textContent =
      "Your routine will appear here after you generate it.";

    renderProducts();
    renderSelected();
  }

  function renderSelected() {
    selectedContainer.replaceChildren();

    const selected = getSelected();

    if (!selected.length) {
      const empty = document.createElement("p");
      empty.textContent = "No products selected yet.";
      selectedContainer.appendChild(empty);
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

  function buildRoutine() {
    const selected = getSelected().sort(
      (a, b) => order[a.category] - order[b.category]
    );

    if (!selected.length) {
      return "Please select at least one product first.";
    }

    const morning = selected.filter(
      p => p.time === "morning" || p.time === "both"
    );

    const night = selected.filter(
      p => p.time === "night" || p.time === "both"
    );

    const formatSteps = items => {
      if (!items.length) {
        return "No products selected for this time.";
      }

      return items.map((p, index) =>
        `${index + 1}. ${p.name}\n   ${p.step}`
      ).join("\n\n");
    };

    let result =
      "☀️ MORNING ROUTINE\n\n" +
      formatSteps(morning) +
      "\n\n🌙 NIGHT ROUTINE\n\n" +
      formatSteps(night);

    if (!selected.some(p => p.category === "sunscreen")) {
      result +=
        "\n\n☀️ Reminder: Use a broad-spectrum SPF 30+ " +
        "sunscreen as the last morning skincare step.";
    }

    result +=
      "\n\nIntroduce new skincare products gradually. " +
      "Patch-test when appropriate.";

    return result;
  }

  function addMessage(role, message) {
    const bubble = document.createElement("div");
    bubble.className = `message ${role}`;
    bubble.style.padding = "12px";
    bubble.style.margin = "10px 0";
    bubble.style.borderRadius = "12px";
    bubble.style.background =
      role === "user" ? "#e8edf7" : "#f5f0e5";
    bubble.style.whiteSpace = "pre-wrap";
    bubble.textContent = message;

    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // Free, product-aware demo assistant.
  // This is not a live AI model.
  function getDemoResponse(message) {
    const text = message.toLowerCase();
    const selected = getSelected();

    if (/selected|chosen|my products|what products/.test(text)) {
      return selected.length
        ? "Your selected products are:\n" +
          selected.map(p => `• ${p.name}`).join("\n")
        : "You haven't selected any products yet.";
    }

    if (/routine|morning|night|order|steps/.test(text)) {
      return lastRoutine || buildRoutine();
    }

    const matched = selected.find(p =>
      text.includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().split(" ").some(
        word => word.length > 5 && text.includes(word)
      )
    );

    if (matched) {
      return `${matched.name}\n\n${matched.description}\n` +
        `How to use: ${matched.step}`;
    }

    if (/dry|hydration|dehydrated/.test(text)) {
      return "For dry skin, consider gentle cleansing, " +
        "a hydrating serum, moisturizer, and daytime SPF. " +
        "Check the product cards to choose your routine.";
    }

    if (/oily|acne|breakout/.test(text)) {
      return "For oily or acne-prone skin, consider a " +
        "gentle cleanser, lightweight moisturizer, " +
        "and non-comedogenic sunscreen.";
    }

    if (/sensitive|redness|irritation/.test(text)) {
      return "For sensitive skin, introduce products " +
        "one at a time and patch-test first.";
    }

    if (/hair|shampoo|conditioner/.test(text)) {
      return "For haircare, start with shampoo and " +
        "follow with conditioner. Select hair products " +
        "from the catalog to include them.";
    }

    if (/hello|hi|hey|hola/.test(text)) {
      return "Hello! 💛 Select your beauty products " +
        "and I'll help explain your routine.";
    }

    return selected.length
      ? "I can explain your selected products, " +
        "their order, and your morning or night routine. " +
        "Try asking: What is my routine?"
      : "Welcome! Browse the product catalog, " +
        "select your favorites, and generate a routine.";
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

  generateBtn.addEventListener("click", () => {
    lastRoutine = buildRoutine();
    routineOutput.style.whiteSpace = "pre-wrap";
    routineOutput.textContent = lastRoutine;
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

  chatWindow.replaceChildren();

  addMessage(
    "assistant",
    "Welcome to L'Oréal Routine Builder! 💛 " +
    "Select products, generate your routine, " +
    "and ask me questions about your choices."
  );

  renderProducts();
  renderSelected();
});
