function pickOne(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function resultTitle(right,total){
  const n = settings.kidName ? esc(settings.kidName) : "";
  if(right===total){
    return n ? pickOne([`Xuất sắc, ${n}!`,`${n} làm chủ hết rồi!`,`Đỉnh của đỉnh, ${n}!`,`${n} giỏi thật đấy!`])
             : pickOne(["Xuất sắc!","Làm chủ hết rồi!","Đỉnh của đỉnh!","Giỏi thật đấy!"]);
  }
  if(right>=total*0.7){
    return n ? pickOne([`Làm tốt lắm, ${n}!`,`${n} tiến bộ rồi đó!`,`Ngon lành, ${n}!`,`Sắp hoàn hảo rồi, ${n}!`])
             : pickOne(["Làm tốt lắm!","Tiến bộ rồi đó!","Ngon lành!","Sắp hoàn hảo rồi!"]);
  }
  return n ? pickOne([`Cố thêm chút nữa nhé, ${n}`,`${n} làm lại là ổn ngay!`,`Gần được rồi, ${n} ơi!`,`Không sao, ${n} ơi, luyện thêm chút!`])
           : pickOne(["Cố thêm chút nữa nhé","Làm lại là ổn ngay!","Gần được rồi, thử lại nhé!","Không sao, luyện thêm chút!"]);
}

function goBtn(id, inner, opts={}){
  const {disabled=false, ghost=false, attrs=""} = opts;
  return `<button class="go button${ghost?" ghost":""}" id="${id}" ${disabled?"disabled":""} ${attrs}><span class="button-outer"><span class="button-inner"><span>${inner}</span></span></span></button>`;
}
function goBtnEl(label, onClick){
  const wrap = document.createElement("div");
  wrap.innerHTML = goBtn("", label);
  const btn = wrap.firstElementChild;
  btn.removeAttribute("id");
  btn.onclick = onClick;
  return btn;
}

const ROUND = 10;
let units = new Set([1]);
let mode = "learn";
let queue = [], qi = 0, right = 0, missed = [], answered = false;
let build = {slots:[], tray:[]};
let rearrangeTile = {slots:[], tray:[]};
let freeMatchState = null;

let reviewWeak = false;
const app = document.getElementById("app");
const pool = () => reviewWeak ? weakWords() : DATA.filter(u=>units.has(u.u)).flatMap(u=>unitWords(u.u));
const picturePool = () => pool().filter(w=>w.img||w.photo);
const patternPool = () => DATA.filter(u=>units.has(u.u)).flatMap(u=>unitPatterns(u.u).map(p=>({u:u.u, q:p[0], a:p[1]})));

function weakWords(){
  const all = DATA.flatMap(u=>unitWords(u.u));
  return all.filter(w=>{
    const s = progress.words[w.en];
    return s && s.n>=1 && (s.c/s.n) < 0.7;
  }).sort((a,b)=>{
    const sa=progress.words[a.en], sb=progress.words[b.en];
    return (sa.c/sa.n) - (sb.c/sb.n);
  });
}

function unitDone(u){
  const ws = unitWords(u.u);
  return ws.length>0 && ws.every(w=>{
    const s = progress.words[w.en];
    return s && s.c>=3 && s.streak>=3;
  });
}
function totalStars(){
  return progress.stars||0;
}

function sayButton(label, big){
  return `<div class="saywrap"><button class="say ${big?"big":""}" id="say" data-on="true" aria-label="${esc(label)}"><span class="toggle"><span class="led"></span></span></button><span class="saylabel">${esc(label)}</span></div>`;
}
function toggleSay(text){
  const b = document.getElementById("say");
  if(b){
    b.dataset.on = "false";
    setTimeout(()=>{ if(b.isConnected) b.dataset.on = "true"; }, 220);
  }
  say(text);
}

function iconHtml(w, size){
  if(!w || (!w.img && !w.photo)) return "";
  if(w.photo){
    return `<div class="picicon photo" style="width:${size||120}px;height:${size||120}px"><img src="${w.photo}" alt="${esc(w.en)}"></div>`;
  }
  if(REAL_PHOTOS.has(w.img)){
    return `<div class="picicon photo" style="width:${size||120}px;height:${size||120}px"><img src="images/${w.img}.jpg" alt="${esc(w.en)}"></div>`;
  }
  const svg = renderIcon(w.img, {color:w.swatch});
  if(!svg) return "";
  return `<div class="picicon" style="width:${size||120}px;height:${size||120}px">${svg}</div>`;
}

function clearHeroWatermark(){ delete app.dataset.pattern; }

/* sóng sáng chạy qua lời nhắn của ba mẹ: từ sáng lên thì giữ nguyên tới khi sáng hết câu mới tắt hết và lặp lại */
function runDailyMsgWave(){
  const el = document.getElementById("dailymsg");
  if(!el) return;
  const words = el.querySelectorAll(".w");
  if(!words.length) return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let i = 0;
  function step(){
    if(!el.isConnected) return;
    if(i < words.length){
      words[i].classList.add("active");
      i++;
      setTimeout(step, 170);
    } else {
      setTimeout(()=>{
        if(!el.isConnected) return;
        words.forEach(w=>w.classList.remove("active"));
        i = 0;
        setTimeout(step, 170);
      }, 850);
    }
  }
  step();
}

/* ---------- màn hình chọn ---------- */
function home(){
  clearHeroWatermark();
  const learned = learnedCount();
  const earned = progress.badges.map(id=>effectiveBadges().find(b=>b.id===id)).filter(Boolean);
  const greetingHtml = settings.greeting
    ? `<div class="dailymsg" id="dailymsg">${esc(settings.greeting).split(" ").map(w=>`<span class="w">${w}</span>`).join(" ")}</div>`
    : `<p class="sub">${settings.kidName ? `Chào ${esc(settings.kidName)}! Chọn bài và cách học, rồi bắt đầu` : "Chọn bài và cách học, rồi bắt đầu"}</p>`;
  const advMenu = effectiveAdvancedMenu();
  app.innerHTML = `
    <div class="topbar">
      <div>
        <h1>${esc(settings.appTitle || "Tiếng Anh 3 · Global Success")}</h1>
      </div>
      <button class="starbtn" id="rewards">⭐ ${totalStars()}</button>
    </div>
    ${greetingHtml}
    ${earned.length ? `<div class="badgerow">${earned.slice(-5).map(b=>`<span class="badgechip"><span class="ic">${b.icon}</span>${esc(b.name)}</span>`).join("")}<button class="badgechip more" id="moreRewards">Xem tất cả →</button></div>` : ""}
    ${weakWords().length ? goBtn("reviewWeak", `<span class="btnicon">${renderEmblem("gauntlet")}</span>Ôn lại ${weakWords().length} từ hay sai`, {ghost:true, attrs:'style="margin:0 0 16px"'}) : ""}

    <div class="label">CHỌN BÀI</div>
    <div class="units">${visibleUnits().map(u=>{
      const um = unitMeta(u.u), h = um.hero;
      return `
      <button class="unit" data-u="${u.u}" data-hero aria-pressed="${units.has(u.u)}" style="--hero-a:${h.a};--hero-b:${h.b}">
        <span class="heroemblem">${renderEmblem(h.emblem)}</span>
        ${unitDone(u) ? `<span class="checkmark">${renderEmblem("check")}</span>` : ""}
        <b${um.unitNumColor?` style="color:${um.unitNumColor}"`:""}>Unit ${u.u}</b><span class="utopic"${um.topicColor?` style="color:${um.topicColor}"`:""}>${esc(um.t)} · ${unitWords(u.u).length} từ</span>
        <span class="heroname"${um.heroNameColor?` style="color:${um.heroNameColor}"`:""}>${esc(h.name)}</span>
      </button>`;
    }).join("")}</div>

    <div class="label">CHỌN CÁCH HỌC</div>
    <div class="modes">${effectiveModes().map(m=>`
      <button class="mode" data-m="${m.id}" aria-pressed="${mode===m.id}" style="--glow:${m.color||STONES[m.id]}">
        <span class="ic" style="color:${m.color||STONES[m.id]}">${renderEmblem(m.icon||"stone")}</span>
        <span><b>${esc(m.name)}</b><small>${esc(m.desc)}</small></span>
      </button>`).join("")}</div>

    ${goBtn("start", units.size ? "Bắt đầu học" : "Hãy chọn ít nhất một bài", {disabled:!units.size})}

    ${(effectiveTests().some(t=>!t.hidden) || !advMenu.hidden) ? `
    <div class="label">ÔN TẬP KIỂM TRA</div>
    <div class="modes">${effectiveTests().filter(t=>!t.hidden).map(t=>`
      <button class="mode test" data-t="${t.id}" style="${t.color?"--glow:"+t.color:""}">
        <span class="ic" style="${t.color?"color:"+t.color:""}">${renderEmblem(t.icon||"gauntlet")}</span>
        <span><b>${esc(t.name)}</b><small>${t.units.length} Unit · ${t.sections} phần</small></span>
      </button>`).join("")}
      ${!advMenu.hidden ? `
      <button class="mode test" id="advMenuBtn" style="${advMenu.color?"--glow:"+advMenu.color:""}">
        <span class="ic" style="${advMenu.color?"color:"+advMenu.color:""}">${renderEmblem(advMenu.icon)}</span>
        <span><b>${esc(advMenu.name)}</b><small>5 giai đoạn · đề tự soạn của ba mẹ</small></span>
      </button>` : ""}
    </div>` : ""}
    ${archives.length ? goBtn("openArchives", `<span class="btnicon">${renderEmblem("book")}</span>Xem lại bài đã lưu trữ`, {ghost:true, attrs:'style="margin:16px 0 0"'}) : ""}
    <a class="parentlink" href="parent.html"><span class="lockic" style="width:12px;height:12px;display:inline-block;vertical-align:-1px;margin-right:4px;color:var(--mist)">${renderEmblem("lock")}</span>Trang dành cho ba mẹ</a>`;

  app.querySelectorAll(".unit").forEach(b=>b.onclick=()=>{
    const n = +b.dataset.u;
    units.has(n) ? units.delete(n) : units.add(n);
    home();
  });
  app.querySelectorAll(".mode:not(.test)").forEach(b=>b.onclick=()=>{ mode = b.dataset.m; home(); });
  app.querySelectorAll(".mode.test[data-t]").forEach(b=>b.onclick=()=>{ examVariants(b.dataset.t); });
  const advBtn = document.getElementById("advMenuBtn");
  if(advBtn) advBtn.onclick = advancedTestMenu;
  document.getElementById("start").onclick = ()=>start(false);
  const reviewBtn = document.getElementById("reviewWeak");
  if(reviewBtn) reviewBtn.onclick = ()=>start(true);
  document.getElementById("rewards").onclick = rewards;
  const more = document.getElementById("moreRewards");
  if(more) more.onclick = rewards;
  const archBtn = document.getElementById("openArchives");
  if(archBtn) archBtn.onclick = kidArchiveList;
  runDailyMsgWave();
}

/* ---------- xem lại bài đã lưu trữ (chỉ xem, không sửa) ---------- */
function kidArchiveList(){
  clearHeroWatermark();
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="quit" aria-label="Về trang chính">✕</button>
      <div class="eyebrow" style="margin:0">BÀI ĐÃ LƯU TRỮ</div>
    </div>
    <p class="sub">Đây là các bài học cũ ba mẹ đã lưu lại để con xem lại bất cứ lúc nào.</p>
    <div class="modes">${archives.map((a,i)=>{
      const s = archiveStats(a);
      return `<button class="mode test" data-viewarch="${i}">
        <span class="ic">${renderEmblem("book")}</span>
        <span><b>${esc(a.label)}</b><small>${s.learned}/${s.totalWords} từ đã thuộc · ${a.units.length} Unit</small></span>
      </button>`;
    }).join("")}</div>`;
  document.getElementById("quit").onclick = home;
  app.querySelectorAll("[data-viewarch]").forEach(b=>b.onclick=()=>kidArchiveViewer(+b.dataset.viewarch));
}
function kidArchiveViewer(idx){
  const a = archives[idx];
  const s = archiveStats(a);
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="quit" aria-label="Về trang chính">✕</button>
      <div class="eyebrow" style="margin:0">${esc(a.label).toUpperCase()}</div>
    </div>
    <p class="sub">Lưu ngày ${a.createdAt} · ${s.learned}/${s.totalWords} từ đã thuộc · ${s.learnedP}/${s.totalPatterns} câu đã thuộc</p>
    ${a.units.map(u=>`
      <div class="card" style="margin-bottom:12px">
        <h3>Unit ${u.u} — ${esc(u.t)} <small style="font-weight:600;color:var(--mist)">(${esc(u.heroName)})</small></h3>
        ${u.words.map(w=>`<div class="wordrow"><span>${esc(w.en)} <em style="color:var(--mist);font-style:normal">— ${esc(w.vi)}</em></span></div>`).join("")}
      </div>`).join("")}
    ${goBtn("back2","Quay lại danh sách",{ghost:true})}`;
  document.getElementById("quit").onclick = home;
  document.getElementById("back2").onclick = kidArchiveList;
}

/* ---------- kho thưởng của bé ---------- */
function rewards(){
  clearHeroWatermark();
  const earnedIds = progress.badges || [];
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="quit" aria-label="Về trang chính">✕</button>
      <div class="eyebrow" style="margin:0">KHO THƯỞNG CỦA EM</div>
    </div>
    <div class="starbig">⭐ ${totalStars()}<span>ngôi sao đã thu thập</span></div>
    <div class="label">HUY HIỆU</div>
    <div class="rewardgrid">${effectiveBadges().map(b=>{
      const on = earnedIds.includes(b.id);
      return `<div class="rewardcard ${on?"on":"off"}">
        <div class="ic">${on ? b.icon : "🔒"}</div>
        <b>${esc(b.name)}</b>
        <small>${esc(b.desc)}</small>
      </div>`;
    }).join("")}</div>
    ${goBtn("back","Về trang chính")}`;
  document.getElementById("quit").onclick = home;
  document.getElementById("back").onclick = home;
}

/* ---------- vòng học ---------- */
function wordGroup(w){ return w.cat || ("u"+w.u); }
function pickOddRoundFrom(poolW){
  if(poolW.length<4) return null;
  const groups = {};
  poolW.forEach(w=>{ const g=wordGroup(w); (groups[g]=groups[g]||[]).push(w); });
  const bigGroups = Object.keys(groups).filter(g=>groups[g].length>=3);
  if(!bigGroups.length) return null;
  // ưu tiên nhóm mà pool còn có từ ở nhóm KHÁC để làm từ lạc (tránh cả 4 từ cùng 1 nhóm)
  const usable = bigGroups.filter(g=>poolW.some(w=>wordGroup(w)!==g));
  if(!usable.length) return null;
  const catG = usable[Math.floor(Math.random()*usable.length)];
  const catWords = shuffle(groups[catG]).slice(0,3);
  const oddCands = poolW.filter(w=>wordGroup(w)!==catG);
  const oddWord = oddCands[Math.floor(Math.random()*oddCands.length)];
  const items = shuffle([...catWords, oddWord]);
  return { items, oddEn: oddWord.en, u: items[0].u };
}
function buildOddRound(){
  // trước tiên chỉ dùng đúng các Unit đã chọn — chỉ mở rộng ra Unit khác khi không đủ dữ liệu
  const ownPool = [...units].flatMap(u=>unitWords(u));
  const r1 = pickOddRoundFrom(ownPool);
  if(r1) return r1;
  const fullPool = ownPool.concat(DATA.filter(d=>!units.has(d.u)).flatMap(d=>unitWords(d.u)));
  return pickOddRoundFrom(fullPool);
}
function start(weak){
  reviewWeak = !!weak;
  if(mode === "sentence"){
    const all = shuffle(patternPool());
    if(!all.length) return;
    queue = all.slice(0, Math.min(ROUND, all.length));
  } else if(mode === "odd"){
    const rounds = [];
    for(let i=0;i<ROUND;i++){ const r = buildOddRound(); if(r) rounds.push(r); }
    if(!rounds.length){ alert("Hãy chọn ít nhất 1 bài có đủ từ vựng để chơi chế độ này."); return; }
    queue = rounds;
  } else if(mode === "fill"){
    const words = pool();
    const fillable = words.filter(w=>w.ex && new RegExp("\\b"+escRe(w.en)+"\\b","i").test(w.ex));
    const rounds = shuffle(fillable).slice(0, Math.min(ROUND, fillable.length)).map(w=>{
      const re = new RegExp("\\b"+escRe(w.en)+"\\b","i");
      const sentence = w.ex.replace(re, "_____");
      const cross = shuffle(words.filter(x=>x.en!==w.en && wordGroup(x)!==wordGroup(w)));
      const same  = shuffle(words.filter(x=>x.en!==w.en && wordGroup(x)===wordGroup(w)));
      const distract = [...cross, ...same].slice(0,3);
      return distract.length===3 ? {word:w, sentence, opts:shuffle([w, ...distract]), u:w.u} : null;
    }).filter(Boolean);
    if(!rounds.length){ alert("Bài đã chọn chưa có đủ câu ví dụ hoặc từ nhiễu để chơi Điền từ. Hãy chọn bài khác."); return; }
    queue = rounds;
  } else if(mode === "match"){
    const words = shuffle(pool());
    const rounds = [];
    for(let i=0;i<words.length;i+=5){
      const chunk = words.slice(i,i+5);
      if(chunk.length>=4) rounds.push({items:chunk, u:chunk[0].u});
    }
    if(!rounds.length){ alert("Hãy chọn thêm bài (ít nhất 4 từ) để chơi Nối từ."); return; }
    queue = rounds.slice(0, ROUND);
  } else if(mode === "rearrange"){
    const patterns = patternPool().filter(p=>{ const n=p.a.split(" ").length; return n>=3 && n<=6; });
    if(!patterns.length){ alert("Bài đã chọn chưa có mẫu câu phù hợp để chơi Sắp xếp câu. Hãy chọn bài khác."); return; }
    queue = shuffle(patterns).slice(0, Math.min(ROUND, patterns.length)).map(p=>({sentence:p.a, u:p.u, q:p.q}));
  } else {
    const base = mode === "picture" ? picturePool() : pool();
    if(!base.length){
      alert("Bài đã chọn chưa có từ nào có hình minh hoạ. Hãy chọn bài khác hoặc đổi cách học.");
      return;
    }
    const weak = shuffle(base).sort((a,b)=> wordScore(a.en) - wordScore(b.en));
    queue = weak.slice(0, Math.min(ROUND, base.length));
  }
  qi = 0; right = 0; missed = [];
  play();
}

function heroBanner(unitNum){
  if(!unitNum) return "";
  const um = unitMeta(unitNum), h = um.hero;
  return `<div class="herobanner" style="--hero-a:${h.a};--hero-b:${h.b}">
    <span class="em">${renderEmblem(h.emblem)}</span>
    <span><b>Unit ${unitNum} · ${esc(um.t)}</b><small>${esc(h.name)}</small></span>
  </div>`;
}

function setHeroWatermark(unitNum){
  if(!unitNum){ clearHeroWatermark(); return; }
  const h = unitMeta(unitNum).hero;
  app.dataset.pattern = h.pattern;
  app.style.setProperty("--hero-a", h.a);
  app.style.setProperty("--hero-b", h.b);
}

function frame(inner){
  const pct = (qi / queue.length) * 100;
  const heroUnit = queue[qi] && queue[qi].u;
  const h = unitMeta(heroUnit).hero;
  setHeroWatermark(heroUnit);
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="quit" aria-label="Thoát">✕</button>
      <div class="track"><div class="fill" style="width:${pct}%"></div></div>
      <div class="count">${qi+1}/${queue.length}</div>
    </div>
    ${heroBanner(heroUnit)}
    ${inner}`;
  document.getElementById("quit").onclick = home;
  const sayBtn = document.getElementById("say");
  if(sayBtn && heroUnit) sayBtn.style.setProperty("--glow", h.a);
  if(heroUnit){
    const fillEl = document.querySelector(".fill");
    if(fillEl) fillEl.style.background = `linear-gradient(90deg, ${h.a}, ${h.b})`;
  }
}

function play(){
  if(qi >= queue.length) return done();
  answered = false;
  const q = queue[qi];
  if(mode==="learn")     return learnCard(q);
  if(mode==="pick")      return pickCard(q);
  if(mode==="build")     return buildCard(q);
  if(mode==="picture")   return pictureCard(q);
  if(mode==="sentence")  return sentenceCard(q);
  if(mode==="dictation") return dictationCard(q);
  if(mode==="odd")       return oddCard(q);
  if(mode==="fill")      return fillCard(q);
  if(mode==="match")     return matchCardInit(q);
  if(mode==="rearrange") return rearrangeCardInit(q);
  return writeCard(q);
}

function next(){ qi++; play(); }

/* chế độ 1: nhìn và nghe */
function learnCard(q){
  frame(`
    <div class="stage">
      ${iconHtml(q, 96)}
      <div class="word">${esc(q.en)}</div>
      <div class="ipa">${esc(q.ipa)}</div>
      <div class="vi">${esc(q.vi)}</div>
      ${q.ex ? `<div class="ex">"${esc(q.ex)}"</div>` : ""}
      ${sayButton("Nghe đọc")}
    </div>
    ${goBtn("nx","Từ tiếp theo")}`);
  document.getElementById("say").onclick = ()=>toggleSay(q.en);
  document.getElementById("nx").onclick = ()=>{ mark(q.en,true); next(); };
  say(q.en);
}

/* chế độ 2: chọn nghĩa */
function pickCard(q){
  const others = shuffle(uniqueByVi(pool(), q.vi)).slice(0,3);
  const opts = shuffle([q, ...others]);
  frame(`
    <div class="stage">
      <div class="word">${esc(q.en)}</div>
      <div class="ipa">${esc(q.ipa)}</div>
      ${sayButton("Nghe đọc")}
    </div>
    <div class="choices">${opts.map((o,i)=>
      `<button class="ch" data-i="${i}">${esc(o.vi)}</button>`).join("")}</div>
    <div class="verdict" id="v"></div>`);
  document.getElementById("say").onclick = ()=>toggleSay(q.en);
  app.querySelectorAll(".ch").forEach((b,i)=>b.onclick=()=>{
    if(answered) return; answered = true;
    const ok = opts[i].vi === q.vi;
    app.querySelectorAll(".ch").forEach((x,j)=>{
      x.disabled = true;
      if(opts[j].vi===q.vi) x.classList.add("right");
      else if(j===i) x.classList.add("wrong");
    });
    finish(q, ok);
  });
}

/* chế độ 3: xếp chữ cái */
function buildCard(q){
  const letters = q.en.split("");
  build.slots = letters.map(c => c===" " ? " " : null);
  build.tray = shuffle(letters.filter(c=>c!==" ")).map((c,i)=>({c,i,used:false}));
  renderBuild(q);
  say(q.en);
}
function renderBuild(q){
  frame(`
    <div class="stage" style="padding:16px">
      <div class="vi">${esc(q.vi)}</div>
      ${sayButton("Nghe đọc")}
    </div>
    <div class="shelf" id="shelf">${build.slots.map((s,i)=>
      s===" " ? `<span class="brick gap"></span>`
      : `<button class="brick ${s?"":"slot"}" data-s="${i}">${s?esc(s):""}</button>`).join("")}</div>
    <div class="tray">${build.tray.map(t=>
      `<button class="brick ${t.used?"used":""}" data-t="${t.i}">${esc(t.c)}</button>`).join("")}</div>
    <div class="verdict" id="v"></div>`);
  document.getElementById("say").onclick = ()=>toggleSay(q.en);
  app.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{
    const t = build.tray.find(x=>x.i==b.dataset.t);
    const free = build.slots.findIndex(s=>s===null);
    if(t.used || free<0) return;
    t.used = true; build.slots[free] = t.c;
    if(build.slots.every(s=>s!==null)) return checkBuild(q);
    renderBuild(q);
  });
  app.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{
    const i = +b.dataset.s;
    if(!build.slots[i]) return;
    const t = build.tray.find(x=>x.used && x.c===build.slots[i]);
    if(t) t.used = false;
    build.slots[i] = null;
    renderBuild(q);
  });
}
function checkBuild(q){
  const made = build.slots.join("");
  const ok = made === q.en;
  renderBuild(q);
  app.querySelectorAll("[data-s]").forEach(b=>b.classList.add(ok?"ok":"no"));
  answered = true;
  finish(q, ok, ok?"":"Đúng là: "+q.en);
}

