/* Logic dùng chung cho cả trang con (index.html) và trang ba mẹ (parent.html):
   lưu trữ tiến độ, đồng bộ Firebase (tuỳ chọn), phát âm, mã PIN, huy hiệu, âm thanh. */

const PKEY = "ga3-progress-v2";
const OLD_KEY = "ga3-progress";
const VKEY = "ga3-voice";
const PINKEY = "ga3-pin";
const CKEY = "ga3-custom";
const SKEY = "ga3-settings";
const AKEY = "ga3-archives";

const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const shuffle = a => a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);

const DAY = 24 * 60 * 60 * 1000;
const BADGES = [
  {id:"first10",  name:"Bước đầu tiên",    desc:"Hoàn thành vòng học đầu tiên", icon:"🌟", conditionType:"firstRound",    conditionValue:1},
  {id:"words25",  name:"Người sưu tầm",    desc:"Thuộc 25 từ",                  icon:"🎖️", conditionType:"wordsLearned",  conditionValue:25},
  {id:"words60",  name:"Bậc thầy từ vựng", desc:"Thuộc 60 từ",                  icon:"🏆", conditionType:"wordsLearned",  conditionValue:60},
  {id:"words120", name:"Siêu nhân từ vựng",desc:"Thuộc 120 từ",                 icon:"🦸", conditionType:"wordsLearned",  conditionValue:120},
  {id:"perfect",  name:"Hoàn hảo",         desc:"Đúng hết cả vòng học",         icon:"💯", conditionType:"perfectRound",  conditionValue:1},
  {id:"streak3",  name:"Chuỗi 3 ngày",     desc:"Học 3 ngày liên tiếp",         icon:"🔥", conditionType:"dayStreak",     conditionValue:3},
  {id:"streak7",  name:"Chuỗi 7 ngày",     desc:"Học 7 ngày liên tiếp",         icon:"⚡", conditionType:"dayStreak",     conditionValue:7}
];
const BADGE_CONDITIONS = {
  firstRound:       {label:"Hoàn thành 1 vòng học",              needsValue:false},
  perfectRound:      {label:"Làm đúng hết 1 vòng học",             needsValue:false},
  wordsLearned:      {label:"Số từ đã thuộc đạt ít nhất",          needsValue:true, unit:"từ"},
  wordsMastered:     {label:"Số từ đã thành thạo đạt ít nhất",     needsValue:true, unit:"từ"},
  patternsLearned:   {label:"Số câu đã thuộc đạt ít nhất",         needsValue:true, unit:"câu"},
  patternsMastered:  {label:"Số câu đã thành thạo đạt ít nhất",    needsValue:true, unit:"câu"},
  dayStreak:         {label:"Số ngày học liên tiếp đạt ít nhất",   needsValue:true, unit:"ngày"},
  unitDone:          {label:"Hoàn thành trọn 1 Unit cụ thể",       needsValue:true, unit:"Unit số"}
};

/* ---------- cách học & đề ôn tập (dữ liệu gốc, phụ huynh có thể tuỳ chỉnh lớp phủ) ---------- */
const MODES = [
  {id:"learn",    name:"Nhìn và nghe",   desc:"Xem mặt chữ, nghe đọc, nhớ nghĩa"},
  {id:"pick",     name:"Chọn nghĩa",     desc:"Thấy từ tiếng Anh, chọn nghĩa đúng"},
  {id:"build",    name:"Xếp chữ cái",    desc:"Ghép từng chữ cái thành từ hoàn chỉnh"},
  {id:"write",    name:"Viết lại từ",    desc:"Nghe và nhìn nghĩa, tự gõ từ ra"},
  {id:"picture",  name:"Nhìn hình đoán từ", desc:"Xem hình minh hoạ, chọn đúng từ"},
  {id:"sentence", name:"Luyện mẫu câu",  desc:"Nghe câu hỏi, chọn câu trả lời đúng"},
  {id:"dictation",name:"Nghe chép chính tả", desc:"Chỉ nghe âm thanh, tự gõ lại từ"},
  {id:"odd",      name:"Tìm từ khác loại", desc:"4 từ, tìm từ không cùng nhóm"},
  {id:"fill",      name:"Điền từ",        desc:"Chọn từ đúng điền vào câu ví dụ"},
  {id:"match",     name:"Nối từ",         desc:"Nối từ tiếng Anh với đúng nghĩa"},
  {id:"rearrange", name:"Sắp xếp câu",    desc:"Ghép các từ thành câu đúng"}
];
const TESTS = [
  {id:"mid1", name:"Giữa kỳ 1",        units:[1,2,3,4,5],                                   sections:4},
  {id:"end1", name:"Cuối kỳ 1",         units:[1,2,3,4,5,6,7,8,9,10],                        sections:4},
  {id:"mid2", name:"Giữa kỳ 2",         units:[11,12,13,14,15],                              sections:4},
  {id:"end2", name:"Cuối kỳ 2",         units:[11,12,13,14,15,16,17,18,19,20],               sections:4},
  {id:"year", name:"Tổng ôn cuối năm",  units:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20], sections:4}
];

