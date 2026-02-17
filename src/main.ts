// Set current year in footer
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear().toString();
}

// Animate stat numbers counting up
function animateCounters(): void {
  const counters = document.querySelectorAll<HTMLElement>(".stat-number");

  counters.forEach((counter) => {
    const target = parseInt(counter.dataset.target ?? "0", 10);
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime: number): void {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      counter.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  });
}

// Start counters when stats section is visible
const statsSection = document.querySelector(".stats");
if (statsSection) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.5 }
  );
  observer.observe(statsSection);
}

// Handle email form submission
const form = document.getElementById("notify-form") as HTMLFormElement | null;
const message = document.getElementById("form-message");

form?.addEventListener("submit", (e: Event) => {
  e.preventDefault();

  const input = document.getElementById("email-input") as HTMLInputElement;
  const email = input.value.trim();

  if (!message) return;

  if (!email) {
    message.textContent = "Please enter a valid email address.";
    message.className = "form-message error";
    return;
  }

  // Simulate subscription (replace with real API call)
  message.textContent = "Thank you! We'll notify you when we launch.";
  message.className = "form-message success";
  input.value = "";
});
