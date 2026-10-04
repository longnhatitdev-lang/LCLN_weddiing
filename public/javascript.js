// ==========================================
// XỬ LÝ NHẠC NỀN (AUTOPLAY + TẮT KHI RỜI TRANG)
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  const audio = document.getElementById("my_audio");
  const audioPlayBtn = document.getElementById("audio_play");
  const wrap = document.getElementById("wrap");

  if (!audio) return;

  let isManuallyPaused = false; // Cờ kiểm tra người dùng có cố tình bấm dừng nhạc không

  // Hàm phát nhạc
  function playAudio() {
    if (audio.paused && !isManuallyPaused) {
      audio
        .play()
        .then(() => {
          if (audioPlayBtn) audioPlayBtn.classList.add("playing");
          removeGlobalUnlockEvents();
        })
        .catch((error) => console.log("Lỗi phát nhạc:", error));
    }
  }

  // Hàm tạm dừng nhạc
  function pauseAudio() {
    if (!audio.paused) {
      audio.pause();
      if (audioPlayBtn) audioPlayBtn.classList.remove("playing");
    }
  }

  // 1. Kích hoạt nhạc KHI BẤM MỞ THIỆP
  if (wrap) {
    wrap.addEventListener("click", () => {
      isManuallyPaused = false;
      playAudio();
    });
  }

  // 2. Dự phòng: Mở nhạc khi có tương tác đầu tiên trên trang
  function unlockAudioOnInteraction() {
    playAudio();
  }

  function addGlobalUnlockEvents() {
    ["pointerdown", "touchstart", "click"].forEach((evt) => {
      document.addEventListener(evt, unlockAudioOnInteraction, {
        once: true,
        capture: true,
      });
    });
  }

  function removeGlobalUnlockEvents() {
    ["pointerdown", "touchstart", "click"].forEach((evt) => {
      document.removeEventListener(evt, unlockAudioOnInteraction, {
        capture: true,
      });
    });
  }

  addGlobalUnlockEvents();

  // 3. Nút Bật/Tắt nhạc trực tiếp
  if (audioPlayBtn) {
    audioPlayBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (audio.paused) {
        isManuallyPaused = false;
        playAudio();
      } else {
        isManuallyPaused = true; // Người dùng chủ động tắt -> Không tự phát lại khi chuyển tab
        pauseAudio();
      }
    });
  }

  // =========================================================
  // XỬ LÝ TẮT NHẠC KHI RỜI TRANG / THOÁT TAB / KHÓA MÀN HÌNH
  // =========================================================

  // A. Khi ẩn/hiện Tab (Page Visibility API)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseAudio(); // Ẩn tab / Rời trang -> Tắt nhạc
    } else {
      playAudio(); // Quay lại tab -> Tự phát tiếp (nếu trước đó không bấm tắt thủ công)
    }
  });

  // B. Dự phòng khi chuyển cửa sổ trình duyệt (Window Blur / Focus)
  window.addEventListener("blur", pauseAudio);
  window.addEventListener("focus", () => {
    if (!document.hidden) playAudio();
  });

  // C. Tắt nhạc triệt để khi đóng hẳn trang hoặc chuyển hướng link
  window.addEventListener("pagehide", pauseAudio);
});

// Đém ngược thời gian
// Countdown
document.addEventListener("DOMContentLoaded", function () {
  const card = document.querySelector(".countdown-card");
  const target = new Date(
    card?.dataset.weddingDate || "2026-12-28T08:00:00",
  ).getTime();
  function updateCountdown() {
    const left = target - Date.now();
    if (left < 0) {
      const title = document.querySelector(".countdown-title");
      if (title) title.textContent = "Đã diễn ra lễ cưới!";
      return;
    }
    const values = [
      Math.floor(left / 86400000),
      Math.floor((left % 86400000) / 3600000),
      Math.floor((left % 3600000) / 60000),
      Math.floor((left % 60000) / 1000),
    ];
    ["days", "hours", "minutes", "seconds"].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(values[i]).padStart(2, "0");
    });
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);
});