function todayStr(d){ d = d || new Date(); return d.toISOString().slice(0,10); }

function emptyProgress(){
  return { words:{}, patterns:{}, history:{}, badges:[], lastDay:"", stars:0, awardedUnits:[] };
}

let progress = emptyProgress();

/* ---------- cấu hình phần thưởng sao (phụ huynh tự chỉnh, trong giới hạn cho phép) ---------- */
function defaultSettings(){
  return { perCorrect:1, perTestCorrect:2, perUnitDone:10, perBadge:5, kidName:"Bí Đỏ", appTitle:"Tiếng Anh 3 · Global Success", greeting:"" };
}
const SETTINGS_OPTIONS = {
  perCorrect:     [0,1,2,3],
  perTestCorrect: [0,1,2,3,4,5],
  perUnitDone:    [0,5,10,15,20],
  perBadge:       [0,5,10,15,20]
};
let settings = defaultSettings();

async function loadSettings(){
  try{
    if(window.storage && window.storage.get){
      const r = await window.storage.get(SKEY);
      settings = (r && r.value) ? {...defaultSettings(), ...JSON.parse(r.value)} : defaultSettings();
      return;
    }
  }catch(e){}
  try{
    const raw = localStorage.getItem(SKEY);
    settings = raw ? {...defaultSettings(), ...JSON.parse(raw)} : defaultSettings();
  }catch(e){ settings = defaultSettings(); }
}
async function saveSettings(){
  const s = JSON.stringify(settings);
  try{
    if(window.storage && window.storage.set){ await window.storage.set(SKEY, s); }
    else localStorage.setItem(SKEY, s);
  }catch(e){ try{ localStorage.setItem(SKEY, s); }catch(e2){} }
  syncUpSettings();
}

function migrateOld(oldMap){
  const p = emptyProgress();
  Object.keys(oldMap||{}).forEach(w=>{
    const o = oldMap[w];
    p.words[w] = { n:o.n||0, c:o.c||0, streak:o.c>0?Math.min(o.c,3):0, due:0 };
  });
  return p;
}

function normalizeProgress(){
  if(progress.stars === undefined){
    progress.stars = Object.values(progress.history||{}).reduce((s,h)=>s+(h.correct||0), 0);
  }
  if(!progress.awardedUnits) progress.awardedUnits = [];
  if(!progress.patterns) progress.patterns = {};
  if(!progress.badges) progress.badges = [];
  if(!progress.words) progress.words = {};
  if(!progress.history) progress.history = {};
}

async function loadProgress(){
  try{
    if(window.storage && window.storage.get){
      const r = await window.storage.get(PKEY);
      if(r && r.value){ progress = JSON.parse(r.value); normalizeProgress(); return; }
      const old = await window.storage.get(OLD_KEY);
      if(old && old.value){ progress = migrateOld(JSON.parse(old.value)); await saveProgress(); return; }
      progress = emptyProgress(); return;
    }
  }catch(e){}
  try{
    const raw = localStorage.getItem(PKEY);
    if(raw){ progress = JSON.parse(raw); normalizeProgress(); return; }
    const old = localStorage.getItem(OLD_KEY);
    if(old){ progress = migrateOld(JSON.parse(old)); saveProgress(); return; }
    progress = emptyProgress();
  }catch(e){ progress = emptyProgress(); }
}

async function saveProgress(){
  const s = JSON.stringify(progress);
  try{
    if(window.storage && window.storage.set){ await window.storage.set(PKEY, s); }
    else localStorage.setItem(PKEY, s);
  }catch(e){ try{ localStorage.setItem(PKEY, s); }catch(e2){} }
  syncUp();
}