/* chế độ 4: viết lại từ */
function writeCard(q){
  frame(`
    <div class="stage" style="padding:16px">
      <div class="vi">${esc(q.vi)}</div>
      <div class="ipa">${esc(q.ipa)}</div>
      ${sayButton("Nghe đọc")}
    </div>
    <input class="type-in" id="in" autocomplete="off" autocorrect="off"
           autocapitalize="none" spellcheck="false" lang="en" inputmode="text" placeholder="gõ từ ở đây">
    <div class="verdict" id="v"></div>
    ${goBtn("ck","Kiểm tra")}`);
  const input = document.getElementById("in");
  document.getElementById("say").onclick = ()=>toggleSay(q.en);
  const check = ()=>{
    if(answered) return;
    const val = input.value.trim().toLowerCase().replace(/\s+/g," ");
    if(!val) return;
    answered = true;
    const ok = val === q.en;
    input.disabled = true;
    input.style.borderColor = ok ? "var(--leaf)" : "var(--coral)";
    finish(q, ok, ok?"":"Đúng là: "+q.en);
  };
  document.getElementById("ck").onclick = check;
  input.onkeydown = e => { if(e.key==="Enter") check(); };
  say(q.en);
  input.focus();
}

/* chế độ 5: nhìn hình đoán từ */
function pictureCard(q){
  const others = shuffle(picturePool().filter(w=>w.en!==q.en)).slice(0,3);
  const opts = shuffle([q, ...others]);
  frame(`
    <div class="stage">${iconHtml(q, 130)}</div>
    <div class="choices">${opts.map((o,i)=>
      `<button class="ch" data-i="${i}">${esc(o.en)}</button>`).join("")}</div>
    <div class="verdict" id="v"></div>`);
  app.querySelectorAll(".ch").forEach((b,i)=>b.onclick=()=>{
    if(answered) return; answered = true;
    const ok = opts[i].en === q.en;
    app.querySelectorAll(".ch").forEach((x,j)=>{
      x.disabled = true;
      if(opts[j].en===q.en) x.classList.add("right");
      else if(j===i) x.classList.add("wrong");
    });
    say(q.en);
    finish(q, ok);
  });
}

