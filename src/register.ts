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

document.querySelectorAll<HTMLInputElement>('input[name="donationCommitment"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const isOther = donationOtherRadio.checked;
    donationOtherInput.disabled = !isOther;
    if (!isOther) donationOtherInput.value = "";
  });
});

// Submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  message.hidden = true;

  const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
  const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
  const contact = (form.elements.namedItem("contact") as HTMLInputElement).value.trim();
  const feedback = (form.elements.namedItem("feedback") as HTMLTextAreaElement).value.trim();

  // Contributions
  const checked = form.querySelectorAll<HTMLInputElement>(
    'input[name="contributions"]:checked'
  );
  const contributions = Array.from(checked).map((cb) => cb.value);

  const contributionOther = contribOtherCheck.checked
    ? contribOtherInput.value.trim()
    : "";

  // Donation commitment
  const donationRadio = form.querySelector<HTMLInputElement>(
    'input[name="donationCommitment"]:checked'
  );
  let donationCommitment = "";
  if (donationRadio) {
    donationCommitment =
      donationRadio.value === "other"
        ? donationOtherInput.value.trim()
        : donationRadio.value;
  }

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

  const submitBtn = form.querySelector("button[type='submit']") as HTMLButtonElement;
  submitBtn.disabled = true;

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        contact,
        contributions,
        contributionOther,
        donationCommitment,
        contactPermission,
        feedback,
      }),
    });

    if (res.ok) {
      window.location.href = "/";
      return;
    } else {
      const data = await res.json();
      showMessage(data.error || "Something went wrong. Please try again.", "error");
    }
  } catch {
    showMessage("Network error. Please check your connection and try again.", "error");
  } finally {
    submitBtn.disabled = false;
  }
});

function showMessage(text: string, type: "success" | "error") {
  message.textContent = text;
  message.className = `form-message ${type}`;
  message.hidden = false;
}