/* ---------- ghi nhận kết quả + lặp lại ngắt quãng (spaced repetition) ---------- */
function mark(word, ok){
  const w = progress.words[word] || {n:0,c:0,streak:0,due:0};
  w.n++;
  if(ok){ w.c++; w.streak = (w.streak||0) + 1; }
  else{ w.streak = 0; }
  const gapDays = [0, 1, 3, 7, 14, 30][Math.min(w.streak, 5)];
  w.due = Date.now() + gapDays*DAY;
  progress.words[word] = w;

  const day = todayStr();
  const h = progress.history[day] || {correct:0,total:0};
  h.total++; if(ok) h.correct++;
  progress.history[day] = h;

  if(ok) progress.stars = (progress.stars||0) + (settings.perCorrect||0);

  saveProgress();
}
function awardTestStars(count){
  progress.stars = (progress.stars||0) + count*(settings.perTestCorrect||0);
  saveProgress();
}
async function adjustStars(delta){
  progress.stars = Math.max(0, (progress.stars||0) + delta);
  await saveProgress();
}

/* ---------- ghi nhận kết quả mẫu câu (chế độ "Luyện mẫu câu") ---------- */
function markPattern(key, ok){
  const w = progress.patterns[key] || {n:0,c:0,streak:0};
  w.n++;
  if(ok){ w.c++; w.streak = (w.streak||0) + 1; } else { w.streak = 0; }
  progress.patterns[key] = w;

  const day = todayStr();
  const h = progress.history[day] || {correct:0,total:0};
  h.total++; if(ok) h.correct++;
  progress.history[day] = h;

  if(ok) progress.stars = (progress.stars||0) + (settings.perCorrect||0);
  saveProgress();
}
function checkUnitBonus(unitNum){
  if(progress.awardedUnits.includes(unitNum)) return false;
  const base = DATA.find(d=>d.u===unitNum);
  if(!base) return false;
  const ws = unitWords(unitNum);
  const done = ws.length>0 && ws.every(w=>{ const s = progress.words[w.en]; return s && s.c>=3 && s.streak>=3; });
  if(!done) return false;
  progress.awardedUnits.push(unitNum);
  progress.stars = (progress.stars||0) + (settings.perUnitDone||0);
  saveProgress();
  return true;
}

function isDue(word){
  const w = progress.words[word];
  if(!w) return true;
  return Date.now() >= (w.due||0);
}

function wordScore(word){
  const w = progress.words[word] || {n:0,c:0,due:0};
  const acc = w.n ? w.c/w.n : -1;
  const overdue = isDue(word) ? 0 : 1;
  return overdue*10 + acc;
}

function learnedCount(){
  return Object.values(progress.words).filter(w=>w.c>=3 && w.streak>=3).length;
}
function masteredWordsCount(){
  return Object.values(progress.words).filter(w=>w.streak>=5).length;
}
function learnedPatternsCount(){
  return Object.values(progress.patterns).filter(w=>w.c>=3 && w.streak>=3).length;
}
function masteredPatternsCount(){
  return Object.values(progress.patterns).filter(w=>w.streak>=5).length;
}

