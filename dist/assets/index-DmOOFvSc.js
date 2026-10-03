(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&a(c)}).observe(document,{childList:!0,subtree:!0});function n(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(o){if(o.ep)return;o.ep=!0;const i=n(o);fetch(o.href,i)}})();document.addEventListener("DOMContentLoaded",()=>{E(),x(),A(),I(),S(),T(),C()});function E(){const t=document.querySelectorAll("[data-view]"),e=document.querySelectorAll(".view-panel"),n=document.getElementById("mobileMenuToggle"),a=document.getElementById("mobileNavDrawer");document.getElementById("brandLogoLink");const o=document.getElementById("floatingChatTrigger");function i(s,r=!0){s==="quick-help"&&(s="home",setTimeout(()=>{const l=document.getElementById("quick-help");l&&l.scrollIntoView({behavior:"smooth"})},50));const d=document.getElementById(`view-${s}`);d&&(e.forEach(l=>l.classList.remove("active")),d.classList.add("active"),document.querySelectorAll(".nav-item, .mobile-nav-item").forEach(l=>{l.getAttribute("data-view")===s?l.classList.add("active"):l.classList.remove("active")}),a&&a.classList.contains("open")&&(a.classList.remove("open"),n&&(n.classList.remove("open"),n.setAttribute("aria-expanded","false"))),r&&s!=="quick-help"&&window.scrollTo({top:0,behavior:"smooth"}),s==="chat"&&setTimeout(()=>{const l=document.getElementById("chatTextarea");l&&l.focus()},150),s==="faqs"&&B())}function c(){const s=window.location.hash.replace("#","").trim();if(s==="chat"||s==="faqs"||s==="about")i(s);else if(s==="quick-help"){i("home",!1);const r=document.getElementById("quick-help");r&&r.scrollIntoView({behavior:"smooth"})}else i("home")}window.addEventListener("hashchange",c),t.forEach(s=>{s.addEventListener("click",r=>{const d=s.getAttribute("data-view");d&&(window.location.hash=d)})}),o&&o.addEventListener("click",()=>{window.location.hash="chat"}),n&&a&&(n.addEventListener("click",()=>{const s=a.classList.toggle("open");n.classList.toggle("open",s),n.setAttribute("aria-expanded",s?"true":"false")}),document.addEventListener("click",s=>{!a.contains(s.target)&&!n.contains(s.target)&&a.classList.contains("open")&&(a.classList.remove("open"),n.classList.remove("open"),n.setAttribute("aria-expanded","false"))})),c()}function x(){const t=document.getElementById("themeToggleBtn");if(!t)return;localStorage.getItem("lpu_assist_theme")==="dark"&&document.body.classList.add("dark-mode"),t.addEventListener("click",()=>{const n=document.body.classList.toggle("dark-mode");localStorage.setItem("lpu_assist_theme",n?"dark":"light")})}function A(){const t=document.getElementById("faqAccordionList");t&&t.addEventListener("click",e=>{const n=e.target.closest(".faq-question-btn");if(!n)return;const a=n.closest(".faq-item");if(!a)return;const o=a.classList.contains("expanded"),i=a.querySelector(".faq-answer-panel");t.querySelectorAll(".faq-item").forEach(s=>{if(s!==a){s.classList.remove("expanded");const r=s.querySelector(".faq-question-btn"),d=s.querySelector(".faq-answer-panel");r&&r.setAttribute("aria-expanded","false"),d&&(d.style.maxHeight=null)}}),o?(a.classList.remove("expanded"),n.setAttribute("aria-expanded","false"),i.style.maxHeight=null):(a.classList.add("expanded"),n.setAttribute("aria-expanded","true"),i.style.maxHeight=i.scrollHeight+"px")})}function I(){const t=document.getElementById("faqSearchInput"),e=document.getElementById("faqClearBtn"),n=document.querySelectorAll(".faq-filter-pills .filter-pill"),a=document.querySelectorAll("#faqAccordionList .faq-item"),o=document.getElementById("faqNoResults"),i=document.getElementById("faqResetSearchBtn");let c="all";function s(){const r=t?t.value.toLowerCase().trim():"";let d=0;a.forEach(l=>{var u,m;const y=l.getAttribute("data-category"),q=((u=l.querySelector(".faq-q-text"))==null?void 0:u.textContent.toLowerCase())||"",w=((m=l.querySelector(".faq-answer-content"))==null?void 0:m.textContent.toLowerCase())||"",L=c==="all"||y===c,b=!r||q.includes(r)||w.includes(r);if(L&&b)l.style.display="block",d++;else{l.style.display="none",l.classList.remove("expanded");const g=l.querySelector(".faq-question-btn"),f=l.querySelector(".faq-answer-panel");g&&g.setAttribute("aria-expanded","false"),f&&(f.style.maxHeight=null)}}),e&&(e.style.display=r.length>0?"block":"none"),o&&(o.style.display=d===0?"block":"none")}n.forEach(r=>{r.addEventListener("click",()=>{n.forEach(d=>d.classList.remove("active")),r.classList.add("active"),c=r.getAttribute("data-category")||"all",s()})}),t&&t.addEventListener("input",s),e&&e.addEventListener("click",()=>{t.value="",s(),t.focus()}),i&&i.addEventListener("click",()=>{t&&(t.value=""),c="all",n.forEach(r=>{r.classList.toggle("active",r.getAttribute("data-category")==="all")}),s()})}function B(){const t=document.getElementById("faqCloneTarget"),e=document.getElementById("faqAccordionList");if(t&&e&&t.children.length===0){t.innerHTML=`
      <div class="faq-accordion-list dedicated-faq-list">
        ${e.innerHTML}
      </div>
    `;const n=t.querySelector(".dedicated-faq-list");n&&n.addEventListener("click",a=>{const o=a.target.closest(".faq-question-btn");if(!o)return;const i=o.closest(".faq-item");if(!i)return;const c=i.classList.contains("expanded"),s=i.querySelector(".faq-answer-panel");n.querySelectorAll(".faq-item").forEach(r=>{if(r!==i){r.classList.remove("expanded");const d=r.querySelector(".faq-question-btn"),l=r.querySelector(".faq-answer-panel");d&&d.setAttribute("aria-expanded","false"),l&&(l.style.maxHeight=null)}}),c?(i.classList.remove("expanded"),o.setAttribute("aria-expanded","false"),s.style.maxHeight=null):(i.classList.add("expanded"),o.setAttribute("aria-expanded","true"),s.style.maxHeight=s.scrollHeight+"px")})}}function S(){document.querySelectorAll(".card-action-btn").forEach(e=>{e.addEventListener("click",()=>{const n=e.getAttribute("data-query");n&&(window.location.hash="chat",setTimeout(()=>{h(n)},120))})})}function T(){const t=document.getElementById("chatInputForm"),e=document.getElementById("chatTextarea"),n=document.getElementById("chatMessagesArea"),a=document.getElementById("typingIndicator"),o=document.getElementById("clearChatBtn"),i=document.getElementById("starterPrompts");e&&(e.addEventListener("input",()=>{e.style.height="auto",e.style.height=Math.min(e.scrollHeight,120)+"px"}),e.addEventListener("keydown",c=>{c.key==="Enter"&&!c.shiftKey&&(c.preventDefault(),t==null||t.dispatchEvent(new Event("submit")))})),i&&i.addEventListener("click",c=>{const s=c.target.closest(".prompt-chip");if(s){const r=s.getAttribute("data-text");r&&h(r)}}),o&&o.addEventListener("click",()=>{n&&(n.innerHTML=`
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
        `)}),t&&e&&t.addEventListener("submit",c=>{c.preventDefault();const s=e.value.trim();s&&(p("user",s),e.value="",e.style.height="auto",a&&(a.style.display="flex"),n.scrollTop=n.scrollHeight,setTimeout(()=>{a&&(a.style.display="none");const r=k(s);p("bot",r)},700))})}function h(t){const e=document.getElementById("chatTextarea"),n=document.getElementById("chatInputForm");e&&n&&(e.value=t,n.dispatchEvent(new Event("submit")))}function p(t,e){const n=document.getElementById("chatMessagesArea");if(!n)return;const a=document.createElement("div");a.className=`chat-message ${t}-message`;const i=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});t==="user"?a.innerHTML=`
      <div class="msg-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <div class="msg-content">
        <div class="msg-sender">You</div>
        <div class="msg-body">
          <p>${v(e)}</p>
        </div>
        <div class="msg-timestamp">${i}</div>
      </div>
    `:a.innerHTML=`
      <div class="msg-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
          <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
        </svg>
      </div>
      <div class="msg-content">
        <div class="msg-sender">LPU Assist</div>
        <div class="msg-body">
          ${e}
        </div>
        <div class="msg-timestamp">${i}</div>
      </div>
    `,n.appendChild(a),n.scrollTop=n.scrollHeight}function k(t){const e=t.toLowerCase();return e.includes("attendance")?`
      <p>Here is what you need to know about attendance at LPU:</p>
      <ul>
        <li><strong>75% Mandatory Criteria:</strong> Students must maintain a minimum of 75% attendance in each course to sit for end-term examinations.</li>
        <li><strong>Checking Attendance:</strong> Go to <em>UMS &gt; Academic Performance &gt; View Attendance</em> to monitor lecture, tutorial, and practical percentages in real-time.</li>
        <li><strong>Duty Leaves:</strong> Official university representation or medical exemptions must be approved by the designated authorities through the UMS duty leave request module.</li>
      </ul>
      <div class="preview-notice-box">
        <em>Note: AI engine is in frontend preview. Full natural language responses will be active in the next phase!</em>
      </div>
    `:e.includes("outpass")||e.includes("leave")||e.includes("hostel")?`
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
    `:e.includes("ums")||e.includes("password")||e.includes("login")?`
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
    `:e.includes("ca")||e.includes("assessment")||e.includes("exam")?`
      <p>Details regarding Examinations and Continuous Assessment (CA):</p>
      <ul>
        <li><strong>Continuous Assessment:</strong> CA consists of class tests, quizzes, assignments, and presentations. Best scores are consolidated on your UMS grade page.</li>
        <li><strong>Hall Tickets:</strong> Downloadable on UMS under <em>Examinations &gt; Admit Card</em> 1–2 weeks prior to the commencement of end-term exams (subject to 75% attendance clearance).</li>
        <li><strong>Datesheets:</strong> Official final datesheets are published on UMS with classroom and shift allocations.</li>
      </ul>
      <div class="preview-notice-box">
        <em>Note: AI engine is in frontend preview. Full natural language responses will be active in the next phase!</em>
      </div>
    `:`
    <p>Thank you for your question: <em>"${v(t)}"</em></p>
    <p>This frontend preview of <strong>LPU Assist</strong> is ready! In the upcoming step, this assistant will be integrated with the live AI backend to provide direct, intelligent answers to any question regarding LPU academic policies, campus facilities, and portal procedures.</p>
    <p>In the meantime, feel free to explore the <strong>Quick Help Guide</strong> and <strong>FAQs</strong> section for verified information.</p>
  `}function v(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function C(){const t=document.getElementById("currentYear");t&&(t.textContent=new Date().getFullYear())}
