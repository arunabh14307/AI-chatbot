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
  TEMP_ASSISTANT_RESPONSE: "Thanks for your question! I'm currently in preview mode. AI-powered responses will be connected in the next step.",
  STORAGE_KEY: "lpu_assist_chat_session",
  SUGGESTED_QUESTIONS: [
    "How can I check my timetable?",
    "Where can I find my course information?",
    "How do I contact university support?",
    "Tell me about academic resources"
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

  // Retrieve current session messages or seed with welcome message
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

  // Render the entire message list + suggested questions
  function renderConversation() {
    const messages = getSessionMessages();
    messagesArea.innerHTML = '';

    messages.forEach(msg => {
      renderMessageElement(msg.sender, msg.text, msg.timestamp, false);
    });

    // Render suggested question buttons
    renderSuggestedQuestionsBox();
    scrollToBottom(false);
  }

  // Render a single message bubble element
  function renderMessageElement(sender, text, timestamp, shouldScroll = true) {
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
            <p>${escapeHtml(text)}</p>
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

  // Render suggested question buttons container
  function renderSuggestedQuestionsBox() {
    // Remove existing container if present
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
        <span>Suggested questions:</span>
      </div>
      <div class="suggested-questions-grid">
        ${CHAT_CONSTANTS.SUGGESTED_QUESTIONS.map(question => `
          <button type="button" class="suggested-question-btn" data-question="${escapeHtml(question)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 16 16 12 12 8"></polyline>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <span>${escapeHtml(question)}</span>
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

  // Process sending a user message
  function handleSendMessage(rawText) {
    const text = (rawText || '').trim();
    if (!text || isResponding) return;

    const time = formatCurrentTime();
    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: time
    };

    // Update session storage
    const messages = getSessionMessages();
    messages.push(userMsg);
    saveSessionMessages(messages);

    // Render user message bubble
    renderMessageElement('user', text, time, true);

    // Reset textarea
    chatTextarea.value = '';
    chatTextarea.style.height = 'auto';

    // Show typing/loading indicator
    isResponding = true;
    if (typingIndicator) typingIndicator.style.display = 'flex';
    if (chatSendBtn) chatSendBtn.style.opacity = '0.6';
    scrollToBottom(true);

    // Temporary assistant response after realistic delay
    setTimeout(() => {
      if (typingIndicator) typingIndicator.style.display = 'none';

      const botTime = formatCurrentTime();
      const botMsg = {
        id: 'msg-' + Date.now(),
        sender: 'bot',
        text: CHAT_CONSTANTS.TEMP_ASSISTANT_RESPONSE,
        timestamp: botTime
      };

      const updated = getSessionMessages();
      updated.push(botMsg);
      saveSessionMessages(updated);

      renderMessageElement('bot', CHAT_CONSTANTS.TEMP_ASSISTANT_RESPONSE, botTime, true);

      isResponding = false;
      if (chatSendBtn) chatSendBtn.style.opacity = '1';
      chatTextarea.focus();
    }, 700);
  }

  // Clear Chat functionality
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      try {
        sessionStorage.removeItem(CHAT_CONSTANTS.STORAGE_KEY);
      } catch (err) {
        console.warn(err);
      }
      isResponding = false;
      if (typingIndicator) typingIndicator.style.display = 'none';
      if (chatSendBtn) chatSendBtn.style.opacity = '1';

      renderConversation();
      chatTextarea.value = '';
      chatTextarea.style.height = 'auto';
      chatTextarea.focus();
    });
  }

  // Auto-resize textarea and handle Enter key
  chatTextarea.addEventListener('input', () => {
    chatTextarea.style.height = 'auto';
    chatTextarea.style.height = Math.min(chatTextarea.scrollHeight, 120) + 'px';
  });

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

  // Initial render from session
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

