/* Quản trị thiệp cưới - admin.js
   - Sửa trực tiếp nội dung (bật/tắt) ngay trong bản xem trước.
   - Đổi ảnh qua thư viện ảnh (bấm ảnh bất kỳ hoặc nút "Đổi ảnh").
   - Quản lý slider, lịch, đếm ngược, bản đồ, hộp quà mừng. */
(() => {
  const login = document.querySelector('#login');
  const workspace = document.querySelector('#workspace');
  const frame = document.querySelector('#preview');
  const statusEl = document.querySelector('#status');

  let password = '';
  let editing = false;
  let dirty = false;
  let pickingImage = false;
  let boundDoc = null;

  const msg = (t) => { statusEl.textContent = t || ''; };
  const esc = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');

  async function api(url, opt = {}) {
    const response = await fetch(url, {
      ...opt,
      headers: { 'x-admin-password': password, ...(opt.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Lỗi máy chủ');
    return data;
  }

  document.querySelector('#loginForm').onsubmit = async (e) => {
    e.preventDefault();
    password = document.querySelector('#password').value;
    try {
      await api('/api/admin-html');
      login.hidden = true;
      workspace.hidden = false;
      loadPreview();
    } catch (error) {
      document.querySelector('#message').textContent = error.message;
    }
  };

  // ---------------------------------------------------------------
  // Nạp bản xem trước: chờ iframe sẵn sàng (KHÔNG chờ tải hết ảnh/nhạc)
  // ---------------------------------------------------------------
  function loadPreview() {
    boundDoc = null;
    editing = false;
    pickingImage = false;
    updateEditButton();
    updatePickButton();
    frame.onload = () => waitReady(0);
    frame.src = '/';
    waitReady(0);
  }

  function waitReady(tries) {
    const d = frame.contentDocument;
    const ready = d && d.body && d.querySelector('main')
      && (d.readyState === 'interactive' || d.readyState === 'complete');
    if (ready) {
      if (d !== boundDoc) setup(d);
      return;
    }
    if (tries < 1200) setTimeout(() => waitReady(tries + 1), 40);
  }
  function setup(d) {
    boundDoc = d;
    d.body.classList.add('admin-preview');
    d.querySelectorAll('main > section').forEach((section, index) => {
      section.dataset.adminSection = index;
      if (!section.querySelector('.admin-delete')) {
        const button = d.createElement('button');
        button.type = 'button';
        button.textContent = '✕ Xóa khối';
        button.className = 'admin-delete';
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (confirm('Xóa section này?')) { section.remove(); dirty = true; msg('Đã xóa khối, hãy lưu thay đổi'); }
        });
        section.appendChild(button);
      }
    });
    d.addEventListener('click', onDocumentClick, true);
    injectPanelStyle(d);
  }

  function injectPanelStyle(d) {
    if (d.getElementById('admin-injected-style')) return;
    const style = d.createElement('style');
    style.id = 'admin-injected-style';
    style.textContent = `
.admin-preview main>section{position:relative}
.admin-preview .admin-delete{display:none;position:absolute;right:8px;top:8px;background:#b11;color:#fff;border:0;border-radius:6px;padding:5px 9px;cursor:pointer;font:600 12px Arial;z-index:2147483000;margin:0}
.admin-preview.admin-editing .admin-delete{display:block}
.admin-preview.admin-editing *{animation-play-state:paused!important;transition:none!important}
.admin-preview.admin-editing [contenteditable="true"]{outline:2px dashed #8f2335;background:rgba(255,255,255,.4);user-select:text!important;-webkit-user-select:text!important;cursor:text}
.admin-preview.admin-pick img{cursor:crosshair!important;pointer-events:auto!important;outline:2px dashed #d4ac0d}
.admin-preview .admin-panel{position:fixed;z-index:2147483647;right:14px;top:14px;width:min(420px,92vw);max-height:88vh;overflow:auto;background:#fff;color:#222;padding:16px;border:2px solid #8f2335;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.45);font:14px/1.45 Arial,sans-serif}
.admin-preview .admin-panel .admin-panel-title{display:block;font-size:16px;margin:0 30px 10px 0;color:#8f2335}
.admin-preview .admin-panel .close{position:absolute;right:10px;top:8px;width:32px;height:32px;padding:0;background:#eee;color:#333;border:0;border-radius:8px;font-size:20px;line-height:1;cursor:pointer;margin:0}
.admin-preview .admin-panel label{display:block;font-weight:600;margin:9px 0 3px}
.admin-preview .admin-panel input,.admin-preview .admin-panel select{display:block;width:100%;padding:8px;margin:2px 0 6px;border:1px solid #ccc;border-radius:8px;font:14px Arial;box-sizing:border-box}
.admin-preview .admin-panel .apply{width:100%;margin-top:12px;background:#8f2335;color:#fff;border:0;border-radius:8px;padding:11px;font-weight:600;cursor:pointer}
.admin-preview .admin-panel .apply:hover{background:#6f1525}
.admin-preview .admin-panel .admin-hint{font-size:12.5px;color:#666;margin:6px 0}
.admin-preview .admin-lib{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:6px;margin:8px 0;max-height:46vh;overflow:auto;padding:2px}
.admin-preview .admin-lib .lib{padding:0;border:2px solid transparent;border-radius:8px;overflow:hidden;cursor:pointer;background:#f2f2f2;height:84px}
.admin-preview .admin-lib .lib.active{border-color:#8f2335}
.admin-preview .admin-lib .lib img{width:100%;height:100%;object-fit:cover;display:block}
.admin-preview .admin-upload{display:block;background:#8f2335;color:#fff;padding:10px;text-align:center;border-radius:8px;cursor:pointer;font-weight:600;margin-top:6px}
.admin-preview .admin-upload input{display:none}
.admin-preview .admin-slide-row{display:grid;grid-template-columns:54px 1fr auto auto;gap:5px;align-items:center;margin:6px 0}
.admin-preview .admin-slide-row img{width:54px;height:54px;object-fit:cover;border-radius:6px}
.admin-preview .admin-slide-row input{margin:0}
.admin-preview .admin-slide-row button{padding:7px 9px;border:0;border-radius:6px;background:#8f2335;color:#fff;cursor:pointer;margin:0}
.admin-preview .admin-slide-row button.del{background:#b11}`;
    d.head.appendChild(style);
  }

  function updateEditButton() {
    document.querySelector('#edit').textContent = editing ? '✅ Tắt sửa trực tiếp' : '✏️ Bật sửa trực tiếp';
  }
  function updatePickButton() {
    document.querySelector('#pickimg').textContent = pickingImage ? '🖼️ Đang chọn ảnh…' : '🖼️ Đổi ảnh';
  }
  // ---------------------------------------------------------------
  // Bắt sự kiện click trong bản xem trước
  // ---------------------------------------------------------------
  function onDocumentClick(e) {
    const target = e.target;
    if (target.closest && target.closest('.admin-panel')) return; // thao tác trên panel
    if (!editing) return;

    const img = target.closest('img');
    if (img) { e.preventDefault(); e.stopPropagation(); openLibrary(img); stopPick(); return; }

    const section = target.closest('main > section');
    if (!section) return;

    if (target.closest('#stage,.wedding')) { e.preventDefault(); e.stopPropagation(); panelSlider(section); return; }
    if (target.closest('.gift-sec,#qrModal')) { e.preventDefault(); e.stopPropagation(); panelGift(section); return; }
    if (target.closest('.content_map')) { e.preventDefault(); e.stopPropagation(); panelMap(section); return; }
    if (target.closest('.calendar-card')) { e.preventDefault(); e.stopPropagation(); panelCalendar(section); return; }
    if (target.closest('.countdown-card')) { e.preventDefault(); e.stopPropagation(); panelCountdown(section); return; }
    if (target.closest('a,button,input,textarea,select,iframe,label')) return;

    const el = target.closest('h1,h2,h3,h4,h5,h6,p,span,strong,b,em,li,small,td,th');
    if (!el || el.isContentEditable) return;
    e.preventDefault();
    e.stopPropagation();
    el.contentEditable = 'true';
    el.focus();
    el.addEventListener('blur', () => { el.contentEditable = 'false'; dirty = true; }, { once: true });
  }

  function stopPick() {
    if (!pickingImage) return;
    pickingImage = false;
    if (frame.contentDocument) frame.contentDocument.body.classList.remove('admin-pick');
    updatePickButton();
    msg('');
  }

  function popup(title, html, save) {
    const d = frame.contentDocument;
    const panel = d.createElement('div');
    panel.className = 'admin-panel';
    panel.innerHTML = '<b class="admin-panel-title">' + esc(title) + '</b>'
      + '<button type="button" class="close">×</button>'
      + '<div class="admin-panel-body">' + html + '</div>'
      + (save ? '<button type="button" class="apply">Áp dụng</button>' : '');
    d.body.appendChild(panel);
    panel.querySelector('.close').onclick = () => panel.remove();
    if (save) {
      panel.querySelector('.apply').onclick = () => {
        save(panel);
        dirty = true;
        panel.remove();
        msg('Đã áp dụng, hãy lưu thay đổi');
      };
    }
    return panel;
  }
  // ---------------------------------------------------------------
  // Panel: lịch, đếm ngược, bản đồ, hộp quà
  // ---------------------------------------------------------------
  function renderCalendar(card) {
    const month = Number(card.dataset.month || 12);
    const year = Number(card.dataset.year || 2026);
    const weddingDay = Number(card.dataset.weddingDay || 28);
    const header = card.querySelector('.calendar-header');
    const grid = card.querySelector('.calendar-grid');
    if (!grid) return;
    if (header) {
      const m = header.querySelector('.month');
      const y = header.querySelector('.year');
      if (m) m.textContent = 'Tháng ' + month;
      if (y) y.textContent = year;
    }
    const names = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
    const first = (new Date(year, month - 1, 1).getDay() + 6) % 7;
    const total = new Date(year, month, 0).getDate();
    grid.innerHTML = names.map((x) => '<span class="day-name">' + x + '</span>').join('')
      + Array.from({ length: first }, () => '<span class="day-item empty"></span>').join('')
      + Array.from({ length: total }, (_, i) => '<span class="day-item' + (i + 1 === weddingDay ? ' wedding-day' : '') + '">' + (i + 1) + '</span>').join('');
  }

  function panelCalendar(section) {
    const card = section.querySelector('.calendar-card');
    if (!card) return;
    popup('Lịch cưới',
      '<label>Tháng<input id="cal-m" type="number" min="1" max="12" value="' + esc(card.dataset.month || 12) + '"></label>'
      + '<label>Năm<input id="cal-y" type="number" value="' + esc(card.dataset.year || 2026) + '"></label>'
      + '<label>Ngày cưới<input id="cal-d" type="number" min="1" max="31" value="' + esc(card.dataset.weddingDay || 28) + '"></label>',
      (panel) => {
        card.dataset.month = panel.querySelector('#cal-m').value;
        card.dataset.year = panel.querySelector('#cal-y').value;
        card.dataset.weddingDay = panel.querySelector('#cal-d').value;
        renderCalendar(card);
      });
  }

  function panelCountdown(section) {
    const card = section.querySelector('.countdown-card');
    if (!card) return;
    const value = card.dataset.weddingDate || '2026-12-28T08:00';
    popup('Đồng hồ đếm ngược',
      '<label>Ngày giờ cưới<input id="cd-v" type="datetime-local" value="' + esc(value) + '"></label>',
      (panel) => { card.dataset.weddingDate = panel.querySelector('#cd-v').value; });
  }

  function panelMap(section) {
    const link = section.querySelector('.wedding-btn');
    const map = section.querySelector('.map_iframe');
    popup('Bản đồ & chỉ đường',
      '<label>Link chỉ đường<input id="map-l" value="' + esc(link ? link.getAttribute('href') : '') + '"></label>'
      + '<label>Địa chỉ cho bản đồ<input id="map-q" placeholder="Nhập địa chỉ mới"></label>',
      (panel) => {
        if (link) link.setAttribute('href', panel.querySelector('#map-l').value);
        const q = panel.querySelector('#map-q').value.trim();
        if (q && map) map.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&output=embed';
      });
  }

  function panelGift(section) {
    const modal = section.querySelector('#qrModal');
    if (!modal) return;
    const title = modal.querySelector('.modal_hed h5');
    const stk1 = modal.querySelector('#stk1');
    const bank1 = modal.querySelector('#bank1');
    const stk2 = modal.querySelector('#stk2');
    const bank2 = modal.querySelector('#bank2');
    const text = (n) => (n ? n.textContent : '');
    popup('Hộp quà mừng',
      '<label>Tiêu đề<input id="gift-t" value="' + esc(text(title)) + '"></label>'
      + '<label>STK chú rể<input id="gift-a" value="' + esc(text(stk1)) + '"></label>'
      + '<label>Ngân hàng chú rể<input id="gift-b" value="' + esc(text(bank1)) + '"></label>'
      + '<label>STK cô dâu<input id="gift-c" value="' + esc(text(stk2)) + '"></label>'
      + '<label>Ngân hàng cô dâu<input id="gift-d" value="' + esc(text(bank2)) + '"></label>',
      (panel) => {
        if (title) title.textContent = panel.querySelector('#gift-t').value;
        if (stk1) stk1.textContent = panel.querySelector('#gift-a').value;
        if (bank1) bank1.textContent = panel.querySelector('#gift-b').value;
        if (stk2) stk2.textContent = panel.querySelector('#gift-c').value;
        if (bank2) bank2.textContent = panel.querySelector('#gift-d').value;
      });
  }
  // ---------------------------------------------------------------
  // Panel: slider ảnh
  // ---------------------------------------------------------------
  function slideRowHTML(src) {
    return '<div class="admin-slide-row"><img src="' + esc(src) + '" alt="">'
      + '<input value="' + esc(src) + '" placeholder="URL ảnh">'
      + '<button type="button" class="pick">Chọn</button>'
      + '<button type="button" class="del">Xóa</button></div>';
  }

  function panelSlider(section) {
    const stage = section.querySelector('#stage');
    if (!stage) return;
    const rows = [...stage.querySelectorAll('img')].map((img) => slideRowHTML(img.getAttribute('src') || ''));
    const panel = popup('Quản lý slider ảnh',
      '<div id="slide-rows">' + (rows.join('') || '<p class="admin-hint">Chưa có ảnh.</p>') + '</div>'
      + '<button type="button" id="add-slide" style="width:100%;background:#8f2335;color:#fff;border:0;border-radius:8px;padding:10px;font-weight:600;cursor:pointer;margin-bottom:4px">＋ Thêm ảnh</button>'
      + '<p class="admin-hint">Bấm "Chọn" để lấy ảnh từ thư viện, rồi bấm "Áp dụng".</p>',
      (p) => {
        const urls = [...p.querySelectorAll('.admin-slide-row input')].map((x) => x.value.trim()).filter(Boolean);
        stage.innerHTML = urls.map((url, i) => '<div class="slide" data-index="' + i + '"><img src="' + esc(url) + '" alt="Ảnh cưới"></div>').join('');
      });
    const rowsBox = panel.querySelector('#slide-rows');
    const bind = (row) => {
      row.querySelector('.del').onclick = () => row.remove();
      row.querySelector('.pick').onclick = () => openLibrary(null, (url) => {
        row.querySelector('input').value = url;
        row.querySelector('img').src = url;
      });
    };
    panel.querySelectorAll('.admin-slide-row').forEach(bind);
    panel.querySelector('#add-slide').onclick = () => {
      const wrap = frame.contentDocument.createElement('div');
      wrap.innerHTML = slideRowHTML('');
      const row = wrap.firstElementChild;
      if (rowsBox.querySelector('.admin-hint')) rowsBox.innerHTML = '';
      rowsBox.appendChild(row);
      bind(row);
    };
  }

  // ---------------------------------------------------------------
  // Thư viện ảnh: chọn ảnh có sẵn hoặc tải ảnh mới
  // ---------------------------------------------------------------
  async function openLibrary(imgEl, onApply) {
    const current = imgEl ? (imgEl.getAttribute('src') || '') : '';
    let panel;
    const apply = (url) => {
      if (onApply) onApply(url);
      else if (imgEl) imgEl.setAttribute('src', url);
      dirty = true;
      if (panel) panel.remove();
      msg('Đã cập nhật ảnh, hãy lưu thay đổi');
    };
    panel = popup('Thư viện ảnh',
      '<label class="admin-upload">Tải ảnh mới từ máy<input id="lib-file" type="file" accept="image/*"></label>'
      + '<div class="admin-hint">Hoặc bấm một ảnh bên dưới để cập nhật ngay.</div>'
      + '<div class="admin-lib" id="lib-grid">Đang tải…</div>',
      null);
    const grid = panel.querySelector('#lib-grid');
    panel.querySelector('#lib-file').onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const data = await api('/api/admin-upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl: reader.result }) });
          apply(data.url);
        } catch (error) { msg(error.message); }
      };
      reader.readAsDataURL(file);
    };
    try {
      const data = await api('/api/admin-images');
      const images = data.images || [];
      if (!images.length) { grid.textContent = 'Chưa có ảnh nào.'; return; }
      grid.innerHTML = images.map((url) =>
        '<button type="button" class="lib' + (url === current ? ' active' : '') + '" data-url="' + esc(url) + '"><img src="' + esc(url) + '" alt=""></button>'
      ).join('');
      grid.querySelectorAll('.lib').forEach((btn) => {
        btn.onclick = () => apply(btn.getAttribute('data-url'));
      });
    } catch (error) {
      grid.textContent = 'Lỗi: ' + error.message;
    }
  }
  // ---------------------------------------------------------------
  // Thanh công cụ
  // ---------------------------------------------------------------
  document.querySelector('#edit').onclick = () => {
    editing = !editing;
    const d = frame.contentDocument;
    if (d && d.body) d.body.classList.toggle('admin-editing', editing);
    if (!editing) {
      pickingImage = false;
      if (d && d.body) d.body.classList.remove('admin-pick');
      updatePickButton();
    }
    updateEditButton();
    msg(editing ? 'Đã bật sửa trực tiếp: bấm vào chữ để sửa, bấm vào ảnh để đổi ảnh.' : '');
  };

  document.querySelector('#pickimg').onclick = () => {
    const d = frame.contentDocument;
    if (!editing) {
      editing = true;
      if (d && d.body) d.body.classList.add('admin-editing');
      updateEditButton();
    }
    pickingImage = !pickingImage;
    if (d && d.body) d.body.classList.toggle('admin-pick', pickingImage);
    updatePickButton();
    msg(pickingImage ? 'Bấm vào ảnh bất kỳ trong bản xem trước để đổi ảnh.' : '');
  };

  document.querySelector('#add').onclick = () => {
    const d = frame.contentDocument;
    if (!d || !d.querySelector('main')) return;
    const section = d.createElement('section');
    section.innerHTML = '<h2>Tiêu đề mới</h2><p>Bấm để sửa nội dung.</p>';
    const button = d.createElement('button');
    button.type = 'button';
    button.textContent = '✕ Xóa khối';
    button.className = 'admin-delete';
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm('Xóa section này?')) { section.remove(); dirty = true; }
    });
    section.appendChild(button);
    d.querySelector('main').appendChild(section);
    dirty = true;
    msg('Đã thêm khối mới, hãy lưu thay đổi');
  };

  document.querySelector('#reload').onclick = () => { dirty = false; loadPreview(); msg(''); };

  document.querySelector('#save').onclick = async () => {
    try {
      const d = frame.contentDocument;
      d.querySelectorAll('[contenteditable]').forEach((x) => x.removeAttribute('contenteditable'));
      d.querySelectorAll('.admin-delete,.admin-panel').forEach((x) => x.remove());
      const injected = d.getElementById('admin-injected-style');
      if (injected) injected.remove();
      d.body.classList.remove('admin-editing', 'admin-preview', 'admin-pick');
      d.querySelectorAll('main > section').forEach((x) => { x.removeAttribute('data-admin-section'); });
      const html = '<!doctype html>\n' + d.documentElement.outerHTML;
      await api('/api/admin-html', { method: 'PUT', headers: { 'Content-Type': 'text/plain' }, body: html });
      dirty = false;
      msg('Đã lưu thành công');
      loadPreview();
    } catch (error) {
      msg(error.message);
    }
  };

  window.onbeforeunload = (e) => {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  };
})();