/* ---------- huy hiệu (danh sách gốc + lớp phủ tuỳ chỉnh của phụ huynh) ---------- */
function effectiveBadges(){
  const hidden = customContent.hiddenBadges || [];
  const ov = customContent.badgeOverrides || {};
  const base = BADGES.filter(b=>!hidden.includes(b.id)).map(b=> ov[b.id] ? {...b, ...ov[b.id]} : b);
  const custom = customContent.customBadges || [];
  return base.concat(custom);
}
function currentDayStreak(){
  let streak = 0;
  let d = new Date();
  if(!(progress.history[todayStr(d)] && progress.history[todayStr(d)].total>0)){
    d = new Date(d.getTime()-DAY);
  }
  while(progress.history[todayStr(d)] && progress.history[todayStr(d)].total>0){
    streak++;
    d = new Date(d.getTime()-DAY);
  }
  return streak;
}
function dayStreakBest(){
  const days = Object.keys(progress.history).sort();
  let streak = 0, best = 0, prev = null;
  days.forEach(d=>{
    if(prev){
      const diff = (new Date(d) - new Date(prev)) / DAY;
      streak = diff===1 ? streak+1 : 1;
    } else streak = 1;
    best = Math.max(best, streak);
    prev = d;
  });
  return best;
}
function checkBadges(sessionRight, sessionTotal){
  const earned = [];
  const has = id => progress.badges.includes(id);
  const give = id => { if(!has(id)){ progress.badges.push(id); earned.push(id); progress.stars = (progress.stars||0) + (settings.perBadge||0); } };
  const best = dayStreakBest();

  effectiveBadges().forEach(b=>{
    const v = b.conditionValue;
    let hit = false;
    switch(b.conditionType){
      case "firstRound":       hit = sessionTotal>0; break;
      case "perfectRound":     hit = sessionRight===sessionTotal && sessionTotal>0; break;
      case "wordsLearned":     hit = learnedCount()>=v; break;
      case "wordsMastered":    hit = masteredWordsCount()>=v; break;
      case "patternsLearned":  hit = learnedPatternsCount()>=v; break;
      case "patternsMastered": hit = masteredPatternsCount()>=v; break;
      case "dayStreak":        hit = best>=v; break;
      case "unitDone":         hit = progress.awardedUnits.includes(v); break;
    }
    if(hit) give(b.id);
  });

  if(earned.length) saveProgress();
  return earned.map(id=>effectiveBadges().find(b=>b.id===id)).filter(Boolean);
}
async function hideBaseBadge(id){
  customContent.hiddenBadges = customContent.hiddenBadges || [];
  if(!customContent.hiddenBadges.includes(id)) customContent.hiddenBadges.push(id);
  await saveCustom();
}
async function unhideBaseBadge(id){
  if(customContent.hiddenBadges) customContent.hiddenBadges = customContent.hiddenBadges.filter(x=>x!==id);
  await saveCustom();
}
async function editBaseBadge(id, fields){
  customContent.badgeOverrides = customContent.badgeOverrides || {};
  customContent.badgeOverrides[id] = {...(customContent.badgeOverrides[id]||{}), ...fields};
  await saveCustom();
}
async function addCustomBadge(badge){
  customContent.customBadges = customContent.customBadges || [];
  customContent.customBadges.push(badge);
  await saveCustom();
}
async function removeCustomBadge(idx){
  if(customContent.customBadges) customContent.customBadges.splice(idx,1);
  await saveCustom();
}
async function editCustomBadge(idx, fields){
  if(customContent.customBadges && customContent.customBadges[idx]) Object.assign(customContent.customBadges[idx], fields);
  await saveCustom();
}

const REAL_PHOTOS = new Set(["father","mother","brother","sister"]);

/* ---------- nội dung tuỳ chỉnh của phụ huynh (thêm/ẩn/sửa từ & mẫu câu) ---------- */
function emptyCustom(){
  return {
    words:{}, hiddenWords:{}, patterns:{}, hiddenPatterns:{}, wordOverrides:{}, patternOverrides:{},
    customTests:[], unitOverrides:{}, hiddenUnits:[],
    modeOverrides:{}, testOverrides:{}, advancedMenu:{},
    hiddenBadges:[], badgeOverrides:{}, customBadges:[]
  };
}
let customContent = emptyCustom();

async function loadCustom(){
  try{
    if(window.storage && window.storage.get){
      const r = await window.storage.get(CKEY);
      customContent = Object.assign(emptyCustom(), (r && r.value) ? JSON.parse(r.value) : {});
      return;
    }
  }catch(e){}
  try{
    const raw = localStorage.getItem(CKEY);
    customContent = Object.assign(emptyCustom(), raw ? JSON.parse(raw) : {});
  }catch(e){ customContent = emptyCustom(); }
}
async function saveCustom(){
  const s = JSON.stringify(customContent);
  try{
    if(window.storage && window.storage.set){ await window.storage.set(CKEY, s); }
    else localStorage.setItem(CKEY, s);
  }catch(e){ try{ localStorage.setItem(CKEY, s); }catch(e2){} }
  syncUpCustom();
}

function unitWords(u){
  const base = DATA.find(d=>d.u===u);
  if(!base) return [];
  const hidden = customContent.hiddenWords[u] || [];
  const ov = customContent.wordOverrides[u] || {};
  const kept = base.w.filter(w=>!hidden.includes(w.en)).map(w=> ov[w.en] ? {...w, ...ov[w.en]} : w);
  const added = customContent.words[u] || [];
  return kept.concat(added).map(w=>({...w, u}));
}
function unitPatterns(u){
  const base = PATTERNS[u] || [];
  const hiddenIdx = customContent.hiddenPatterns[u] || [];
  const ov = customContent.patternOverrides[u] || {};
  const kept = base.map((p,i)=> ov[i] || p).filter((p,i)=>!hiddenIdx.includes(i));
  const added = customContent.patterns[u] || [];
  return kept.concat(added);
}

