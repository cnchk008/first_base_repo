const statusLabel = document.querySelector("[data-status-label]");

async function refreshStatus() {
  if (!statusLabel) {
    return;
  }

  try {
    const response = await fetch("/health");
    const payload = await response.json();
    statusLabel.textContent = payload.ok ? "Ready" : "Check";
  } catch {
    statusLabel.textContent = "Offline";
  }
}

refreshStatus();
