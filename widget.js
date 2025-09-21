(function () {
  function initChatbot({
    apiUrl,
    companyUuid,
    type = "business_agent",
    primaryColor = "#007bff",
  }) {
    // Create floating chat button
    const chatButton = document.createElement("div");
    chatButton.innerHTML = "💬";
    chatButton.style.position = "fixed";
    chatButton.style.bottom = "20px";
    chatButton.style.right = "20px";
    chatButton.style.width = "50px";
    chatButton.style.height = "50px";
    chatButton.style.borderRadius = "50%";
    chatButton.style.background = primaryColor;
    chatButton.style.color = "#fff";
    chatButton.style.display = "flex";
    chatButton.style.justifyContent = "center";
    chatButton.style.alignItems = "center";
    chatButton.style.cursor = "pointer";
    chatButton.style.zIndex = "9999";
    document.body.appendChild(chatButton);

    // Create chat window
    const chatWindow = document.createElement("div");
    chatWindow.style.position = "fixed";
    chatWindow.style.bottom = "80px";
    chatWindow.style.right = "20px";
    chatWindow.style.width = "300px";
    chatWindow.style.height = "400px";
    chatWindow.style.background = "#fff";
    chatWindow.style.border = "1px solid #ccc";
    chatWindow.style.borderRadius = "10px";
    chatWindow.style.display = "none";
    chatWindow.style.flexDirection = "column";
    chatWindow.style.zIndex = "9999";

    // Messages area
    const messages = document.createElement("div");
    messages.style.flex = "1";
    messages.style.padding = "10px";
    messages.style.overflowY = "auto";
    chatWindow.appendChild(messages);

    // Input area
    const inputContainer = document.createElement("div");
    inputContainer.style.display = "flex";
    inputContainer.style.borderTop = "1px solid #ccc";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Type a message...";
    input.style.flex = "1";
    input.style.border = "none";
    input.style.padding = "10px";
    inputContainer.appendChild(input);

    const sendBtn = document.createElement("button");
    sendBtn.innerText = "Send";
    sendBtn.style.border = "none";
    sendBtn.style.background = primaryColor;
    sendBtn.style.color = "white";
    sendBtn.style.padding = "10px";
    inputContainer.appendChild(sendBtn);

    chatWindow.appendChild(inputContainer);
    document.body.appendChild(chatWindow);

    // Toggle chat window
    chatButton.addEventListener("click", () => {
      chatWindow.style.display =
        chatWindow.style.display === "none" ? "flex" : "none";
    });

    // Send message to API
    sendBtn.addEventListener("click", async () => {
      const userMessage = input.value.trim();
      if (!userMessage) return;

      // Show user message
      const userDiv = document.createElement("div");
      userDiv.innerText = "You: " + userMessage;
      userDiv.style.margin = "5px 0";
      messages.appendChild(userDiv);
      input.value = "";
      const body =
        type === "customer_agent"
          ? { company_uuid: companyUuid, question: userMessage, top_k: 5 }
          : { prompt: userMessage, company_uuid: companyUuid };
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        // Show bot reply
        const botDiv = document.createElement("div");
        botDiv.innerText = "Bot: " + (data.answer || "No reply");
        botDiv.style.margin = "5px 0";
        botDiv.style.color = "green";
        messages.appendChild(botDiv);

        messages.scrollTop = messages.scrollHeight;
      } catch (err) {
        console.error("Chatbot API error:", err);
      }
    });
  }

  // Expose globally
  window.ChatbotWidget = { init: initChatbot };
})();
