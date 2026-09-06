/* ===== helpers ===== */
const enc = (p) => "assets/" + p.split("/").map(encodeURIComponent).join("/");
const encThumb = (p) => "thumbs/" + p.replace(/\.(jpg|jpeg|png)$/i, ".jpg").split("/").map(encodeURIComponent).join("/");
const byPrefix = (prefix) => MANIFEST.filter((m) => m.p.startsWith(prefix));
const fileName = (p) => p.split("/").pop().replace(/\.(jpg|jpeg|png)$/i, "");

/* natural-ish sort so "2 보정전" < "10 보정전" */
const nsort = (a, b) => a.p.localeCompare(b.p, "ko", { numeric: true });

/* explicit ordering: patterns earlier in the list come first */
function orderItems(items, order) {
  if (!order) return items.sort(nsort);
  const rank = (m) => {
    const i = order.findIndex((k) => m.p.includes(k));
    return i === -1 ? order.length : i;
  };
  return items.sort((a, b) => rank(a) - rank(b) || nsort(a, b));
}

/* ===== external links (사진 클릭 → 5초 뒤 이동) ===== */
const LINKS = [
  ["디자인/ZB1/GoodsoBad숏터뷰", "https://youtu.be/h_donwG_DE8?si=QSEhEKCtDkdjqQ5w"],
  ["Photo/사진 보정/시네마/[시네마] 모비딕", "https://m.blog.naver.com/PostView.naver?blogId=moss-music&logNo=223753042572&navType=by"],
  ["Photo/사진 보정/시네마/[시네마] 청춘콘썰트", "https://m.blog.naver.com/PostView.naver?blogId=moss-music&logNo=223753042311&navType=by"],
  ["영상 썸네일/EP.1", "https://www.instagram.com/reel/Co9az1aj0Q0/?igsi=MWZwbWluODAzdWUwcg=="],
  ["디자인/Gaho/다이아몬드/2. 자켓티저 1-", "https://www.instagram.com/p/CphaneOJR-D/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA=="],
  ["디자인/Gaho/다이아몬드/2. 자켓티저 2-", "https://www.instagram.com/p/Cpj_6x4vBtI/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA=="],
  ["디자인/Gaho/다이아몬드/2. 자켓티저 3-", "https://www.instagram.com/p/CpmkNNbJ-6R/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA=="],
  ["디자인/Gaho/다이아몬드/리릭포스터", "https://www.instagram.com/p/Cpw3YaMp4tg/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA=="],
  ["디자인/Gaho/다이아몬드/MV-스틸컷", "https://www.instagram.com/p/CqC49VPve2Z/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA=="],
  ["디자인/Gaho/다이아몬드/마플샵 굿즈/", "https://www.instagram.com/p/Cqpg7wpPcaj/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA=="],
  ["디자인/Gaho/온리유/MV-스틸컷-커버1", "https://www.instagram.com/p/CkSrRx8pbZC/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA=="],
  ["디자인/Gaho/온리유/MV-스틸컷-커버2", "https://www.instagram.com/p/CkVQECTps27/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA=="],
  ["디자인/Gaho/온리유/MV-스틸컷-커버3", "https://www.instagram.com/p/CksbN9TP4as/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA=="],
  ["디자인/Gaho/온리유/Lyrics-포스터", "https://www.instagram.com/p/CkvAAuFJk4T/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA=="],
  ["디자인/Gaho/온리유/1_02_", "https://www.instagram.com/p/CkvAAuFJk4T/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA=="],
  ["디자인/Gaho/온리유/2_02_", "https://www.instagram.com/p/CkvAAuFJk4T/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA=="],
  ["디자인/Gaho/온리유/3_02_", "https://www.instagram.com/p/CkvAAuFJk4T/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA=="],
  ["디자인/Gaho/온리유/마플샵 굿즈/", "https://www.instagram.com/p/ClGMccxhVM8/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA=="],
  ["Photo/촬영 및 보정/ZB1/", "https://www.instagram.com/p/C_QEaH-pMR5/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA=="],
];
const linkFor = (p) => {
  const hit = LINKS.find(([prefix]) => p.startsWith(prefix));
  return hit ? hit[1] : null;
};

