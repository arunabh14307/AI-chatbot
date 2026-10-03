/**
 * LPU Assist - Student Support Assistant
 * Frontend UI & Navigation Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initThemeToggle();
  initFaqAccordion();
  initFaqSearchAndFilter();
  initQuickHelpTriggers();
  initChatPreview();
  initDynamicYear();
});

/**
 * -----------------------------------------------------------------------------
 * 1. View Navigation & Routing
 * -----------------------------------------------------------------------------
 */
function initNavigation() {
  const navLinks = document.querySelectorAll('[data-view]');
  const viewPanels = document.querySelectorAll('.view-panel');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const brandLogoLink = document.getElementById('brandLogoLink');
  const floatingChatTrigger = document.getElementById('floatingChatTrigger');

  // Switch to a target view
  function switchView(targetViewId, shouldScrollTop = true) {
    // If targetViewId is not one of our primary views (e.g. #quick-help), handle scrolling
    if (targetViewId === 'quick-help') {
      targetViewId = 'home';
      setTimeout(() => {
        const el = document.getElementById('quick-help');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }

    const targetPanel = document.getElementById(`view-${targetViewId}`);
    if (!targetPanel) return;

    // Update active view panel
    viewPanels.forEach(panel => panel.classList.remove('active'));
    targetPanel.classList.add('active');

    // Update active state in desktop and mobile links
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(link => {
      if (link.getAttribute('data-view') === targetViewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close mobile menu drawer if open
    if (mobileNavDrawer && mobileNavDrawer.classList.contains('open')) {
      mobileNavDrawer.classList.remove('open');
      if (mobileMenuToggle) {
        mobileMenuToggle.classList.remove('open');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
    }

    // Scroll to top of page on view change
    if (shouldScrollTop && targetViewId !== 'quick-help') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // If switching to chat view, auto-focus textarea
    if (targetViewId === 'chat') {
      setTimeout(() => {
        const chatInput = document.getElementById('chatTextarea');
        if (chatInput) chatInput.focus();
      }, 150);
    }

    // Sync FAQ target if switching to dedicated faqs view
    if (targetViewId === 'faqs') {
      syncFaqToDedicatedView();
    }
  }

  // Handle URL hash routing
  function handleHashChange() {
    const rawHash = window.location.hash.replace('#', '').trim();
    if (rawHash === 'chat' || rawHash === 'faqs' || rawHash === 'about') {
      switchView(rawHash);
    } else if (rawHash === 'quick-help') {
      switchView('home', false);
      const el = document.getElementById('quick-help');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      switchView('home');
    }
  }

  window.addEventListener('hashchange', handleHashChange);

  // Bind clicks on all data-view elements
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const view = link.getAttribute('data-view');
      if (view) {
        window.location.hash = view;
      }
    });
  });

  // Floating Chat Button
  if (floatingChatTrigger) {
    floatingChatTrigger.addEventListener('click', () => {
      window.location.hash = 'chat';
    });
  }

  // Mobile Menu Toggle
  if (mobileMenuToggle && mobileNavDrawer) {
    mobileMenuToggle.addEventListener('click', () => {
      const isOpen = mobileNavDrawer.classList.toggle('open');
      mobileMenuToggle.classList.toggle('open', isOpen);
      mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close drawer if clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileNavDrawer.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        if (mobileNavDrawer.classList.contains('open')) {
          mobileNavDrawer.classList.remove('open');
          mobileMenuToggle.classList.remove('open');
          mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }

  // Initial routing check
  handleHashChange();
}

/**
 * -----------------------------------------------------------------------------
 * 2. Visual Theme Toggle (Dark / Light Mode)
 * -----------------------------------------------------------------------------
 */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (!themeToggleBtn) return;

  // Retrieve saved preference or default to light
  const savedTheme = localStorage.getItem('lpu_assist_theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('lpu_assist_theme', isDark ? 'dark' : 'light');
  });
}

/**
 * -----------------------------------------------------------------------------
 * 3. FAQ Accordion Functionality
 * -----------------------------------------------------------------------------
 */
function initFaqAccordion() {
  const faqList = document.getElementById('faqAccordionList');
  if (!faqList) return;

  faqList.addEventListener('click', (e) => {
    const questionBtn = e.target.closest('.faq-question-btn');
    if (!questionBtn) return;

    const faqItem = questionBtn.closest('.faq-item');
    if (!faqItem) return;

    const isExpanded = faqItem.classList.contains('expanded');
    const answerPanel = faqItem.querySelector('.faq-answer-panel');

    // Close other open accordions for a clean single-open behavior
    const allItems = faqList.querySelectorAll('.faq-item');
    allItems.forEach(item => {
      if (item !== faqItem) {
        item.classList.remove('expanded');
        const btn = item.querySelector('.faq-question-btn');
        const panel = item.querySelector('.faq-answer-panel');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        if (panel) panel.style.maxHeight = null;
      }
    });

    if (isExpanded) {
      faqItem.classList.remove('expanded');
      questionBtn.setAttribute('aria-expanded', 'false');
      answerPanel.style.maxHeight = null;
    } else {
      faqItem.classList.add('expanded');
      questionBtn.setAttribute('aria-expanded', 'true');
      answerPanel.style.maxHeight = answerPanel.scrollHeight + 'px';
    }
  });
}

/**
 * -----------------------------------------------------------------------------
 * 4. FAQ Search & Category Filter
 * -----------------------------------------------------------------------------
 */
function initFaqSearchAndFilter() {
  const searchInput = document.getElementById('faqSearchInput');
  const clearBtn = document.getElementById('faqClearBtn');
  const filterPills = document.querySelectorAll('.faq-filter-pills .filter-pill');
  const faqItems = document.querySelectorAll('#faqAccordionList .faq-item');
  const noResultsBlock = document.getElementById('faqNoResults');
  const resetSearchBtn = document.getElementById('faqResetSearchBtn');

  let activeCategory = 'all';

  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let visibleCount = 0;

    faqItems.forEach(item => {
      const itemCategory = item.getAttribute('data-category');
      const questionText = item.querySelector('.faq-q-text')?.textContent.toLowerCase() || '';
      const answerText = item.querySelector('.faq-answer-content')?.textContent.toLowerCase() || '';

      const matchesCategory = (activeCategory === 'all' || itemCategory === activeCategory);
      const matchesQuery = !query || questionText.includes(query) || answerText.includes(query);

      if (matchesCategory && matchesQuery) {
        item.style.display = 'block';
        visibleCount++;
      } else {
        item.style.display = 'none';
        // collapse if hidden
        item.classList.remove('expanded');
        const btn = item.querySelector('.faq-question-btn');
        const panel = item.querySelector('.faq-answer-panel');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        if (panel) panel.style.maxHeight = null;
      }
    });

    // Handle clear button visibility
    if (clearBtn) {
      clearBtn.style.display = query.length > 0 ? 'block' : 'none';
    }

    // Handle no results message
    if (noResultsBlock) {
      noResultsBlock.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  // Category pill clicks
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-category') || 'all';
      applyFilters();
    });
  });

  // Search input typing
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  // Search clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      applyFilters();
      searchInput.focus();
    });
  }

  // Reset button inside no-results
  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      activeCategory = 'all';
      filterPills.forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-category') === 'all');
      });
      applyFilters();
    });
  }
}

