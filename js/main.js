/* ===== helpers ===== */
const enc = (p) => "assets/" + p.split("/").map(encodeURIComponent).join("/");
const encThumb = (p) => "thumbs/" + p.replace(/\.(jpg|jpeg|png)$/i, ".jpg").split("/").map(encodeURIComponent).join("/");
const byPrefix = (prefix) => MANIFEST.filter((m) => m.p.startsWith(prefix));
const fileName = (p) => p.split("/").pop().replace(/\.(jpg|jpeg|png)$/i, "");

/* natural-ish sort so "2 보정전" < "10 보정전" */
const nsort = (a, b) => a.p.localeCompare(b.p, "ko", { numeric: true });

/* ===== lightbox ===== */
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCaption = document.getElementById("lbCaption");
let lbList = [];
let lbIdx = 0;

function openLb(list, idx) {
  lbList = list;
  lbIdx = idx;
  renderLb();
  lb.hidden = false;
  document.body.style.overflow = "hidden";
}
function renderLb() {
  const item = lbList[lbIdx];
  lbImg.classList.toggle("fit", item.h / item.w <= 2.4);
  lbImg.src = enc(item.p);
  lbCaption.textContent = `${fileName(item.p)}  (${lbIdx + 1} / ${lbList.length})`;
}
function closeLb() {
  lb.hidden = true;
  lbImg.src = "";
  document.body.style.overflow = "";
}
lb.querySelector(".lb-close").addEventListener("click", closeLb);
lb.querySelector(".lb-prev").addEventListener("click", () => { lbIdx = (lbIdx - 1 + lbList.length) % lbList.length; renderLb(); });
lb.querySelector(".lb-next").addEventListener("click", () => { lbIdx = (lbIdx + 1) % lbList.length; renderLb(); });
lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lb-stage")) closeLb(); });
document.addEventListener("keydown", (e) => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") lb.querySelector(".lb-prev").click();
  if (e.key === "ArrowRight") lb.querySelector(".lb-next").click();
});

/* ===== tile / masonry builder ===== */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      const img = en.target;
      img.src = img.dataset.src;
      img.addEventListener("load", () => img.classList.add("loaded"), { once: true });
      io.unobserve(img);
    }
  });
}, { rootMargin: "600px" });

function buildMasonry(items, cols) {
  const wrap = document.createElement("div");
  wrap.className = `masonry cols-${cols}`;
  items.forEach((item, i) => {
    const tall = item.h / item.w > 2.4;
    const tile = document.createElement("figure");
    tile.className = "tile reveal" + (tall ? " tall" : "");
    const img = document.createElement("img");
    img.decoding = "async";
    img.dataset.src = encThumb(item.p);
    img.alt = fileName(item.p);
    if (!tall) img.style.aspectRatio = `${item.w} / ${item.h}`;
    tile.appendChild(img);
    if (tall) {
      const b = document.createElement("span");
      b.className = "badge";
      b.textContent = "FULL VIEW ↗";
      tile.appendChild(b);
    }
    tile.addEventListener("click", () => openLb(items, i));
    wrap.appendChild(tile);
    io.observe(img);
    revealer.observe(tile);
  });
  return wrap;
}

/* reveal on scroll */
const revealer = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("on"); revealer.unobserve(en.target); } });
}, { rootMargin: "60px" });