/* ===== lightbox ===== */
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCaption = document.getElementById("lbCaption");
const lbLinkbar = document.getElementById("lbLinkbar");
let lbList = [];
let lbIdx = 0;
let lbTimer = null;

function clearLbTimer() {
  if (lbTimer) { clearInterval(lbTimer); lbTimer = null; }
  lbLinkbar.hidden = true;
  lbLinkbar.innerHTML = "";
}

function openLb(list, idx) {
  lbList = list;
  lbIdx = idx;
  renderLb();
  lb.hidden = false;
  document.body.style.overflow = "hidden";
}
function renderLb() {
  clearLbTimer();
  const item = lbList[lbIdx];
  lbImg.classList.toggle("fit", item.h / item.w <= 2.4);
  lbImg.src = enc(item.p);
  lbCaption.textContent = `${fileName(item.p)}  (${lbIdx + 1} / ${lbList.length})`;

  const url = linkFor(item.p);
  if (url) {
    let sec = 5;
    lbLinkbar.hidden = false;
    const draw = () => {
      lbLinkbar.innerHTML =
        `<a href="${url}" target="_blank" rel="noopener">관련 게시물 보러가기 ↗</a>` +
        `<span class="count">${sec}초 후 자동 이동</span>`;
    };
    draw();
    lbTimer = setInterval(() => {
      sec--;
      if (sec <= 0) {
        clearInterval(lbTimer);
        lbTimer = null;
        const w = window.open(url, "_blank", "noopener");
        if (w) {
          lbLinkbar.innerHTML = `<a href="${url}" target="_blank" rel="noopener">새 탭에서 열렸습니다 ↗</a>`;
        } else {
          window.location.href = url; // 팝업 차단 시 현재 탭으로 이동
        }
      } else draw();
    }, 1000);
  }
}
function closeLb() {
  clearLbTimer();
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
    if (linkFor(item.p)) {
      const l = document.createElement("span");
      l.className = "badge link-badge";
      l.textContent = "LINK";
      tile.appendChild(l);
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

/* static .reveal elements (About 등) */
document.querySelectorAll(".reveal").forEach((el) => revealer.observe(el));

/* ===== project renderer (Design / Photo 공용) ===== */
function renderProject(proj, mount) {
  const items = byPrefix(proj.dir + "/");
  if (!items.length) return;

  const sec = document.createElement("div");
  sec.className = "project";
  sec.innerHTML = `
    <div class="project-head reveal">
      <h3>${proj.title}</h3><span class="artist">${proj.artist}</span>
      ${proj.post ? `<a class="post-link" href="${proj.post}" target="_blank" rel="noopener">포스트 보러가기 ↗</a>` : ""}
    </div>
    <p class="project-desc reveal">${proj.desc}</p>
    ${proj.note ? `<p class="project-note reveal">${proj.note}</p>` : ""}`;
  sec.querySelectorAll(".reveal").forEach((el) => revealer.observe(el));

  // split into direct files vs subfolders
  const depth = proj.dir.split("/").length;
  const direct = orderItems(items.filter((m) => m.p.split("/").length === depth + 1), proj.order);
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
    sec.appendChild(buildMasonry(subs[key].sort(nsort), proj.subCols || proj.cols));
  });

  mount.appendChild(sec);
}

