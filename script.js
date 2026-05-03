const photos = [
  "./assets/images/photo-1.webp",
  "./assets/images/photo-2.webp",
  "./assets/images/photo-3.webp",
  "./assets/images/photo-4.webp",
  "./assets/images/photo-5.webp",
  "./assets/images/photo-6.webp",
];

const SUPABASE_URL = "https://oispevxnjlighemfhxpj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pc3BldnhuamxpZ2hlbWZoeHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2OTgyMjcsImV4cCI6MjA5MzI3NDIyN30.uins94rMAmYQcAiKJO0x7rGqBPbEKTJkbZQzShKTh2c";
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
const SUPABASE_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

const cover = document.getElementById("cover");
const openCard = document.getElementById("openCard");
const musicBtn = document.getElementById("musicBtn");
const weddingAudio = document.getElementById("weddingAudio");
const calendarDays = document.getElementById("calendarDays");
const countdown = document.getElementById("countdown");
const albumGrid = document.getElementById("albumGrid");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const closeLightbox = document.getElementById("closeLightbox");
const prevPhoto = document.getElementById("prevPhoto");
const nextPhoto = document.getElementById("nextPhoto");
const thumbs = document.getElementById("thumbs");
const wishForm = document.getElementById("wishForm");
const wishes = document.getElementById("wishes");
const wishTrack = document.getElementById("wishTrack");
const wishTrigger = document.getElementById("wishTrigger");
const wishModal = document.getElementById("wishModal");
const wishMessage = document.getElementById("wishMessage");
const closeWishModal = document.getElementById("closeWishModal");
const cancelWish = document.getElementById("cancelWish");
const giftBtn = document.getElementById("giftBtn");
const giftModal = document.getElementById("giftModal");
const closeGiftModal = document.getElementById("closeGiftModal");
const controlsToggle = document.getElementById("controlsToggle");
const confirmForm = document.getElementById("confirmForm");
const confirmMessage = document.getElementById("confirmMessage");
let currentPhoto = 0;
let lightboxScale = 1;
let lightboxOffsetX = 0;
let lightboxOffsetY = 0;
let lightboxDragging = false;
let lightboxDragX = 0;
let lightboxDragY = 0;
let autoScrollFrame = 0;
let autoScrollActive = false;
let previousScrollBehavior = "";

function updateMusicButton() {
  if (!weddingAudio || !musicBtn) return;
  const isPaused = weddingAudio.paused || weddingAudio.ended;
  musicBtn.classList.toggle("paused", isPaused);
  musicBtn.setAttribute("aria-pressed", String(!isPaused));
  musicBtn.setAttribute("aria-label", isPaused ? "Phát nhạc" : "Tạm dừng nhạc");
}

function playWeddingMusic() {
  if (!weddingAudio) return;
  weddingAudio.volume = 0.78;
  const play = weddingAudio.play();
  if (!play) {
    updateMusicButton();
    return;
  }
  play
    .then(() => {
      updateMusicButton();
    })
    .catch(() => {
      updateMusicButton();
    });
}

function stopInvitationAutoScroll() {
  if (!autoScrollActive) return;
  autoScrollActive = false;
  cancelAnimationFrame(autoScrollFrame);
  document.documentElement.style.scrollBehavior = previousScrollBehavior;
}

function startInvitationAutoScroll() {
  stopInvitationAutoScroll();

  const startY = window.scrollY;
  const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const distance = maxY - startY;

  if (distance <= 0) return;

  const duration = Math.max(58000, distance * 14);
  const startTime = performance.now();
  autoScrollActive = true;
  previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";

  const step = (now) => {
    if (!autoScrollActive) return;
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * progress);

    if (progress < 1) {
      autoScrollFrame = requestAnimationFrame(step);
    } else {
      autoScrollActive = false;
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    }
  };

  autoScrollFrame = requestAnimationFrame(step);
}

function jumpToTop() {
  const scrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  document.documentElement.style.scrollBehavior = scrollBehavior;
}