// Hiệu ứng mưa biểu tượng nền
const CONFIG = {
  PARTICLE_COUNT: 50,
  FALL_SPEED_MIN: 0.5,
  FALL_SPEED_RANDOM: 1.2,
  GRAVITY: 0.0015,
  POINTER_RADIUS: 100,
  METEOR_SPEED_X: 10,
  METEOR_SPEED_Y: 7,
};
const ICON_LIST = ["❤️", "💕", "💖", "💗", "💓", "✨", "🌸", "🌹"];
function createEmojiSprite(emoji, size) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d");
  context.font = `${size - 2}px serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(emoji, size / 2, size / 2);
  return canvas;
}
const rainCanvas = document.getElementById("rainCanvas");
const rainContext = rainCanvas?.getContext("2d", { alpha: true });
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
function resizeScreen() {
  if (!rainCanvas) return;
  screenWidth = rainCanvas.width = window.innerWidth;
  screenHeight = rainCanvas.height = window.innerHeight;
}
resizeScreen();
window.addEventListener("resize", resizeScreen);

const emojiSprites = ICON_LIST.map((e) => createEmojiSprite(e, 36));

const pointer = {
  x: -1000,
  y: -1000,
  lastX: -1000,
  lastY: -1000,
  velocityX: 0,
  velocityY: 0,
  radius: CONFIG.POINTER_RADIUS,
  radiusSq: CONFIG.POINTER_RADIUS * CONFIG.POINTER_RADIUS,
  isActive: false,
};
const updatePointer = (x, y) => {
  pointer.lastX = pointer.x;
  pointer.lastY = pointer.y;
  pointer.x = x;
  pointer.y = y;
  pointer.velocityX = x - pointer.lastX;
  pointer.velocityY = y - pointer.lastY;
  pointer.isActive = true;
  clearTimeout(pointer.hideTimer);
  pointer.hideTimer = setTimeout(() => (pointer.isActive = false), 120);
};
addEventListener("mousemove", (e) => updatePointer(e.clientX, e.clientY), {
  passive: true,
});
addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    updatePointer(e.touches[0].clientX, e.touches[0].clientY);
  },
  { passive: false },
);

class RainParticle {
  constructor() {
    this.reset(true);
  }
  reset(isFirst = false) {
    this.sprite = emojiSprites[(Math.random() * emojiSprites.length) | 0];
    this.x = Math.random() * screenWidth;
    this.y = isFirst ? Math.random() * screenHeight : -50;
    this.velocityX = (Math.random() - 0.5) * 0.8;
    this.velocityY =
      Math.random() * CONFIG.FALL_SPEED_RANDOM + CONFIG.FALL_SPEED_MIN;
    this.scale = Math.random() * 0.3 + 0.85;
  }
  update() {
    const dx = this.x - pointer.x,
      dy = this.y - pointer.y,
      distSq = dx * dx + dy * dy;
    if (distSq < pointer.radiusSq) {
      const dist = Math.sqrt(distSq) || 1;
      const force = (pointer.radius - dist) / pointer.radius;
      const nx = dx / dist,
        ny = dy / dist;
      this.velocityX += nx * force * 2.5 + pointer.velocityX * 0.3 * force;
      this.velocityY += ny * force * 2.5 + pointer.velocityY * 0.3 * force;
      this.x += nx * force * 5;
      this.y += ny * force * 5;
    }
    this.velocityX *= 0.985;
    this.velocityY += CONFIG.GRAVITY;
    this.x += this.velocityX;
    this.y += this.velocityY;
    if (this.y > screenHeight + 60) this.reset();
  }
  draw(ctx) {
    ctx.drawImage(
      this.sprite,
      this.x,
      this.y,
      this.sprite.width * this.scale,
      this.sprite.height * this.scale,
    );
  }
}
class ShootingStar {
  constructor() {
    this.isAlive = false;
  }
  launch() {
    this.isAlive = true;
    this.x = Math.random() * screenWidth * 0.4 - 100;
    this.y = -20;
    this.velocityX = CONFIG.METEOR_SPEED_X + Math.random() * 6;
    this.velocityY = CONFIG.METEOR_SPEED_Y + Math.random() * 4;
    this.trailLength = 0;
    this.life = 1;
  }
  update() {
    if (!this.isAlive) return;
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.trailLength = Math.min(200, this.trailLength + 12);
    this.velocityX *= 1.008;
    this.velocityY *= 1.008;
    if (
      this.x > screenWidth + 300 ||
      this.y > screenHeight + 300 ||
      this.life <= 0
    )
      this.isAlive = false;
  }
  draw(ctx) {
    if (!this.isAlive) return;
    ctx.save();
    ctx.globalAlpha = this.life;
    const grad = ctx.createLinearGradient(
      this.x,
      this.y,
      this.x - this.trailLength,
      this.y - this.trailLength * 0.5,
    );
    grad.addColorStop(0, "#fff");
    grad.addColorStop(1, "transparent");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.trailLength, this.y - this.trailLength * 0.5);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
const rainParticles = Array.from(
  { length: CONFIG.PARTICLE_COUNT },
  () => new RainParticle(),
);
const shootingStars = [new ShootingStar(), new ShootingStar()];
setInterval(() => {
  const dead = shootingStars.find((s) => !s.isAlive);
  if (dead && Math.random() < 0.7) dead.launch();
}, 2500);
shootingStars[0].launch();

function renderLoop() {
  if (!window.isPageActive) {
    window.globalAnimationFrameId = null;
    return;
  }
  rainContext.clearRect(0, 0, screenWidth, screenHeight);
  for (const p of rainParticles) {
    p.update();
    p.draw(rainContext);
  }
  for (const s of shootingStars) {
    s.update();
    s.draw(rainContext);
  }
  window.globalAnimationFrameId = requestAnimationFrame(renderLoop);
}
if (rainContext) {
  window.globalAnimationFrameId = requestAnimationFrame(renderLoop);
  window.resumeRain = () => {
    if (!window.globalAnimationFrameId) renderLoop();
  };
}

//hộp quà
const modalH = document.getElementById("qrModal");
document.getElementById("giftBox").onclick = () => modalH.classList.add("show");
document.getElementById("hintId").onclick = () => modalH.classList.add("show");
function closeGift() {
  modalH.classList.remove("show");
}
//  click ngoài  đóng
modalH.onclick = (e) => {
  if (e.target === modalH) closeGift();
};
async function copy(id, btn) {
  const txt = document.getElementById(id).innerText;
  await navigator.clipboard.writeText(txt);
  const old = btn.innerText;
  btn.innerText = "Đã copy STK";
  setTimeout(() => (btn.innerText = old), 2000);
}
// tải thẳng về máy
async function dl(id, name, btn) {
  const src = document.getElementById(id).src;
  const res = await fetch(src);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `QR-${name}.png`;
  a.click();
  btn.innerText = "Đã tải mã QR";
  URL.revokeObjectURL(url);
}

// intro thư mở đầu
// ==========================================
// XỬ LÝ INTRO MỞ THIỆP MƯỢT MÀ
// ==========================================
(function () {
  const intro = document.getElementById("intro"),
    wrap = document.getElementById("wrap"),
    letter = document.getElementById("letter"),
    stars = document.getElementById("stars");

  if (!wrap || !intro) return;

  let isOpening = false;
  let isOpened = false;

  const icons = ["❤️", "💖", "💕", "💗", "💓", "✨", "🌸", "🌹"];

  // Dải sao lấp lánh ở nền
  if (stars) {
    stars.innerHTML = "";
    for (let i = 0; i < 35; i++) {
      const s = document.createElement("div");
      s.className = "sparkle";
      s.textContent = ["✦", "✧", "✨"][i % 3];
      s.style.left = Math.random() * 100 + "vw";
      s.style.top = Math.random() * 100 + "vh";
      s.style.fontSize = 10 + Math.random() * 14 + "px";
      s.style.color = "#ffef9c";
      s.style.animationDelay = Math.random() * 2 + "s";
      stars.appendChild(s);
    }
  }

  // Hàm hiệu ứng pháo hoa tim bung tỏa
  function boom(x, y, count = 45) {
    for (let i = 0; i < count; i++) {
      const h = document.createElement("div");
      h.className = "h";
      h.textContent = icons[(Math.random() * icons.length) | 0];
      h.style.left = x + "px";
      h.style.top = y + "px";
      h.style.fontSize = 16 + Math.random() * 20 + "px";

      const angle = Math.random() * Math.PI * 2;
      const dist = 150 + Math.random() * 230;
      const rot = (Math.random() - 0.5) * 360 + "deg";
      const size = 0.8 + Math.random() * 0.8;

      h.style.setProperty("--angle", angle + "rad");
      h.style.setProperty("--dist", dist + "px");
      h.style.setProperty("--rot", rot);
      h.style.setProperty("--size", size);

      document.body.appendChild(h);

      setTimeout(() => h.remove(), 2200);
    }
  }

  // Sự kiện Click
  wrap.addEventListener("click", (e) => {
    if (isOpening) return;

    if (!isOpened) {
      // CLICK LẦN 1: MỞ THIỆP (Có tung pháo hoa)
      const cx = e.clientX || window.innerWidth / 2;
      const cy = e.clientY || window.innerHeight / 2;

      isOpening = true;
      wrap.classList.add("open");
      boom(cx, cy, 45); // Kích hoạt pháo hoa ở lần click 1

      // Đợi nắp lật (0.8s) + lá thư đâm lên (1.2s với delay 1s) = 2.2s kích hoạt nhún float
      setTimeout(() => {
        letter.classList.add("float");
        isOpened = true;
        isOpening = false;
      }, 2200);
    } else {
      // CLICK LẦN 2: CHUYỂN VÀO TRANG CHÍNH (Đã tắt pháo hoa)
      isOpening = true;
      intro.classList.add("hide");

      setTimeout(() => {
        intro.remove();

        // KÍCH HOẠT AUTO-SCROLL
        if (window.startAutoScroll) window.startAutoScroll();
      }, 800);
    }
  });
})();
// ok nhahhhhhhhhaaaaaaaaaaaaaaa
document.addEventListener("DOMContentLoaded", () => {
  const WEDDING_CONFIG = {
    url: "https://tmbjatndhwslcndgexqd.supabase.co",
    key: "sb_publishable_SQXElWQX6pUX0sdRbFvutw_BJaUlR4B",
  };
  const WEDDING_LIMIT = 3;
  let supabaseClient = null;
  try {
    if (typeof supabase !== "undefined") {
      supabaseClient = supabase.createClient(
        "https://tmbjatndhwslcndgexqd.supabase.co",
        "sb_publishable_SQXElWQX6pUX0sdRbFvutw_BJaUlR4B",
      );
    }
  } catch (e) {
    console.log(e);
  }
  // nhập lờI chúc
  const DOM = {
    wallList: document.getElementById("js-wall-list"),
    commentInput: document.getElementById("js-comment-input"),
    modalProfile: document.getElementById("js-modal-profile"),
    modalRsvp: document.getElementById("js-modal-rsvp"),
    toast: document.getElementById("js-toast"),
  };

  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[m],
    );
  const getP = () => {
    try {
      return JSON.parse(localStorage.getItem("wedding_profile_v2"));
    } catch {
      return null;
    }
  };
  const saveP = (p) =>
    localStorage.setItem("wedding_profile_v2", JSON.stringify(p));
  const toast = (msg) => {
    DOM.toast.innerText = msg;
    DOM.toast.style.display = "block";
    setTimeout(() => (DOM.toast.style.display = "none"), 3000);
  };

  function render(msg) {
    const el = document.createElement("div");
    el.className = `wall-message ${msg.side === "nha-trai" ? "wall-message--groom" : "wall-message--bride"}`;
    el.dataset.name = (msg.name || "").toLowerCase().trim();
    const phe = msg.side === "nha-trai" ? "🤵 Nhà trai" : "👰 Nhà gái";
    const badge =
      msg.status === "yes"
        ? `✅ Sẽ đến • ${msg.guests} khách`
        : msg.status === "no"
          ? `❌ Không đến được`
          : `💬 Lời chúc`;
    el.innerHTML = `<div style="display:flex;justify-content:space-between"><b>${esc(msg.name)}</b><small>${phe}</small></div><div style="font-size:13px;font-weight:600">${badge}</div><div>${esc(msg.message || "")}</div>`;
    DOM.wallList.appendChild(el);
    DOM.wallList.scrollTop = DOM.wallList.scrollHeight;
  }
  async function count(name) {
    const key = name.toLowerCase().trim();
    if (supabaseClient) {
      const { count } = await supabaseClient
        .from("wedding_wall")
        .select("*", { count: "exact", head: true })
        .ilike("name", key);
      return count || 0;
    }
    return [...DOM.wallList.querySelectorAll(".wall-message")].filter(
      (e) => e.dataset.name === key,
    ).length;
  }

  let tempSide = null;
  function checkLock() {
    const p = getP();
    if (!p) {
      DOM.commentInput.placeholder = "Bấm vào đây để nhập tên trước nhé!";
      DOM.commentInput.readOnly = true;
      DOM.commentInput.style.opacity = "0.6";
      return false;
    }
    DOM.commentInput.readOnly = false;
    DOM.commentInput.style.opacity = "1";
    DOM.commentInput.placeholder = "Nhập lời chúc...";
    return true;
  }
  checkLock();

  // OPEN MODAL
  document.getElementById("js-open-rsvp").addEventListener("click", () => {
    DOM.modalRsvp.classList.remove("is-hidden");
  });

  // CLOSE MODAL VIA BUTTON
  document.getElementById("js-close-rsvp").addEventListener("click", () => {
    DOM.modalRsvp.classList.add("is-hidden");
  });

  document.getElementById("js-done-rsvp").addEventListener("click", () => {
    DOM.modalRsvp.classList.add("is-hidden");
    document.getElementById("js-rsvp-content").classList.remove("is-hidden");
    document.getElementById("js-rsvp-success").classList.add("is-hidden");
  });

  // CLOSE MODAL WHEN CLICKING OUTSIDE (OVERLAY)
  DOM.modalRsvp.addEventListener("click", (e) => {
    // Nếu nhấp trực tiếp vào phần nền modalRsvp (không phải nội dung bên trong)
    if (e.target === DOM.modalRsvp) {
      DOM.modalRsvp.classList.add("is-hidden");
    }
  });
  document
    .getElementById("js-profile-groom")
    .addEventListener("click", function () {
      tempSide = "nha-trai";
      this.classList.add("is-active");
      document.getElementById("js-profile-bride").classList.remove("is-active");
      document
        .getElementById("js-profile-side-error")
        .classList.remove("is-show");
    });
  document
    .getElementById("js-profile-bride")
    .addEventListener("click", function () {
      tempSide = "nha-gai";
      this.classList.add("is-active");
      document.getElementById("js-profile-groom").classList.remove("is-active");
      document
        .getElementById("js-profile-side-error")
        .classList.remove("is-show");
    });
  document.getElementById("js-close-profile").addEventListener("click", () => {
    DOM.modalProfile.classList.add("is-hidden");
    checkLock();
  });
  DOM.commentInput.addEventListener("click", () => {
    if (!getP()) DOM.modalProfile.classList.remove("is-hidden");
  });
  DOM.commentInput.addEventListener("focus", (e) => {
    if (!getP()) {
      e.target.blur();
      DOM.modalProfile.classList.remove("is-hidden");
    }
  });

  document.getElementById("js-save-profile").addEventListener("click", () => {
    const name = document.getElementById("js-profile-name").value.trim();
    let ok = true;
    if (!name) {
      document.getElementById("js-profile-name-error").classList.add("is-show");
      ok = false;
    }
    if (!tempSide) {
      document.getElementById("js-profile-side-error").classList.add("is-show");
      ok = false;
    }
    if (!ok) return;
    saveP({ name, side: tempSide });
    document.getElementById("js-rsvp-name").value = name;
    DOM.modalProfile.classList.add("is-hidden");
    checkLock();
  });

  async function notifyTelegram(payload) {
    try {
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        console.warn(
          "Không gửi được Telegram:",
          result.error || response.status,
        );
      }
    } catch (error) {
      console.warn("Không kết nối được server Telegram:", error);
    }
  }
  async function sendLive() {
    const txt = DOM.commentInput.value.trim();
    if (!txt) return;
    if (!getP()) {
      DOM.modalProfile.classList.remove("is-hidden");
      return;
    }
    const p = getP();
    if ((await count(p.name)) >= WEDDING_LIMIT) {
      toast(`${p.name} đã đủ ${WEDDING_LIMIT} tin!`);
      return;
    }
    if (supabaseClient) {
      const { error } = await supabaseClient.from("wedding_wall").insert([
        {
          name: p.name,
          side: p.side,
          status: "live",
          guests: 0,
          message: txt,
        },
      ]);
      if (error) {
        toast(error.message);
        return;
      }
    } else render({ name: p.name, side: p.side, status: "live", message: txt });
    DOM.commentInput.value = "";
    void notifyTelegram({
      type: "wish",
      name: p.name,
      side: p.side,
      message: txt,
    });
  }
  document.getElementById("js-send-live").addEventListener("click", sendLive);
  DOM.commentInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendLive();
  });

  // RSVP
  let rsvpSide = null,
    rsvpStatus = null,
    rsvpCount = 1;
  document
    .getElementById("js-rsvp-groom")
    .addEventListener("click", function () {
      rsvpSide = "nha-trai";
      this.classList.add("is-active");
      document.getElementById("js-rsvp-bride").classList.remove("is-active");
    });
  document
    .getElementById("js-rsvp-bride")
    .addEventListener("click", function () {
      rsvpSide = "nha-gai";
      this.classList.add("is-active");
      document.getElementById("js-rsvp-groom").classList.remove("is-active");
    });
  document.getElementById("js-opt-yes").addEventListener("click", function () {
    rsvpStatus = "yes";
    this.classList.add("is-active");
    document.getElementById("js-opt-no").classList.remove("is-active");
    document.getElementById("js-group-qty").classList.remove("is-hidden");
  });
  document.getElementById("js-opt-no").addEventListener("click", function () {
    rsvpStatus = "no";
    this.classList.add("is-active");
    document.getElementById("js-opt-yes").classList.remove("is-active");
    document.getElementById("js-group-qty").classList.add("is-hidden");
  });
  document.getElementById("js-qty-plus").addEventListener("click", () => {
    if (rsvpCount < 20) {
      rsvpCount++;
      document.getElementById("js-qty-count").innerText = rsvpCount;
    }
  });
  document.getElementById("js-qty-minus").addEventListener("click", () => {
    if (rsvpCount > 1) {
      rsvpCount--;
      document.getElementById("js-qty-count").innerText = rsvpCount;
    }
  });
  document
    .getElementById("js-submit-rsvp")
    .addEventListener("click", async () => {
      const name = document.getElementById("js-rsvp-name").value.trim();
      const msg = document.getElementById("js-rsvp-msg").value.trim();
      if (!name || !rsvpSide || !rsvpStatus) {
        if (!name)
          document
            .getElementById("js-rsvp-name-error")
            .classList.add("is-show");
        if (!rsvpSide)
          document
            .getElementById("js-rsvp-side-error")
            .classList.add("is-show");
        if (!rsvpStatus)
          document
            .getElementById("js-rsvp-status-error")
            .classList.add("is-show");
        return;
      }
      if ((await count(name)) >= WEDDING_LIMIT) {
        toast(`Tên ${name} đã đủ ${WEDDING_LIMIT} tin!`);
        return;
      }
      const savedRecord = {
        name,
        side: rsvpSide,
        status: rsvpStatus,
        guests: rsvpStatus === "yes" ? rsvpCount : 0,
        message:
          msg ||
          (rsvpStatus === "yes"
            ? `Sẽ đến ${rsvpCount} khách`
            : "Không đến được"),
      };
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from("wedding_wall")
          .insert([savedRecord]);
        if (error) {
          toast(error.message);
          return;
        }
      } else render(savedRecord);
      void notifyTelegram({ type: "rsvp", ...savedRecord });
      saveP({ name, side: rsvpSide });
      checkLock();
      document.getElementById("js-rsvp-content").classList.add("is-hidden");
      document.getElementById("js-rsvp-success").classList.remove("is-hidden");
    });

  if (supabaseClient) {
    supabaseClient
      .from("wedding_wall")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(200)
      .then((r) => {
        if (r.data) r.data.forEach(render);
      });
    supabaseClient
      .channel("wall")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wedding_wall" },
        (p) => render(p.new),
      )
      .subscribe();
  }
});

// auto cuộn list
// ==========================================
// XỬ LÝ CUỘN TỰ ĐỘNG KHÔNG GIẬT LAG (GPU OPTIMIZED)
// ==========================================
(function () {
  const list = document.getElementById("js-wall-list");
  const btn = document.getElementById("toggleWallBtn");
  const wrap = document.getElementById("wrap");

  if (!list) return;

  let isHidden = false;
  let isUserInteracting = false;
  let userScrollTimer = null;
  let animFrameId = null;
  let endReachedTimer = null; // Timer chờ 3s khi cuộn tới cuối

  // Tốc độ cuộn: số pixel nhích trong mỗi frame (0.4 - 0.8 là mượt và từ từ nhất)
  const SCROLL_SPEED = 0.6;

  // Hàm ẩn lời chúc và cập nhật Nút
  function hideWallList() {
    isHidden = true;
    list.classList.add("is-hidden");
    if (btn) btn.textContent = "👀 Hiện lời chúc";
    stopAutoScroll();
  }

  // Hàm lặp cuộn mượt bằng requestAnimationFrame
  function startAutoScroll() {
    if (animFrameId) cancelAnimationFrame(animFrameId);

    function step() {
      if (!window.isPageActive) {
        animFrameId = null;
        return;
      }
      // Chỉ cuộn khi danh sách không ẩn và người dùng không chạm/lướt tay
      if (!isHidden && !isUserInteracting) {
        const maxScroll = list.scrollHeight - list.clientHeight;

        // Cho phép dung sai 1-2px do làm tròn pixel trên các màn hình khác nhau
        if (list.scrollTop < maxScroll - 1) {
          list.scrollTop += SCROLL_SPEED;

          // Nếu người dùng cuộn ngược lại lên trên, hủy timer 3s (nếu có)
          if (endReachedTimer) {
            clearTimeout(endReachedTimer);
            endReachedTimer = null;
          }
        } else {
          // Đã cuộn đến lời chúc cuối cùng
          if (!endReachedTimer) {
            endReachedTimer = setTimeout(() => {
              hideWallList();
              endReachedTimer = null;
            }, 3000); // Chờ 3s rồi tự động ẩn
          }
        }
      }
      animFrameId = requestAnimationFrame(step);
    }

    animFrameId = requestAnimationFrame(step);
  }

  function stopAutoScroll() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (endReachedTimer) {
      clearTimeout(endReachedTimer);
      endReachedTimer = null;
    }
  }

  // 1. Lắng nghe tương tác người dùng (Chạm/Lướt) để tạm dừng cuộn ngay lập tức
  const handleUserTouch = () => {
    isUserInteracting = true;
    if (userScrollTimer) clearTimeout(userScrollTimer);
    if (endReachedTimer) {
      clearTimeout(endReachedTimer);
      endReachedTimer = null;
    }

    // Sau 3 giây không tương tác nữa -> Tự động cuộn tiếp xuống cuối
    userScrollTimer = setTimeout(() => {
      isUserInteracting = false;
    }, 3000);
  };

  // Sử dụng passive: true để không chặn luồng cuộn của trình duyệt
  list.addEventListener("touchstart", handleUserTouch, { passive: true });
  list.addEventListener("wheel", handleUserTouch, { passive: true });
  list.addEventListener("pointerdown", handleUserTouch, { passive: true });

  // 2. Kích hoạt khi KHÁCH BẤM MỞ THIỆP
  if (wrap) {
    wrap.addEventListener("click", () => {
      setTimeout(() => {
        list.scrollTop = 0; // Đưa về đầu (lời chúc cũ)
        isUserInteracting = false;
        startAutoScroll(); // Bắt đầu cuộn từ từ xuống
      }, 1000);
    });
  }

  // 3. Tự khởi chạy nếu mở thẳng (không qua intro) hoặc Supabase tải xong
  const observer = new MutationObserver(() => {
    const intro = document.getElementById("intro");
    if ((!intro || intro.classList.contains("hide")) && !animFrameId) {
      startAutoScroll();
    }
  });
  observer.observe(list, { childList: true, subtree: true });

  // 4. Bắt sự kiện Nút Ẩn/Hiện
  if (btn) {
    btn.addEventListener("click", () => {
      isHidden = !isHidden;

      if (isHidden) {
        hideWallList();
      } else {
        list.classList.remove("is-hidden");
        btn.textContent = "🙈 Ẩn lời chúc";

        setTimeout(() => {
          list.scrollTop = 0;
          isUserInteracting = false;
          startAutoScroll();
        }, 300);
      }
    });
  }
})();

// ==========================================
// TỰ ĐỘNG CUỘN TRANG auto cuộn trang (SMOOTH AUTO-SCROLL PAGE)
(function () {
  let velocity = 1; // Vận tốc cuộn hiện tại (px / frame)
  let baseSpeed = 1; // Tốc độ cuộn tự động tối thiểu khi hết đà
  let friction = 0.96; // Hệ số ma sát giảm đà (0.95 - 0.98 là mượt nhất)
  let isTouching = false;
  let animId = null;

  let lastY = 0;
  let lastTime = 0;

  // Hàm vòng lặp cuộn liên tục (Animation Loop)
  function scrollLoop() {
    if (!window.isPageActive) {
      animId = null;
      return;
    }
    // Nếu người dùng không giữ tay trên màn hình
    if (!isTouching) {
      const currentScroll =
        window.scrollY || document.documentElement.scrollTop;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      // Giảm dần vận tốc theo ma sát
      velocity *= friction;

      // Nếu đà cuộn giảm xuống thấp hơn tốc độ chuẩn -> Duy trì tốc độ cuộn tự động
      if (Math.abs(velocity) < baseSpeed) {
        velocity = velocity >= 0 ? baseSpeed : -baseSpeed;
      }

      // Đã chạm đáy hoặc chạm đỉnh -> Dừng cuộn
      if (
        (velocity > 0 && currentScroll >= maxScroll - 1) ||
        (velocity < 0 && currentScroll <= 0)
      ) {
        velocity = 0;
        cancelAnimationFrame(animId);
        animId = null;
        return;
      }

      // Cuộn trang theo vận tốc hiện tại
      window.scrollBy(0, velocity);
    }

    animId = requestAnimationFrame(scrollLoop);
  }

  // Khởi chạy hệ thống tự động cuộn
  window.startAutoScroll = function () {
    if (!animId) {
      if (Math.abs(velocity) < baseSpeed) velocity = baseSpeed;
      animId = requestAnimationFrame(scrollLoop);
    }
  };
  window.resumePageScroll = window.startAutoScroll;

  // Hàm dừng cuộn
  window.stopAutoScroll = function () {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    velocity = 0;
  };

  // 1. Theo dõi thao tác VUỐT TAY (Touch Screen / Mobile)
  window.addEventListener(
    "touchstart",
    (e) => {
      isTouching = true;
      lastY = e.touches[0].clientY;
      lastTime = performance.now();
    },
    { passive: true },
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      const currentY = e.touches[0].clientY;
      const currentTime = performance.now();
      const deltaY = lastY - currentY; // Vuốt lên -> Delta dương -> Cuộn xuống
      const deltaTime = currentTime - lastTime;

      if (deltaTime > 0) {
        // Tính vận tốc thực tế dựa trên độ dài & thời gian vuốt
        velocity = (deltaY / deltaTime) * 16; // Quy đổi về khung hình ~60fps
      }

      lastY = currentY;
      lastTime = currentTime;
    },
    { passive: true },
  );

  window.addEventListener(
    "touchend",
    () => {
      isTouching = false;
      window.startAutoScroll(); // Tiếp tục cuộn NGAY LẬP TỨC theo đà vừa vuốt
    },
    { passive: true },
  );

  // 2. Theo dõi thao tác LĂN CHUỘT (Mouse Wheel / Desktop)
  window.addEventListener(
    "wheel",
    (e) => {
      // Kế thừa lực lăn chuột (lăn nhanh -> vận tốc cao)
      velocity =
        e.deltaY > 0
          ? Math.max(velocity, e.deltaY * 0.15)
          : Math.min(velocity, e.deltaY * 0.15);
      window.startAutoScroll();
    },
    { passive: true },
  );

  // 3. Dừng cuộn hoàn toàn khi người dùng Click / Tap vào màn hình
  document.addEventListener("click", () => {
    window.stopAutoScroll();
  });
})();
// ==========================================
//  ĐÓNG BĂNG TOÀN BỘ HIỆU ỨNG KHÔNG CHẠY NGẦM
// ==========================================
(function () {
  window.isPageActive = true;

  function freezeProject() {
    window.isPageActive = false;
    // Tạm dừng mọi CSS Animation & Transition toàn trang
    document.body.classList.add("freeze-effects");

    // Dừng vòng lặp requestAnimationFrame (nếu trong code của bạn có sử dụng)
    if (window.globalAnimationFrameId) {
      cancelAnimationFrame(window.globalAnimationFrameId);
      window.globalAnimationFrameId = null;
    }
  }

  function unfreezeProject() {
    window.isPageActive = true;
    // Khôi phục lại toàn bộ CSS Animation
    document.body.classList.remove("freeze-effects");

    // Khôi phục vòng lặp JS
    if (typeof window.resumeRain === "function") window.resumeRain();
    if (typeof window.resumePageScroll === "function")
      window.resumePageScroll();

    if (typeof window.resumeAppLoops === "function") {
      window.resumeAppLoops();
    }
  }

  // Lắng nghe sự kiện chuyển tab / ẩn trang từ trình duyệt
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      freezeProject();
    } else {
      unfreezeProject();
    }
  });
})();
const widgetWrapper = document.getElementById("js-wedding-widget");
const widgetToggle = document.getElementById("js-widget-toggle");
const btnShareMain = document.getElementById("js-btn-share-main");
const btnContactMain = document.getElementById("js-btn-contact-main");
const copyBtn = document.getElementById("js-copy-link");

// Click Trái Tim -> Mở/Đóng Cấp 1
widgetToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  widgetWrapper.classList.toggle("open-main");
  widgetWrapper.classList.remove("open-share", "open-contact");
});

// Click Share Cấp 1 -> Bật/Tắt Cấp 2 Share
btnShareMain.addEventListener("click", (e) => {
  e.stopPropagation();
  if (widgetWrapper.classList.contains("open-share")) {
    widgetWrapper.classList.remove("open-share");
  } else {
    widgetWrapper.classList.add("open-share");
    widgetWrapper.classList.remove("open-contact");
  }
});

// Click Contact Cấp 1 -> Bật/Tắt Cấp 2 Contact
btnContactMain.addEventListener("click", (e) => {
  e.stopPropagation();
  if (widgetWrapper.classList.contains("open-contact")) {
    widgetWrapper.classList.remove("open-contact");
  } else {
    widgetWrapper.classList.add("open-contact");
    widgetWrapper.classList.remove("open-share");
  }
});

// Click ngoài Widget -> Đóng toàn bộ
document.addEventListener("click", (e) => {
  if (!widgetWrapper.contains(e.target)) {
    widgetWrapper.classList.remove("open-main", "open-share", "open-contact");
  }
});

// Copy link
copyBtn.addEventListener("click", async (e) => {
  e.stopPropagation();
  try {
    await navigator.clipboard.writeText(window.location.href);
  } catch (err) {}

  const icon = copyBtn.querySelector("i");
  icon.className = "fa-solid fa-check";
  copyBtn.classList.add("copied");

  setTimeout(() => {
    widgetWrapper.classList.remove("open-main", "open-share", "open-contact");
    setTimeout(() => {
      icon.className = "fa-regular fa-copy";
      copyBtn.classList.remove("copied");
    }, 300);
  }, 400);
});

// GALARY AMBUM ẢNH VÀ SLICK SLIDER
document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------------------------------------------------
  // 1. CHỨC NĂNG LIGHTBOX MODAL (XEM ẢNH + VUỐT SANG TRÁI/PHẢI + ĐẾM SỐ)
  // ----------------------------------------------------------------------
  const modal = document.getElementById("imageViewerModal");
  const modalImg = modal?.querySelector(".js-lightbox-display-img");
  const closeBtn = modal?.querySelector(".js-lightbox-close");
  const prevBtnLightbox = modal?.querySelector(".js-lightbox-prev");
  const nextBtnLightbox = modal?.querySelector(".js-lightbox-next");
  const counterEl = modal?.querySelector(".js-lightbox-counter");

  let activeImageList = []; // Danh sách các ảnh của nhóm đang mở
  let activeImageIndex = 0; // Vị trí ảnh hiện tại

  const updateLightboxContent = () => {
    if (!activeImageList.length || !modalImg) return;
    const currentData = activeImageList[activeImageIndex];
    modalImg.src = currentData.src;
    modalImg.alt = currentData.alt || "Ảnh phóng to";

    if (counterEl) {
      counterEl.textContent = `${activeImageIndex + 1} / ${activeImageList.length}`;
    }
  };

  const openLightboxGroup = (imageList, startIndex = 0) => {
    if (!imageList || !imageList.length) return;
    activeImageList = imageList;
    activeImageIndex = startIndex;
    updateLightboxContent();
    modal?.classList.add("is-active");
  };

  const closeModal = () => {
    modal?.classList.remove("is-active");
  };

  const showNextLightbox = () => {
    if (!activeImageList.length) return;
    activeImageIndex = (activeImageIndex + 1) % activeImageList.length;
    updateLightboxContent();
  };

  const showPrevLightbox = () => {
    if (!activeImageList.length) return;
    activeImageIndex =
      (activeImageIndex - 1 + activeImageList.length) % activeImageList.length;
    updateLightboxContent();
  };

  closeBtn?.addEventListener("click", closeModal);
  nextBtnLightbox?.addEventListener("click", showNextLightbox);
  prevBtnLightbox?.addEventListener("click", showPrevLightbox);

  modal?.addEventListener("click", (e) => {
    if (
      e.target === modal ||
      e.target.classList.contains("lightbox-modal__container")
    ) {
      closeModal();
    }
  });

  // Bàn phím điều hướng
  document.addEventListener("keydown", (e) => {
    if (!modal?.classList.contains("is-active")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") showPrevLightbox();
    if (e.key === "ArrowRight") showNextLightbox();
  });

  // Vuốt (Touch Swipe) trên Lightbox Popup
  let touchStartX = 0;
  let touchEndX = 0;

  modal?.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true },
  );

  modal?.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleLightboxSwipe();
    },
    { passive: true },
  );

  const handleLightboxSwipe = () => {
    const swipeThreshold = 40; // Độ dài vuốt tối thiểu
    if (touchEndX < touchStartX - swipeThreshold) {
      showNextLightbox(); // Vuốt sang trái -> Xem ảnh tiếp
    } else if (touchEndX > touchStartX + swipeThreshold) {
      showPrevLightbox(); // Vuốt sang phải -> Xem ảnh trước
    }
  };

  // ----------------------------------------------------------------------
  // 2. XỬ LÝ EVENT CLICK CHO GALLERY GRID (TỰ ĐỘNG GỘP NHÓM ẢNH GALLERY)
  // ----------------------------------------------------------------------
  document.addEventListener("click", (e) => {
    const clickedImg = e.target.closest(
      ".gallery-grid[data-lightbox] .gallery-grid__image",
    );
    if (clickedImg) {
      const galleryContainer = clickedImg.closest(".gallery-grid");
      const allImgs = Array.from(
        galleryContainer.querySelectorAll(".gallery-grid__image"),
      );

      // Tạo danh sách ảnh riêng cho Gallery này
      const galleryList = allImgs.map((img) => ({
        src: img.src,
        alt: img.alt,
      }));

      const clickedIndex = allImgs.indexOf(clickedImg);
      openLightboxGroup(galleryList, clickedIndex !== -1 ? clickedIndex : 0);
    }
  });

  // ----------------------------------------------------------------------
  // 3. 3D SLIDER LOGIC (AUTO 1S + SWIPE + PAUSE ON HOVER + DOTS)
  // ----------------------------------------------------------------------
  const stage = document.getElementById("stage");

  // Nếu quản trị viên đã đổi ảnh slider thì dùng lại (tránh ghi đè khi tải lại).
  const savedSlides = stage
    ? Array.from(stage.querySelectorAll(".slide img"))
        .map((img, index) => ({
          src: img.getAttribute("src"),
          alt: img.getAttribute("alt") || `Slider ${index + 1}`,
        }))
        .filter((slide) => slide.src)
    : [];

  const slidesData = savedSlides.length
    ? savedSlides
    : [
        { src: "./asset/img/mau1.webp", alt: "Slider 1" },
        { src: "./asset/img/mau13.webp", alt: "Slider 2" },
        { src: "./asset/img/mau2.webp", alt: "Slider 3" },
        { src: "./asset/img/mau13.webp", alt: "Slider 4" },
        { src: "./asset/img/mau1.webp", alt: "Slider 5" },
        { src: "./asset/img/mau2.webp", alt: "Slider 6" },
        { src: "./asset/img/mau13.webp", alt: "Slider 7" },
      ];

  let currentIndex = Math.max(0, Math.min(3, slidesData.length - 1));
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const sliderWrapper = document.getElementById("weddingSlider");
  const dotsContainer = document.getElementById("sliderDots");

  // Khởi tạo Carousel & Render Dots
  const renderCarousel = () => {
    if (!stage) return;

    // 1. Render Slides (Giữ nguyên class "slide")
    if (!stage.querySelector(".slide")) {
      const fragment = document.createDocumentFragment();

      slidesData.forEach((slide, index) => {
        const slideEl = document.createElement("div");
        slideEl.className = "slide";
        slideEl.dataset.index = index;
        slideEl.innerHTML = `<img src="${slide.src}" alt="${slide.alt}">`;
        fragment.appendChild(slideEl);
      });

      stage.appendChild(fragment);
    }

    // 2. Render Dots (Tạo theo style class ngắn gọn của code cũ)
    if (dotsContainer) {
      dotsContainer.innerHTML = "";
      const dotsFragment = document.createDocumentFragment();

      slidesData.forEach((_, index) => {
        const dot = document.createElement("span");
        dot.className = "dot";
        dot.dataset.index = index;
        if (index === currentIndex) dot.classList.add("active");

        // Click vào dot chuyển tới slide tương ứng
        dot.addEventListener("click", () => {
          currentIndex = index;
          updateCarousel();
        });

        dotsFragment.appendChild(dot);
      });

      dotsContainer.appendChild(dotsFragment);
    }
  };

  const updateCarousel = () => {
    if (!stage) return;
    const slideElements = stage.querySelectorAll(".slide");
    const total = slidesData.length;

    // Cập nhật slide (Giữ nguyên logic & class cũ)
    slideElements.forEach((slide, index) => {
      let offset = index - currentIndex;

      if (offset < -3) offset += total;
      if (offset > 3) offset -= total;

      slide.className = "slide";

      if (offset === 0) {
        slide.classList.add("active");
      } else if (offset < 0) {
        slide.classList.add("left", `left-${Math.abs(offset)}`);
      } else if (offset > 0) {
        slide.classList.add("right", `right-${offset}`);
      }
    });

    // Cập nhật trạng thái active cho Dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll(".dot");
      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
      });
    }
  };

  const nextSlide = () => {
    currentIndex = (currentIndex + 1) % slidesData.length;
    updateCarousel();
  };

  const prevSlide = () => {
    currentIndex = (currentIndex - 1 + slidesData.length) % slidesData.length;
    updateCarousel();
  };

  prevBtn?.addEventListener("click", prevSlide);
  nextBtn?.addEventListener("click", nextSlide);

  // --- CHỨC NĂNG AUTO PLAY (3 GIÂY) ---
  let autoPlayTimer = null;

  const startAutoPlay = () => {
    if (!autoPlayTimer) {
      autoPlayTimer = setInterval(nextSlide, 3000);
    }
  };

  const stopAutoPlay = () => {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  };

  sliderWrapper?.addEventListener("mouseenter", stopAutoPlay);
  sliderWrapper?.addEventListener("mouseleave", startAutoPlay);

  // Bắt sự kiện Click ảnh trong 3D Slider
  stage?.addEventListener("click", (e) => {
    const slide = e.target.closest(".slide");
    if (!slide) return;

    const index = parseInt(slide.dataset.index, 10);

    if (index === currentIndex) {
      openLightboxGroup(slidesData, index);
    } else {
      currentIndex = index;
      updateCarousel();
    }
  });

  // Touch Swipe cho Slider
  let sliderTouchStartX = 0;
  let sliderTouchEndX = 0;

  sliderWrapper?.addEventListener(
    "touchstart",
    (e) => {
      stopAutoPlay();
      sliderTouchStartX = e.changedTouches[0].screenX;
    },
    { passive: true },
  );

  sliderWrapper?.addEventListener(
    "touchend",
    (e) => {
      sliderTouchEndX = e.changedTouches[0].screenX;
      const threshold = 30;
      if (sliderTouchEndX < sliderTouchStartX - threshold) {
        nextSlide();
      } else if (sliderTouchEndX > sliderTouchStartX + threshold) {
        prevSlide();
      }
      startAutoPlay();
    },
    { passive: true },
  );

  // Khởi chạy
  renderCarousel();
  updateCarousel();
  startAutoPlay();
});
///////////// SLIDER DỌC/////////////////////// câu chuyện tình yêu
(function () {
  "use strict";

  // Dataset
  const lclnSlides = [
    {
      title: "Pavilion",
      description:
        "Open-concept wooden ceiling villa framed with seamless dark basalt floors and framed outdoor lounge spaces.",
      image: "./asset/img/mau1.webp",
    },
    {
      title: "Minimalist",
      description:
        "High-contrast geometric living room render balancing low-profile luxury furniture with natural morning lighting.",
      image: "./asset/img/mau13.webp",
    },
    {
      title: "Cantilever",
      description:
        "Overhanging concrete structural design incorporating infinity pool reflections and floor-to-ceiling glass paneling.",
      image: "./asset/img/mau2.webp",
    },
    {
      title: "Horizon",
      description:
        "Low-slung minimalist glass facade overlooking tranquil waters with warm interior ambient accent lighting.",
      image: "./asset/img/mau1.webp",
    },
    {
      title: "Monolith",
      description:
        "Raw concrete exterior featuring precision linear geometry and sheltered interior courtyard gardens.",
      image: "./asset/img/mau13.webp",
    },
  ];

  // State management variables
  let lclnCurrentIndex = 0;
  let lclnLightboxIndex = 0;
  let lclnIsLightboxOpen = false;

  // DOM Cache
  const lclnCarouselEl = document.getElementById("lcln-verticalCarousel");
  const lclnDotsContainer = document.getElementById("lcln-dotsContainer");
  const lclnCardTitle = document.getElementById("lcln-cardTitle");
  const lclnCardDescription = document.getElementById("lcln-cardDescription");

  const lclnUpBtn = document.getElementById("lcln-upBtn");
  const lclnDownBtn = document.getElementById("lcln-downBtn");

  // Lightbox Cache
  const lclnModal = document.getElementById("lcln-fullscreenModal");
  const lclnFullscreenImg = document.getElementById("lcln-fullscreenImg");
  const lclnLightboxCounter = document.getElementById("lcln-lightboxCounter");
  const lclnCloseModalBtn = document.getElementById("lcln-closeModalBtn");
  const lclnLightboxPrevBtn = document.getElementById("lcln-lightboxPrevBtn");
  const lclnLightboxNextBtn = document.getElementById("lcln-lightboxNextBtn");

  function init() {
    renderCards();
    renderDots();
    updateSliderState();
    bindEvents();
  }

  function renderCards() {
    lclnCarouselEl.innerHTML = "";
    lclnSlides.forEach((slide, idx) => {
      const card = document.createElement("div");
      card.className = "lcln-slide-card";
      card.dataset.index = idx;

      const img = document.createElement("img");
      img.src = slide.image;
      img.alt = slide.title;

      card.appendChild(img);

      card.addEventListener("click", () => {
        if (idx === lclnCurrentIndex) {
          openLightbox(idx);
        } else {
          goToSlide(idx);
        }
      });

      lclnCarouselEl.appendChild(card);
    });
  }

  function renderDots() {
    lclnDotsContainer.innerHTML = "";
    lclnSlides.forEach((_, idx) => {
      const dot = document.createElement("div");
      dot.className = `lcln-dot-indicator ${idx === lclnCurrentIndex ? "lcln-active" : ""}`;
      dot.addEventListener("click", () => goToSlide(idx));
      lclnDotsContainer.appendChild(dot);
    });
  }

  function updateSliderState() {
    const total = lclnSlides.length;
    const prevIndex = (lclnCurrentIndex - 1 + total) % total;
    const nextIndex = (lclnCurrentIndex + 1) % total;

    const cards = lclnCarouselEl.children;
    Array.from(cards).forEach((card, idx) => {
      card.className = "lcln-slide-card";

      if (idx === lclnCurrentIndex) {
        card.classList.add("lcln-active");
      } else if (idx === prevIndex) {
        card.classList.add("lcln-prev");
      } else if (idx === nextIndex) {
        card.classList.add("lcln-next");
      } else {
        card.classList.add("lcln-hidden-stack");
      }
    });

    // Update Dots
    Array.from(lclnDotsContainer.children).forEach((dot, idx) => {
      dot.classList.toggle("lcln-active", idx === lclnCurrentIndex);
    });

    // Update Red Card Content with smooth opacity sequence
    const data = lclnSlides[lclnCurrentIndex];
    lclnCardTitle.style.opacity = "0";
    lclnCardTitle.style.transform = "translateY(6px)";
    lclnCardDescription.style.opacity = "0";

    setTimeout(() => {
      lclnCardTitle.textContent = data.title;
      lclnCardDescription.textContent = data.description;

      lclnCardTitle.style.opacity = "1";
      lclnCardTitle.style.transform = "translateY(0)";
      lclnCardDescription.style.opacity = "1";
    }, 150);
  }

  function goToSlide(index) {
    lclnCurrentIndex = index;
    updateSliderState();
  }

  function prevSlide() {
    lclnCurrentIndex =
      (lclnCurrentIndex - 1 + lclnSlides.length) % lclnSlides.length;
    updateSliderState();
  }

  function nextSlide() {
    lclnCurrentIndex = (lclnCurrentIndex + 1) % lclnSlides.length;
    updateSliderState();
  }

  function openLightbox(idx) {
    lclnLightboxIndex = idx !== undefined ? idx : lclnCurrentIndex;
    lclnIsLightboxOpen = true;
    updateLightboxContent();

    lclnModal.classList.add("lcln-show");
  }

  function closeLightbox() {
    lclnIsLightboxOpen = false;
    lclnModal.classList.remove("lcln-show");
  }

  function updateLightboxContent() {
    const slide = lclnSlides[lclnLightboxIndex];

    lclnFullscreenImg.style.opacity = "0.3";
    lclnFullscreenImg.style.transform = "scale(0.97)";

    setTimeout(() => {
      lclnFullscreenImg.src = slide.image;
      lclnFullscreenImg.alt = slide.title;
      lclnLightboxCounter.textContent = `${lclnLightboxIndex + 1} / ${lclnSlides.length}`;

      lclnFullscreenImg.style.opacity = "1";
      lclnFullscreenImg.style.transform = "scale(1)";
    }, 120);
  }

  function lightboxNext(e) {
    if (e) e.stopPropagation();
    lclnLightboxIndex = (lclnLightboxIndex + 1) % lclnSlides.length;
    updateLightboxContent();
    goToSlide(lclnLightboxIndex);
  }

  function lightboxPrev(e) {
    if (e) e.stopPropagation();
    lclnLightboxIndex =
      (lclnLightboxIndex - 1 + lclnSlides.length) % lclnSlides.length;
    updateLightboxContent();
    goToSlide(lclnLightboxIndex);
  }

  function bindEvents() {
    lclnUpBtn.addEventListener("click", prevSlide);
    lclnDownBtn.addEventListener("click", nextSlide);

    lclnCloseModalBtn.addEventListener("click", closeLightbox);
    lclnLightboxNextBtn.addEventListener("click", lightboxNext);
    lclnLightboxPrevBtn.addEventListener("click", lightboxPrev);

    // Click Outside Lightbox Image to Close
    lclnModal.addEventListener("click", (e) => {
      const isImg = e.target === lclnFullscreenImg;
      const isNavBtn = e.target.closest(".lcln-lightbox-nav-btn");
      const isCloseBtn = e.target.closest("#lcln-closeModalBtn");

      if (!isImg && !isNavBtn && !isCloseBtn) {
        closeLightbox();
      }
    });

    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      if (lclnIsLightboxOpen) {
        if (e.key === "ArrowRight") lightboxNext();
        if (e.key === "ArrowLeft") lightboxPrev();
        if (e.key === "Escape") closeLightbox();
      } else {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") nextSlide();
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") prevSlide();
      }
    });

    // Mouse Wheel Navigation Debounced
    let isWheelDebounced = false;
    window.addEventListener(
      "wheel",
      (e) => {
        if (isWheelDebounced || lclnIsLightboxOpen) return;
        if (e.deltaY > 20) {
          nextSlide();
          triggerDebounce();
        } else if (e.deltaY < -20) {
          prevSlide();
          triggerDebounce();
        }
      },
      { passive: true },
    );

    function triggerDebounce() {
      isWheelDebounced = true;
      setTimeout(() => (isWheelDebounced = false), 650);
    }
  }

  // Initialize App on DOM ready
  document.addEventListener("DOMContentLoaded", init);
})();
