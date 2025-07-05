class ReniskaBookingForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // --- Firebase Configuration (REPLACE with your project's config) ---
    // You can get this from your Firebase project settings
    this.firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    // Prefer data-* attributes, but fall back to window.ReniskaSettings for config
    let zipcodes =
      this.dataset.zipcodes
        ? JSON.parse(this.dataset.zipcodes)
        : (window.ReniskaSettings && window.ReniskaSettings.zipcodes) || [];

    // If no zipcodes are provided, use a default list for demonstration
    if (zipcodes.length === 0) {
        console.warn("ReniskaBookingForm: No zipcodes provided via data-zipcodes. Using default list for demonstration. Try 41107.");
        zipcodes = ["41107", "41121", "41254", "41318", "41503"]; // Example Gothenburg zip codes
    }
    this.zipcodesArray = zipcodes;

    // Define the component's internal structure (HTML and CSS).
    this.shadowRoot.innerHTML = `
      <!-- Import Firebase SDKs -->
      <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
        import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
        
        // Expose Firebase functions to the component instance
        window.firebase = {
          initializeApp,
          getFirestore,
          collection,
          addDoc
        };
      </script>

      <style>
      /* [Your existing CSS styles remain here...] */
      /* 1. MODAL WRAPPER & LAYOUT
         ————————————————————— */
      .popup-content-booking {
        position: relative;
        z-index: 9999;           /* above your header */
        max-width: 1140px;       /* cap width on desktop */
        margin: 2rem auto;       
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
        padding: 2rem 1.5rem;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.1);
      }

      /* stack on mobile */
      @media (max-width: 900px) {
        .popup-content-booking {
          grid-template-columns: 1fr;
        }
      }

      /* 2. TYPOGRAPHY TOKENS
         ————————————————————— */
      :host {
        --ff-heading: 'Tiempos Headline', serif;
        --ff-body: Arial, sans-serif;
        --fs-h1: 42px;
        --fs-h2: 20px;
        --fs-body: 16px;
        --fs-small: 12px;
        --color-primary: #003E5B;
      }

      /* main heading inside form */
      .popup-content-booking h2 {
        font-family: var(--ff-heading);
        font-size: var(--fs-h1);
        font-weight: 400;
        margin-bottom: 1rem;
      }

      /* sub-headings like “Flyttstädning” */
      .service-section h2 {
        font-family: var(--ff-heading);
        font-size: var(--fs-h2);
        font-weight: 500;
        margin-top: 0;
        margin-bottom: 1rem;
        color: var(--color-primary);
      }

      /* body text */
      .popup-content-booking,
      .popup-content-booking label,
      .popup-content-booking p {
        font-family: var(--ff-body);
        font-size: var(--fs-body);
        color: var(--color-primary);
      }

      /* 3. PRICE CARD
         ————————————————————— */
      /* you already have .sticky-price-card */
      .sticky-price-card {
        padding: 2rem 1.5rem;
        max-width: 360px;
      }

      /* price line
         increase line-height so “after RUT deduction” wraps neatly */
      #footerPrice {
        font-size: 22px;
        font-weight: 700;
        line-height: 1.2;
        margin-bottom: 1rem;
      }

      /* hide inner Rabattkod—if you want it elsewhere */
      .sticky-price-card .discount-section {
        display: none!important;
      }

      /* button */
      .sticky-price-card .button-primary {
        background: #b02a22;
        color: #fff;
        padding: 1rem;
        font-size: 16px;
        border-radius: 4px;
        margin-top: 1.5rem;
        width: 100%;
        border: none;
      }

      /* 4. SERVICE SELECT & BUTTON (step-2)
         ————————————————————— */
      .popup-content-small #serviceSelect {
        width: 100%;
        font-size: 16px;
        padding: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        appearance: none;
        background-color: #f9f9f9;
      }

      .popup-content-small #confirmService {
        margin-top: 1.5rem;
        width: 100%;
        padding: 1rem;
        background: #b02a22;
        color: #fff;
        border: none;
        font-size: 16px;
        font-weight: 700;
        border-radius: 4px;
      }

      /* 5. WINDOW ROWS
         ————————————————————— */
      .service-section[data-service="fonsterputsning"] .qty-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        border: 1px solid #b02a22;
        border-radius: 4px;
        margin-bottom: 0.75rem;
      }
      .service-section[data-service="fonsterputsning"] .qty-label {
        font-size: 16px;
        flex: 1;
      }
      .service-section[data-service="fonsterputsning"] .qty-controls {
        display: flex;
        gap: 0.5rem;
      }
      .service-section[data-service="fonsterputsning"] .qty-btn {
        width: 2rem;
        height: 2rem;
        border: none;
        background: #f9f9f9;
        border-radius: 4px;
        font-size: 1rem;
        color: var(--color-primary);
      }
      .service-section[data-service="fonsterputsning"] .qty-value {
        width: 3rem;
        text-align: center;
        border-radius: 4px;
        border: 1px solid #ccc;
        padding: 0.25rem;
      }

      /* ——— 1. Increase price‐card width & rebalance columns ——— */
      :host .final-details-columns {
        grid-template-columns: 1.8fr 1fr; /* a bit narrower left, wider right */
      }
      :host .sticky-price-card {
        max-width: 380px !important; /* increase from 340px */
      }

      /* ——— 2. Hide the in‐card discount code row ——— */
      :host .sticky-price-card .discount-section:first-of-type {
        display: none !important;
      }

      /* ——— 3. Tighten privacy‐policy gap ——— */
      :host .sticky-price-card input[type="checkbox"] + label {
        margin-left: 0.3em !important;
        margin-top: 0.2rem !important;
        display: inline-block;
      }
      :host .sticky-price-card div[style] {
        margin: 0.5rem 0 !important; /* reduce wrapper margin */
      }

      /* ——— 4. Slim down the date/time controls ——— */
      :host select#bookingTime,
      :host input[type="date"] {
        max-width: 140px !important;
        font-size: 0.95rem !important;
        padding: 0.4rem !important;
      }

      /* ——— 5. Hemfrid‐style typography ——— */
      /* Main section headings (h2) */
      :host h2 {
        font-family: 'Tiempos Headline', serif;
        font-size: 20px;
        font-weight: 500;
        line-height: 1.3;
        margin-bottom: 1rem;
      }

      /* Labels & selectors */
      :host label,
      :host .qty-label,
      :host .inline-group label,
      :host .frequency-group label {
        font-family: 'Tiempos', serif;
        font-size: 18px;
        font-weight: 400;
        line-height: 1.4;
      }

      /* Button styling */
      :host .button-primary {
        padding: 0.6rem 1.2rem !important;
        font-size: 1.05rem !important;
        font-weight: 700 !important;
      }

      /* Price text (larger, bold) */
      :host .sticky-price-card #footerPrice {
        font-family: 'Tiempos Headline', serif;
        font-size: 24px;
        font-weight: 700;
        line-height: 1.1;
        margin-bottom: 0.5rem;
      }

      /* 1. overlay always on top */
      .popup-overlay {
        z-index: 9999 !important;
      }

      /* 2. cap desktop width and center */
      @media (min-width: 900px) {
        .popup-content-booking {
          max-width: 1140px !important;
          margin: 0 auto !important;
        }
      }

      /* 3. tweak inner padding & line-height */
      .popup-content-booking {
        padding: 1.5rem !important;
      }
      .popup-content-small {
        padding: 1.25rem !important;
      }

      /* price heading line-breaks */
      .sticky-price-card #footerPrice {
        line-height: 1.2 !important;
        white-space: pre-wrap;
      }

      /* reduce the gap between price and subtext */
      .sticky-price-card #footerPrice + p,
      .sticky-price-card #footerPrice + .discount-section {
        margin-top: 0.5rem !important;
      }

      /* tighten button padding */
      .button-primary {
        padding: 0.5rem 1rem !important;
        font-size: 1rem !important;
      }

      /* overall form content area */
      .popup-content-booking .final-details-left,
      .popup-content-booking .final-details-right {
        padding: 0 1rem !important;
      }
      @media (min-width: 900px) {
        .popup-content-booking .final-details-left {
          padding-right: 2rem !important;
        }
        .popup-content-booking .final-details-right {
          padding-left: 2rem !important;
        }
      }

      /* Show/hide */
      .reniska-hidden { display: none !important; }
      .visible       { display: block !important; }

      /* Full‐screen overlay */
      .popup-overlay {
        position: fixed !important;
        top: 0; left: 0; right: 0; bottom: 0;
        display: none !important;
        justify-content: center;
        align-items: center;
        background: rgba(0,0,0,0.35);
        z-index: 1000;
      }
      .popup-overlay.visible {
        display: flex !important;
      }

      /* Modal containers */
      .popup-content-small,
      .popup-content-booking {
        background: #fff;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        width: 90%;
        max-width: 480px;
        max-height: 90vh;
        overflow-y: auto;
      }
      .popup-content-booking {
        max-width: 800px;
        display: grid;
        grid-template-columns: 1fr min-content;
        gap: 2rem;
      }

      /* Close button */
      .popup-close {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        background: transparent;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
      }

      /* Inputs & selects */
      input[type="text"],
      input[type="tel"],
      input[type="email"],
      input[type="number"],
      select {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid #b5c6ce;
        border-radius: 6px;
        background: #f9fbfc;
        font-size: 1rem;
        transition: border-color 0.2s;
      }
      input:focus,
      select:focus {
        border-color: #00b4d8;
        outline: none;
      }

      /* Primary button */
      .button-primary {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background: #ffb6c1;
        color: #003E5B;
        font-size: 1.1rem;
        font-weight: 600;
        text-align: center;
        border: 2px solid #003E5B;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s, color 0.2s;
      }
      .button-primary:hover:not(:disabled) {
        background: #ff8fa3;
        color: #fff;
      }

      /* Disabled button */
      .button-disabled,
      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      /* Added style for the enabled service button */
      #serviceButton.button-enabled {
        background: #b02a22;
        color: #fff;
        cursor: pointer;
        opacity: 1;
      }

      /* Sticky price card */
      .popup-content-booking .sticky-price-card {
        max-width: 320px;
        padding: 1.5rem;
        border-radius: 12px;
      }

      /* --- NEW GRID LAYOUT RULES (must be first, nothing before this) --- */
      :host .final-details-columns {
        display: grid !important;
        grid-template-columns: 2fr 1fr;
        gap: var(--space-md);
      }
      :host .sticky-price-card {
        position: sticky !important;
        top: var(--space-lg);
      }
      @media (max-width: var(--bp-md)) {
        :host .final-details-columns {
          display: block !important;
        }
        :host .sticky-price-card {
          position: static !important;
          margin-top: var(--space-md);
        }
      }

      :host {
        /* ─── Font Families ─── */
        --ff-heading: 'Tiempos Headline', serif;
        --ff-ui: Arial, sans-serif;
      }

      :host {
        /* ─── Design Tokens ─── */
        /* Spacing scale */
        --space-xs: 0.25rem;
        --space-sm: 0.5rem;
        --space-md: 1rem;
        --space-lg: 2rem;

        /* Typography sizes & weights */
        /* Headings */
        --fs-h1: 42px;  --fw-h1: 400;
        --fs-h2: 20px;  --fw-h2: 500;
        /* Body text */
        --fs-body: 16px;  --fw-body: 400;
        --fs-body-bold: 16px; --fw-body-bold: 700;
        /* Small print */
        --fs-small: 12px; --fw-small: 400;
        /* Selector labels */
        --fs-selector: 18px; --fw-selector: 400;

        /* Font scale shortcuts */
        --font-base: 1rem; --font-lg: 1.15rem; --font-xl: 1.35rem;

        /* Color palette */
        --color-primary: #003E5B;
        --color-secondary: #00b4d8;
        --color-bg: #f9fbfc;
        --color-offwhite: #FFFFFA;

        /* Breakpoints */
        --bp-sm: 600px;
        --bp-md: 900px;
        --bp-lg: 1200px;
      }

      /* ─── Utility Classes ─── */
      /* Font utilities */
      .u-h1 { font-family: var(--ff-heading); font-size: var(--fs-h1); font-weight: var(--fw-h1); }
      .u-h2 { font-family: var(--ff-heading); font-size: var(--fs-h2); font-weight: var(--fw-h2); }
      .u-body { font-family: var(--ff-ui); font-size: var(--fs-body); font-weight: var(--fw-body); }
      .u-body-bold { font-family: var(--ff-ui); font-size: var(--fs-body-bold); font-weight: var(--fw-body-bold); }
      .u-small { font-family: var(--ff-ui); font-size: var(--fs-small); font-weight: var(--fw-small); }
      .u-selector { font-family: var(--ff-heading); font-size: var(--fs-selector); font-weight: var(--fw-selector); }

      /* Flex & Grid */
      .flex { display: flex !important; }
      .flex-col { flex-direction: column !important; }

      /* Gaps */
      .gap-xs { gap: var(--space-xs) !important; }
      .gap-sm { gap: var(--space-sm) !important; }
      .gap-md { gap: var(--space-md) !important; }
      .gap-lg { gap: var(--space-lg) !important; }

      /* Sticky */
      .sticky-top { position: sticky !important; top: var(--space-lg) !important; }

      /* Visibility */
      .hide { display: none !important; }

      :host {
        font-family: 'Outfit', Arial, sans-serif;
        font-size: 15px;
        color: #003E5B;
        box-sizing: border-box;
      }
      *, *:before, *:after { box-sizing: inherit; }
      h2 {
        font-size: 1.15rem;
        font-weight: 700;
        margin-bottom: 0.7rem;
        letter-spacing: 0.01em;
      }
      label, .qty-label, .add-on-section label, .frequency-group label {
        font-size: 1rem;
        font-weight: 500;
        color: #003E5B;
      }
      input[type="number"], input[type="text"], input[type="email"], input[type="tel"], select {
        font-size: 1rem;
        padding: 0.5rem 0.9rem;
        margin: 0.18rem 0 0.5rem 0;
        height: 2.3rem;
        border: 1.5px solid #b5c6ce;
        border-radius: 8px;
        background: #f9fbfc;
        transition: border 0.2s;
      }
      input[type="number"]:focus, input[type="text"]:focus, input[type="email"]:focus, input[type="tel"]:focus, select:focus {
        border: 1.5px solid #00b4d8;
        outline: none;
      }
      input[type="checkbox"], input[type="radio"] {
        accent-color: #00b4d8;
      }
      .qty-value {
        width: 2.2rem;
        min-width: 2.2rem;
        font-size: 1rem;
        padding: 0.1rem 0.2rem;
        text-align: center;
      }
      .add-on-section {
        margin: 0.2rem 0 0.2rem 0;
        padding: 0.2rem 0.7rem 0.2rem 0.7rem;
        background: #f6f9fa;
        border-radius: 8px;
      }
      .add-on-section label {
        margin-bottom: 0.1em;
        gap: 0.5em;
      }
      #footerPrice {
        font-size: 1.35rem;
        font-weight: 700;
        color: #003E5B;
        margin-bottom: 0.7rem;
        text-align: left;
        letter-spacing: 0.01em;
      }
      .sticky-price-card {
        position: sticky;
        top: 2rem;
        background: #f9fbfc;
        border-radius: 18px;
        box-shadow: 0 2px 16px rgba(0,0,0,0.08);
        padding: 2rem 1.5rem 2rem 1.5rem;
        min-width: 260px;
        max-width: 340px;
        margin-left: auto;
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
      }
      .sticky-price-card .discount-section {
        margin-bottom: 0.7rem;
      }

      /* Remove any inline/flex grouping for finalDetails fields */
      #finalDetails .inline-group,
      #finalDetails .frequency-group {
        display: block !important;
        gap: 0 !important;
        margin-bottom: 0.1rem !important;
      }

      /* --- FINAL BOOKING FORM: SINGLE COLUMN, COMPACT --- */
      #finalDetails {
        display: flex !important;
        flex-direction: column !important;
        gap: 0.2rem !important;
        margin-top: 0.3rem !important;
      }
      #finalDetails label,
      #finalDetails input,
      #finalDetails select {
        display: block !important;
        width: 100% !important;
        margin: 0.12rem 0 0.18rem 0 !important;
        box-sizing: border-box !important;
      }
      #finalDetails input[type="date"],
      #finalDetails select {
        max-width: 100% !important;
      }
      #finalDetails .inline-group,
      #finalDetails .frequency-group {
        display: block !important;
        gap: 0 !important;
        margin-bottom: 0.1rem !important;
      }

      /* Reduce spacing for add-ons and sections */
      .service-section {
        margin-bottom: 0.4rem !important;
        padding: 0.4rem 0.4rem 0.4rem 0.4rem !important;
      }
      .add-on-section {
        margin: 0.08rem 0 0.08rem 0 !important;
        padding: 0.08rem 0.4rem 0.08rem 0.4rem !important;
      }
      .discount-section {
        margin-top: 0.15rem !important;
        margin-bottom: 0.08rem !important;
      }
      input[type="checkbox"] + label, .sticky-price-card label {
        font-weight: 400;
        font-size: 1rem;
        color: #003E5B;
        margin-left: 0.4em;
      }
      .sticky-price-card input[type="text"] {
        width: 100%;
        margin-bottom: 0.7rem;
      }
      .sticky-price-card .button-primary,
      .sticky-price-card .button-disabled {
        margin-top: 1.1rem;
        font-size: 1.1rem;
      }
      .sticky-price-card .button-primary {
        background: #ffb6c1;
        color: #003E5B;
      }
      .sticky-price-card .button-primary:hover {
        background: #ff8fa3;
        color: #fff;
      }

      /* 1. Rebalance columns: make left ~60% and right ~40% */
      :host .final-details-columns {
        grid-template-columns: 3fr 2fr;
      }

      /* 2. Reduce gap between columns */
      :host .final-details-columns {
        gap: 1rem !important;
      }

      /* 3. Shrink the price card typography slightly */
      :host .sticky-price-card #footerPrice {
        font-size: 20px !important;
        margin-bottom: 0.4rem !important;
      }

      /* 4. Tighter padding inside price card */
      :host .sticky-price-card {
        padding: 1.5rem !important;
      }

      /* 5. Decrease top/bottom margin around summary items */
      :host .sticky-price-card label,
      :host .sticky-price-card a {
        margin: 0.3rem 0 !important;
      }

      /* 6. Shrink left‐side headings a bit */
      :host h2 {
        font-size: 18px !important;
      }

      /* 7. Compact form fields on left */
      :host input,
      :host select {
        padding: 0.4rem 0.8rem !important;
        margin-bottom: 0.6rem !important;
      }

      /* 8. Checkbox + label grouping tighter */
      :host .inline-group,
      :host .frequency-group {
        margin-bottom: 0.5rem !important;
        gap: 0.4rem !important;
      }

      /* 9. Overall max‐width of modal content */
      :host .popup-content-booking {
        max-width: 1140px !important;
        width: 100%;
        margin: 0 auto;
      }

      /* 10. Ensure modal sits above header */
      :host .popup-overlay.visible {
        z-index: 9999;
      }

      /* ←–– DROP YOUR NEW OVERRIDES HERE AT THE BOTTOM ––→ */

      /* ——— Restore the Stor-städning window checkbox ——— */
      :host .inline-group input#window_stor,
      :host .inline-group label[for="window_stor"] {
        display: inline-block !important;
      }

      /* ——— Tighter gaps, rebalance columns ——— */
      :host .final-details-columns { grid-template-columns: 3fr 2fr !important; gap: 1rem !important; }
      :host .sticky-price-card { max-width: 380px !important; padding: 1.5rem !important; }

      /* ——— Typos, line-height, font sizes ——— */
      :host #footerPrice { font-size: 20px !important; line-height: 1.2 !important; }
      :host h2.service-section { font-size: 20px !important; }

      /* 1) Hide native spinner everywhere */
      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type="number"] {
        -moz-appearance: textfield;
      }

      /* 2) Flex row */
      .service-section[data-service="fonsterputsning"] .qty-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        margin-bottom: 0.75rem;
        border: 1px solid #b02a22;
        border-radius: 6px;
        background: #fff;
      }

      .service-section[data-service="fonsterputsning"] .qty-label {
        font-family: var(--ff-heading);
        font-size: 18px;
        font-weight: 400;
        color: var(--color-primary);
        flex: 1;
      }

      .service-section[data-service="fonsterputsning"] .qty-controls {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .service-section[data-service="fonsterputsning"] .qty-btn {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 4px;
        background: #f9f9f9;
        font-size: 20px;
        line-height: 1;
        color: var(--color-primary);
        cursor: pointer;
        transition: background 0.2s;
      }
      .service-section[data-service="fonsterputsning"] .qty-btn:hover {
        background: #e6e6e6;
      }

      .service-section[data-service="fonsterputsning"] .qty-display {
        min-width: 2.5rem;
        text-align: center;
        font-family: var(--ff-body);
        font-size: 16px;
        color: var(--color-primary);
      }

      /* Apply qty-row styles to both fonsterputsning and storstadning */
      .service-section[data-service="fonsterputsning"] .qty-row,
      .service-section[data-service="storstadning"] .qty-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        margin-bottom: 0.75rem;
        border: 1px solid #b02a22;
        border-radius: 6px;
        background: #fff;
      }

      .service-section[data-service="fonsterputsning"] .qty-label,
      .service-section[data-service="storstadning"] .qty-label {
        font-family: var(--ff-heading);
        font-size: 18px;
        font-weight: 400;
        color: var(--color-primary);
        flex: 1;
      }

      .service-section[data-service="fonsterputsning"] .qty-controls,
      .service-section[data-service="storstadning"] .qty-controls {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .service-section[data-service="fonsterputsning"] .qty-btn,
      .service-section[data-service="storstadning"] .qty-btn {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 4px;
        background: #f9f9f9;
        font-size: 20px;
        line-height: 1;
        color: var(--color-primary);
        cursor: pointer;
        transition: background 0.2s;
      }
      .service-section[data-service="fonsterputsning"] .qty-btn:hover,
      .service-section[data-service="storstadning"] .qty-btn:hover {
        background: #e6e6e6;
      }

      .service-section[data-service="fonsterputsning"] .qty-display,
      .service-section[data-service="storstadning"] .qty-display {
        min-width: 2.5rem;
        text-align: center;
        font-family: var(--ff-body);
        font-size: 16px;
        color: var(--color-primary);
      }

      /* === Add at the bottom of your <style> block in the template === */

      /* 1. Unify spacing and stacking for all checkbox & radio groups */
      .inline-group,
      .frequency-group {
        display: flex !important;
        flex-wrap: wrap;
        gap: 1rem !important;
        margin-bottom: 1rem !important;
        align-items: center;
      }

      /* For vertical stacks (e.g. rabattkod inputs), override on a per-section basis */
      .service-section[data-service="flyttstadning"] .discount-section,
      .service-section[data-service="storstadning"] .discount-section {
        flex-direction: column;
      }

      /* 2. Make “Jag accepterar Reniskas…” line-height tighter and consistent */
      .sticky-price-card label[for="privacy_policy"] {
        display: inline-flex;
        align-items: center;
        gap: .5rem;
        line-height: 1.2;
        margin: 1rem 0 !important;
      }

      /* 3. Remove the red outline on the window-qty boxes */
      .service-section[data-service="fonsterputsning"] .qty-row,
      .service-section[data-service="storstadning"] .qty-row {
        border-color: var(--color-secondary) !important;
      }

      /* 4. Equalize the height of each qty-row container */
      .service-section[data-service="fonsterputsning"] .qty-row,
      .service-section[data-service="storstadning"] .qty-row {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        padding: 1rem !important;
        min-height: 4.5rem;
        margin-bottom: 1rem !important;
      }

      /* 5. Tighter overall form line-height */
      .reniska-wrapper,
      .popup-content-booking,
      .popup-content-small {
        line-height: 1.4 !important;
      }

      /* 6. Even spacing around checkboxes in each “add-on” section */
      .add-on-section {
        display: flex;
        gap: 1.5rem;
        padding: 1rem;
        background: var(--color-bg);
        border-radius: 6px;
        margin-bottom: 1rem;
      }
        /* ─── Section headings at 42px / weight 400 ─── */
.popup-content-booking h2,
.popup-content-small h2,
.service-section h2 {
  font-size: 42px !important;
  font-weight: 400 !important;
  line-height: 1.2; /* optional for nicer wrapping */
}


      /* ─── Summary Title & Service ───────────────────────────────── */
.sticky-price-card {
  padding: 1.5rem;
  max-width: 380px;
  background: #f9fbfc;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  font-family: 'Outfit', sans-serif;
  color: #003E5B;
}
.summary-header {
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}
.summary-service {
  font-size: 1rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
}

/* ─── Extras List ─────────────────────────────────────────── */
.summary-extras .extras-title {
  font-weight: 600;
  margin-bottom: 0.4rem;
}
.extras-list {
  margin: 0;
  padding-left: 1.2rem;
}
.extras-list li {
  margin-bottom: 0.2rem;
  line-height: 1.3;
}

/* ─── Divider ────────────────────────────────────────────── */
.summary-divider {
  border: none;
  border-top: 1px solid #ccc;
  margin: 0.75rem 0;
}

/* ─── Total Block ────────────────────────────────────────── */
.summary-total {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: baseline;
  margin-bottom: 0.25rem;
}
.total-label {
  font-size: 1rem;
  font-weight: 400;
}
.total-amount {
  font-size: 1.25rem;
  font-weight: 700;
  text-align: right;
}
.total-subtext {
  grid-column: 1 / -1;
  font-size: 0.85rem;
  color: #555;
  margin-top: 0.2rem;
}

/* ─── Legal Note & Accept Row ─────────────────────────────── */
.summary-legal {
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.5rem;
}
.summary-accept {
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

/* ─── Primary Button ─────────────────────────────────────── */
.sticky-price-card .button-primary {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
}

/* ─── Hide any previous price‐line if present ─────────────── */
.sticky-price-card > #footerPrice,
.sticky-price-card > .discount-section {
  display: none !important;
}

/* === Ensure the price‐card’s own checkbox & button remain clickable === */
.sticky-price-card {
  /* remove any previous pointer-events overrides */
  pointer-events: auto !important;
}

/* in case any ancestor was made non-interactive */
.popup-content-booking,
.popup-content-small {
  pointer-events: auto !important;
}

/** 1) Make sure the card and all its children can receive clicks **/
.sticky-price-card,
.sticky-price-card * {
  pointer-events: auto !important;
}

/** 2) Float the card above any other layer so nothing sits on top of the checkbox **/
.sticky-price-card {
  z-index: 10000 !important;
}

/** 3) Explicitly bring the accept‐row above the divider **/
.summary-accept {
  position: relative;
  z-index: 10001 !important;
}

/** 4) Ensure the checkbox label itself is full‐width & clickable **/
.summary-accept label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  pointer-events: auto !important;
}
.summary-accept input[type="checkbox"] {
  pointer-events: auto !important;
}

      @media (max-width: 600px) {
        /* Collapse the two‐column grid into one */
        :host .popup-content-booking {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 1rem !important;
          padding: 1rem !important;
          max-width: 100vw !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        /* Stack left & right sections vertically */
        :host .final-details-columns {
          display: block !important;
        }

        /* Price card flows below form, not sticky */
        :host .sticky-price-card {
          position: relative !important;
          top: auto !important;
          margin: 1rem 0 0 0 !important;
          width: 100% !important;
          max-width: none !important;
        }
      }
      </style>
      <div class="reniska-wrapper">
        <div id="step-zip" class="step-zip">
          <div class="zip-container">
            <input type="text" id="zipInput" placeholder="Postnummer" maxlength="5" />
            <button id="serviceButton" class="button-disabled" disabled>Välj tjänst</button>
          </div>
          <div id="zipError" class="error-msg reniska-hidden">
            Tyvärr, vi levererar inte till ditt område.
          </div>
        </div>

        <div id="serviceModal" class="popup-overlay reniska-hidden">
          <div class="popup-content-small service-modal-content">
            <button class="popup-close" type="button" id="closeServiceModal">×</button>
            <h2>Välj tjänst</h2>
            <p>Där du bor erbjuds följande tjänster:</p>
            <select id="serviceSelect">
              <option value="">-- Välj tjänst --</option>
              <option value="flyttstadning">Flyttstädning</option>
              <option value="storstadning">Storstädning</option>
              <option value="hemstadning">Hemstädning</option>
              <option value="fonsterputsning">Fönsterputsning</option>
              <option value="kontorsstadning">Kontorsstädning</option>
              <option value="trappstadning">Trappstädning</option>
            </select>
            <button id="confirmService" class="button-disabled" type="button" disabled>Fortsätt</button>
          </div>
        </div>

        <div id="bookingFormModal" class="popup-overlay reniska-hidden">
          <div class="popup-content-booking">
            <button class="popup-close" type="button" id="closeBookingModal">×</button>
            <form id="reniskaBookingForm" novalidate>
              <input type="hidden" id="zipHidden" name="hiddenZip" />
              <input type="hidden" id="serviceHidden" name="service" />
              <input type="hidden" id="finalPrice" name="finalPrice" />

              <!-- Only these classes, no grid-2 or other utility classes -->
              <div class="final-details-columns">
                <div class="final-details-left">
                  <div class="service-section reniska-hidden" data-service="flyttstadning">
                    <h2>Flyttstädning</h2>
                    <label for="area_flytt">Bostadsyta (m²)*</label>
                    <input type="number" id="area_flytt" name="area_flytt" required />
                    <div class="add-on-section">
                      <label><input type="checkbox" name="balcony_window_flytt" value="1" /> Balkongfönsterputsning (+500 kr)</label>
                      <label><input type="checkbox" name="balcony_cleaning_flytt" value="1" /> Balkongstädning (+500 kr)</label>
                    </div>
                    <div class="discount-section">
                      <label for="discount_flytt">Rabattkod</label>
                      <input type="text" id="discount_flytt" name="discount_flytt" />
                    </div>
                  </div>
                  <div class="service-section reniska-hidden" data-service="storstadning">
                    <h2>Storstädning</h2>
                    <label for="area_stor">Bostadsyta (m²)*</label>
                    <input type="number" id="area_stor" name="area_stor" required />
                    <div class="inline-group">
                      <input type="checkbox" id="oven_stor" name="oven_stor" /> <label for="oven_stor">Ugn</label>
                    </div>
                    <div class="inline-group">
                      <input type="checkbox" id="fridge_stor" name="fridge_stor" /> <label for="fridge_stor">Kylskåp</label>
                    </div>
                    <div class="inline-group">
                      <input type="checkbox" id="window_stor" name="window_stor" />
                      <label for="window_stor">Fönsterputs</label>
                    </div>
                    <div id="windowDetailsStor" class="window-details reniska-hidden">
                      <h4>Fönsterantal:</h4>
                      <div class="qty-grid">
                        ${[...Array(8)].map((_, i) => `
                        <div class="qty-row">
                          <span class="qty-label">Typ ${i + 1}</span>
                          <div class="qty-controls">
                            <button type="button" class="qty-btn minus" data-idx="${i + 1}">−</button>
                            <span class="qty-display" data-idx="${i + 1}">0</span>
                            <button type="button" class="qty-btn plus" data-idx="${i + 1}">+</button>
                            <input type="hidden" id="qty${i + 1}_stor" name="qty${i + 1}_stor" value="0" />
                          </div>
                        </div>`).join('')}
                      </div>
                    </div>
                    <div class="discount-section">
                      <label for="discount_stor">Rabattkod</label>
                      <input type="text" id="discount_stor" name="discount_stor" />
                    </div>
                  </div>
                  <div class="service-section reniska-hidden" data-service="hemstadning">
                    <h2>Hemstädning</h2>
                    <label for="area_hem">Bostadsyta (m²)*</label>
                    <input type="number" id="area_hem" name="area_hem" required />
                    <p id="areaWarningHem" class="warning-msg reniska-hidden">Kontakta oss för ytor över 199 m²</p>
                    <label>Husdjur?</label>
                    <div class="frequency-group">
                      <label><input type="radio" name="pets" value="yes" /> Ja</label>
                      <label><input type="radio" name="pets" value="no" checked /> Nej</label>
                    </div>
                    <label>Städfrekvens?</label>
                    <div class="frequency-group">
                      <label><input type="radio" name="frequency" value="veckovis" /> Varje vecka</label>
                      <label><input type="radio" name="frequency" value="varannan" /> Varannan vecka</label>
                      <label><input type="radio" name="frequency" value="fjarde" /> Var fjärde vecka</label>
                    </div>
                    <div class="discount-section">
                      <label for="discount_hem">Rabattkod</label>
                      <input type="text" id="discount_hem" name="discount_hem" />
                    </div>
                  </div>
                  <div class="service-section reniska-hidden" data-service="fonsterputsning">
                    <h2>Fönsterputsning</h2>
                    <div class="qty-grid">
                       ${[...Array(8)].map((_, i) => `
                        <div class="qty-row">
                          <span class="qty-label">Typ ${i + 1}</span>
                          <div class="qty-controls">
                            <button type="button" class="qty-btn minus" data-idx="${i + 1}">−</button>
                            <span class="qty-display" data-idx="${i + 1}">0</span>
                            <button type="button" class="qty-btn plus" data-idx="${i + 1}">+</button>
                            <input type="hidden" id="qty${i + 1}_win" name="qty${i + 1}_win" value="0" />
                          </div>
                        </div>`).join('')}
                    </div>
                    <div class="add-on-section">
                      <label><input type="checkbox" name="kemtvatt_win" value="1" /> Kemtvätt av gardiner (+500 kr)</label>
                    </div>
                  </div>
                  <div class="service-section reniska-hidden" data-service="kontorsstadning">
                    <p>Kontorsstädning? <a href="https://reniska.se/kontakt-kontorsstadning/" target="_blank">Klicka här</a>.</p>
                  </div>
                  <div class="service-section reniska-hidden" data-service="trappstadning">
                    <p>Trappstädning? <a href="https://reniska.se/kontakt-trappstadning/" target="_blank">Klicka här</a>.</p>
                  </div>
                  
                  <div id="finalDetails" class="reniska-hidden">
                    <h2>Slutför bokning</h2>
                    <label for="fullName">Fullständigt namn*</label>
                    <input type="text" id="fullName" name="fullName" required />
                    <label for="phoneNumber">Mobilnummer*</label>
                    <input type="tel" id="phoneNumber" name="phoneNumber" required />
                    <label for="email">E-postadress*</label>
                    <input type="email" id="email" name="email" required />
                    <label for="personnummer">Personnummer*</label>
                    <input type="text" id="personnummer" name="personnummer" placeholder="ÅÅÅÅMMDD-XXXX" required />
                    <label for="address">Adress*</label>
                    <input type="text" id="address" name="address" required />
                    <label for="bookingDate">Datum*</label>
                    <input type="date" id="bookingDate" name="bookingDate" required />
                    <label for="bookingTime">Tid*</label>
                    <select id="bookingTime" name="bookingTime" required>
                      <option value="">Välj tid</option>
                      <option value="08:00">08:00 (Morgon)</option>
                      <option value="13:00">13:00 (Eftermiddag)</option>
                    </select>
                  </div>
                </div>

                <div class="final-details-right">
                  <div class="sticky-price-card">
                    <div id="footerPrice">0 kr</div>
                    <!-- 2) Summary section -->
                    <div id="priceSummary" class="price-summary reniska-hidden">
                      <div class="summary-service">
                        <span class="summary-title">Summary</span>
                        <span class="summary-main-service"></span>
                      </div>
                      <div class="summary-extras reniska-hidden">
                        <span class="summary-extras-label">Extra services</span>
                        <ul class="summary-extras-list"></ul>
                      </div>
                    </div>
                    <div class="discount-section">
                      <label for="final_discount">Rabattkod</label>
                      <input type="text" id="final_discount" name="final_discount" />
                    </div>
                    <div style="margin:1rem 0;">
                      <label><input type="checkbox" id="privacy_policy" required /> Jag accepterar Reniskas <a href="/privacy-policy/" target="_blank">personuppgiftspolicy</a></label>
                    </div>
                    <button type="submit" form="reniskaBookingForm" class="button-primary">Boka nu</button>
                    <span id="bookingSpinner" class="reniska-hidden" style="margin-left:1rem;">⏳</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    this.discountInputMap = {
      flyttstadning: '#discount_flytt',
      storstadning: '#discount_stor',
      hemstadning: '#discount_hem',
      fonsterputsning: null,
    };
    this.windowQtySuffixMap = {
      storstadning: 'stor',
      fonsterputsning: 'win',
    };
    this.windowPriceConfig = {
      qty1: 90,
      qty2: 90,
      qty3: 120,
      qty4: 120,
      qty5: 150,
      qty6: 150,
      qty7: 200,
      qty8: 250
    };
  }

  // This method is called when the component is added to the page.
  connectedCallback() {
    // Initialize Firebase
    this.app = window.firebase.initializeApp(this.firebaseConfig);
    this.db = window.firebase.getFirestore(this.app);
    
    this.setBookingStep(1); // Ensure always starts at step 1
    this.setupEventListeners();
    this.restoreState();
  }

  // Helper to query elements within the shadow DOM.
  qs(selector) {
    return this.shadowRoot.querySelector(selector);
  }

  qsAll(selector) {
    return this.shadowRoot.querySelectorAll(selector);
  }

  // --- All JavaScript logic, adapted for the component ---
  setupEventListeners() {
    const form = this.qs('#reniskaBookingForm');
    
    this.qs('#zipInput').addEventListener('input', () => this.validateZip());
    this.qs('#serviceButton').addEventListener('click', () => this.openServiceModal());
    
    this.qs('#closeServiceModal').addEventListener('click', () => this.setBookingStep(1));
    this.qs('#serviceSelect').addEventListener('change', () => this.validateServiceSelection());
    this.qs('#confirmService').addEventListener('click', () => this.confirmService());
    
    this.qs('#closeBookingModal').addEventListener('click', () => this.resetAndClose());

    // Single delegated change handler for window_stor
    this.shadowRoot.addEventListener('change', e => {
      if (e.target.id === 'window_stor') {
        const details = this.shadowRoot.querySelector('#windowDetailsStor');
        details.classList.toggle('reniska-hidden', !e.target.checked);
        this.calculatePrice();
      }
    });

    // Unified qty-btn logic for both services
    this.shadowRoot.addEventListener('click', e => {
      if (!e.target.classList.contains('qty-btn')) return;
      const section = e.target.closest('.service-section');
      if (!section) return;
      const svc = section.dataset.service;
      const idx = e.target.dataset.idx;
      const display = section.querySelector(`.qty-display[data-idx="${idx}"]`);
      let val = parseInt(display?.textContent || '0', 10);
      if (e.target.classList.contains('minus')) val = Math.max(0, val - 1);
      if (e.target.classList.contains('plus'))  val++;
      if (display) display.textContent = val;
      const hidden = this.qs(`#qty${idx}_${svc === 'storstadning' ? 'stor' : 'win'}`);
      if (hidden) {
        hidden.value = val;
        hidden.dispatchEvent(new Event('input', { bubbles: true }));
      }
      this.calculatePrice();
    });

    form.addEventListener('input', () => this.saveState());
    form.addEventListener('change', () => this.saveState());
    form.addEventListener('submit', (e) => this.submitForm(e));
  }
  
  // --- STATE AND STEP MANAGEMENT ---
  setBookingStep(step) {
    this.qs('#step-zip').classList.toggle('reniska-hidden', step !== 1);
    this.qs('#serviceModal').classList.toggle('reniska-hidden', step !== 2);
    this.qs('#serviceModal').classList.toggle('visible', step === 2);
    this.qs('#bookingFormModal').classList.toggle('reniska-hidden', step !== 3);
    this.qs('#bookingFormModal').classList.toggle('visible', step === 3);

    document.body.classList.toggle('reniska-modal-open', step === 2 || step === 3);

    localStorage.setItem('bookingStep', step);
  }
  
  saveState() {
      const formData = new FormData(this.qs('#reniskaBookingForm'));
      const formObj = Object.fromEntries(formData.entries());
      // Save fonsterputsning qtys
      const fonsterQtys = {};
      for (let i = 1; i <= 8; i++) {
        const display = this.shadowRoot.querySelector(
          `.service-section[data-service="fonsterputsning"] .qty-display[data-idx="${i}"]`
        );
        if (display) fonsterQtys[`qty${i}_win`] = display.textContent;
      }
      formObj._fonsterQtys = fonsterQtys;
      localStorage.setItem('reniskaBookingForm', JSON.stringify(formObj));
      this.calculatePrice();
  }

  restoreState() {
      const savedState = localStorage.getItem('reniskaBookingForm');
      const savedStep = parseInt(localStorage.getItem('bookingStep'), 10) || 1;

      if (savedState) {
          const data = JSON.parse(savedState);
          for (const key in data) {
            const fields = this.qsAll(`[name="${key}"]`);
            if (fields.length > 1) {
                fields.forEach(field => {
                    if (field.type === 'checkbox' || field.type === 'radio') {
                        field.checked = field.value === data[key];
                    } else {
                        field.value = data[key];
                    }
                });
            } else {
                const field = fields[0];
                if (field) {
                    if (field.type === 'radio') {
                        const radio = this.qs(`[name="${key}"][value="${data[key]}"]`);
                        if (radio) radio.checked = true;
                    } else if (field.type === 'checkbox') {
                        field.checked = data[key] === "on" || data[key] === "1" || data[key] === true;
                    } else {
                        field.value = data[key];
                    }
                }
            }
          }
      }
      
      // If restoring to step 3, make sure the service section is visible
      if (savedStep === 3) {
          const service = this.qs('#serviceHidden').value;
          if (service) {
              this.showServiceSection(service);
          } else {
              // If no service is saved, fall back to step 1
              this.setBookingStep(1);
              return;
          }
      }

      this.setBookingStep(savedStep);
      this.calculatePrice();
  }
  
  clearState() {
      localStorage.removeItem('reniskaBookingForm');
      localStorage.removeItem('bookingStep');
  }

  resetAndClose() {
      this.qs('#reniskaBookingForm').reset();
      this.qsAll('.service-section').forEach(s => s.classList.add('reniska-hidden'));
      this.qs('#finalDetails').classList.add('reniska-hidden');
      this.qs('#zipInput').value = '';
      this.validateZip();
      this.clearState();
      this.setBookingStep(1);
  }

  // --- UI AND VALIDATION LOGIC ---
  validateZip() {
    const zip = this.qs('#zipInput').value.trim();
    const zipError = this.qs('#zipError');
    const serviceButton = this.qs('#serviceButton');

    if (zip.length !== 5) {
      zipError.classList.add('reniska-hidden');
      serviceButton.disabled = true;
      serviceButton.className = 'button-disabled';
    } else if (this.zipcodesArray.includes(zip)) {
      zipError.classList.add('reniska-hidden');
      serviceButton.disabled = false;
      serviceButton.className = 'button-enabled';
    } else {
      zipError.textContent = 'Tyvärr, vi levererar inte till ditt område.';
      zipError.classList.remove('reniska-hidden');
      serviceButton.disabled = true;
      serviceButton.className = 'button-disabled';
    }
  }

  openServiceModal() {
    const zip = this.qs('#zipInput').value.trim();
    if (this.zipcodesArray.includes(zip)) {
        this.qs('#zipHidden').value = zip;
        this.setBookingStep(2);
    }
  }

  validateServiceSelection() {
    const service = this.qs('#serviceSelect').value;
    const confirmButton = this.qs('#confirmService');
    const isValid = service !== '';
    confirmButton.disabled = !isValid;
    confirmButton.className = isValid ? 'button-enabled' : 'button-disabled';
  }
  
  showServiceSection(service) {
    this.qsAll('.service-section').forEach(section => {
        section.classList.toggle('reniska-hidden', section.dataset.service !== service);
    });
  }

  confirmService() {
    const service = this.qs('#serviceSelect').value;
    if (service) {
      this.qs('#serviceHidden').value = service;
      this.showServiceSection(service);
      this.setBookingStep(3);
      this.calculatePrice();
      this.saveState(); 
    }
  }
  
  changeQty(id, delta) {
    const input = this.qs('#' + id);
    let value = parseInt(input.value, 10) || 0;
    value = Math.max(0, value + delta);
    input.value = value;
    // Manually trigger an input event to ensure price recalculation and state saving
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // --- PRICE CALCULATION ---
  calculatePrice() {
    const service = this.qs('#serviceHidden').value;
    let price = 0;
    let shouldShow = false;
    const getValue = sel => parseInt(this.qs(sel)?.value, 10) || 0;
    const isChecked = sel => this.qs(sel)?.checked;

    if (service === 'flyttstadning') {
      const area = getValue('#area_flytt');
      if (area > 0) {
        shouldShow = true;
        price = area <= 50 ? 2545 : area <= 60 ? 2695 : area <= 70 ? 3045 : 3195;
        if (isChecked('[name="balcony_window_flytt"]')) price += 500;
        if (isChecked('[name="balcony_cleaning_flytt"]')) price += 500;
      }
    }

    else if (service === 'storstadning') {
      const area = getValue('#area_stor');
      if (area > 0) {
        shouldShow = true;
        price = area <= 50 ? 1905
              : area <= 60 ? 2335
              : area <= 80 ? 3195
              : 3625;
        if (isChecked('#oven_stor'))   price += 500;
        if (isChecked('#fridge_stor')) price += 500;
        // Only add window price if the user opts in for window cleaning
        if (isChecked('#window_stor')) {
          const winPrice = this.calculateWindowPrice('storstadning');
          price += winPrice;
        }
      }
    }

    else if (service === 'hemstadning') {
      const area = getValue('#area_hem');
      const warning = this.qs('#areaWarningHem');
      if (area > 0) {
        shouldShow = true;
        if (area > 199) {
          warning.classList.remove('reniska-hidden');
          price = 0;
        } else {
          warning.classList.add('reniska-hidden');
          price = area <= 69 ? 758 : area <= 99 ? 862 : area <= 115 ? 997 : area <= 129 ? 1132 : area <= 159 ? 1246 : area <= 179 ? 1371 : 1485;
          const freqInput = this.qs('input[name="frequency"]:checked');
          if (freqInput && freqInput.value === 'varannan') price = Math.round(price * 1.15);
          if (freqInput && freqInput.value === 'fjarde') price = Math.round(price * 1.40);
          const petsInput = this.qs('input[name="pets"]:checked');
          if (petsInput && petsInput.value === 'yes') price = Math.round(price * 1.10);
        }
      }
    }

    else if (service === 'fonsterputsning') {
      // purely window‐based service
      const windowTotal = this.calculateWindowPrice('fonsterputsning');
      if (windowTotal > 0) {
        shouldShow = true;
        price = windowTotal;
      }
      if (isChecked('[name="kemtvatt_win"]')) price += 500;
    }

    // Discount
    const discountSelector = this.discountInputMap[service];
    if (shouldShow && price > 0 && discountSelector) {
      const discountInput = this.qs(discountSelector);
      if (discountInput && discountInput.value.trim().toUpperCase() === 'RENSAVE10') {
        price = Math.round(price * 0.90);
      }
    }

    const extras = [];
    if (service === 'storstadning') {
      if (isChecked('#oven_stor'))   extras.push('Ugnsrengöring');
      if (isChecked('#fridge_stor')) extras.push('Kylskåpsrengöring');
      if (isChecked('#window_stor')) extras.push('Fönsterputsning');
    }
    if (service === 'flyttstadning') {
      if (isChecked('[name="balcony_window_flytt"]'))  extras.push('Balkongfönsterputsning');
      if (isChecked('[name="balcony_cleaning_flytt"]')) extras.push('Balkongstädning');
    }
    if (service === 'fonsterputsning') {
      if (isChecked('[name="kemtvatt_win"]')) extras.push('Kemtvätt av gardiner');
    }

    const priceCard = this.qs('.sticky-price-card');
    if (shouldShow && priceCard) {
      priceCard.innerHTML = `
        <div class="summary-header">Summary</div>
        <div class="summary-service">${this.qs('.service-section[data-service="' + service + '"] h2')?.textContent || ''}</div>
        ${extras.length ? `
          <div class="summary-extras">
            <div class="extras-title">Extra services</div>
            <ul class="extras-list">
              ${extras.map(e => `<li>${e}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        <hr class="summary-divider">
        <div class="summary-total">
          <div class="total-label">Total</div>
          <div class="total-amount">${price} kr</div>
          <div class="total-subtext">after RUT deduction</div>
        </div>
        <div class="summary-legal">*Framkörningsavgift kan tillkomma om du bor utanför stadsgräns</div>
        <div class="summary-accept">
          <label><input type="checkbox" id="privacy_policy" required /> Jag accepterar Reniskas <a href="/privacy-policy/" target="_blank">personuppgiftspolicy</a></label>
        </div>
        <button type="submit" form="reniskaBookingForm" class="button-primary">${service === 'storstadning' ? 'Skicka förfrågan' : 'Boka nu'}</button>
        <span id="bookingSpinner" class="reniska-hidden" style="margin-left:1rem;">⏳</span>
      `;
    }

    this.qs('#finalPrice').value = shouldShow ? price : '';
    this.qs('#finalDetails').classList.toggle('reniska-hidden', !shouldShow);
  }

  calculateWindowPrice(service) {
    let total = 0, regularWindowCount = 0;
    for (let i = 1; i <= 8; i++) {
      let qty = 0;
      if (service === 'storstadning') {
        qty = parseInt(this.qs(`#qty${i}_stor`)?.value, 10) || 0;
      } else {
        const display = this.shadowRoot
          .querySelector(`.service-section[data-service="fonsterputsning"] .qty-display[data-idx="${i}"]`);
        qty = parseInt(display?.textContent, 10) || 0;
      }
      if (qty > 0) {
        if (i < 7) regularWindowCount += qty;
        total += qty * this.windowPriceConfig[`qty${i}`];
      }
    }
    return (regularWindowCount > 0 && total < 900) ? 900 : total;
}
  
  // --- FORM SUBMISSION (Firebase Integration) ---
  async submitForm(event) {
    event.preventDefault();
    if (!this.qs('#privacy_policy').checked) {
        alert('Du måste acceptera vår personuppgiftspolicy för att fortsätta.');
        return;
    }

    const spinner = this.qs('#bookingSpinner');
    spinner.classList.remove('reniska-hidden');
    
    // Get form data as an object
    const formData = new FormData(this.qs('#reniskaBookingForm'));
    const bookingData = Object.fromEntries(formData.entries());
    
    // Add a timestamp
    bookingData.createdAt = new Date();

    try {
        // Get a reference to the 'bookings' collection
        const bookingsCollection = window.firebase.collection(this.db, "bookings");
        
        // Add a new document with the booking data
        const docRef = await window.firebase.addDoc(bookingsCollection, bookingData);

        console.log("Document written with ID: ", docRef.id);
        alert('Tack för din bokning! Vi har tagit emot den.');
        this.resetAndClose();

    } catch (error) {
        alert('Ett fel inträffade. Försök igen.');
        console.error("Error adding document: ", error);
    } finally {
        spinner.classList.add('reniska-hidden');
    }
  }
}

// Define the new custom element for the browser to recognize.
customElements.define('reniska-booking-form', ReniskaBookingForm