["wheel", "touchstart", "pointerdown", "keydown"].forEach((eventName) => {
  window.addEventListener(eventName, stopInvitationAutoScroll, { passive: true });
});

openCard.addEventListener("click", () => {
  if (cover.classList.contains("opening")) return;
  openCard.disabled = true;
  cover.classList.add("opening");
  playWeddingMusic();
  jumpToTop();
  setTimeout(() => {
    cover.classList.add("hidden");
  }, 1300);
  setTimeout(() => {
    cover.classList.remove("opening");
  }, 2100);
  setTimeout(startInvitationAutoScroll, 2300);
});

musicBtn.addEventListener("click", () => {
  if (!weddingAudio) return;
  if (weddingAudio.paused) {
    playWeddingMusic();
  } else {
    weddingAudio.pause();
    updateMusicButton();
  }
});

if (weddingAudio) {
  weddingAudio.addEventListener("play", updateMusicButton);
  weddingAudio.addEventListener("pause", updateMusicButton);
  weddingAudio.addEventListener("ended", updateMusicButton);
}

function renderCalendar() {
  calendarDays.innerHTML = "";
  for (let i = 0; i < 4; i += 1) {
    calendarDays.appendChild(document.createElement("span"));
  }
  for (let day = 1; day <= 31; day += 1) {
    const cell = document.createElement("span");
    cell.textContent = day;
    if (day === 24) {
      cell.className = "selected";
    }
    calendarDays.appendChild(cell);
  }
}

function updateCountdown() {
  const target = new Date("2026-05-24T11:00:00+07:00").getTime();
  const now = Date.now();
  const distance = Math.max(0, target - now);
  const day = Math.floor(distance / 86400000);
  const hour = Math.floor((distance % 86400000) / 3600000);
  const minute = Math.floor((distance % 3600000) / 60000);
  const second = Math.floor((distance % 60000) / 1000);
  countdown.textContent = `${day} ngày ${hour} giờ ${minute} phút ${second} giây`;
}

function setPhoto(index) {
  currentPhoto = (index + photos.length) % photos.length;
  lightboxImage.src = photos[currentPhoto];
  lightboxImage.alt = `Ảnh cưới ${currentPhoto + 1}`;
  resetLightboxZoom();
  [...thumbs.children].forEach((button, i) => {
    button.classList.toggle("active", i === currentPhoto);
  });
}

function applyLightboxZoom() {
  lightboxImage.style.setProperty("--zoom-x", `${lightboxOffsetX}px`);
  lightboxImage.style.setProperty("--zoom-y", `${lightboxOffsetY}px`);
  lightboxImage.style.setProperty("--zoom-scale", lightboxScale);
  lightbox.classList.toggle("zoomed", lightboxScale > 1);
}

function resetLightboxZoom() {
  lightboxScale = 1;
  lightboxOffsetX = 0;
  lightboxOffsetY = 0;
  lightboxDragging = false;
  applyLightboxZoom();
}

function setLightboxZoom(scale) {
  lightboxScale = Math.min(3, Math.max(1, scale));
  if (lightboxScale === 1) {
    lightboxOffsetX = 0;
    lightboxOffsetY = 0;
  }
  applyLightboxZoom();
}

function openLightbox(index) {
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  setPhoto(index);
}

function hideLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
}

function openWishModal() {
  wishModal.classList.add("open");
  wishModal.setAttribute("aria-hidden", "false");
  setTimeout(() => document.getElementById("guestName").focus(), 60);
}

function hideWishModal() {
  wishModal.classList.remove("open");
  wishModal.setAttribute("aria-hidden", "true");
}

function openGiftModal() {
  giftModal.classList.add("open");
  giftModal.setAttribute("aria-hidden", "false");
}

function hideGiftModal() {
  giftModal.classList.remove("open");
  giftModal.setAttribute("aria-hidden", "true");
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${SUPABASE_REST_URL}/${path}`, {
    ...options,
    headers: {
      ...SUPABASE_HEADERS,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Supabase error ${response.status}`;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}