/**
 * Synchronize FAQ items onto the dedicated FAQs view
 */
function syncFaqToDedicatedView() {
  const mount = document.getElementById('faqCloneTarget');
  const source = document.getElementById('faqAccordionList');
  if (mount && source && mount.children.length === 0) {
    mount.innerHTML = `
      <div class="faq-accordion-list dedicated-faq-list">
        ${source.innerHTML}
      </div>
    `;

    // Re-attach click listener for cloned accordion items
    const clonedList = mount.querySelector('.dedicated-faq-list');
    if (clonedList) {
      clonedList.addEventListener('click', (e) => {
        const questionBtn = e.target.closest('.faq-question-btn');
        if (!questionBtn) return;
        const item = questionBtn.closest('.faq-item');
        if (!item) return;

        const isExpanded = item.classList.contains('expanded');
        const answerPanel = item.querySelector('.faq-answer-panel');

        clonedList.querySelectorAll('.faq-item').forEach(other => {
          if (other !== item) {
            other.classList.remove('expanded');
            const b = other.querySelector('.faq-question-btn');
            const p = other.querySelector('.faq-answer-panel');
            if (b) b.setAttribute('aria-expanded', 'false');
            if (p) p.style.maxHeight = null;
          }
        });

        if (isExpanded) {
          item.classList.remove('expanded');
          questionBtn.setAttribute('aria-expanded', 'false');
          answerPanel.style.maxHeight = null;
        } else {
          item.classList.add('expanded');
          questionBtn.setAttribute('aria-expanded', 'true');
          answerPanel.style.maxHeight = answerPanel.scrollHeight + 'px';
        }
      });
    }
  }
}