/* ===== DESIGN section ===== */
const DESIGN_PROJECTS = [
  { dir: "디자인/ZB1", title: "ZEROBASEONE", artist: "Album Promotion · SNS · On-site", cols: 4,
    desc: "‘GOOD SO BAD’ 활동기 바이럴 이미지, 숏터뷰 썸네일, 쇼케이스 현수막, 뮤비 조회수 축전, 인스타 필터, 콘서트 SNS 공지 등 프로모션 전반 디자인." },
  { dir: "디자인/Gaho/다이아몬드", title: "GAHO — Diamond", artist: "Album Art · Teaser · SNS", cols: 4,
    desc: "앨범 커버, 로고·자켓 티저, 리릭 포스터, 트랙리스트, MV 스틸컷, 폴라로이드 등 ‘Diamond’ 발매 프로모션 디자인." },
  { dir: "디자인/Gaho/온리유", title: "GAHO — Only You", artist: "Album Art · MV · Goods", cols: 4,
    desc: "‘Only You’ 온라인 커버와 MV 스틸컷 커버, 리릭 포스터, 마플샵 굿즈 디자인." },
  { dir: "디자인/기탁", title: "기탁 (GITAK)", artist: "Concert Branding · SNS", cols: 3,
    desc: "‘Beyond’ 콘서트 포스터·LED 송출 이미지·상세페이지, 비하인드 SNS 콘텐츠 디자인." },
  { dir: "디자인/유채훈", title: "유채훈", artist: "Content Design · SNS", cols: 3,
    desc: "‘유채훈의 음악세상’ 썸네일·크레딧, 콘서트/콘텐츠 비하인드 SNS 이미지." },
  { dir: "디자인/정엽x유채훈 ReFeel 콘서트", title: "정엽 × 유채훈 — ReFeel", artist: "Concert Branding", cols: 3,
    desc: "ReFeel 콘서트 포스터, 상세페이지, 현수막 디자인 및 현장 적용." },
  { dir: "디자인/임시완-팬콘", title: "임시완 팬콘서트", artist: "Fan Concert", cols: 3,
    desc: "팬 콘서트 메인 포스터·상세이미지(국문), 현수막 시안." },
  { dir: "디자인/디어유버블", title: "DearU bubble", artist: "App Promotion", cols: 3,
    desc: "디어유 버블 입점 아티스트 팝업·SNS 프로모션 이미지." },
  { dir: "디자인/라포엠", title: "LA POEM", artist: "Celebration", cols: 2,
    desc: "뮤직비디오 100만 뷰 축전 이미지." },
];

const designWrap = document.getElementById("designProjects");
DESIGN_PROJECTS.forEach((proj) => {
  const items = byPrefix(proj.dir + "/").sort(nsort);
  if (!items.length) return;

  const sec = document.createElement("div");
  sec.className = "project";
  sec.innerHTML = `
    <div class="project-head reveal">
      <h3>${proj.title}</h3><span class="artist">${proj.artist}</span>
    </div>
    <p class="project-desc reveal">${proj.desc}</p>`;
  revealer.observe(sec.querySelector(".project-head"));
  revealer.observe(sec.querySelector(".project-desc"));

  // split into direct files vs subfolders
  const depth = proj.dir.split("/").length;
  const direct = items.filter((m) => m.p.split("/").length === depth + 1);
  const subs = {};
  items.filter((m) => m.p.split("/").length > depth + 1).forEach((m) => {
    const key = m.p.split("/")[depth];
    (subs[key] = subs[key] || []).push(m);
  });

  if (direct.length) sec.appendChild(buildMasonry(direct, proj.cols));
  Object.keys(subs).sort().forEach((key) => {
    const label = document.createElement("div");
    label.className = "subgroup-label";
    label.textContent = key;
    sec.appendChild(label);
    sec.appendChild(buildMasonry(subs[key], proj.cols));
  });

  designWrap.appendChild(sec);
});

/* hero tags from project titles */
document.getElementById("heroTags").innerHTML =
  DESIGN_PROJECTS.map((p) => `<span>${p.title}</span>`).join("");

/* ===== PHOTO: before / after ===== */
const baGrid = document.getElementById("baGrid");
const baItems = byPrefix("Photo/보정 전_후/").sort(nsort);
const pairs = {};
baItems.forEach((m) => {
  const match = fileName(m.p).match(/^(\d+)\s*(보정전|보정후)$/);
  if (!match) return;
  const [, num, kind] = match;
  (pairs[num] = pairs[num] || {})[kind === "보정전" ? "before" : "after"] = m;
});
Object.keys(pairs).sort((a, b) => a - b).forEach((num) => {
  const pair = pairs[num];
  if (!pair.before || !pair.after) return;
  const el = document.createElement("div");
  el.className = "ba reveal";
  el.style.aspectRatio = `${pair.before.w} / ${pair.before.h}`;
  el.innerHTML = `
    <img class="base" data-src="${enc(pair.before.p)}" alt="보정 전">
    <div class="after-wrap"><img data-src="${enc(pair.after.p)}" alt="보정 후"></div>
    <div class="divider"></div>
    <span class="tag after">AFTER</span>
    <span class="tag before">BEFORE</span>`;
  baGrid.appendChild(el);
  el.querySelectorAll("img").forEach((img) => io.observe(img));
  revealer.observe(el);
  initBA(el);
});