/* ---------- cài đặt riêng từng Unit (chủ đề, tên/icon/màu nhân vật, màu chữ) ---------- */
function unitMeta(u){
  const base = DATA.find(d=>d.u===u) || {u, t:""};
  const h = heroFor(u);
  const ov = (customContent.unitOverrides && customContent.unitOverrides[u]) || {};
  return {
    u,
    t: ov.t !== undefined && ov.t !== "" ? ov.t : base.t,
    hero: {
      name: ov.heroName !== undefined && ov.heroName !== "" ? ov.heroName : h.name,
      a: ov.a || h.a,
      b: ov.b || h.b,
      pattern: h.pattern,
      emblem: ov.emblem || h.emblem
    },
    unitNumColor: ov.unitNumColor || null,
    topicColor: ov.topicColor || null,
    heroNameColor: ov.heroNameColor || null
  };
}
async function setUnitOverride(u, patch){
  customContent.unitOverrides = customContent.unitOverrides || {};
  customContent.unitOverrides[u] = {...(customContent.unitOverrides[u]||{}), ...patch};
  await saveCustom();
}
async function resetUnitOverride(u){
  if(customContent.unitOverrides) delete customContent.unitOverrides[u];
  await saveCustom();
}
function visibleUnits(){
  const hidden = customContent.hiddenUnits || [];
  return DATA.filter(u=>!hidden.includes(u.u));
}
async function hideUnit(u){
  customContent.hiddenUnits = customContent.hiddenUnits || [];
  if(!customContent.hiddenUnits.includes(u)) customContent.hiddenUnits.push(u);
  await saveCustom();
}
async function unhideUnit(u){
  if(customContent.hiddenUnits) customContent.hiddenUnits = customContent.hiddenUnits.filter(x=>x!==u);
  await saveCustom();
}

/* ---------- cài đặt cách học (bật/ẩn, thứ tự, tên, icon, màu) ---------- */
function effectiveModes(){
  const ov = customContent.modeOverrides || {};
  return MODES.map((m,i)=>{
    const o = ov[m.id] || {};
    return {
      id:m.id, desc:m.desc,
      name: o.name || m.name,
      icon: o.icon || null,
      color: o.color || null,
      order: o.order !== undefined ? o.order : i,
      hidden: !!o.hidden
    };
  }).filter(m=>!m.hidden).sort((a,b)=>a.order-b.order);
}
async function setModeOverride(id, patch){
  customContent.modeOverrides = customContent.modeOverrides || {};
  customContent.modeOverrides[id] = {...(customContent.modeOverrides[id]||{}), ...patch};
  await saveCustom();
}
async function resetModeOverride(id){
  if(customContent.modeOverrides) delete customContent.modeOverrides[id];
  await saveCustom();
}

/* ---------- cài đặt đề ôn tập kiểm tra (tên, các Unit trong từng giai đoạn) ---------- */
function effectiveTests(){
  const ov = customContent.testOverrides || {};
  return TESTS.map(t=>{
    const o = ov[t.id] || {};
    return { id:t.id, name:o.name || t.name, units:o.units || t.units, sections:t.sections, icon:o.icon||null, color:o.color||null, hidden:!!o.hidden };
  });
}
async function setTestOverride(id, patch){
  customContent.testOverrides = customContent.testOverrides || {};
  customContent.testOverrides[id] = {...(customContent.testOverrides[id]||{}), ...patch};
  await saveCustom();
}
async function resetTestOverride(id){
  if(customContent.testOverrides) delete customContent.testOverrides[id];
  await saveCustom();
}

/* ---------- cài đặt nút "Đề nâng cao" (điểm vào tổng hợp 5 giai đoạn + đề tự soạn) ---------- */
function effectiveAdvancedMenu(){
  const o = customContent.advancedMenu || {};
  return { name: o.name || "Đề nâng cao", icon: o.icon || "cometstar", color: o.color || null, hidden: !!o.hidden };
}
async function setAdvancedMenuOverride(patch){
  customContent.advancedMenu = {...(customContent.advancedMenu||{}), ...patch};
  await saveCustom();
}
async function resetAdvancedMenuOverride(){
  customContent.advancedMenu = {};
  await saveCustom();
}

