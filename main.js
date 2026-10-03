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
          triggerChatQuestion(query);
        }, 120);
      }
    });
  });
}

/**
 * -----------------------------------------------------------------------------
 * 6. Chat Preview Interface
 * -----------------------------------------------------------------------------
 */
function initChatPreview() {
  const chatForm = document.getElementById('chatInputForm');
  const chatTextarea = document.getElementById('chatTextarea');
  const messagesArea = document.getElementById('chatMessagesArea');
  const typingIndicator = document.getElementById('typingIndicator');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const starterPrompts = document.getElementById('starterPrompts');

  // Auto-resize textarea
  if (chatTextarea) {
    chatTextarea.addEventListener('input', () => {
      chatTextarea.style.height = 'auto';
      chatTextarea.style.height = Math.min(chatTextarea.scrollHeight, 120) + 'px';
    });

    // Enter submits (Shift+Enter inserts newline)
    chatTextarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm?.dispatchEvent(new Event('submit'));
      }
    });
  }

  // Handle starter prompt chip clicks
  if (starterPrompts) {
    starterPrompts.addEventListener('click', (e) => {
      const chip = e.target.closest('.prompt-chip');
      if (chip) {
        const text = chip.getAttribute('data-text');
        if (text) {
          triggerChatQuestion(text);
        }
      }
    });
  }

  // Clear conversation button
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      if (messagesArea) {
        messagesArea.innerHTML = `
          <div class="chat-message bot-message">
            <div class="msg-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
            <div class="msg-content">
              <div class="msg-sender">LPU Assist</div>
              <div class="msg-body">
                <p>Chat cleared. How can I help you today? You can select any category or type your question below.</p>
              </div>
              <div class="msg-timestamp">Just now</div>
            </div>
          </div>
        `;
      }
    });
  }

  // Form submission
  if (chatForm && chatTextarea) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = chatTextarea.value.trim();
      if (!message) return;

      // Append user message
      appendMessage('user', message);
      chatTextarea.value = '';
      chatTextarea.style.height = 'auto';

      // Show typing indicator
      if (typingIndicator) typingIndicator.style.display = 'flex';
      messagesArea.scrollTop = messagesArea.scrollHeight;

      // Realistic mock response reflecting frontend preview state
      setTimeout(() => {
        if (typingIndicator) typingIndicator.style.display = 'none';
        const responseText = generatePreviewResponse(message);
        appendMessage('bot', responseText);
      }, 700);
    });
  }
}

/**
 * Triggers a question directly into the chat
 */
function triggerChatQuestion(questionText) {
  const chatTextarea = document.getElementById('chatTextarea');
  const chatForm = document.getElementById('chatInputForm');
  if (chatTextarea && chatForm) {
    chatTextarea.value = questionText;
    chatForm.dispatchEvent(new Event('submit'));
  }
}

/**
 * Append message bubble to chat
 */
function appendMessage(sender, text) {
  const messagesArea = document.getElementById('chatMessagesArea');
  if (!messagesArea) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${sender}-message`;

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (sender === 'user') {
    msgDiv.innerHTML = `
      <div class="msg-avatar">
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
        <div class="msg-timestamp">${timeString}</div>
      </div>
    `;
  } else {
    msgDiv.innerHTML = `
      <div class="msg-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
          <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
        </svg>
      </div>
      <div class="msg-content">
        <div class="msg-sender">LPU Assist</div>
        <div class="msg-body">
          ${text}
        </div>
        <div class="msg-timestamp">${timeString}</div>
      </div>
    `;
  }

  messagesArea.appendChild(msgDiv);
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

/**
 * Generate preview bot guidance for common student topics
 */
function generatePreviewResponse(userQuery) {
  const query = userQuery.toLowerCase();

  if (query.includes('attendance')) {
    return `
      <p>Here is what you need to know about attendance at LPU:</p>
      <ul>
        <li><strong>75% Mandatory Criteria:</strong> Students must maintain a minimum of 75% attendance in each course to sit for end-term examinations.</li>
        <li><strong>Checking Attendance:</strong> Go to <em>UMS &gt; Academic Performance &gt; View Attendance</em> to monitor lecture, tutorial, and practical percentages in real-time.</li>
        <li><strong>Duty Leaves:</strong> Official university representation or medical exemptions must be approved by the designated authorities through the UMS duty leave request module.</li>
      </ul>
      <div class="preview-notice-box">
        <em>Note: AI engine is in frontend preview. Full natural language responses will be active in the next phase!</em>
      </div>
    `;
  }

  if (query.includes('outpass') || query.includes('leave') || query.includes('hostel')) {
    return `
      <p>Here is the standard hostel leave and outpass procedure:</p>
      <ol>
        <li>Open the <strong>UMS / Mobile App Hostel Module</strong>.</li>
        <li>Select <em>Apply Outpass / Home Leave</em>.</li>
        <li>Specify the departure date, expected return time, and destination contact.</li>
        <li>For home leaves, an automated confirmation message/call is sent to the registered guardian contact.</li>
        <li>Once approved, scan your digital QR/barcode at the university exit turnstiles.</li>
      </ol>
      <div class="preview-notice-box">
        <em>Note: AI engine is in frontend preview. Full natural language responses will be active in the next phase!</em>
      </div>
    `;
  }

  if (query.includes('ums') || query.includes('password') || query.includes('login')) {
    return `
      <p>To recover or reset your UMS credentials:</p>
      <ul>
        <li>Visit the official UMS login portal and click <strong>Forgot Password</strong>.</li>
        <li>Provide your official Student Registration Number.</li>
        <li>Enter the OTP received on your university-registered phone number and email.</li>
        <li>If your mobile number has changed, visit the University IT Services helpdesk with your physical student ID card.</li>
      </ul>
      <div class="preview-notice-box">
        <em>Note: AI engine is in frontend preview. Full natural language responses will be active in the next phase!</em>
      </div>
    `;
  }

  if (query.includes('ca') || query.includes('assessment') || query.includes('exam')) {
    return `
      <p>Details regarding Examinations and Continuous Assessment (CA):</p>
      <ul>
        <li><strong>Continuous Assessment:</strong> CA consists of class tests, quizzes, assignments, and presentations. Best scores are consolidated on your UMS grade page.</li>
        <li><strong>Hall Tickets:</strong> Downloadable on UMS under <em>Examinations &gt; Admit Card</em> 1–2 weeks prior to the commencement of end-term exams (subject to 75% attendance clearance).</li>
        <li><strong>Datesheets:</strong> Official final datesheets are published on UMS with classroom and shift allocations.</li>
      </ul>
      <div class="preview-notice-box">
        <em>Note: AI engine is in frontend preview. Full natural language responses will be active in the next phase!</em>
      </div>
    `;
  }

  // Fallback realistic response
  return `
    <p>Thank you for your question: <em>"${escapeHtml(userQuery)}"</em></p>
    <p>This frontend preview of <strong>LPU Assist</strong> is ready! In the upcoming step, this assistant will be integrated with the live AI backend to provide direct, intelligent answers to any question regarding LPU academic policies, campus facilities, and portal procedures.</p>
    <p>In the meantime, feel free to explore the <strong>Quick Help Guide</strong> and <strong>FAQs</strong> section for verified information.</p>
  `;
}

/**
 * Safe HTML escaping for user strings
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
