class Chatbot {
  constructor(config) {
    this.config = config;
    this.messages = [];
    this.isOpen = false;
    this.init();
  }

  init() {
    this.container = document.createElement('div');
    this.container.className = 'chatbot-container';
    if (this.config.theme === 'dark') this.container.classList.add('dark');
    if (this.config.position === 'bottom-left') this.container.classList.add('bottom-left');

    const header = document.createElement('div');
    header.className = 'chatbot-header';
    header.innerHTML = `
      <div class="chatbot-title">Asistente de Pedidos</div>
      <button class="chatbot-close">&times;</button>
    `;

    const messagesArea = document.createElement('div');
    messagesArea.className = 'chatbot-messages';

    const inputArea = document.createElement('div');
    inputArea.className = 'chatbot-input';
    inputArea.innerHTML = `
      <input type="text" placeholder="Escribe tu mensaje...">
      <button>Enviar</button>
    `;

    this.container.appendChild(header);
    this.container.appendChild(messagesArea);
    this.container.appendChild(inputArea);
    document.body.appendChild(this.container);

    this.setupEventListeners();
  }

  setupEventListeners() {
    const closeButton = this.container.querySelector('.chatbot-close');
    const input = this.container.querySelector('input');
    const sendButton = this.container.querySelector('button');

    closeButton.addEventListener('click', () => this.toggleChat());
    sendButton.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.container.style.display = this.isOpen ? 'flex' : 'none';
  }

  async sendMessage() {
    const input = this.container.querySelector('input');
    const message = input.value.trim();
    if (!message) return;

    this.addMessage(message, 'user');
    input.value = '';

    try {
      const response = await fetch('https://andrestorres15.app.n8n.cloud/webhook/71b29523-e74f-40e5-b566-fd6aeaa10bf6/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      const data = await response.json();
      this.addMessage(data.response, 'bot');
    } catch (error) {
      this.addMessage('Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.', 'bot');
    }
  }

  addMessage(text, type) {
    const messagesArea = this.container.querySelector('.chatbot-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `chatbot-message ${type}`;
    messageElement.textContent = text;
    messagesArea.appendChild(messageElement);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const config = {
    theme: document.documentElement.getAttribute('data-chatbot-theme') || 'light',
    position: document.documentElement.getAttribute('data-chatbot-position') || 'bottom-right'
  };
  window.chatbot = new Chatbot(config);
}); 