/* chế độ 6: luyện mẫu câu */
function sentenceCard(item){
  const allA = shuffle(DATA.flatMap(u=>unitPatterns(u.u).map(p=>p[1]))).filter(a=>a!==item.a);
  const opts = shuffle([item.a, ...allA.slice(0,3)]);
  frame(`
    <div class="stage">
      <div class="word" style="font-size:24px">${esc(item.q)}</div>
      ${sayButton("Nghe câu hỏi")}
    </div>
    <div class="choices">${opts.map((o,i)=>
      `<button class="ch" data-i="${i}">${esc(o)}</button>`).join("")}</div>
    <div class="verdict" id="v"></div>`);
  document.getElementById("say").onclick = ()=>toggleSay(item.q);
  app.querySelectorAll(".ch").forEach((b,i)=>b.onclick=()=>{
    if(answered) return; answered = true;
    const ok = opts[i] === item.a;
    app.querySelectorAll(".ch").forEach((x,j)=>{
      x.disabled = true;
      if(opts[j]===item.a) x.classList.add("right");
      else if(j===i) x.classList.add("wrong");
    });
    say(item.a);
    finishSentence(item, ok);
  });
}
function finishSentence(item, ok){
  if(item.u) progress.lastUnit = item.u;
  markPattern(item.u+"|"+item.q, ok);
  if(ok) right++; else missed.push({en:item.q, vi:item.a});
  const v = document.getElementById("v");
  v.className = "verdict " + (ok?"ok":"no");
  v.innerHTML = (ok ? "Đúng rồi 🎉" : "Chưa đúng") + (ok?"":`<small>Đúng là: ${esc(item.a)}</small>`);
  if(ok) sfxRight(); else sfxWrong();
  const btn = goBtnEl(qi+1 < queue.length ? "Câu tiếp theo" : "Xem kết quả", next);
  app.appendChild(btn);
  btn.focus();
}