async function addCustomWord(u, word){
  customContent.words[u] = customContent.words[u] || [];
  customContent.words[u].push(word);
  await saveCustom();
}
async function removeCustomWord(u, idx){
  if(customContent.words[u]) customContent.words[u].splice(idx,1);
  await saveCustom();
}
async function hideBaseWord(u, en){
  customContent.hiddenWords[u] = customContent.hiddenWords[u] || [];
  if(!customContent.hiddenWords[u].includes(en)) customContent.hiddenWords[u].push(en);
  await saveCustom();
}
async function unhideBaseWord(u, en){
  if(customContent.hiddenWords[u]) customContent.hiddenWords[u] = customContent.hiddenWords[u].filter(x=>x!==en);
  await saveCustom();
}
async function addCustomPattern(u, pair){
  customContent.patterns[u] = customContent.patterns[u] || [];
  customContent.patterns[u].push(pair);
  await saveCustom();
}
async function removeCustomPattern(u, idx){
  if(customContent.patterns[u]) customContent.patterns[u].splice(idx,1);
  await saveCustom();
}
async function hideBasePattern(u, idx){
  customContent.hiddenPatterns[u] = customContent.hiddenPatterns[u] || [];
  if(!customContent.hiddenPatterns[u].includes(idx)) customContent.hiddenPatterns[u].push(idx);
  await saveCustom();
}
async function unhideBasePattern(u, idx){
  if(customContent.hiddenPatterns[u]) customContent.hiddenPatterns[u] = customContent.hiddenPatterns[u].filter(x=>x!==idx);
  await saveCustom();
}
async function editBaseWord(u, en, fields){
  customContent.wordOverrides[u] = customContent.wordOverrides[u] || {};
  customContent.wordOverrides[u][en] = {...(customContent.wordOverrides[u][en]||{}), ...fields};
  await saveCustom();
}
async function editCustomWord(u, idx, fields){
  if(customContent.words[u] && customContent.words[u][idx]) Object.assign(customContent.words[u][idx], fields);
  await saveCustom();
}
async function editBasePattern(u, idx, pair){
  customContent.patternOverrides[u] = customContent.patternOverrides[u] || {};
  customContent.patternOverrides[u][idx] = pair;
  await saveCustom();
}
async function editCustomPattern(u, idx, pair){
  if(customContent.patterns[u]) customContent.patterns[u][idx] = pair;
  await saveCustom();
}
async function addCustomTest(test){
  customContent.customTests = customContent.customTests || [];
  customContent.customTests.push(test);
  await saveCustom();
}
async function removeCustomTest(idx){
  if(customContent.customTests) customContent.customTests.splice(idx,1);
  await saveCustom();
}
async function updateCustomTest(idx, test){
  customContent.customTests = customContent.customTests || [];
  customContent.customTests[idx] = test;
  await saveCustom();
}
async function toggleCustomTestHidden(idx){
  if(customContent.customTests && customContent.customTests[idx]){
    customContent.customTests[idx].hidden = !customContent.customTests[idx].hidden;
  }
  await saveCustom();
}
function fileToPhoto(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = ()=>{
      const img = new Image();
      img.onerror = reject;
      img.onload = ()=>{
        const maxDim = 320;
        let w = img.width, h = img.height;
        if(w > h){ if(w > maxDim){ h = Math.round(h*maxDim/w); w = maxDim; } }
        else { if(h > maxDim){ w = Math.round(w*maxDim/h); h = maxDim; } }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ---------- lưu trữ dữ liệu học (đóng băng 1 "cuốn sách" + kết quả, dùng khi đổi nội dung cho lớp sau) ---------- */
let archives = [];

async function loadArchives(){
  try{
    if(window.storage && window.storage.get){
      const r = await window.storage.get(AKEY);
      archives = (r && r.value) ? JSON.parse(r.value) : [];
      return;
    }
  }catch(e){}
  try{
    const raw = localStorage.getItem(AKEY);
    archives = raw ? JSON.parse(raw) : [];
  }catch(e){ archives = []; }
}
async function saveArchives(){
  const s = JSON.stringify(archives);
  try{
    if(window.storage && window.storage.set){ await window.storage.set(AKEY, s); }
    else localStorage.setItem(AKEY, s);
  }catch(e){ try{ localStorage.setItem(AKEY, s); }catch(e2){} }
  syncUpArchives();
}
function buildArchiveSnapshot(label){
  const units = DATA.map(u=>{
    const um = unitMeta(u.u);
    return {
      u: u.u,
      t: um.t,
      heroName: um.hero.name,
      words: unitWords(u.u).map(w=>({en:w.en, ipa:w.ipa, vi:w.vi, ex:w.ex||""})),
      patterns: unitPatterns(u.u)
    };
  });
  return {
    id: "arc_"+Date.now(),
    label,
    createdAt: todayStr(),
    units,
    wordStats: JSON.parse(JSON.stringify(progress.words||{})),
    patternStats: JSON.parse(JSON.stringify(progress.patterns||{})),
    stars: progress.stars||0,
    badgeCount: (progress.badges||[]).length
  };
}
async function addArchive(label){
  archives = archives || [];
  archives.push(buildArchiveSnapshot(label));
  await saveArchives();
}
async function removeArchive(idx){
  if(archives) archives.splice(idx,1);
  await saveArchives();
}
function archiveStats(arc){
  const allWords = arc.units.flatMap(u=>u.words.map(w=>({...w, u:u.u})));
  const allPatterns = arc.units.flatMap(u=>u.patterns.map(p=>({q:p[0], a:p[1], u:u.u})));
  const wordEntries = allWords.map(w=>({...w, ...(arc.wordStats[w.en]||{n:0,c:0,streak:0})}));
  const learned = wordEntries.filter(w=>w.c>=3 && w.streak>=3).length;
  const weak = wordEntries.filter(w=>w.n>=2).sort((a,b)=>(a.c/a.n)-(b.c/b.n)).slice(0,10);
  const patKey = (u,q)=>u+"|"+q;
  const patternEntries = allPatterns.map(p=>({...p, ...(arc.patternStats[patKey(p.u,p.q)]||{n:0,c:0,streak:0})}));
  const learnedP = patternEntries.filter(p=>p.c>=3 && p.streak>=3).length;
  const weakP = patternEntries.filter(p=>p.n>=2).sort((a,b)=>(a.c/a.n)-(b.c/b.n)).slice(0,10);
  return { totalWords:allWords.length, learned, weak, totalPatterns:allPatterns.length, learnedP, weakP };
}

let syncTimerA = null;
function syncUpArchives(){
  if(!firebaseConfigured()) return;
  clearTimeout(syncTimerA);
  syncTimerA = setTimeout(()=>{
    initFirebaseIfConfigured();
    if(!fbReady) return;
    try{ fbDb.ref("families/"+FAMILY_ID+"/archives").set(archives); }catch(e){}
  }, 800);
}
function subscribeArchives(cb){
  initFirebaseIfConfigured();
  if(!fbReady){ cb(archives, false); return; }
  try{
    fbDb.ref("families/"+FAMILY_ID+"/archives").on("value", snap=>{
      const val = snap.val();
      if(val) archives = val;
      cb(archives, true);
    });
  }catch(e){ cb(archives, false); }
}

/* ---------- mã PIN cho ba mẹ ---------- */
async function getPin(){
  try{
    if(window.storage && window.storage.get){
      const r = await window.storage.get(PINKEY);
      return (r && r.value) || null;
    }
  }catch(e){}
  try{ return localStorage.getItem(PINKEY); }catch(e){ return null; }
}
async function setPin(pin){
  try{
    if(window.storage && window.storage.set){ await window.storage.set(PINKEY, pin); return; }
  }catch(e){}
  try{ localStorage.setItem(PINKEY, pin); }catch(e){}
}

/* ---------- phát âm ---------- */
let voices = [], voiceName = "";
async function loadVoicePref(){
  try{
    if(window.storage && window.storage.get){
      const r = await window.storage.get(VKEY); voiceName = (r && r.value) || ""; return;
    }
  }catch(e){}
  try{ voiceName = localStorage.getItem(VKEY) || ""; }catch(e){ voiceName = ""; }
}
async function saveVoicePref(){
  try{
    if(window.storage && window.storage.set){ await window.storage.set(VKEY, voiceName); return; }
  }catch(e){}
  try{ localStorage.setItem(VKEY, voiceName); }catch(e){}
}
function enVoices(){ return voices.filter(v => /^en/i.test(v.lang)); }
function loadVoices(onChange){
  try{
    voices = speechSynthesis.getVoices() || [];
    speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices() || [];
      if(onChange) onChange();
    };
  }catch(e){ voices = []; }
}
function say(text){
  try{
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = enVoices().find(x => x.name === voiceName);
    if(v){ u.voice = v; u.lang = v.lang; } else { u.lang = "en-GB"; }
    u.rate = .8;
    speechSynthesis.speak(u);
  }catch(e){}
}

/* ---------- hiệu ứng âm thanh (Web Audio, không cần file âm thanh) ---------- */
let actx = null;
function tone(freq, start, dur, type, gain){
  try{
    actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type||"sine"; o.frequency.value = freq;
    g.gain.value = 0;
    o.connect(g); g.connect(actx.destination);
    const t0 = actx.currentTime + start;
    g.gain.linearRampToValueAtTime(gain||0.15, t0+0.02);
    g.gain.linearRampToValueAtTime(0, t0+dur);
    o.start(t0); o.stop(t0+dur+0.02);
  }catch(e){}
}
function sfxRight(){ tone(523,0,.12,"triangle"); tone(659,.1,.12,"triangle"); tone(784,.2,.18,"triangle"); }
function sfxWrong(){ tone(200,0,.16,"square",.16); tone(150,.14,.24,"square",.16); }
function sfxBadge(){ tone(392,0,.12,"square",.1); tone(523,.1,.12,"square",.1); tone(659,.2,.12,"square",.1); tone(784,.3,.25,"square",.1); }
function sfxClick(){ tone(650,0,.045,"sine",.05); }
document.addEventListener("click", e=>{
  const el = e.target.closest("button, a.button");
  if(el && !el.disabled) sfxClick();
}, true);

/* ---------- hiệu ứng confetti (mừng khi đạt điểm cao / được huy hiệu) ---------- */
function burstConfetti(count){
  try{
    const container = document.getElementById("app");
    if(!container) return;
    const colors = ["#FFC93C","#3ECF8E","#3D6BFF","#FF5C6C","#8B5CF6"];
    const wrap = document.createElement("div");
    wrap.className = "confetti";
    for(let i=0;i<(count||20);i++){
      const s = document.createElement("i");
      s.style.left = (Math.random()*100)+"%";
      s.style.top = (-10-Math.random()*40)+"px";
      s.style.background = colors[i%colors.length];
      s.style.animationDelay = (Math.random()*0.25)+"s";
      wrap.appendChild(s);
    }
    container.appendChild(wrap);
    setTimeout(()=>wrap.remove(), 1500);
  }catch(e){}
}

/* ---------- đồng bộ Firebase (tuỳ chọn, mất mạng vẫn học được bình thường) ---------- */
let fbReady = false, fbDb = null, syncTimer = null;
function firebaseConfigured(){
  return typeof FIREBASE_CONFIG !== "undefined" && FIREBASE_CONFIG.apiKey;
}
function initFirebaseIfConfigured(){
  if(!firebaseConfigured() || fbReady) return;
  if(typeof firebase === "undefined") return;
  try{
    firebase.initializeApp(FIREBASE_CONFIG);
    fbDb = firebase.database();
    fbReady = true;
  }catch(e){ fbReady = false; }
}
function syncUp(){
  if(!firebaseConfigured()) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(()=>{
    initFirebaseIfConfigured();
    if(!fbReady) return;
    try{ fbDb.ref("families/"+FAMILY_ID+"/progress").set(progress); }catch(e){}
  }, 800);
}
function subscribeProgress(cb){
  initFirebaseIfConfigured();
  if(!fbReady){ cb(progress, false); return; }
  try{
    fbDb.ref("families/"+FAMILY_ID+"/progress").on("value", snap=>{
      const val = snap.val();
      if(val) progress = Object.assign(emptyProgress(), val);
      cb(progress, true);
    });
  }catch(e){ cb(progress, false); }
}

let syncTimerC = null;
function syncUpCustom(){
  if(!firebaseConfigured()) return;
  clearTimeout(syncTimerC);
  syncTimerC = setTimeout(()=>{
    initFirebaseIfConfigured();
    if(!fbReady) return;
    try{ fbDb.ref("families/"+FAMILY_ID+"/custom").set(customContent); }catch(e){}
  }, 800);
}
function subscribeCustom(cb){
  initFirebaseIfConfigured();
  if(!fbReady){ cb(customContent, false); return; }
  try{
    fbDb.ref("families/"+FAMILY_ID+"/custom").on("value", snap=>{
      const val = snap.val();
      if(val) customContent = Object.assign(emptyCustom(), val);
      cb(customContent, true);
    });
  }catch(e){ cb(customContent, false); }
}

let syncTimerS = null;
function syncUpSettings(){
  if(!firebaseConfigured()) return;
  clearTimeout(syncTimerS);
  syncTimerS = setTimeout(()=>{
    initFirebaseIfConfigured();
    if(!fbReady) return;
    try{ fbDb.ref("families/"+FAMILY_ID+"/settings").set(settings); }catch(e){}
  }, 800);
}
function subscribeSettings(cb){
  initFirebaseIfConfigured();
  if(!fbReady){ cb(settings, false); return; }
  try{
    fbDb.ref("families/"+FAMILY_ID+"/settings").on("value", snap=>{
      const val = snap.val();
      if(val) settings = {...defaultSettings(), ...val};
      cb(settings, true);
    });
  }catch(e){ cb(settings, false); }
}
