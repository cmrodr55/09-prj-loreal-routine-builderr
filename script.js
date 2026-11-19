
/* L'OREAL SMART BEAUTY ADVISOR */

document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const chatWindow = document.getElementById("chatWindow");

  if (!chatForm || !userInput || !chatWindow) {
    console.error("Chat elements not found.");
    return;
  }

  const WORKER_URL =
    "https://loreal-beauty-advisor.cmrodr55.workers.dev";

  // Free demonstration mode
  const DEMO_MODE = true;
  const conversationHistory = [];

  chatWindow.innerHTML = "";
  addMessage(
    "assistant",
    "Hi! 💄 Welcome to L'Oréal Smart Beauty Advisor! " +
    "I can help you with skincare, makeup, haircare, " +
    "and personalized beauty routines. What can I help you with?"
  );

  function addMessage(role, message) {
    const bubble = document.createElement("div");
    bubble.className = "message " + role;
    bubble.style.padding = "12px";
    bubble.style.margin = "10px 0";
    bubble.style.borderRadius = "12px";
    bubble.style.background =
      role === "user" ? "#fce4ec" : "#f5f5f5";
    bubble.style.whiteSpace = "pre-wrap";
    bubble.textContent = message;
    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function getDemoResponse(message) {
    const text = message.toLowerCase();

    if (/hello|hi|hey|hola/.test(text)) {
      return "Hello, beautiful! 💕 I'm your L'Oréal " +
        "Smart Beauty Advisor. Tell me about your " +
        "skin, hair, or makeup goals!";
    }

    if (/oily|greasy|acne|pimple|breakout/.test(text)) {
      return "For oily or acne-prone skin, try a gentle " +
        "cleanser, a lightweight moisturizer, and SPF 30+. " +
        "L'Oréal Revitalift products may be worth exploring. " +
        "What is your biggest skin concern?";
    }

    if (/dry|dehydrated|hydration|moistur/.test(text)) {
      return "Hydration is key! 💧 Look for ingredients " +
        "like hyaluronic acid. L'Oréal Revitalift " +
        "1.5% Pure Hyaluronic Acid Serum is one option. " +
        "Follow with moisturizer and sunscreen.";
    }

    if (/sensitive|redness|irritat/.test(text)) {
      return "For sensitive skin, choose gentle, " +
        "fragrance-free products when possible. " +
        "Patch-test new products and introduce " +
        "them one at a time.";
    }

    if (/hair|shampoo|conditioner|frizz|curl/.test(text)) {
      return "Let's talk haircare! 💇‍♀️ L'Oréal Paris " +
        "Elvive offers products for different hair needs. " +
        "Is your hair dry, oily, curly, or damaged?";
    }

    if (/makeup|foundation|concealer|lipstick|mascara/.test(text)) {
      return "Let's find your perfect makeup! 💄 " +
        "L'Oréal Paris True Match foundation and " +
        "Lash Paradise mascara are popular options. " +
        "What kind of look are you going for?";
    }

    if (/routine|morning|night|skincare/.test(text)) {
      return "Here's a simple skincare routine:\n" +
        "☀️ Morning: Cleanser → Moisturizer → SPF 30+\n" +
        "🌙 Night: Cleanser → Serum → Moisturizer\n" +
        "Tell me your skin type so I can personalize it!";
    }

    if (/price|budget|affordable|cheap/.test(text)) {
      return "L'Oréal Paris has beauty products at " +
        "different price points! 💕 Tell me your " +
        "budget and what kind of product you need.";
    }

    return "I'd love to help you with that! 💕 " +
      "Tell me a little more about your skin type, " +
      "hair type, or beauty goals so I can recommend " +
      "a L'Oréal beauty routine.";
  }

  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    addMessage("user", message);
    conversationHistory.push({
      role: "user",
      content: message
    });

    userInput.value = "";

    if (DEMO_MODE) {
      const response = getDemoResponse(message);
      addMessage("assistant", response);
      conversationHistory.push({
        role: "assistant",
        content: response
      });
      return;
    }

    try {
      const result = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: conversationHistory
        })
      });

      if (!result.ok) {
        throw new Error("Server error: " + result.status);
      }

      const data = await result.json();
      const response =
        data.choices?.[0]?.message?.content ||
        data.response ||
        data.reply ||
        "Sorry, I couldn't generate a response.";

      addMessage("assistant", response);
      conversationHistory.push({
        role: "assistant",
        content: response
      });
    } catch (error) {
      console.error(error);
      addMessage(
        "assistant",
        "Sorry! I'm having trouble connecting right now. " +
        "Please try again."
      );
    }
  });
});
