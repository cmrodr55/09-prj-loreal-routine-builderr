
/* L'OREAL ROUTINE BUILDER — PROJECT 9 */

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

  const WORKER_URL =
    "https://loreal-beauty-advisor.cmrodr55.workers.dev";

  const STORAGE_KEY = "loreal-project9-products";

  let products = [];
  let visibleCount = 6;
  let lastRoutine = "";
  let conversationHistory = [];
  let busy = false;

  const required = [
    productGrid, searchInput, categoryFilter,
    selectedContainer, showMoreBtn, generateBtn,
    clearBtn, routineOutput, chatForm,
    userInput, chatWindow
  ];

  if (required.some(element => !element)) {
    console.error("Required HTML elements are missing.");
    return;
  }

  // Restore saved product selections.
  let savedIds = [];

  try {
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    if (Array.isArray(stored)) savedIds = stored;
  } catch (error) {
    console.warn("Could not read saved products.", error);
  }

  const selectedIds = new Set(savedIds.map(Number));

  const SYSTEM_PROMPT = `
You are L'Oréal Routine Builder's beauty assistant.

Help users create personalized beauty routines using
only the product information provided in the conversation.

Stay focused on skincare, haircare, makeup,
fragrance, grooming, and related beauty topics.

When generating a routine:
- Use only the selected products.
- Consider each product's category and description.
- Organize skincare in a sensible application order.
- Separate morning and evening steps when appropriate.
- Explain how to use each selected product.
- Do not invent ingredients or product benefits.
- Do not invent products that were not selected.
- Mention sunscreen when relevant, without claiming
  that an unselected sunscreen was included.
- Give cautious advice about irritation and retinol.
- Avoid medical diagnoses.

For follow-up questions, remember the previous
conversation and the generated routine.

Use clear, friendly, helpful English.
`;

  function saveSelections() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...selectedIds])
      );
    } catch (error) {
      console.warn("Could not save selections.", error);
    }
  }

  function getSelected() {
    return products.filter(product =>
      selectedIds.has(product.id)
    );
  }

  function makeButton(label, callback) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", callback);
    return button;
  }

  function resetRoutine() {
    lastRoutine = "";
    conversationHistory = [];
    routineOutput.textContent =
      "Generate a routine using your selected products.";

    chatWindow.replaceChildren();
    addMessage(
      "assistant",
      "Your selections have changed. Generate a new " +
      "routine to start a conversation about them."
    );
  }

  function toggleProduct(id) {
    if (selectedIds.has(id)) {
      selectedIds.delete(id);
    } else {
      selectedIds.add(id);
    }

    saveSelections();
    resetRoutine();
    renderProducts();
    renderSelected();
  }

  function renderProducts() {
    const query = searchInput.value
      .trim()
      .toLowerCase();

    const category = categoryFilter.value;

    const filtered = products.filter(product => {
      const searchable = [
        product.name,
        product.brand,
        product.category,
        product.description
      ].join(" ").toLowerCase();

      const matchesSearch = searchable.includes(query);
      const matchesCategory =
        category === "all" ||
        product.category === category;

      return matchesSearch && matchesCategory;
    });

    productGrid.replaceChildren();

    filtered.slice(0, visibleCount).forEach(product => {
      const selected = selectedIds.has(product.id);

      const card = document.createElement("article");
      card.className = "product-card";

      if (selected) {
        card.classList.add("selected");
        card.style.border = "2px solid #ff003b";
      }

      const image = document.createElement("img");
      image.src = product.image;
      image.alt = product.name;
      image.loading = "lazy";
      image.style.width = "100%";
      image.style.height = "150px";
      image.style.objectFit = "contain";

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
          detailsButton.setAttribute(
            "aria-expanded",
            String(!description.hidden)
          );
        }
      );

      detailsButton.setAttribute(
        "aria-expanded", "false"
      );

      const selectButton = makeButton(
        selected ? "Remove Product" : "Add to Routine",
        () => toggleProduct(product.id)
      );

      selectButton.setAttribute(
        "aria-pressed", String(selected)
      );

      card.append(
        image,
        title,
        brand,
        categoryText,
        detailsButton,
        description,
        selectButton
      );

      productGrid.appendChild(card);
    });

    if (filtered.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No matching products found.";
      productGrid.appendChild(empty);
    }

    showMoreBtn.hidden =
      visibleCount >= filtered.length;
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

  function setBusy(value) {
    busy = value;
    generateBtn.disabled = value;
    clearBtn.disabled = value;
    userInput.disabled = value;
    chatForm.querySelector(
      'button[type="submit"]'
    ).disabled = value;
  }

  async function askAI(message) {
    if (busy) return null;

    setBusy(true);

    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      ...conversationHistory,
      {
        role: "user",
        content: message
      }
    ];

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        throw new Error(
          "Worker returned status " + response.status
        );
      }

      const data = await response.json();

      const answer =
        data.choices?.[0]?.message?.content ||
        data.response ||
        data.reply ||
        data.output_text;

      if (typeof answer !== "string" ||
          !answer.trim()) {
        throw new Error("Invalid AI response.");
      }

      conversationHistory.push(
        { role: "user", content: message },
        { role: "assistant", content: answer }
      );

      return answer;

    } catch (error) {
      console.error("AI request failed:", error);

      addMessage(
        "assistant",
        "Sorry, I couldn't connect to the AI service. " +
        "Please try again later."
      );

      return null;
    } finally {
      setBusy(false);
    }
  }

  // Generate a routine with selected product JSON.
  generateBtn.addEventListener("click", async () => {
    const selected = getSelected();

    if (!selected.length) {
      routineOutput.textContent =
        "Please select at least one product.";
      return;
    }

    conversationHistory = [];
    lastRoutine = "";
    chatWindow.replaceChildren();

    const productData = selected.map(product => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description
    }));

    const prompt =
      "Generate a personalized beauty routine using " +
      "ONLY these selected products:\n\n" +
      JSON.stringify(productData, null, 2) +
      "\n\nExplain the order, usage, and appropriate " +
      "timing for each product. Keep the routine " +
      "practical and easy to follow.";

    routineOutput.textContent =
      "Generating your personalized routine...";

    const answer = await askAI(prompt);

    if (answer) {
      lastRoutine = answer;
      routineOutput.style.whiteSpace = "pre-wrap";
      routineOutput.textContent = answer;
      addMessage("assistant", answer);
    } else {
      routineOutput.textContent =
        "Could not generate a routine. " +
        "Please check the AI connection.";
    }
  });

  // Continue conversation with full history.
  chatForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (busy) return;

    const message = userInput.value.trim();
    if (!message) return;

    if (!lastRoutine) {
      addMessage(
        "assistant",
        "Please generate a routine first so I can " +
        "answer questions about your selected products."
      );
      return;
    }

    addMessage("user", message);
    userInput.value = "";

    const answer = await askAI(message);

    if (answer) {
      addMessage("assistant", answer);
    }
  });

  // Clear every saved selection.
  clearBtn.addEventListener("click", () => {
    selectedIds.clear();
    saveSelections();
    resetRoutine();
    renderProducts();
    renderSelected();
  });

  // Product search LevelUp.
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

  // Load the real product catalog.
  async function loadProducts() {
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

      // Remove saved IDs no longer in the catalog.
      const validIds = new Set(
        products.map(product => product.id)
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
        "Unable to load products. Please refresh " +
        "the page or check products.json.";
    }
  }

  addMessage(
    "assistant",
    "Welcome to L'Oréal Routine Builder! 💛 " +
    "Select your favorite products, generate " +
    "a routine, and ask me beauty questions."
  );

  await loadProducts();
});