/* chế độ 7: nghe chép chính tả */
function dictationCard(q){
  frame(`
    <div class="stage" style="padding:16px">
      ${sayButton("Nghe và gõ lại", true)}
    </div>
    <input class="type-in" id="in" autocomplete="off" autocorrect="off"
           autocapitalize="none" spellcheck="false" lang="en" inputmode="text" placeholder="gõ từ nghe được">
    <div class="verdict" id="v"></div>
    ${goBtn("ck","Kiểm tra")}`);
  const input = document.getElementById("in");
  document.getElementById("say").onclick = ()=>toggleSay(q.en);
  const check = ()=>{
    if(answered) return;
    const val = input.value.trim().toLowerCase().replace(/\s+/g," ");
    if(!val) return;
    answered = true;
    const ok = val === q.en;
    input.disabled = true;
    input.style.borderColor = ok ? "var(--leaf)" : "var(--coral)";
    finish(q, ok, (ok?"":"Đúng là: "+q.en) + " · Nghĩa: "+q.vi);
  };
  document.getElementById("ck").onclick = check;
  input.onkeydown = e => { if(e.key==="Enter") check(); };
  say(q.en);
  input.focus();
}

/* chế độ 8: tìm từ khác loại */
function oddCard(round){
  frame(`
    <div class="choices">${round.items.map((w,i)=>`<button class="ch" data-i="${i}">${esc(w.en)}</button>`).join("")}</div>
    <div class="verdict" id="v"></div>`);
  app.querySelectorAll(".ch").forEach((b,i)=>b.onclick=()=>{
    if(answered) return; answered = true;
    const w = round.items[i];
    const ok = w.en === round.oddEn;
    app.querySelectorAll(".ch").forEach((x,j)=>{
      x.disabled = true;
      if(round.items[j].en===round.oddEn) x.classList.add("right");
      else if(j===i && !ok) x.classList.add("wrong");
    });
    finish({en:round.oddEn, vi:""}, ok, ok?"":"Từ khác nhóm là: "+round.oddEn);
  });
}

/* chế độ 9: điền từ */
function fillCard(item){
  frame(`
    <div class="examsentence">${esc(item.sentence)}</div>
    <div class="choices">${item.opts.map((o,i)=>`<button class="ch" data-i="${i}">${esc(o.en)}</button>`).join("")}</div>
    <div class="verdict" id="v"></div>`);
  app.querySelectorAll(".ch").forEach((b,i)=>b.onclick=()=>{
    if(answered) return; answered = true;
    const ok = item.opts[i].en === item.word.en;
    app.querySelectorAll(".ch").forEach((x,j)=>{
      x.disabled = true;
      if(item.opts[j].en===item.word.en) x.classList.add("right");
      else if(j===i) x.classList.add("wrong");
    });
    finish(item.word, ok, ok?"":"Đáp án đúng: "+item.word.en);
  });
}

/* chế độ 10: nối từ */
function matchCardInit(round){
  freeMatchState = { lefts:round.items, rights:shuffle(round.items), pairs:{}, leftSel:null, checked:false };
  renderFreeMatch(round);
}
function renderFreeMatch(round){
  const colors = ["#FFC93C","#3ECF8E","#3D6BFF","#FF5C6C","#8B5CF6"];
  const allPaired = Object.keys(freeMatchState.pairs).length === freeMatchState.lefts.length;
  frame(`
    <div class="matchgrid">
      <div class="matchcol">${freeMatchState.lefts.map((w,i)=>{
        const paired = freeMatchState.pairs[i]!==undefined;
        const c = paired ? colors[i%colors.length] : null;
        return `<button class="matchitem ${freeMatchState.leftSel===i?"sel":""}" data-l="${i}" ${c?`style="box-shadow:0 0 0 3px ${c}, var(--raised-sm);background:color-mix(in srgb, ${c} 22%, var(--surf))"`:""}>${i+1}. ${esc(w.en)}</button>`;
      }).join("")}</div>
      <div class="matchcol">${freeMatchState.rights.map((w,j)=>{
        const li = Object.keys(freeMatchState.pairs).find(k=>freeMatchState.pairs[k]===j);
        const c = li!==undefined ? colors[li%colors.length] : null;
        return `<button class="matchitem" data-r="${j}" ${c?`style="box-shadow:0 0 0 3px ${c}, var(--raised-sm);background:color-mix(in srgb, ${c} 22%, var(--surf))" disabled`:""}>${String.fromCharCode(97+j)}. ${esc(w.vi)}</button>`;
      }).join("")}</div>
    </div>
    <div class="verdict" id="v"></div>
    ${allPaired && !freeMatchState.checked ? goBtn("checkMatch","Kiểm tra") : ""}`);
  app.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{
    if(freeMatchState.checked) return;
    const i = +b.dataset.l;
    if(freeMatchState.pairs[i]!==undefined){ delete freeMatchState.pairs[i]; freeMatchState.leftSel=null; renderFreeMatch(round); return; }
    freeMatchState.leftSel = (freeMatchState.leftSel===i) ? null : i;
    renderFreeMatch(round);
  });
  app.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{
    if(freeMatchState.checked || freeMatchState.leftSel===null) return;
    freeMatchState.pairs[freeMatchState.leftSel] = +b.dataset.r;
    freeMatchState.leftSel = null;
    renderFreeMatch(round);
  });
  const ckBtn = document.getElementById("checkMatch");
  if(ckBtn) ckBtn.onclick = ()=>finishFreeMatch(round);
}
function finishFreeMatch(round){
  freeMatchState.checked = true;
  let correct = 0;
  freeMatchState.lefts.forEach((w,i)=>{
    const ri = freeMatchState.pairs[i];
    const ok = ri!==undefined && w.en === freeMatchState.rights[ri].en;
    mark(w.en, ok);
    if(ok) correct++;
  });
  renderFreeMatch(round);
  app.querySelectorAll("[data-l]").forEach(b=>{
    const i = +b.dataset.l, ri = freeMatchState.pairs[i];
    const ok = ri!==undefined && freeMatchState.lefts[i].en === freeMatchState.rights[ri].en;
    b.classList.add(ok?"right":"wrong");
  });
  answered = true;
  const total = freeMatchState.lefts.length;
  const allOk = correct===total;
  if(allOk) right++; else missed.push(...freeMatchState.lefts.filter((w,i)=>{
    const ri = freeMatchState.pairs[i];
    return !(ri!==undefined && w.en===freeMatchState.rights[ri].en);
  }));
  if(allOk) sfxRight(); else sfxWrong();
  const v = document.getElementById("v");
  v.className = "verdict " + (allOk?"ok":"no");
  v.innerHTML = allOk ? "Đúng hết rồi 🎉" : `Đúng ${correct}/${total} cặp`;
  const ck = document.getElementById("checkMatch");
  const btn = goBtnEl(qi+1 < queue.length ? "Câu tiếp theo" : "Xem kết quả", next);
  if(ck) ck.replaceWith(btn); else app.appendChild(btn);
  btn.focus();
}

