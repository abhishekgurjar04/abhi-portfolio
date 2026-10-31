(function () {
  "use strict";

  var CONTACT_EMAIL = "abhishekgurjar781782@gmail.com";

  /* Footer year */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Hide the optional hero photo if the image file is missing */
  var heroImg = document.querySelector("#hero-photo img");
  function hideHeroPhoto() {
    var photo = document.getElementById("hero-photo");
    var grid = document.getElementById("hero-grid");
    if (photo) photo.hidden = true;
    if (grid) grid.classList.add("no-photo");
  }
  if (heroImg) {
    heroImg.addEventListener("error", hideHeroPhoto);
    if (heroImg.complete && heroImg.naturalWidth === 0) hideHeroPhoto();
  }

  /* Highlight the nav link of the section currently in view */
  var links = document.querySelectorAll('.topbar nav a[href^="#"]');
  if ("IntersectionObserver" in window && links.length) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (a) { a.removeAttribute("aria-current"); });
          var active = byId[entry.target.id];
          if (active) active.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    document.querySelectorAll("main section[id]").forEach(function (section) { observer.observe(section); });
  }

  /* Demo booking form: sends the details to the owner's email via FormSubmit (free, no backend) */
  var form = document.getElementById("demo-form");
  var statusEl = document.getElementById("form-status");
  if (!form || !statusEl) return;
  form.noValidate = true; /* custom messages below; native validation remains the no-JS fallback */

  var ENDPOINT = "https://formsubmit.co/ajax/bf36a6c6e58fccd892fd11d268aef954"; /* private FormSubmit ID, hides your email address */
  var WHATSAPP = "https://wa.me/919828468345?text=Hi%20Abhishek%2C%20I%20want%20to%20book%20a%20free%20demo.";

  /* ===== Phone validation: country dropdown + country-specific length rules =====
     Rules check the national number (without the country code and without a leading 0). */
  var COUNTRY_DATA = [
    ["IN", "India", "+91", 10, 10, "^[6-9]", "6, 7, 8 or 9"],
    ["US", "United States", "+1", 10, 10, "^[2-9]", "a digit from 2 to 9"],
    ["CA", "Canada", "+1", 10, 10, "^[2-9]", "a digit from 2 to 9"],
    ["GB", "United Kingdom", "+44", 10, 10],
    ["AE", "United Arab Emirates", "+971", 9, 9],
    ["SA", "Saudi Arabia", "+966", 9, 9],
    ["QA", "Qatar", "+974", 8, 8],
    ["KW", "Kuwait", "+965", 8, 8],
    ["OM", "Oman", "+968", 8, 8],
    ["BH", "Bahrain", "+973", 8, 8],
    ["PK", "Pakistan", "+92", 10, 10],
    ["BD", "Bangladesh", "+880", 10, 10],
    ["NP", "Nepal", "+977", 10, 10],
    ["LK", "Sri Lanka", "+94", 9, 9],
    ["BT", "Bhutan", "+975", 8, 8],
    ["MV", "Maldives", "+960", 7, 7],
    ["AF", "Afghanistan", "+93", 9, 9],
    ["AU", "Australia", "+61", 9, 9],
    ["NZ", "New Zealand", "+64", 8, 10],
    ["SG", "Singapore", "+65", 8, 8],
    ["MY", "Malaysia", "+60", 9, 10],
    ["ID", "Indonesia", "+62", 9, 12],
    ["PH", "Philippines", "+63", 10, 10],
    ["TH", "Thailand", "+66", 9, 9],
    ["VN", "Vietnam", "+84", 9, 10],
    ["JP", "Japan", "+81", 10, 10],
    ["KR", "South Korea", "+82", 9, 10],
    ["CN", "China", "+86", 11, 11],
    ["HK", "Hong Kong", "+852", 8, 8],
    ["DE", "Germany", "+49", 10, 11],
    ["FR", "France", "+33", 9, 9],
    ["IT", "Italy", "+39", 9, 10],
    ["ES", "Spain", "+34", 9, 9],
    ["NL", "Netherlands", "+31", 9, 9],
    ["IE", "Ireland", "+353", 9, 9],
    ["RU", "Russia", "+7", 10, 10],
    ["TR", "Turkey", "+90", 10, 10],
    ["EG", "Egypt", "+20", 10, 10],
    ["ZA", "South Africa", "+27", 9, 9],
    ["NG", "Nigeria", "+234", 10, 10],
    ["KE", "Kenya", "+254", 9, 9],
    ["BR", "Brazil", "+55", 10, 11],
    ["MX", "Mexico", "+52", 10, 10]
  ];
  var COUNTRIES = COUNTRY_DATA.map(function (r) {
    return { code: r[0], name: r[1], dial: r[2], min: r[3], max: r[4], start: r[5] ? new RegExp(r[5]) : null, startHint: r[6] || "", keepZero: r[0] === "IT" };
  });
  COUNTRIES = [COUNTRIES[0]]
    .concat(COUNTRIES.slice(1).sort(function (a, b) { return a.name.localeCompare(b.name); }))
    .concat([{ code: "XX", name: "Other country", dial: "", min: 7, max: 15, start: null, startHint: "", keepZero: false }]);

  function getCountry() {
    var code = form.elements["country"] ? form.elements["country"].value : "IN";
    for (var i = 0; i < COUNTRIES.length; i++) if (COUNTRIES[i].code === code) return COUNTRIES[i];
    return COUNTRIES[0];
  }
  function lengthText(c) { return c.min === c.max ? c.min + " digits" : c.min + " to " + c.max + " digits"; }

  /* Returns { message, full, country }. message is "" when the number is valid. */
  function checkPhone(raw) {
    var c = getCountry(), v = String(raw).trim(), r = { message: "", full: "", wa: "", country: c.name };
    if (!v) { r.message = "Please enter your WhatsApp or phone number."; return r; }

    if (c.code === "XX") {
      var all = v.replace(/\D/g, "");
      if (/[^\d\s\-().+]/.test(v) || all.length < 7 || all.length > 15) {
        r.message = "Enter the full number with country code, 7 to 15 digits.";
        return r;
      }
      r.full = "+" + all;
      r.wa = all;
      return r;
    }

    if (/^(\+|00)/.test(v)) { r.message = "Choose your country above and enter the number without " + c.dial + "."; return r; }
    if (/[^\d\s\-().]/.test(v)) { r.message = "Use digits only."; return r; }

    var digits = v.replace(/\D/g, "");
    if (digits.charAt(0) === "0" && !c.keepZero) digits = digits.slice(1); /* ignore the national trunk 0 */
    if (digits.length < c.min || digits.length > c.max) {
      r.message = "Enter " + lengthText(c) + " for " + c.name + ", without " + c.dial + ".";
      return r;
    }
    if (c.start && !c.start.test(digits)) {
      r.message = c.name + " numbers start with " + c.startHint + ".";
      return r;
    }
    r.full = c.dial + " " + digits;
    r.wa = c.dial.replace("+", "") + digits; /* digits only, for wa.me links */
    return r;
  }
  /* ===== end phone validation ===== */

  var rules = {
    name: function (v) { return v.trim().length >= 2 ? "" : "Please enter your name."; },
    email: function (v, el) { return el.checkValidity() && v.trim() ? "" : "Please enter a valid email address."; },
    phone: function (v) { return checkPhone(v).message; },
    subject: function (v) { return v ? "" : "Please choose a subject."; }
  };

  function checkField(field) {
    var message = rules[field.name](field.value, field);
    var errorEl = document.getElementById(field.id + "-err");
    field.setAttribute("aria-invalid", message ? "true" : "false");
    if (errorEl) errorEl.textContent = message;
    return !message;
  }

  function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = "status-msg" + (type ? " " + type : "");
  }

  function appendWhatsApp(suffix) {
    var link = document.createElement("a");
    link.href = WHATSAPP; link.target = "_blank"; link.rel = "noopener"; link.textContent = "WhatsApp";
    statusEl.appendChild(link);
    statusEl.appendChild(document.createTextNode(suffix));
  }

  var fields = Object.keys(rules).map(function (n) { return form.elements[n]; });
  fields.forEach(function (field) {
    field.addEventListener("blur", function () { checkField(field); });
    field.addEventListener("input", function () {
      if (field.getAttribute("aria-invalid") === "true") checkField(field);
    });
  });

  /* Country dropdown: fill options, keep the placeholder in sync, re-check the number on change */
  var countrySelect = form.elements["country"];
  var phoneInput = form.elements["phone"];
  if (countrySelect && phoneInput) {
    countrySelect.innerHTML = "";
    COUNTRIES.forEach(function (c) {
      var option = document.createElement("option");
      option.value = c.code;
      option.textContent = c.name + (c.dial ? " (" + c.dial + ")" : "");
      countrySelect.appendChild(option);
    });
    countrySelect.value = "IN";

    var syncPlaceholder = function () {
      var c = getCountry();
      phoneInput.placeholder = c.code === "XX" ? "Number with country code" : lengthText(c);
    };
    syncPlaceholder();
    countrySelect.addEventListener("change", function () {
      syncPlaceholder();
      if (phoneInput.value || phoneInput.getAttribute("aria-invalid") === "true") checkField(phoneInput);
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var firstInvalid = null;
    fields.forEach(function (field) {
      if (!checkField(field) && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      setStatus("Please fix the highlighted fields.", "error");
      firstInvalid.focus();
      return;
    }

    var phoneInfo = checkPhone(form.elements["phone"].value);
    var honey = form.elements["_honey"].value;
    var studentName = form.elements["name"].value.trim();
    var language = form.elements["subject"].value;
    var replyText = "Hi " + studentName + ", this is Abhishek. I got your request for a free " + language + " demo class. When are you free to start?";

    /* Only these rows appear in the email, in this order. Gmail and phone are inside "message". */
    var payload = {
      booking: "New demo booking for " + language + " from " + studentName,
      message:
        "New demo booking for " + language + " from " + studentName + ". " +
        "Contact details: Gmail " + form.elements["email"].value.trim() + ", phone " + phoneInfo.full + ". " +
        "Chat on WhatsApp: https://wa.me/" + phoneInfo.wa,
      name: studentName,
      whatsapp: "https://wa.me/" + phoneInfo.wa + "?text=" + encodeURIComponent(replyText),
      _subject: "Booking for " + language,
      _template: "table",
      _captcha: "false"
    };

    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    setStatus("Sending...");

    function done() {
      form.reset();
      fields.forEach(function (f) { f.removeAttribute("aria-invalid"); });
      setStatus("Thanks " + payload.name + "! Your request is sent and I will contact you soon. For a faster reply, message me on ", "ok");
      appendWhatsApp(".");
    }

    if (honey) { done(); button.disabled = false; return; } /* bot: pretend success */

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Request failed");
        return response.json();
      })
      .then(function (result) {
        /* FormSubmit can answer 200 while the form is still waiting for activation, so check its own flag */
        if (String(result && result.success) !== "true") throw new Error("Not delivered");
        done();
      })
      .catch(function () {
        setStatus("Could not send right now. Please message me on ", "error");
        appendWhatsApp(" instead.");
      })
      .finally(function () { button.disabled = false; });
  });
})();