function createWishElement(name, message) {
  const item = document.createElement("div");
  item.className = "wish";
  item.innerHTML = `<strong>${escapeHtml(name)}:</strong><span>${escapeHtml(message)}</span>`;
  return item;
}

function appendWish(name, message) {
  const item = createWishElement(name, message);
  const firstClone = wishTrack.querySelector(".wish-clone");
  wishTrack.insertBefore(item, firstClone || wishTrack.firstChild);
  refreshWishTicker();
}

async function loadWishes() {
  try {
    const rows = await supabaseRequest("wishes?select=name,message,created_at&order=created_at.desc&limit=40");
    wishTrack.querySelectorAll(".wish").forEach((wish) => wish.remove());
    if (!Array.isArray(rows) || rows.length === 0) {
      refreshWishTicker();
      return;
    }

    rows.reverse().forEach((row) => {
      wishTrack.appendChild(createWishElement(row.name, row.message));
    });
    refreshWishTicker();
  } catch (error) {
    console.warn("Không tải được lời chúc từ Supabase:", error);
  }
}

async function saveWish(name, message) {
  return supabaseRequest("wishes", {
    method: "POST",
    body: JSON.stringify({ name, message }),
  });
}

async function saveRsvp(name, attendance, guestCount) {
  return supabaseRequest("rsvps", {
    method: "POST",
    body: JSON.stringify({
      name,
      attendance,
      guest_count: guestCount,
    }),
  });
}

function startWishTicker() {
  if (!wishes || !wishTrack) return;
  refreshWishTicker();
  window.addEventListener("resize", refreshWishTicker);
}

function refreshWishTicker() {
  if (!wishes || !wishTrack) return;
  wishTrack.querySelectorAll(".wish-clone").forEach((clone) => clone.remove());

  const originalWishes = [...wishTrack.querySelectorAll(".wish:not(.wish-clone)")];
  originalWishes.forEach((wish) => {
    const clone = wish.cloneNode(true);
    clone.classList.add("wish-clone");
    clone.setAttribute("aria-hidden", "true");
    wishTrack.appendChild(clone);
  });

  const gap = Number.parseFloat(getComputedStyle(wishTrack).gap) || 0;
  const distance = originalWishes.reduce((total, wish) => total + wish.getBoundingClientRect().height, 0) + gap * originalWishes.length;
  const duration = Math.max(6, distance / 32);
  wishTrack.style.setProperty("--wish-distance", `${Math.max(distance, 1)}px`);
  wishTrack.style.setProperty("--wish-duration", `${duration}s`);
}

albumGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-index]");
  if (!button) return;
  openLightbox(Number(button.dataset.index));
});

closeLightbox.addEventListener("click", hideLightbox);
prevPhoto.addEventListener("click", () => setPhoto(currentPhoto - 1));
nextPhoto.addEventListener("click", () => setPhoto(currentPhoto + 1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) hideLightbox();
});

lightboxImage.addEventListener("dblclick", () => {
  setLightboxZoom(lightboxScale > 1 ? 1 : 2.25);
});

lightboxImage.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    const step = event.deltaY < 0 ? 0.25 : -0.25;
    setLightboxZoom(lightboxScale + step);
  },
  { passive: false },
);

lightboxImage.addEventListener("pointerdown", (event) => {
  if (lightboxScale <= 1) return;
  lightboxDragging = true;
  lightboxDragX = event.clientX - lightboxOffsetX;
  lightboxDragY = event.clientY - lightboxOffsetY;
  lightboxImage.setPointerCapture(event.pointerId);
});

lightboxImage.addEventListener("pointermove", (event) => {
  if (!lightboxDragging) return;
  lightboxOffsetX = event.clientX - lightboxDragX;
  lightboxOffsetY = event.clientY - lightboxDragY;
  applyLightboxZoom();
});

lightboxImage.addEventListener("pointerup", (event) => {
  lightboxDragging = false;
  if (lightboxImage.hasPointerCapture(event.pointerId)) {
    lightboxImage.releasePointerCapture(event.pointerId);
  }
});