/* chế độ 11: sắp xếp câu */
function rearrangeCardInit(round){
  const words = round.sentence.replace(/[.!?]$/,"").split(" ");
  const endPunct = round.sentence.match(/[.!?]$/) ? round.sentence.slice(-1) : "";
  rearrangeTile.slots = words.map(()=>null);
  rearrangeTile.tray = shuffle(words.map((w,i)=>({w,i,used:false})));
  renderFreeRearrange(round, endPunct);
}
function renderFreeRearrange(round, endPunct){
  frame(`
    <div class="wordshelf" id="shelf">${rearrangeTile.slots.map((s,i)=>
      `<button class="wordtile ${s?"":"slot"}" data-s="${i}">${s?esc(s):""}</button>`).join("")}<span class="endpunct">${endPunct}</span></div>
    <div class="tray">${rearrangeTile.tray.map(t=>
      `<button class="wordtile ${t.used?"used":""}" data-t="${t.i}">${esc(t.w)}</button>`).join("")}</div>
    <div class="verdict" id="v"></div>`);
  app.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{
    const t = rearrangeTile.tray.find(x=>x.i==b.dataset.t);
    const free = rearrangeTile.slots.findIndex(s=>s===null);
    if(t.used || free<0) return;
    t.used = true; rearrangeTile.slots[free] = t.w;
    if(rearrangeTile.slots.every(s=>s!==null)) return checkFreeRearrange(round, endPunct);
    renderFreeRearrange(round, endPunct);
  });
  app.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{
    const i = +b.dataset.s;
    if(!rearrangeTile.slots[i]) return;
    const t = rearrangeTile.tray.find(x=>x.used && x.w===rearrangeTile.slots[i]);
    if(t) t.used = false;
    rearrangeTile.slots[i] = null;
    renderFreeRearrange(round, endPunct);
  });
}
function checkFreeRearrange(round, endPunct){
  const made = rearrangeTile.slots.join(" ") + endPunct;
  const ok = made === round.sentence;
  renderFreeRearrange(round, endPunct);
  app.querySelectorAll("[data-s]").forEach(b=>b.classList.add(ok?"ok":"no"));
  answered = true;
  if(round.u && round.q) markPattern(round.u+"|"+round.q, ok);
  if(ok) right++; else missed.push({en:round.sentence, vi:""});
  if(ok) sfxRight(); else sfxWrong();
  const v = document.getElementById("v");
  v.className = "verdict " + (ok?"ok":"no");
  v.innerHTML = (ok ? "Đúng rồi 🎉" : "Chưa đúng") + (ok?"":`<small>Đúng là: ${esc(round.sentence)}</small>`);
  const btn = goBtnEl(qi+1 < queue.length ? "Câu tiếp theo" : "Xem kết quả", next);
  app.appendChild(btn);
  btn.focus();
}

/* chấm và đi tiếp */
function finish(q, ok, note=""){
  if(q.u) progress.lastUnit = q.u;
  mark(q.en, ok);
  if(ok) right++; else missed.push(q);
  say(q.en);
  if(ok) sfxRight(); else sfxWrong();
  const unitBonus = ok && q.u ? checkUnitBonus(q.u) : false;
  if(unitBonus){ setTimeout(sfxBadge, 250); setTimeout(()=>burstConfetti(24), 300); }
  const v = document.getElementById("v");
  v.className = "verdict " + (ok?"ok":"no");
  v.innerHTML = (ok ? "Đúng rồi 🎉" : "Chưa đúng") + (note?`<small>${esc(note)}</small>`:"")
    + (unitBonus ? `<small style="color:var(--stud)">🏅 Hoàn thành Unit! +${settings.perUnitDone} sao</small>` : "");
  const ck = document.getElementById("ck");
  const btn = goBtnEl(qi+1 < queue.length ? "Từ tiếp theo" : "Xem kết quả", next);
  if(ck) ck.replaceWith(btn); else app.appendChild(btn);
  btn.focus();
}

/* kết quả */
function done(){
  const total = queue.length;
  const earned = checkBadges(right, total);
  if(earned.length) setTimeout(sfxBadge, 300);
  if(right===total || earned.length) setTimeout(()=>burstConfetti(earned.length?28:20), 150);
  app.innerHTML = `
    <div class="eyebrow">Xong rồi</div>
    <h1>${resultTitle(right,total)}</h1>
    <div class="score">${right}<span>/${total}</span></div>
    ${earned.length ? `<div class="newbadges">${earned.map(b=>`
      <div class="newbadge"><span class="ic">${b.icon}</span><span><b>${esc(b.name)}</b><small>${esc(b.desc)}</small></span></div>`).join("")}</div>` : ""}
    ${missed.length ? `<div class="missed"><h3>TỪ CẦN ÔN LẠI</h3>${
      missed.map(m=>`<div><b>${esc(m.en)}</b><em>${esc(m.vi)}</em></div>`).join("")
    }</div>` : ""}
    <div class="row">
      ${goBtn("hm","Về trang chính",{ghost:true})}
      ${goBtn("ag","Học tiếp")}
    </div>`;
  document.getElementById("hm").onclick = home;
  document.getElementById("ag").onclick = ()=>start(reviewWeak);
}

/* ================= ÔN TẬP KIỂM TRA (giữa kỳ / cuối kỳ / cuối năm) ================= */
/* Trình bày theo đúng 4 dạng bài phổ biến trong đề thi thật: trắc nghiệm, điền từ,
   nối từ, sắp xếp câu — không dựa vào các chế độ chơi của app. */
let testInfo = null, testQueue = [], testI = 0, testRight = 0, testMaxPoints = 0;
let testTile = {slots:[], tray:[]};
let testBuildTile = {slots:[], tray:[]};
let matchState = null;
const LETTERS = ["A","B","C","D"];
const SECTION_LABEL = {
  mc:"A · Trắc nghiệm", fill:"B · Điền từ vào chỗ trống",
  match:"C · Nối từ", rearrange:"D · Sắp xếp câu",
  build:"E · Xếp chữ cái", write:"F · Viết lại từ", picture:"G · Nhìn hình đoán từ",
  sentence:"H · Luyện mẫu câu", dictation:"I · Nghe chép chính tả", odd:"J · Tìm từ khác loại"
};

function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }

function buildExamQueue(unitIds){
  const words = unitIds.flatMap(u=>unitWords(u));
  const q = [];

  shuffle(words).slice(0,5).forEach(w=>q.push({type:"mc", word:w, points:1}));

  const fillable = words.filter(w=>w.ex && new RegExp("\\b"+escRe(w.en)+"\\b","i").test(w.ex));
  shuffle(fillable).slice(0,4).forEach(w=>{
    const re = new RegExp("\\b"+escRe(w.en)+"\\b","i");
    const sentence = w.ex.replace(re, "_____");
    // ưu tiên từ nhiễu KHÁC nhóm với đáp án đúng, tránh 2 đáp án cùng hợp lý (VD 2 động từ -ing cùng điền được)
    const cross = shuffle(words.filter(x=>x.en!==w.en && wordGroup(x)!==wordGroup(w)));
    const same  = shuffle(words.filter(x=>x.en!==w.en && wordGroup(x)===wordGroup(w)));
    const distract = [...cross, ...same].slice(0,3);
    if(distract.length<3) return;
    q.push({type:"fill", word:w, sentence, opts:shuffle([w, ...distract]), points:1});
  });

  const matchWords = shuffle(words).slice(0,5);
  if(matchWords.length>=4) q.push({type:"match", items:matchWords, points:matchWords.length});

  const sentences = [...new Set(unitIds.flatMap(u=>unitPatterns(u).map(p=>p[1])))]
    .filter(s=>{ const n=s.split(" ").length; return n>=3 && n<=6; });
  shuffle(sentences).slice(0,3).forEach(s=>q.push({type:"rearrange", sentence:s, points:1}));

  return q;
}

