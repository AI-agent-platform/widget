(function () {
  function initChatbot({
    apiUrl = "/chat/send",
    historyUrl = "http://localhost:4001/chat/history",
    company_uuid,
    type = "customer_agent",
    primaryColor = "#007bff",
  }) {
    // --- Generate persistent sessionId ---
    function getSessionId() {
      let id = localStorage.getItem("chatSessionId");
      if (!id) {
        id = "sess_" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("chatSessionId", id);
      }
      return id;
    }

    const sessionId = getSessionId();

    // --- Create floating chat button ---
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

    // --- Create chat window ---
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

    // --- Messages area ---
    const messages = document.createElement("div");
    messages.style.flex = "1";
    messages.style.padding = "10px";
    messages.style.overflowY = "auto";
    chatWindow.appendChild(messages);

    // --- Input area ---
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

    // --- Toggle chat window & load history ---
    chatButton.addEventListener("click", async () => {
      chatWindow.style.display =
        chatWindow.style.display === "none" ? "flex" : "none";

      if (chatWindow.style.display === "flex") {
        try {
          const historyResp = await fetch(
            `${historyUrl}?sessionId=${sessionId}`
          );
          const history = await historyResp.json();

          messages.innerHTML = ""; // clear previous
          history.forEach((msg) => {
            const msgDiv = document.createElement("div");
            msgDiv.innerText = `${msg.role === "user" ? "You" : "Bot"}: ${
              msg.content
            }`;
            msgDiv.style.margin = "5px 0";
            msgDiv.style.color = msg.role === "bot" ? "green" : "black";
            messages.appendChild(msgDiv);
          });

          messages.scrollTop = messages.scrollHeight;
        } catch (err) {
          console.error("Failed to load history:", err);
        }
      }
    });

    // --- Send message ---
    sendBtn.addEventListener("click", async () => {
      const userMessage = input.value.trim();
      if (!userMessage) return;

      const userDiv = document.createElement("div");
      userDiv.innerText = "You: " + userMessage;
      userDiv.style.margin = "5px 0";
      messages.appendChild(userDiv);
      messages.scrollTop = messages.scrollHeight;
      input.value = "";
      
      try {
        if (type === "customer_agent") {
          response = await fetch("http://localhost:4001/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: type,
              sessionId: sessionId,
              company_uuid: company_uuid,
              message: userMessage,
              top_k: 5,
            }),
          });
        } else {
          response = await fetch("http://localhost:4001/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: type,
              sessionId: sessionId,
              company_uuid: company_uuid,
              message: userMessage,
            }),
          });
        }
        const data = await response.json();

        const botDiv = document.createElement("div");
        botDiv.innerText = "Bot: " + (data.answer || "No reply");
        botDiv.style.margin = "5px 0";
        botDiv.style.color = "green";
        messages.appendChild(botDiv);
        messages.scrollTop = messages.scrollHeight;
      } catch (err) {
        console.error("Chatbot API error:", err);
        const errorDiv = document.createElement("div");
        errorDiv.innerText = "Bot: ❌ Error contacting server";
        errorDiv.style.margin = "5px 0";
        errorDiv.style.color = "red";
        messages.appendChild(errorDiv);
      }
    });

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendBtn.click();
    });
  }

  window.ChatbotWidget = { init: initChatbot };
})();
