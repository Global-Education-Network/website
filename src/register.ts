import "./footer";

const form = document.getElementById("register-form") as HTMLFormElement;
const message = document.getElementById("form-message") as HTMLParagraphElement;

// Toggle "Other" text inputs
const contribOtherCheck = document.getElementById(
  "contrib-other-check"
) as HTMLInputElement;
const contribOtherInput = document.getElementById(
  "contribution-other"
) as HTMLInputElement;

contribOtherCheck.addEventListener("change", () => {
  contribOtherInput.disabled = !contribOtherCheck.checked;
  if (!contribOtherCheck.checked) contribOtherInput.value = "";
});

const donationOtherRadio = document.getElementById(
  "donation-other-radio"
) as HTMLInputElement;
const donationOtherInput = document.getElementById(
  "donation-other"
) as HTMLInputElement;
const currencyEl = document.getElementById("currency") as HTMLSelectElement;

// Donation tiers per currency (NOK base, others are 1/10)
const NOK_TIERS = [200, 300, 500];
const OTHER_TIERS = [20, 30, 50];

function getTiers(currency: string): number[] {
  return currency === "NOK" ? NOK_TIERS : OTHER_TIERS;
}

function updateDonationAmounts() {
  const tiers = getTiers(currencyEl.value || "USD");
  const cards = document.querySelectorAll<HTMLElement>(".donation-card");
  cards.forEach((card, i) => {
    const radio = card.querySelector<HTMLInputElement>('input[type="radio"]');
    const amountSpan = card.querySelector<HTMLElement>(".card-amount");
    if (!radio || !amountSpan || radio.id === "donation-other-radio") return;
    radio.value = String(tiers[i]);
    amountSpan.textContent = String(tiers[i]);
  });
}

// Map country dialing codes to their actual currency; unlisted codes default to USD
const dialingCodeToCurrency: Record<string, string> = {
  "+47": "NOK",
  "+44": "GBP",
  "+49": "EUR",
};

const countryCodeEl = document.getElementById("country-dialing-code") as HTMLSelectElement;

function syncCurrencyFromDialingCode() {
  const mapped = dialingCodeToCurrency[countryCodeEl.value] || "USD";
  currencyEl.value = mapped;
  updateDonationAmounts();
}

countryCodeEl.addEventListener("change", syncCurrencyFromDialingCode);

// Sync on page load so currency matches the default dialing code
syncCurrencyFromDialingCode();

currencyEl.addEventListener("change", updateDonationAmounts);

document.querySelectorAll<HTMLInputElement>('input[name="donationCommitment"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const isOther = donationOtherRadio.checked;
    donationOtherInput.disabled = !isOther;
    if (!isOther) donationOtherInput.value = "";
  });
});

const SERVICE_DOWN_MSG = "We're sorry, our registration service is temporarily unavailable. Please try again later.";

function extractError(data: any): string {
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail)) {
    return data.detail.map((e: any) => e.msg || String(e)).join("; ");
  }
  if (typeof data?.error === "string") return data.error;
  if (typeof data?.message === "string") return data.message;
  return SERVICE_DOWN_MSG;
}

// Submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  message.hidden = true;

  const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
  const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
  const countryDialingCode = (form.elements.namedItem("countryDialingCode") as HTMLSelectElement).value.trim();
  const contact = (form.elements.namedItem("contact") as HTMLInputElement).value.trim();
  const feedback = (form.elements.namedItem("feedback") as HTMLTextAreaElement).value.trim();

  // Contributions
  const checked = form.querySelectorAll<HTMLInputElement>(
    'input[name="contributions"]:checked'
  );
  const contributions = Array.from(checked).map((cb) => {
    if (cb.value === "Other" && contribOtherCheck.checked && contribOtherInput.value.trim()) {
      return contribOtherInput.value.trim();
    }
    return cb.value;
  });

  // Donation commitment
  const donationRadio = form.querySelector<HTMLInputElement>(
    'input[name="donationCommitment"]:checked'
  );
  let donationCommitment: number | null = null;
  if (donationRadio) {
    if (donationRadio.value === "other") {
      const val = parseFloat(donationOtherInput.value.trim());
      if (!isNaN(val) && val > 0) donationCommitment = val;
    } else {
      donationCommitment = parseFloat(donationRadio.value);
    }
  }

  // Currency
  const currencySelect = form.elements.namedItem("currency") as HTMLSelectElement;
  const currency = currencySelect.value || null;

  // Contact permission
  const permRadio = form.querySelector<HTMLInputElement>(
    'input[name="contactPermission"]:checked'
  );

  // Client-side validation
  if (!email || !name) {
    showMessage("Please fill in all required fields.", "error");
    return;
  }
  if (contributions.length === 0) {
    showMessage("Please select at least one contribution option.", "error");
    return;
  }
  if (!permRadio) {
    showMessage("Please indicate whether we may contact you.", "error");
    return;
  }

  const contactPermission = permRadio.value === "yes";

  const payload: Record<string, unknown> = {
    email,
    name,
    contributions,
    contact_permission: contactPermission,
  };

  if (countryDialingCode) payload.country_dialing_code = countryDialingCode;
  if (contact) payload.contact = contact;
  if (donationCommitment !== null) payload.donation_commitment = donationCommitment;
  if (donationCommitment !== null && currency) payload.currency = currency;
  if (feedback) payload.feedback = feedback;

  const submitBtn = form.querySelector("button[type='submit']") as HTMLButtonElement;
  submitBtn.disabled = true;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (!backendUrl) {
    showMessage("Registration is currently unavailable. Please try again later.", "error");
    submitBtn.disabled = false;
    return;
  }

  try {
    const res = await fetch(`${backendUrl}/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      form.hidden = true;
      message.hidden = true;

      const successDiv = document.createElement("div");
      successDiv.className = "success-screen";

      let seconds = 10;
      successDiv.innerHTML = `
        <div class="success-icon">&#10003;</div>
        <h2>Registration Successful!</h2>
        <p>Thank you for registering. Your form has been successfully submitted.</p>
        <p class="countdown">Redirecting to home in <span id="countdown-timer">${seconds}</span> seconds...</p>
        <a href="/" class="join-btn home-btn">Go to Home</a>
      `;
      form.parentElement!.insertBefore(successDiv, form);

      const timerSpan = document.getElementById("countdown-timer")!;
      const interval = setInterval(() => {
        seconds--;
        timerSpan.textContent = String(seconds);
        if (seconds <= 0) {
          clearInterval(interval);
          window.location.href = "/";
        }
      }, 1000);

      return;
    } else {
      try {
        const data = await res.json();
        const msg = extractError(data);
        showMessage(msg, "error");
      } catch {
        showMessage(SERVICE_DOWN_MSG, "error");
      }
    }
  } catch {
    showMessage(SERVICE_DOWN_MSG, "error");
  } finally {
    submitBtn.disabled = false;
  }
});

function showMessage(text: string, type: "success" | "error") {
  message.textContent = text;
  message.className = `form-message ${type}`;
  message.hidden = false;
}