lightboxImage.addEventListener("pointercancel", () => {
  lightboxDragging = false;
});

photos.forEach((src, index) => {
  const button = document.createElement("button");
  const img = document.createElement("img");
  img.src = src;
  img.alt = `Thumbnail ${index + 1}`;
  button.appendChild(img);
  button.addEventListener("click", () => setPhoto(index));
  thumbs.appendChild(button);
});

wishForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.getElementById("guestName").value.trim();
  const wish = document.getElementById("guestWish").value.trim();
  if (!name || !wish) return;
  const submitButton = wishForm.querySelector('button[type="submit"]');
  const originalLabel = submitButton.textContent;

  submitButton.disabled = true;
  submitButton.textContent = "Đang gửi...";
  wishMessage.textContent = "";

  try {
    await saveWish(name, wish);
    appendWish(name, wish);
    wishForm.reset();
    hideWishModal();
  } catch (error) {
    console.error("Không lưu được lời chúc:", error);
    wishMessage.textContent = `Chưa gửi được lời chúc: ${error.message}`;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }
});

wishTrigger.addEventListener("click", openWishModal);
closeWishModal.addEventListener("click", hideWishModal);
cancelWish.addEventListener("click", hideWishModal);

wishModal.addEventListener("click", (event) => {
  if (event.target === wishModal) hideWishModal();
});

giftBtn.addEventListener("click", openGiftModal);
closeGiftModal.addEventListener("click", hideGiftModal);

giftModal.addEventListener("click", (event) => {
  if (event.target === giftModal) hideGiftModal();
});

controlsToggle.addEventListener("click", () => {
  const isHidden = document.body.classList.toggle("controls-hidden");
  controlsToggle.classList.toggle("is-hidden", isHidden);
  controlsToggle.setAttribute("aria-pressed", String(isHidden));
  controlsToggle.setAttribute(
    "aria-label",
    isHidden ? "Mở lời chúc, hộp mừng cưới và âm nhạc" : "Ẩn lời chúc, hộp mừng cưới và âm nhạc",
  );
  controlsToggle.querySelector("span").textContent = isHidden ? "+" : "×";
});

confirmForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.getElementById("confirmName").value.trim();
  const guests = document.getElementById("guestCount").value;
  const guestCount = Number.parseInt(guests, 10) || 1;
  const attendance = new FormData(confirmForm).get("attendance");
  const submitButton = confirmForm.querySelector('button[type="submit"]');
  const originalLabel = submitButton.textContent;

  if (!name) return;

  submitButton.disabled = true;
  submitButton.textContent = "Đang gửi...";
  confirmMessage.textContent = "";

  try {
    await saveRsvp(name, attendance, guestCount);
    confirmMessage.textContent =
      attendance === "yes"
        ? `Đã ghi nhận ${name} tham dự cùng ${guests}.`
        : `Đã ghi nhận phản hồi của ${name}.`;
    confirmForm.reset();
  } catch (error) {
    console.error("Không lưu được xác nhận tham dự:", error);
    confirmMessage.textContent = `Chưa gửi được xác nhận: ${error.message}`;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }
});

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return map[char];
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && wishModal.classList.contains("open")) {
    hideWishModal();
    return;
  }

  if (event.key === "Escape" && giftModal.classList.contains("open")) {
    hideGiftModal();
    return;
  }

  if (!lightbox.classList.contains("open")) return;
  if (event.key === "Escape") hideLightbox();
  if (event.key === "ArrowLeft") setPhoto(currentPhoto - 1);
  if (event.key === "ArrowRight") setPhoto(currentPhoto + 1);
  if (event.key === "+" || event.key === "=") setLightboxZoom(lightboxScale + 0.25);
  if (event.key === "-") setLightboxZoom(lightboxScale - 0.25);
  if (event.key === "0") resetLightboxZoom();
});

renderCalendar();
updateCountdown();
playWeddingMusic();
startWishTicker();
loadWishes();
setInterval(updateCountdown, 1000);