/**
 * -----------------------------------------------------------------------------
 * 5. Quick Help Triggers
 * -----------------------------------------------------------------------------
 */
function initQuickHelpTriggers() {
  const cardButtons = document.querySelectorAll('.card-action-btn');
  cardButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.getAttribute('data-query');
      if (query) {
        window.location.hash = 'chat';
        setTimeout(() => {
          if (window.handleExternalChatQuery) {
            window.handleExternalChatQuery(query);
          }
        }, 150);
      }
    });
  });
}

/**
 * -----------------------------------------------------------------------------
 * 6. Chat Controller (Step 2 - Dedicated Chat Interface)
 * -----------------------------------------------------------------------------
 */
const CHAT_CONSTANTS = {
  WELCOME_MESSAGE: "Hi! I'm LPU Assist. How can I help you today?",
  STORAGE_KEY: "lpu_assist_chat_session",
  SUGGESTED_QUESTIONS: [
    { title: "75% Attendance Rule", icon: "📋" },
    { title: "Hostel Outpass Guide", icon: "🏠" },
    { title: "UMS Password Reset", icon: "🔐" },
    { title: "CA Marks Calculation", icon: "📝" },
    { title: "RMS Grievance Ticket", icon: "🎫" }
  ]
};

function initChatPreview() {
  const chatForm = document.getElementById('chatInputForm');
  const chatTextarea = document.getElementById('chatTextarea');
  const messagesArea = document.getElementById('chatMessagesArea');
  const typingIndicator = document.getElementById('typingIndicator');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const chatSendBtn = document.getElementById('chatSendBtn');

  if (!chatForm || !chatTextarea || !messagesArea) return;

  let isResponding = false;

  // Retrieve current session messages or seed with initial welcome message
  function getSessionMessages() {
    try {
      const stored = sessionStorage.getItem(CHAT_CONSTANTS.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Could not read chat session:", err);
    }

    const initial = [
      {
        id: 'msg-' + Date.now(),
        sender: 'bot',
        text: CHAT_CONSTANTS.WELCOME_MESSAGE,
        isHtml: false,
        timestamp: formatCurrentTime()
      }
    ];
    saveSessionMessages(initial);
    return initial;
  }

  // Save messages to sessionStorage
  function saveSessionMessages(messages) {
    try {
      sessionStorage.setItem(CHAT_CONSTANTS.STORAGE_KEY, JSON.stringify(messages));
    } catch (err) {
      console.warn("Could not save chat session:", err);
    }
  }

  // Format AI markdown responses with support for headings, bold, italics, code, lists, and sources
  function formatMarkdownResponse(markdown, sources = []) {
    if (!markdown) return '';

    // Basic markdown inline formatting
    let formatted = markdown
      // Headings
      .replace(/^### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^## (.*$)/gim, '<h3>$1</h3>')
      .replace(/^# (.*$)/gim, '<h3>$1</h3>')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      // Markdown links [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Parse list blocks and paragraphs
    const lines = formatted.split('\n');
    let inUl = false;
    let inOl = false;
    const outputLines = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (line.startsWith('* ') || line.startsWith('- ')) {
        if (!inUl) {
          outputLines.push('<ul>');
          inUl = true;
        }
        outputLines.push(`<li>${line.substring(2)}</li>`);
      } else if (/^\d+\.\s/.test(line)) {
        if (!inOl) {
          outputLines.push('<ol>');
          inOl = true;
        }
        const item = line.replace(/^\d+\.\s*/, '');
        outputLines.push(`<li>${item}</li>`);
      } else {
        if (inUl) {
          outputLines.push('</ul>');
          inUl = false;
        }
        if (inOl) {
          outputLines.push('</ol>');
          inOl = false;
        }
        if (line.length > 0) {
          if (!line.startsWith('<h') && !line.startsWith('</h')) {
            outputLines.push(`<p>${line}</p>`);
          } else {
            outputLines.push(line);
          }
        }
      }
    }

    if (inUl) outputLines.push('</ul>');
    if (inOl) outputLines.push('</ol>');

    let finalHtml = outputLines.join('\n');

    // Append source citations if available from verified knowledge base
    if (Array.isArray(sources) && sources.length > 0) {
      finalHtml += `
        <div class="message-sources-container">
          <span class="sources-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            Source Information:
          </span>
          <div class="sources-list">
            ${sources.map(s => `
              <a href="${escapeHtml(s.url || '#')}" target="_blank" rel="noopener noreferrer" class="source-item" title="Verified: ${escapeHtml(s.lastVerifiedDate || 'Official')}">
                <span>📄 ${escapeHtml(s.title || 'Official Portal')}</span>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    return finalHtml;
  }

  // Render the entire message list + suggested questions
  function renderConversation() {
    const messages = getSessionMessages();
    messagesArea.innerHTML = '';

    messages.forEach(msg => {
      renderMessageElement(msg.sender, msg.text, msg.timestamp, msg.isHtml, false);
    });

    // Render suggested question buttons
    renderSuggestedQuestionsBox();
    scrollToBottom(false);
  }

  // Render a single message bubble element
  function renderMessageElement(sender, text, timestamp, isHtml = false, shouldScroll = true) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender === 'user' ? 'user-message' : 'bot-message'}`;

    if (sender === 'user') {
      msgDiv.innerHTML = `
        <div class="msg-avatar" aria-label="User avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="msg-content">
          <div class="msg-sender">You</div>
          <div class="msg-body">
            <p>${escapeHtml(text)}</p>
          </div>
          <div class="msg-timestamp">${timestamp || formatCurrentTime()}</div>
        </div>
      `;
    } else {
      msgDiv.innerHTML = `
        <div class="msg-avatar" aria-label="LPU Assist avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
        </div>
        <div class="msg-content">
          <div class="msg-sender">LPU Assist</div>
          <div class="msg-body">
            ${isHtml ? text : `<p>${escapeHtml(text)}</p>`}
          </div>
          <div class="msg-timestamp">${timestamp || formatCurrentTime()}</div>
        </div>
      `;
    }

    // Insert before the suggested questions container if it exists, otherwise append
    const suggestionsContainer = document.getElementById('suggestedQuestionsContainer');
    if (suggestionsContainer && suggestionsContainer.parentNode === messagesArea) {
      messagesArea.insertBefore(msgDiv, suggestionsContainer);
    } else {
      messagesArea.appendChild(msgDiv);
    }

    if (shouldScroll) {
      scrollToBottom(true);
    }
  }

  // Render suggested question buttons container (5 requested topics)
  function renderSuggestedQuestionsBox() {
    const existing = document.getElementById('suggestedQuestionsContainer');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.className = 'suggested-questions-container';
    container.id = 'suggestedQuestionsContainer';

    container.innerHTML = `
      <div class="suggested-questions-label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4"></path>
          <path d="M12 8h.01"></path>
        </svg>
        <span>Suggested Questions:</span>
      </div>
      <div class="suggested-questions-grid">
        ${CHAT_CONSTANTS.SUGGESTED_QUESTIONS.map(q => `
          <button type="button" class="suggested-question-btn" data-question="${escapeHtml(q.title)}">
            <span class="btn-emoji-icon">${q.icon}</span>
            <span>${escapeHtml(q.title)}</span>
          </button>
        `).join('')}
      </div>
    `;

    messagesArea.appendChild(container);
  }

  // Smooth scroll helper
  function scrollToBottom(smooth = true) {
    if (!messagesArea) return;
    messagesArea.scrollTo({
      top: messagesArea.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  // Update send button state based on textarea content
  function updateSendButtonState() {
    const hasText = chatTextarea.value.trim().length > 0;
    if (chatSendBtn) {
      chatSendBtn.style.opacity = (hasText && !isResponding) ? '1' : '0.5';
      chatSendBtn.disabled = !hasText || isResponding;
    }
  }

  // Process sending a user message to real AI backend
  async function handleSendMessage(rawText) {
    const text = (rawText || '').trim();
    // Prevent empty or whitespace-only messages
    if (!text || isResponding) return;

    const time = formatCurrentTime();
    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text,
      isHtml: false,
      timestamp: time
    };

    // Update session storage
    const messages = getSessionMessages();
    messages.push(userMsg);
    saveSessionMessages(messages);

    // Render user message bubble
    renderMessageElement('user', text, time, false, true);

    // Reset textarea
    chatTextarea.value = '';
    chatTextarea.style.height = 'auto';
    updateSendButtonState();

    // Show realistic typing/loading indicator while waiting
    isResponding = true;
    if (typingIndicator) typingIndicator.style.display = 'flex';
    updateSendButtonState();
    scrollToBottom(true);

    try {
      // Build conversation history to send to backend (excluding the current turn)
      const historyPayload = messages.slice(0, -1).map(m => ({
        sender: m.sender,
        text: m.rawText || m.text
      }));

      // Real fetch call to backend endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: historyPayload
        })
      });

      const data = await response.json();
      const botTime = formatCurrentTime();

      let botRawText = data.response || data.message || 'I received your inquiry, but could not retrieve a response.';
      const sources = data.sources || [];
      const formattedHtml = formatMarkdownResponse(botRawText, sources);

      const botMsg = {
        id: 'msg-' + Date.now(),
        sender: 'bot',
        text: formattedHtml,
        rawText: botRawText,
        isHtml: true,
        sources: sources,
        timestamp: botTime
      };

      const updated = getSessionMessages();
      updated.push(botMsg);
      saveSessionMessages(updated);

      renderMessageElement('bot', formattedHtml, botTime, true, true);

    } catch (networkError) {
      console.error('Chat API Error:', networkError);
      const botTime = formatCurrentTime();
      const errorHtml = `
        <p>I am unable to connect to the assistant server at the moment.</p>
        <p class="sub-note">Please ensure your local server is running, or verify your network connection. For urgent academic guidance, please consult the official UMS portal.</p>
      `;

      const botMsg = {
        id: 'msg-' + Date.now(),
        sender: 'bot',
        text: errorHtml,
        rawText: 'Unable to connect to server.',
        isHtml: true,
        sources: [],
        timestamp: botTime
      };

      const updated = getSessionMessages();
      updated.push(botMsg);
      saveSessionMessages(updated);

      renderMessageElement('bot', errorHtml, botTime, true, true);
    } finally {
      isResponding = false;
      if (typingIndicator) typingIndicator.style.display = 'none';
      updateSendButtonState();
      chatTextarea.focus();
    }
  }

  // Clear Chat functionality
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      try {
        sessionStorage.removeItem(CHAT_CONSTANTS.STORAGE_KEY);
      } catch (err) {
        console.warn("Error clearing chat session:", err);
      }
      isResponding = false;
      if (typingIndicator) typingIndicator.style.display = 'none';

      renderConversation();
      chatTextarea.value = '';
      chatTextarea.style.height = 'auto';
      updateSendButtonState();
      chatTextarea.focus();
    });
  }

  // Auto-resize textarea and update send button state
  chatTextarea.addEventListener('input', () => {
    chatTextarea.style.height = 'auto';
    chatTextarea.style.height = Math.min(chatTextarea.scrollHeight, 120) + 'px';
    updateSendButtonState();
  });

  // Enter sends message, Shift+Enter creates new line
  chatTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(chatTextarea.value);
    }
  });

  // Submit via send button / form
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSendMessage(chatTextarea.value);
  });

  // Handle suggested question clicks via event delegation
  messagesArea.addEventListener('click', (e) => {
    const btn = e.target.closest('.suggested-question-btn');
    if (!btn) return;
    const question = btn.getAttribute('data-question');
    if (question) {
      handleSendMessage(question);
    }
  });

  // Expose for external calls (e.g. from Home page quick help cards)
  window.handleExternalChatQuery = function(query) {
    handleSendMessage(query);
  };

  // Initial setup & render
  updateSendButtonState();
  renderConversation();
}

/**
 * Safe HTML escaping for user strings
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format timestamp helper (e.g. "11:45 PM")
 */
function formatCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * -----------------------------------------------------------------------------
 * 7. Dynamic Footer Year
 * -----------------------------------------------------------------------------
 */
function initDynamicYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}