/* ===== DESIGN section ===== */
const DESIGN_PROJECTS = [
  { dir: "디자인/ZB1", title: "ZEROBASEONE", artist: "Album Promotion · SNS · On-site", cols: 4,
    desc: "인스타 필터(제로니), 콘서트 SNS 공지, 지비티빙 롯데월드 공지와 ‘GOOD SO BAD’ 활동기 바이럴 이미지, 현수막, 축전, 쇼케이스 영상 디자인, 활동 마무리 디자인 등 프로모션 전반 디자인.",
    order: [
      "인스타필터",
      "콘서트 SNS 공지",
      "지비티빙",
      "GoodsoBad 바이럴",
      "GoodsoBad 쇼케이스 현수막",
      "GoodsoBad뮤비조회수축전",
      "ZB1 미니 4집 팬쇼케이스",
      "ZB1-미니-4집-팬쇼케이스",
      "GoodsoBad활동마무리",
      "GoodsoBad숏터뷰",
    ] },
  { dir: "디자인/Gaho/다이아몬드", title: "GAHO — Diamond", artist: "Album Art · Teaser · SNS · Goods", cols: 4,
    desc: "앨범 커버, 로고·자켓 티저, 트랙리스트, MV 스틸컷, 리릭 포스터, 폴라로이드, 상세이미지, SNS 및 마플샵 굿즈 등 ‘Diamond’ 발매 프로모션 디자인.",
    note: "선물 같은 앨범의 다이아몬드 시리즈를 잘 보여준 앨범이라고 생각합니다. 천 위에 다이아몬드, 티저 이미지에서 천 속의 가호를 보여줌으로 주인공을 나타내었습니다. 다이아몬드의 특성을 살린 다이아몬드로 바라보는 가호를 묘사할 수 있게 잔상 효과의 티저를 제작하였습니다. 타이틀 곡 ‘Love Me’의 도입 테이프 감기는 소리를 연상케하는 분위기의 이미지를 흑백으로 나타내었습니다. 리릭포스터에도 이 점을 접목시켜 필름 효과를 사용하였습니다. 앨범 기획부터 티저 촬영 컨셉, 프로모션 이미지 제작까지 담당하였습니다. 이 전 앨범인 ‘Only You’, ‘Diamond’ 두가지 앨범의 결을 맞춰가며 인정을 받으며 마무리한 앨범입니다.",
    order: [
      "앨범커버",
      "1. 로고 티저",
      "2. 자켓티저",
      "트랙리스트",
      "MV-스틸컷",
      "리릭포스터",
      "폴라포이드",
      "상세이미지",
      "SNS-",
    ] },
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
DESIGN_PROJECTS.forEach((proj) => renderProject(proj, designWrap));

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
    desc: "콘서트 현장 무대 촬영 및 셀렉·보정.",
    post: "https://m.blog.naver.com/PostView.naver?blogId=moss-music&logNo=223753041888&navType=by" },
  { dir: "Photo/촬영 및 보정/유채훈-일몬도비하인드", title: "유채훈 — Il Mondo Behind", artist: "Shooting + Retouch", cols: 3,
    desc: "무대 비하인드 촬영 및 셀렉·보정.",
    post: "https://m.blog.naver.com/PostView.naver?blogId=moss-music&logNo=223753041787&navType=by" },
  { dir: "Photo/촬영 및 보정/ZB1", title: "ZEROBASEONE — Behind", artist: "Shooting + Retouch", cols: 4,
    desc: "‘GoodsoBad’ MV·마담피가로 화보 현장 스틸 및 영상 촬영, 보정.",
    order: ["GoodsoBad MV 비하인드", "마담피가로 화보 비하인드"] },
  { dir: "Photo/사진 보정/ZB1", title: "ZEROBASEONE — Retouch", artist: "Retouch", cols: 4,
    desc: "현장 사진 리터칭 작업." },
  { dir: "Photo/사진 보정/시네마", title: "시네마 — 모비딕 · 청춘콘썰트", artist: "Retouch", cols: 3,
    desc: "‘모비딕’ 자켓, ‘청춘콘썰트’ 사진 보정." },
];

const photoWrap = document.getElementById("photoProjects");
PHOTO_PROJECTS.forEach((proj) => renderProject(proj, photoWrap));

/* ===== VIDEO thumbnails ===== */
const thumbs = byPrefix("영상 썸네일/").sort(nsort);
const thumbGrid = document.getElementById("thumbGrid");
thumbGrid.replaceWith(buildMasonry(thumbs, 3));