/* ---------- đề nâng cao: đề cố định, đầy đủ hơn cho từng Unit ---------- */
function mulberry32(seed){
  let s = seed|0;
  return function(){
    s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function seededShuffle(arr, seed){
  const rnd = mulberry32(seed);
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(rnd()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function buildAdvancedQueue(unitIds, seed){
  const words = unitIds.flatMap(u=>unitWords(u));
  const q = [];

  seededShuffle(words, seed+1).slice(0, Math.min(10, words.length)).forEach(w=>q.push({type:"mc", word:w, points:1}));

  const fillable = words.filter(w=>w.ex && new RegExp("\\b"+escRe(w.en)+"\\b","i").test(w.ex));
  seededShuffle(fillable, seed+2).slice(0, Math.min(8, fillable.length)).forEach(w=>{
    const re = new RegExp("\\b"+escRe(w.en)+"\\b","i");
    const sentence = w.ex.replace(re, "_____");
    const cross = seededShuffle(words.filter(x=>x.en!==w.en && wordGroup(x)!==wordGroup(w)), seed+3+w.en.length);
    const same  = seededShuffle(words.filter(x=>x.en!==w.en && wordGroup(x)===wordGroup(w)), seed+3+w.en.length+1);
    const distract = [...cross, ...same].slice(0,3);
    if(distract.length<3) return;
    q.push({type:"fill", word:w, sentence, opts:seededShuffle([w, ...distract], seed+4+w.en.length), points:1});
  });

  const matchWords = seededShuffle(words, seed+5).slice(0, Math.min(6, words.length));
  if(matchWords.length>=4) q.push({type:"match", items:matchWords, points:matchWords.length});

  const sentences = [...new Set(unitIds.flatMap(u=>unitPatterns(u).map(p=>p[1])))]
    .filter(s=>{ const n=s.split(" ").length; return n>=3 && n<=7; });
  seededShuffle(sentences, seed+6).slice(0,5).forEach(s=>q.push({type:"rearrange", sentence:s, points:1}));

  return q;
}
function startAdvancedStage(t){
  testInfo = { id:"adv_"+t.id, name:"Đề nâng cao — "+t.name, units:t.units };
  const seed = t.units.reduce((s,u)=>s+u*13, (t.id||"").length*31 + 7);
  testQueue = buildAdvancedQueue(t.units, seed);
  if(!testQueue.length){ alert("Chưa đủ dữ liệu để tạo đề nâng cao cho giai đoạn này."); return; }
  testMaxPoints = testQueue.reduce((s,it)=>s+it.points,0);
  testI = 0; testRight = 0;
  playTest();
}
function findWordByEn(en){
  if(!en) return null;
  const target = en.trim().toLowerCase();
  return DATA.flatMap(u=>unitWords(u.u)).find(w=>w.en.toLowerCase()===target) || null;
}
function customQuestionToQueueItem(q){
  if(q.type==="mc") return {type:"mc", custom:true, q:q.q, opts:q.opts, correct:q.correct, points:1};
  if(q.type==="fill") return {type:"fill", word:{en:q.opts[q.correct], u:null}, sentence:q.sentence, opts:q.opts.map(o=>({en:o})), points:1};
  if(q.type==="match") return {type:"match", items:q.pairs.map(p=>({en:p[0], vi:p[1]})), points:q.pairs.length};
  if(q.type==="rearrange") return {type:"rearrange", sentence:q.sentence, points:1};
  if(q.type==="build") return {type:"build", en:q.en, vi:q.vi, points:1};
  if(q.type==="write") return {type:"write", en:q.en, vi:q.vi, points:1};
  if(q.type==="picture") return {type:"picture", en:q.opts[q.correct], opts:q.opts, correct:q.correct, points:1};
  if(q.type==="sentence") return {type:"sentence", q:q.q, opts:q.opts, correct:q.correct, points:1};
  if(q.type==="dictation") return {type:"dictation", en:q.en, vi:q.vi, points:1};
  if(q.type==="odd") return {type:"odd", items:q.words, oddIndex:q.oddIndex, points:1};
}
function startCustomAuthoredTest(test){
  testInfo = { id:"ct", name:test.name, units:[] };
  testQueue = (test.questions||[]).map(customQuestionToQueueItem);
  if(!testQueue.length){ alert("Đề này chưa có câu hỏi nào — vào trang phụ huynh để soạn thêm."); return; }
  testMaxPoints = testQueue.reduce((s,it)=>s+it.points,0);
  testI = 0; testRight = 0;
  playTest();
}
function advancedTestMenu(){
  const custom = customContent.customTests||[];
  const customVisible = custom.map((t,i)=>({t,i})).filter(x=>!x.t.hidden);
  const advMenu = effectiveAdvancedMenu();
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="quit" aria-label="Về trang chính">✕</button>
      <div class="eyebrow" style="margin:0">${esc(advMenu.name)}</div>
    </div>
    <p class="sub">Đề cố định, gộp nhiều Unit theo từng giai đoạn — nhiều câu hỏi và đa dạng hơn đề thường.</p>
    <div class="modes">${effectiveTests().filter(t=>!t.hidden).map(t=>`
      <button class="mode test" data-advstage="${t.id}" style="${advMenu.color?"--glow:"+advMenu.color:""}">
        <span class="ic" style="${advMenu.color?"color:"+advMenu.color:""}">${renderEmblem(advMenu.icon)}</span>
        <span><b>${esc(t.name)}</b><small>${t.units.length} Unit · nâng cao</small></span>
      </button>`).join("")}${customVisible.map(({t,i})=>`
      <button class="mode test" data-advcustom="${i}" style="${advMenu.color?"--glow:"+advMenu.color:""}">
        <span class="ic" style="${advMenu.color?"color:"+advMenu.color:""}">${renderEmblem(advMenu.icon)}</span>
        <span><b>${esc(t.name)}</b><small>${(t.questions||[]).length} câu · ba mẹ tự soạn</small></span>
      </button>`).join("")}</div>`;
  document.getElementById("quit").onclick = home;
  app.querySelectorAll("[data-advstage]").forEach(b=>b.onclick=()=>startAdvancedStage(effectiveTests().find(t=>t.id===b.dataset.advstage)));
  app.querySelectorAll("[data-advcustom]").forEach(b=>b.onclick=()=>{
    startCustomAuthoredTest(customContent.customTests[+b.dataset.advcustom]);
  });
}

function examVariants(id){
  testInfo = effectiveTests().find(t=>t.id===id);
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="quit" aria-label="Về trang chính">✕</button>
      <div class="eyebrow" style="margin:0">${esc(testInfo.name)}</div>
    </div>
    <p class="sub">Chọn 1 trong 4 đề — mỗi đề gồm 4 phần: Trắc nghiệm, Điền từ, Nối từ, Sắp xếp câu.</p>
    <div class="modes">${[1,2,3,4].map(n=>`
      <button class="mode" data-variant="${n}" style="${testInfo.color?"--glow:"+testInfo.color:""}">
        <span class="ic" style="${testInfo.color?"color:"+testInfo.color:""}">${renderEmblem(testInfo.icon||"gauntlet")}</span>
        <span><b>Đề ${n}</b><small>${testInfo.units.length} Unit · 4 phần · ~13 câu</small></span>
      </button>`).join("")}</div>`;
  document.getElementById("quit").onclick = home;
  app.querySelectorAll("[data-variant]").forEach(b=>b.onclick=()=>startTest(id));
}

function startTest(id){
  testInfo = effectiveTests().find(t=>t.id===id);
  testQueue = buildExamQueue(testInfo.units);
  if(!testQueue.length){ alert("Chưa đủ dữ liệu để tạo đề cho phần này."); return; }
  testMaxPoints = testQueue.reduce((s,it)=>s+it.points,0);
  testI = 0; testRight = 0;
  playTest();
}

function testFrame(inner, sectionType, unitNum){
  const pct = (testI / testQueue.length) * 100;
  const showLabel = testI===0 || testQueue[testI-1].type !== sectionType;
  setHeroWatermark(unitNum);
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="quit" aria-label="Thoát">✕</button>
      <div class="track"><div class="fill test" style="width:${pct}%"></div></div>
      <div class="count">${testI+1}/${testQueue.length}</div>
    </div>
    ${showLabel ? `<div class="sectionlbl">${SECTION_LABEL[sectionType]}</div>` : ""}
    ${unitNum ? heroBanner(unitNum) : ""}
    ${inner}`;
  document.getElementById("quit").onclick = home;
}

function playTest(){
  if(testI >= testQueue.length) return testDone();
  answered = false;
  const item = testQueue[testI];
  if(item.type==="mc" && item.custom) return customTestMC(item);
  if(item.type==="mc")        return testMC(item);
  if(item.type==="fill")      return testFill(item);
  if(item.type==="match")     return testMatchInit(item);
  if(item.type==="rearrange") return testRearrange(item);
  if(item.type==="build")     return testBuild(item);
  if(item.type==="write")     return testWrite(item);
  if(item.type==="picture")   return testPicture(item);
  if(item.type==="sentence")  return testSentenceQ(item);
  if(item.type==="dictation") return testDictation(item);
  if(item.type==="odd")       return testOdd(item);
}
function customTestMC(item){
  testFrame(`
    <p class="examq">Câu ${testI+1}: ${esc(item.q)}</p>
    <div class="examopts">${item.opts.map((o,i)=>`<button class="examopt" data-i="${i}"><span class="let">${LETTERS[i]}</span>${esc(o)}</button>`).join("")}</div>
    <div class="verdict" id="v"></div>`, "mc", null);
  app.querySelectorAll(".examopt").forEach((b,i)=>b.onclick=()=>{
    if(answered) return; answered = true;
    const ok = i === item.correct;
    app.querySelectorAll(".examopt").forEach((x,j)=>{ x.disabled=true; if(j===item.correct) x.classList.add("right"); else if(j===i) x.classList.add("wrong"); });
    testFinish(ok, ok?"":"Đáp án đúng: "+item.opts[item.correct]);
  });
}
function nextTest(){ testI++; playTest(); }

function testFinish(ok, note, pointsEarned, pointsMax){
  const earned = pointsEarned!==undefined ? pointsEarned : (ok?1:0);
  const max = pointsMax!==undefined ? pointsMax : 1;
  testRight += earned;
  if(earned===max) sfxRight(); else sfxWrong();
  const v = document.getElementById("v");
  v.className = "verdict " + (earned===max?"ok":"no");
  v.innerHTML = (earned===max ? "Đúng rồi 🎉" : `Được ${earned}/${max} điểm`) + (note?`<small>${esc(note)}</small>`:"");
  const btn = goBtnEl(testI+1 < testQueue.length ? "Câu tiếp theo" : "Nộp bài", nextTest);
  const ck = document.getElementById("checkMatch") || document.getElementById("ck");
  if(ck) ck.replaceWith(btn); else app.appendChild(btn);
  btn.focus();
}

/* A. Trắc nghiệm */
function uniqueByVi(list, excludeVi){
  const seen = new Set([excludeVi]);
  return list.filter(w=>{ if(seen.has(w.vi)) return false; seen.add(w.vi); return true; });
}

function testMC(item){
  const q = item.word;
  const others = shuffle(uniqueByVi(pool(), q.vi)).slice(0,3);
  const opts = shuffle([q, ...others]);
  testFrame(`
    <p class="examq">Câu ${testI+1}: <b>${esc(q.en)}</b> nghĩa là gì?</p>
    <div class="examopts">${opts.map((o,i)=>`<button class="examopt" data-i="${i}"><span class="let">${LETTERS[i]}</span>${esc(o.vi)}</button>`).join("")}</div>
    <div class="verdict" id="v"></div>`, "mc", q.u);
  app.querySelectorAll(".examopt").forEach((b,i)=>b.onclick=()=>{
    if(answered) return; answered = true;
    const ok = opts[i].vi === q.vi;
    app.querySelectorAll(".examopt").forEach((x,j)=>{ x.disabled=true; if(opts[j].vi===q.vi) x.classList.add("right"); else if(j===i) x.classList.add("wrong"); });
    testFinish(ok);
  });
}

/* B. Điền từ vào chỗ trống */
function testFill(item){
  testFrame(`
    <p class="examq">Câu ${testI+1}: Chọn từ đúng để điền vào chỗ trống</p>
    <div class="examsentence">${esc(item.sentence)}</div>
    <div class="examopts">${item.opts.map((o,i)=>`<button class="examopt" data-i="${i}"><span class="let">${LETTERS[i]}</span>${esc(o.en)}</button>`).join("")}</div>
    <div class="verdict" id="v"></div>`, "fill", item.word.u);
  app.querySelectorAll(".examopt").forEach((b,i)=>b.onclick=()=>{
    if(answered) return; answered = true;
    const ok = item.opts[i].en === item.word.en;
    app.querySelectorAll(".examopt").forEach((x,j)=>{ x.disabled=true; if(item.opts[j].en===item.word.en) x.classList.add("right"); else if(j===i) x.classList.add("wrong"); });
    testFinish(ok, ok?"":"Đáp án đúng: "+item.word.en);
  });
}

/* C. Nối từ */
function testMatchInit(item){
  matchState = { lefts:item.items, rights:shuffle(item.items), pairs:{}, leftSel:null, checked:false };
  renderMatch(item);
}
function renderMatch(item){
  const colors = ["#FFC93C","#3ECF8E","#3D6BFF","#FF5C6C","#8B5CF6"];
  const allPaired = Object.keys(matchState.pairs).length === matchState.lefts.length;
  testFrame(`
    <p class="examq">Câu ${testI+1}: Nối từ tiếng Anh (cột trái) với nghĩa đúng (cột phải)</p>
    <div class="matchgrid">
      <div class="matchcol">${matchState.lefts.map((w,i)=>{
        const paired = matchState.pairs[i]!==undefined;
        const c = paired ? colors[i%colors.length] : null;
        return `<button class="matchitem ${matchState.leftSel===i?"sel":""}" data-l="${i}" ${c?`style="box-shadow:0 0 0 3px ${c}, var(--raised-sm);background:color-mix(in srgb, ${c} 22%, var(--surf))"`:""}>${i+1}. ${esc(w.en)}</button>`;
      }).join("")}</div>
      <div class="matchcol">${matchState.rights.map((w,j)=>{
        const li = Object.keys(matchState.pairs).find(k=>matchState.pairs[k]===j);
        const c = li!==undefined ? colors[li%colors.length] : null;
        return `<button class="matchitem" data-r="${j}" ${c?`style="box-shadow:0 0 0 3px ${c}, var(--raised-sm);background:color-mix(in srgb, ${c} 22%, var(--surf))" disabled`:""}>${String.fromCharCode(97+j)}. ${esc(w.vi)}</button>`;
      }).join("")}</div>
    </div>
    <div class="verdict" id="v"></div>
    ${allPaired && !matchState.checked ? goBtn("checkMatch","Kiểm tra") : ""}`, "match", null);

  app.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{
    if(matchState.checked) return;
    const i = +b.dataset.l;
    if(matchState.pairs[i]!==undefined){ delete matchState.pairs[i]; matchState.leftSel=null; renderMatch(item); return; }
    matchState.leftSel = (matchState.leftSel===i) ? null : i;
    renderMatch(item);
  });
  app.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{
    if(matchState.checked || matchState.leftSel===null) return;
    matchState.pairs[matchState.leftSel] = +b.dataset.r;
    matchState.leftSel = null;
    renderMatch(item);
  });
  const ckBtn = document.getElementById("checkMatch");
  if(ckBtn) ckBtn.onclick = ()=>checkMatch(item);
}
function checkMatch(item){
  matchState.checked = true;
  let correct = 0;
  Object.keys(matchState.pairs).forEach(li=>{
    if(matchState.lefts[li].en === matchState.rights[matchState.pairs[li]].en) correct++;
  });
  renderMatch(item);
  app.querySelectorAll("[data-l]").forEach(b=>{
    const i = +b.dataset.l, ri = matchState.pairs[i];
    const ok = ri!==undefined && matchState.lefts[i].en === matchState.rights[ri].en;
    b.classList.add(ok?"right":"wrong");
  });
  answered = true;
  testFinish(correct===item.points, correct+"/"+item.points+" cặp đúng", correct, item.points);
}

/* D. Sắp xếp câu */
function testRearrange(item){
  const words = item.sentence.replace(/[.!?]$/,"").split(" ");
  const endPunct = item.sentence.match(/[.!?]$/) ? item.sentence.slice(-1) : "";
  testTile.slots = words.map(()=>null);
  testTile.tray = shuffle(words.map((w,i)=>({w,i,used:false})));
  renderRearrange(item, endPunct);
}
function renderRearrange(item, endPunct){
  testFrame(`
    <p class="examq">Câu ${testI+1}: Sắp xếp các từ thành câu đúng</p>
    <div class="wordshelf" id="shelf">${testTile.slots.map((s,i)=>
      `<button class="wordtile ${s?"":"slot"}" data-s="${i}">${s?esc(s):""}</button>`).join("")}<span class="endpunct">${endPunct}</span></div>
    <div class="tray">${testTile.tray.map(t=>
      `<button class="wordtile ${t.used?"used":""}" data-t="${t.i}">${esc(t.w)}</button>`).join("")}</div>
    <div class="verdict" id="v"></div>`, "rearrange");
  app.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{
    const t = testTile.tray.find(x=>x.i==b.dataset.t);
    const free = testTile.slots.findIndex(s=>s===null);
    if(t.used || free<0) return;
    t.used = true; testTile.slots[free] = t.w;
    if(testTile.slots.every(s=>s!==null)) return checkRearrange(item, endPunct);
    renderRearrange(item, endPunct);
  });
  app.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{
    const i = +b.dataset.s;
    if(!testTile.slots[i]) return;
    const t = testTile.tray.find(x=>x.used && x.w===testTile.slots[i]);
    if(t) t.used = false;
    testTile.slots[i] = null;
    renderRearrange(item, endPunct);
  });
}
function checkRearrange(item, endPunct){
  const made = testTile.slots.join(" ") + endPunct;
  const ok = made === item.sentence;
  renderRearrange(item, endPunct);
  app.querySelectorAll("[data-s]").forEach(b=>b.classList.add(ok?"ok":"no"));
  answered = true;
  testFinish(ok, ok?"":"Đúng là: "+item.sentence);
}

/* E. Xếp chữ cái (đề tự soạn) */
function testBuild(item){
  const letters = item.en.split("");
  testBuildTile.slots = letters.map(c => c===" " ? " " : null);
  testBuildTile.tray = shuffle(letters.filter(c=>c!==" ")).map((c,i)=>({c,i,used:false}));
  renderTestBuild(item);
}
function renderTestBuild(item){
  testFrame(`
    <div class="stage" style="padding:16px">
      <div class="vi">${esc(item.vi)}</div>
    </div>
    <div class="shelf" id="shelf">${testBuildTile.slots.map((s,i)=>
      s===" " ? `<span class="brick gap"></span>`
      : `<button class="brick ${s?"":"slot"}" data-s="${i}">${s?esc(s):""}</button>`).join("")}</div>
    <div class="tray">${testBuildTile.tray.map(t=>
      `<button class="brick ${t.used?"used":""}" data-t="${t.i}">${esc(t.c)}</button>`).join("")}</div>
    <div class="verdict" id="v"></div>`, "build", null);
  app.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{
    const t = testBuildTile.tray.find(x=>x.i==b.dataset.t);
    const free = testBuildTile.slots.findIndex(s=>s===null);
    if(t.used || free<0) return;
    t.used = true; testBuildTile.slots[free] = t.c;
    if(testBuildTile.slots.every(s=>s!==null)) return checkTestBuild(item);
    renderTestBuild(item);
  });
  app.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{
    const i = +b.dataset.s;
    if(!testBuildTile.slots[i]) return;
    const t = testBuildTile.tray.find(x=>x.used && x.c===testBuildTile.slots[i]);
    if(t) t.used = false;
    testBuildTile.slots[i] = null;
    renderTestBuild(item);
  });
}
function checkTestBuild(item){
  const made = testBuildTile.slots.join("");
  const ok = made === item.en;
  renderTestBuild(item);
  app.querySelectorAll("[data-s]").forEach(b=>b.classList.add(ok?"ok":"no"));
  answered = true;
  testFinish(ok, ok?"":"Đúng là: "+item.en);
}

/* F. Viết lại từ (đề tự soạn) */
function testWrite(item){
  testFrame(`
    <div class="stage" style="padding:16px">
      <div class="vi">${esc(item.vi)}</div>
    </div>
    <input class="type-in" id="in" autocomplete="off" autocorrect="off"
           autocapitalize="none" spellcheck="false" lang="en" inputmode="text" placeholder="gõ từ ở đây">
    <div class="verdict" id="v"></div>
    ${goBtn("ck","Kiểm tra")}`, "write", null);
  const input = document.getElementById("in");
  const check = ()=>{
    if(answered) return;
    const val = input.value.trim().toLowerCase().replace(/\s+/g," ");
    if(!val) return;
    answered = true;
    const ok = val === item.en.trim().toLowerCase();
    input.disabled = true;
    input.style.borderColor = ok ? "var(--leaf)" : "var(--coral)";
    testFinish(ok, ok?"":"Đúng là: "+item.en);
  };
  document.getElementById("ck").onclick = check;
  input.onkeydown = e => { if(e.key==="Enter") check(); };
  input.focus();
}

/* G. Nhìn hình đoán từ (đề tự soạn) */
function testPicture(item){
  const w = findWordByEn(item.en);
  testFrame(`
    <div class="stage">${w ? iconHtml(w, 130) : `<p class="examq">${esc((w&&w.vi)||"Chọn từ đúng")}</p>`}</div>
    <div class="examopts">${item.opts.map((o,i)=>`<button class="examopt" data-i="${i}"><span class="let">${LETTERS[i]}</span>${esc(o)}</button>`).join("")}</div>
    <div class="verdict" id="v"></div>`, "picture", null);
  app.querySelectorAll(".examopt").forEach((b,i)=>b.onclick=()=>{
    if(answered) return; answered = true;
    const ok = i === item.correct;
    app.querySelectorAll(".examopt").forEach((x,j)=>{ x.disabled=true; if(j===item.correct) x.classList.add("right"); else if(j===i) x.classList.add("wrong"); });
    testFinish(ok, ok?"":"Đáp án đúng: "+item.opts[item.correct]);
  });
}

/* H. Luyện mẫu câu (đề tự soạn) */
function testSentenceQ(item){
  testFrame(`
    <p class="examq">Câu ${testI+1}: ${esc(item.q)}</p>
    <div class="examopts">${item.opts.map((o,i)=>`<button class="examopt" data-i="${i}"><span class="let">${LETTERS[i]}</span>${esc(o)}</button>`).join("")}</div>
    <div class="verdict" id="v"></div>`, "sentence", null);
  app.querySelectorAll(".examopt").forEach((b,i)=>b.onclick=()=>{
    if(answered) return; answered = true;
    const ok = i === item.correct;
    app.querySelectorAll(".examopt").forEach((x,j)=>{ x.disabled=true; if(j===item.correct) x.classList.add("right"); else if(j===i) x.classList.add("wrong"); });
    testFinish(ok, ok?"":"Đáp án đúng: "+item.opts[item.correct]);
  });
}

/* I. Nghe chép chính tả (đề tự soạn) */
function testDictation(item){
  testFrame(`
    <div class="stage" style="padding:16px">
      ${sayButton("Nghe và gõ lại", true)}
    </div>
    <input class="type-in" id="in" autocomplete="off" autocorrect="off"
           autocapitalize="none" spellcheck="false" lang="en" inputmode="text" placeholder="gõ từ nghe được">
    <div class="verdict" id="v"></div>
    ${goBtn("ck","Kiểm tra")}`, "dictation", null);
  const input = document.getElementById("in");
  document.getElementById("say").onclick = ()=>toggleSay(item.en);
  const check = ()=>{
    if(answered) return;
    const val = input.value.trim().toLowerCase().replace(/\s+/g," ");
    if(!val) return;
    answered = true;
    const ok = val === item.en.trim().toLowerCase();
    input.disabled = true;
    input.style.borderColor = ok ? "var(--leaf)" : "var(--coral)";
    testFinish(ok, (ok?"":"Đúng là: "+item.en) + (item.vi?" · Nghĩa: "+item.vi:""));
  };
  document.getElementById("ck").onclick = check;
  input.onkeydown = e => { if(e.key==="Enter") check(); };
  say(item.en);
  input.focus();
}

/* J. Tìm từ khác loại (đề tự soạn) */
function testOdd(item){
  testFrame(`
    <p class="examq">Câu ${testI+1}: Từ nào KHÁC nhóm với 3 từ còn lại?</p>
    <div class="examopts">${item.items.map((w,i)=>`<button class="examopt" data-i="${i}"><span class="let">${LETTERS[i]}</span>${esc(w)}</button>`).join("")}</div>
    <div class="verdict" id="v"></div>`, "odd", null);
  app.querySelectorAll(".examopt").forEach((b,i)=>b.onclick=()=>{
    if(answered) return; answered = true;
    const ok = i === item.oddIndex;
    app.querySelectorAll(".examopt").forEach((x,j)=>{ x.disabled=true; if(j===item.oddIndex) x.classList.add("right"); else if(j===i) x.classList.add("wrong"); });
    testFinish(ok, ok?"":"Từ khác nhóm là: "+item.items[item.oddIndex]);
  });
}

function testDone(){
  const total = testMaxPoints;
  awardTestStars(testRight);
  const pct = Math.round(100*testRight/total);
  const n = settings.kidName ? esc(settings.kidName) : "";
  const gradeBase = pct>=90?"Xuất sắc":pct>=70?"Giỏi":pct>=50?"Khá, cố thêm nhé":"Cần ôn lại thêm";
  const gradeEmoji = pct>=90?"🏆":pct>=70?"🌟":pct>=50?"💪":"📚";
  const grade = `${gradeBase}${n?", "+n:""} ${gradeEmoji}`;
  if(pct>=70) setTimeout(()=>burstConfetti(24), 150);
  app.innerHTML = `
    <div class="eyebrow">${esc(testInfo.name)} — kết quả</div>
    <h1>${grade}</h1>
    <div class="score">${testRight}<span>/${total} điểm (${pct}%)</span></div>
    <p class="sub" style="text-align:center">+${testRight*(settings.perTestCorrect||0)} sao</p>
    <div class="row">
      ${goBtn("hm","Về trang chính",{ghost:true})}
      ${goBtn("ag","Làm đề khác")}
    </div>`;
  document.getElementById("hm").onclick = home;
  document.getElementById("ag").onclick = ()=>examVariants(testInfo.id);
}

if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{ navigator.serviceWorker.register("sw.js").catch(()=>{}); });
}

loadVoices(()=>{});
Promise.all([loadProgress(), loadVoicePref(), loadCustom(), loadSettings(), loadArchives()]).then(() => {
  home();
  setTimeout(() => { if(!enVoices().length) loadVoices(()=>{}); }, 600);
});