function initBA(el) {
  const afterWrap = el.querySelector(".after-wrap");
  const divider = el.querySelector(".divider");

  const setPos = (clientX) => {
    const rect = el.getBoundingClientRect();
    let x = ((clientX - rect.left) / rect.width) * 100;
    x = Math.max(2, Math.min(98, x));
    afterWrap.style.clipPath = `inset(0 ${100 - x}% 0 0)`;
    divider.style.left = x + "%";
  };
  let dragging = false;
  el.addEventListener("pointerdown", (e) => { dragging = true; setPos(e.clientX); el.setPointerCapture(e.pointerId); });
  el.addEventListener("pointermove", (e) => { if (dragging) setPos(e.clientX); });
  el.addEventListener("pointerup", () => { dragging = false; });
}

/* ===== PHOTO: shooting & retouch galleries ===== */
const PHOTO_PROJECTS = [
  { dir: "Photo/촬영 및 보정/유채훈-포디움콘서트", title: "유채훈 — 포디움 콘서트", artist: "Shooting + Retouch", cols: 3,
    desc: "콘서트 현장 무대 촬영 및 셀렉·보정." },
  { dir: "Photo/촬영 및 보정/유채훈-일몬도비하인드", title: "유채훈 — Il Mondo Behind", artist: "Shooting + Retouch", cols: 3,
    desc: "무대 비하인드 촬영 및 셀렉·보정." },
  { dir: "Photo/촬영 및 보정/ZB1", title: "ZEROBASEONE — Behind", artist: "Shooting + Retouch", cols: 4,
    desc: "현장 스틸·영상 촬영 및 보정." },
  { dir: "Photo/사진 보정/ZB1", title: "ZEROBASEONE — Retouch", artist: "Retouch", cols: 4,
    desc: "현장 사진 리터칭 작업." },
  { dir: "Photo/사진 보정/시네마", title: "시네마 — 모비딕 · 청춘콘썰트", artist: "Retouch", cols: 3,
    desc: "‘모비딕’ 자켓, ‘청춘콘썰트’ 사진 보정." },
];

const photoWrap = document.getElementById("photoProjects");
PHOTO_PROJECTS.forEach((proj) => {
  const items = byPrefix(proj.dir + "/").sort(nsort);
  if (!items.length) return;
  const sec = document.createElement("div");
  sec.className = "project";
  sec.innerHTML = `
    <div class="project-head reveal">
      <h3>${proj.title}</h3><span class="artist">${proj.artist}</span>
    </div>
    <p class="project-desc reveal">${proj.desc}</p>`;
  revealer.observe(sec.querySelector(".project-head"));
  revealer.observe(sec.querySelector(".project-desc"));

  const depth = proj.dir.split("/").length;
  const direct = items.filter((m) => m.p.split("/").length === depth + 1);
  const subs = {};
  items.filter((m) => m.p.split("/").length > depth + 1).forEach((m) => {
    const key = m.p.split("/")[depth];
    (subs[key] = subs[key] || []).push(m);
  });
  if (direct.length) sec.appendChild(buildMasonry(direct, proj.cols));
  Object.keys(subs).sort().forEach((key) => {
    const label = document.createElement("div");
    label.className = "subgroup-label";
    label.textContent = key;
    sec.appendChild(label);
    sec.appendChild(buildMasonry(subs[key], proj.cols));
  });
  photoWrap.appendChild(sec);
});

/* ===== VIDEO thumbnails + motion ===== */
const thumbs = byPrefix("영상 썸네일/").sort(nsort);
const thumbGrid = document.getElementById("thumbGrid");
thumbGrid.replaceWith(buildMasonry(thumbs, 3));

const gitakVideo = document.getElementById("gitakVideo");
gitakVideo.addEventListener("error", () => {
  const wrap = gitakVideo.closest(".video-wrap");
  wrap.innerHTML = '<p class="video-missing">영상 준비 중입니다 — 유튜브 업로드 후 연결됩니다.</p>';
}, { once: true });
gitakVideo.src = enc("디자인/기탁/[기탁] 도영이의_도전_면허편(영상디자인).mp4");
