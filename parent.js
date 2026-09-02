const app = document.getElementById("app");
let pin = null, pinInput = "", setupStage = 1, setupFirst = "", pinError = "";
let unlocked = false;

function goBtn(id, inner, opts={}){
  const {disabled=false, ghost=false, attrs=""} = opts;
  return `<button class="go button${ghost?" ghost":""}" id="${id}" ${disabled?"disabled":""} ${attrs}><span class="button-outer"><span class="button-inner"><span>${inner}</span></span></span></button>`;
}
function goLink(href, inner, attrs=""){
  return `<a class="go button" href="${href}" ${attrs}><span class="button-outer"><span class="button-inner"><span>${inner}</span></span></span></a>`;
}

function pinDots(){
  return `<div class="pindots">${[0,1,2,3].map(i=>`<span class="pindot ${i<pinInput.length?"on":""}"></span>`).join("")}</div>`;
}
function pinPad(){
  const keys = ["1","2","3","4","5","6","7","8","9","","0","⌫"];
  return `<div class="pinpad">${keys.map(k=>k===""?`<span></span>`:`<button class="pinkey" data-k="${k}">${k}</button>`).join("")}</div>`;
}
function bindPinPad(onDigit, onBack){
  app.querySelectorAll(".pinkey").forEach(b=>b.onclick=()=>{
    if(b.dataset.k==="⌫") onBack(); else onDigit(b.dataset.k);
  });
}

function lockScreen(){
  const isSetup = !pin;
  app.innerHTML = `
    <div class="eyebrow">Khu vực phụ huynh</div>
    <h1>${isSetup ? (setupStage===1 ? "Đặt mã PIN mới" : "Nhập lại để xác nhận") : "Nhập mã PIN"}</h1>
    <p class="sub">${isSetup ? "Mã PIN giúp con không tự vào được mục này" : "Nhập mã PIN 4 số để xem báo cáo học tập"}</p>
    ${pinError ? `<p class="sub" style="color:var(--coral)">${esc(pinError)}</p>` : ""}
    ${pinDots()}
    ${pinPad()}
    <a class="parentlink" href="index.html">← Về trang học của con</a>`;
  bindPinPad(
    d => {
      if(pinInput.length>=4) return;
      pinInput += d;
      if(pinInput.length===4) setTimeout(()=>submitPin(isSetup), 150);
      else lockScreen();
    },
    () => { pinInput = pinInput.slice(0,-1); lockScreen(); }
  );
}

async function submitPin(isSetup){
  pinError = "";
  if(isSetup){
    if(setupStage===1){ setupFirst = pinInput; pinInput=""; setupStage=2; lockScreen(); return; }
    if(pinInput === setupFirst){
      await setPin(pinInput); pin = pinInput; unlocked = true; dashboard();
    } else {
      pinError = "Hai mã PIN không khớp, thử lại nhé."; setupStage=1; pinInput=""; setupFirst=""; lockScreen();
    }
  } else {
    if(pinInput === pin){ unlocked = true; dashboard(); }
    else { pinError = "Sai mã PIN, thử lại nhé."; pinInput=""; lockScreen(); }
  }
}

function accClass(acc){ return acc<0.5 ? "low" : acc<0.8 ? "mid" : "high"; }

function dashboard(){
  const words = progress.words || {};
  const wordEntries = Object.keys(words).map(en=>({en, ...words[en]}));
  const totalWordsInBook = DATA.reduce((s,u)=>s+unitWords(u.u).length,0);
  const learned = wordEntries.filter(w=>w.c>=3 && w.streak>=3).length;
  const masteredW = masteredWordsCount();
  const needReviewW = wordEntries.filter(w=>w.n>=1 && (w.c/w.n)<0.7).length;

  const patterns = progress.patterns || {};
  const patternEntries = Object.keys(patterns).map(key=>{
    const sep = key.indexOf("|");
    return {key, u:+key.slice(0,sep), q:key.slice(sep+1), ...patterns[key]};
  });
  const totalPatternsInBook = DATA.reduce((s,u)=>s+unitPatterns(u.u).length,0);
  const learnedP = learnedPatternsCount();
  const masteredP = masteredPatternsCount();
  const needReviewP = patternEntries.filter(p=>p.n>=1 && (p.c/p.n)<0.7).length;

  const totalTries = wordEntries.reduce((s,w)=>s+w.n,0) + patternEntries.reduce((s,p)=>s+p.n,0);
  const totalRight = wordEntries.reduce((s,w)=>s+w.c,0) + patternEntries.reduce((s,p)=>s+p.c,0);
  const retention = totalTries ? Math.round(100*totalRight/totalTries) : 0;
  const streak = currentDayStreak();

  const days = [];
  for(let i=6;i>=0;i--){ const d = new Date(Date.now()-i*DAY); days.push(todayStr(d)); }
  const hist = days.map(d=>progress.history[d] || {correct:0,total:0});
  const maxTotal = Math.max(1, ...hist.map(h=>h.total));

  const enToUnit = {};
  DATA.forEach(u=>unitWords(u.u).forEach(w=>{ enToUnit[w.en] = u.u; }));

  const weak = wordEntries.filter(w=>w.n>=2).sort((a,b)=>(a.c/a.n)-(b.c/b.n)).slice(0,8);
  const weakP = patternEntries.filter(p=>p.n>=2).sort((a,b)=>(a.c/a.n)-(b.c/b.n)).slice(0,8);

  const nextUnit = DATA.find(u=>!unitDoneP(u, words));
  const doneUnits = DATA.filter(u=>unitDoneP(u, words)).length;
  const lastUnit = progress.lastUnit ? DATA.find(u=>u.u===progress.lastUnit) : null;
  const curUnit = lastUnit || nextUnit;
  const curUnitWordsLearned = curUnit ? unitWords(curUnit.u).filter(w=>{ const s=words[w.en]; return s && s.c>=3 && s.streak>=3; }).length : 0;
  const suggestWords = weak.slice(0,5).map(w=>`${w.en} (Unit ${enToUnit[w.en]||"?"})`);

  const earned = (progress.badges||[]).map(id=>effectiveBadges().find(b=>b.id===id)).filter(Boolean);

  app.innerHTML = `
    <div class="bar" style="justify-content:space-between">
      <div>
        <div class="eyebrow">Báo cáo học tập</div>
        <h1 style="margin:4px 0 2px">Con học thế nào?</h1>
      </div>
      <button class="quit" id="refresh" aria-label="Làm mới báo cáo"><span style="width:18px;height:18px;display:block">${renderEmblem("refresh")}</span></button>
    </div>
    <p class="sub" style="margin:2px 0 16px">⭐ <b style="color:var(--stud)">${progress.stars||0} sao</b> đã tích luỹ</p>

    <div class="statcards">
    <div class="card">
      <h3>Unit đang học</h3>
      <div class="statgrid">
        <div class="stat"><b>${curUnit ? curUnit.u : "—"}</b><span>${curUnit ? esc(unitMeta(curUnit.u).t) : "Đã xong hết"}</span></div>
        <div class="stat"><b>${curUnit ? curUnitWordsLearned+"/"+unitWords(curUnit.u).length : doneUnits+"/"+DATA.length}</b><span>${curUnit ? "từ đã thuộc trong Unit này" : "Unit đã hoàn thành"}</span></div>
        <div class="stat"><b>${doneUnits}/${DATA.length}</b><span>Unit đã hoàn thành</span></div>
      </div>
    </div>

    <div class="card">
      <h3>Từ vựng</h3>
      <div class="statgrid">
        <div class="stat"><b>${learned}</b><span>từ đã thuộc / ${totalWordsInBook}</span></div>
        <div class="stat"><b>${masteredW}</b><span>từ đã thành thạo</span></div>
        <div class="stat"><b>${needReviewW}</b><span>từ cần ôn thêm</span></div>
      </div>
    </div>

    <div class="card">
      <h3>Mẫu câu</h3>
      <div class="statgrid">
        <div class="stat"><b>${learnedP}</b><span>câu đã thuộc / ${totalPatternsInBook}</span></div>
        <div class="stat"><b>${masteredP}</b><span>câu đã thành thạo</span></div>
        <div class="stat"><b>${needReviewP}</b><span>câu cần ôn thêm</span></div>
      </div>
    </div>

    <div class="card">
      <h3>Tỉ lệ ghi nhớ</h3>
      <div class="statgrid">
        <div class="stat"><b>${retention}%</b><span>tỉ lệ ghi nhớ chung</span></div>
        <div class="stat"><b>${totalTries}</b><span>lượt luyện tập</span></div>
        <div class="stat"><b>${streak}</b><span>ngày học liên tiếp</span></div>
      </div>
    </div>
    </div>

    <div class="card">
      <h3>7 ngày gần đây</h3>
      <div class="hist">${hist.map((h,i)=>{
        const pct = h.total ? Math.round(100*h.total/maxTotal) : 2;
        const acc = h.total ? Math.round(100*h.correct/h.total) : 0;
        return `<div class="histday"><div class="histpct">${h.total?acc+"%":"—"}</div><div class="histtrack"><div class="histbar" style="height:${pct}%"></div></div><div class="histlbl">${days[i].slice(8,10)}/${days[i].slice(5,7)}</div></div>`;
      }).join("")}</div>
    </div>

    ${earned.length ? `<div class="card"><h3>Huy hiệu đã đạt</h3><div class="badgerow">${earned.map(b=>`<span class="badgechip"><span class="ic">${b.icon}</span>${esc(b.name)}</span>`).join("")}</div></div>` : ""}

    <div class="suggest">
      <b>💡 Gợi ý cho hôm nay</b>
      <p style="margin:8px 0 0;font-size:14px;color:var(--ink)">
        ${nextUnit ? `Nên học tiếp <b>Unit ${nextUnit.u} — ${esc(unitMeta(nextUnit.u).t)}</b>.` : "Con đã hoàn thành hết các Unit hiện có, rất giỏi!"}
        ${suggestWords.length ? `<br>Nên ôn lại các từ hay sai: <b>${suggestWords.map(esc).join(", ")}</b>.` : ""}
      </p>
    </div>

    <div class="card">
      <h3>Từ hay sai nhất</h3>
      ${weak.length ? weak.map(w=>{
        const acc = Math.round(100*w.c/w.n);
        return `<div class="wordrow"><span>${esc(w.en)} <em style="color:var(--mist);font-style:normal">· Unit ${enToUnit[w.en]||"?"}</em></span><span class="acc ${accClass(w.c/w.n)}">${acc}% (${w.c}/${w.n})</span></div>`;
      }).join("") : `<p class="sub" style="margin:0">Chưa có đủ dữ liệu.</p>`}
    </div>

    <div class="card">
      <h3>Câu hay sai nhất</h3>
      ${weakP.length ? weakP.map(p=>{
        const acc = Math.round(100*p.c/p.n);
        return `<div class="wordrow"><span>${esc(p.q)} <em style="color:var(--mist);font-style:normal">· Unit ${p.u}</em></span><span class="acc ${accClass(p.c/p.n)}">${acc}% (${p.c}/${p.n})</span></div>`;
      }).join("") : `<p class="sub" style="margin:0">Chưa có đủ dữ liệu.</p>`}
    </div>

    <div class="card">
      <h3>Nội dung học</h3>
      <p class="sub" style="margin:0 0 10px">Thừa hoặc thiếu từ/câu so với sách của con? Bạn có thể tự thêm, ẩn hoặc xoá.</p>
      ${goBtn("editContent", `<span class="btnicon">${renderEmblem("pencil")}</span>Thêm/bớt từ &amp; mẫu câu`, {ghost:true, attrs:'style="margin:0"'})}
    </div>

    <div class="card">
      <h3>Đề tự soạn</h3>
      <p class="sub" style="margin:0 0 10px">Tự soạn từng câu hỏi (trắc nghiệm, điền từ, nối từ, sắp xếp câu) — đề sẽ nằm trong mục "Đề nâng cao" của con.</p>
      ${goBtn("editTests", `<span class="btnicon">${renderEmblem("puzzlepc")}</span>Soạn đề tự chọn`, {ghost:true, attrs:'style="margin:0"'})}
    </div>

    <div class="card">
      <h3>Cài đặt App</h3>
      <p class="sub" style="margin:0 0 10px">Tiêu đề, lời chào, Unit, cách học, đề ôn tập, giọng đọc, kho thưởng — tất cả ở một chỗ.</p>
      ${goBtn("openAppSettings", `<span class="btnicon">${renderEmblem("gear")}</span>Mở Cài đặt App`, {ghost:true, attrs:'style="margin:0"'})}
      <p class="sub" style="margin:10px 0 0;font-size:11px">${firebaseConfigured() ? "🔗 Đang đồng bộ qua Firebase" : "📱 Đang lưu trên máy này — bật Firebase trong firebase-config.js để xem từ xa"}</p>
    </div>

    <div class="row">
      ${goBtn("lock", `<span class="btnicon">${renderEmblem("lock")}</span>Khoá lại`, {ghost:true})}
      ${goLink("index.html", "Về trang học của con")}
    </div>`;
  document.getElementById("lock").onclick = ()=>{ unlocked=false; pinInput=""; lockScreen(); };
  document.getElementById("editContent").onclick = ()=>contentEditor(1);
  document.getElementById("openAppSettings").onclick = appSettings;
  document.getElementById("editTests").onclick = customTestEditor;
  document.getElementById("refresh").onclick = async()=>{ await loadProgress(); dashboard(); };
}

/* ---------- soạn đề tự chọn (từng câu, nằm trong "Đề nâng cao") ---------- */
let testDraft = null;        // {name, questions:[]}
let testDraftEditIdx = null; // null = đề mới, số = đang sửa đề thứ mấy
let qFormType = null;        // 'mc'|'fill'|'match'|'rearrange'|null
let qFormCorrect = 0;
let qEditIdx = null;         // null = đang thêm câu mới, số = đang sửa câu đã có ở vị trí này

function customTestEditor(){
  if(testDraft) return testBuilderView();
  const list = customContent.customTests || [];
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">ĐỀ TỰ SOẠN</div>
    </div>
    <p class="sub">Các đề soạn ở đây sẽ nằm trong mục "Đề nâng cao" bên app của con.</p>
    <div class="card">
      <h3>Các đề đã tạo</h3>
      ${list.length ? list.map((t,i)=>`
        <div class="wordrow">
          <span>${t.hidden?"🚫 ":""}${esc(t.name)} <em style="color:var(--mist);font-style:normal">— ${(t.questions||[]).length} câu</em></span>
          <div style="display:flex;gap:6px">
            <button class="ghostbtn" data-editctest="${i}">Sửa</button>
            <button class="ghostbtn" data-hidectest="${i}">${t.hidden?"Hiện":"Ẩn"}</button>
            <button class="ghostbtn" data-delctest="${i}">Xoá</button>
          </div>
        </div>`).join("") : `<p class="sub" style="margin:0">Chưa có đề nào.</p>`}
    </div>
    ${goBtn("ct_new", "+ Tạo đề mới", {attrs:'style="margin:0 0 14px"'})}
    ${goBtn("done", "Xong, quay lại báo cáo", {ghost:true})}`;
  document.getElementById("back").onclick = dashboard;
  document.getElementById("done").onclick = dashboard;
  document.getElementById("ct_new").onclick = ()=>{
    testDraft = {name:"", questions:[]};
    testDraftEditIdx = null;
    customTestEditor();
  };
  app.querySelectorAll("[data-editctest]").forEach(b=>b.onclick=()=>{
    const i = +b.dataset.editctest;
    testDraft = JSON.parse(JSON.stringify(customContent.customTests[i]));
    testDraftEditIdx = i;
    customTestEditor();
  });
  app.querySelectorAll("[data-hidectest]").forEach(b=>b.onclick=async()=>{
    await toggleCustomTestHidden(+b.dataset.hidectest);
    customTestEditor();
  });
  app.querySelectorAll("[data-delctest]").forEach(b=>b.onclick=async()=>{
    await removeCustomTest(+b.dataset.delctest);
    customTestEditor();
  });
}

const QTYPE_LABEL = {
  mc:"Trắc nghiệm", fill:"Điền từ", match:"Nối từ", rearrange:"Sắp xếp câu",
  build:"Xếp chữ cái", write:"Viết lại từ", picture:"Nhìn hình đoán từ",
  sentence:"Luyện mẫu câu", dictation:"Nghe chép chính tả", odd:"Tìm từ khác loại"
};
function questionPreview(q){
  if(q.type==="mc") return q.q;
  if(q.type==="fill") return q.sentence;
  if(q.type==="match") return q.pairs.length+" cặp từ";
  if(q.type==="rearrange") return q.sentence;
  if(q.type==="build") return q.en;
  if(q.type==="write") return q.en;
  if(q.type==="picture") return q.opts[q.correct];
  if(q.type==="sentence") return q.q;
  if(q.type==="dictation") return q.en;
  if(q.type==="odd") return q.words.join(", ");
}
function syncDraftName(){
  const el = document.getElementById("td_name");
  if(el) testDraft.name = el.value;
}

function testBuilderView(){
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">${testDraftEditIdx!==null?"SỬA ĐỀ":"TẠO ĐỀ MỚI"}</div>
    </div>
    <div class="card">
      <input class="type-in small" id="td_name" placeholder="Tên đề (VD: Ôn trước bài kiểm tra thứ 5)" value="${esc(testDraft.name)}">
    </div>
    <div class="card">
      <h3>Các câu đã thêm (${testDraft.questions.length})</h3>
      ${testDraft.questions.length ? testDraft.questions.map((q,i)=>`
        <div class="wordrow">
          <span><b style="color:var(--hero-blue)">${QTYPE_LABEL[q.type]}</b> — ${esc(questionPreview(q))}</span>
          <div style="display:flex;gap:6px">
            <button class="ghostbtn" data-editq="${i}">Sửa</button>
            <button class="ghostbtn" data-delq="${i}">Xoá</button>
          </div>
        </div>`).join("") : `<p class="sub" style="margin:0">Chưa có câu nào.</p>`}
    </div>
    <div class="card">
      <h3>${qFormType && qEditIdx!==null ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}</h3>
      ${!qFormType ? `
        <div class="row" style="flex-wrap:wrap;gap:8px">
          <button class="ghostbtn" data-qtype="mc">+ Trắc nghiệm</button>
          <button class="ghostbtn" data-qtype="fill">+ Điền từ</button>
          <button class="ghostbtn" data-qtype="match">+ Nối từ</button>
          <button class="ghostbtn" data-qtype="rearrange">+ Sắp xếp câu</button>
          <button class="ghostbtn" data-qtype="build">+ Xếp chữ cái</button>
          <button class="ghostbtn" data-qtype="write">+ Viết lại từ</button>
          <button class="ghostbtn" data-qtype="picture">+ Nhìn hình đoán từ</button>
          <button class="ghostbtn" data-qtype="sentence">+ Luyện mẫu câu</button>
          <button class="ghostbtn" data-qtype="dictation">+ Nghe chép chính tả</button>
          <button class="ghostbtn" data-qtype="odd">+ Tìm từ khác loại</button>
        </div>
      ` : questionFormHtml()}
    </div>
    <div class="row">
      ${goBtn("td_save", `<span class="btnicon">${renderEmblem("save")}</span>Lưu đề`)}
      ${goBtn("td_cancel", "Huỷ", {ghost:true})}
    </div>`;
  document.getElementById("back").onclick = ()=>{ testDraft=null; testDraftEditIdx=null; qFormType=null; dashboard(); };
  document.getElementById("td_cancel").onclick = ()=>{ testDraft=null; testDraftEditIdx=null; qFormType=null; dashboard(); };
  app.querySelectorAll("[data-delq]").forEach(b=>b.onclick=()=>{
    syncDraftName();
    const idx = +b.dataset.delq;
    testDraft.questions.splice(idx,1);
    if(qEditIdx===idx){ qEditIdx=null; qFormType=null; }
    testBuilderView();
  });
  app.querySelectorAll("[data-editq]").forEach(b=>b.onclick=()=>{
    syncDraftName();
    qEditIdx = +b.dataset.editq;
    const q = testDraft.questions[qEditIdx];
    qFormType = q.type;
    qFormCorrect = q.correct!==undefined ? q.correct : (q.oddIndex||0);
    testBuilderView();
  });
  app.querySelectorAll("[data-qtype]").forEach(b=>b.onclick=()=>{
    syncDraftName();
    qFormType = b.dataset.qtype; qFormCorrect = 0; qEditIdx = null;
    testBuilderView();
  });
  bindQuestionForm();
  document.getElementById("td_save").onclick = async()=>{
    const name = document.getElementById("td_name").value.trim();
    if(!name){ alert("Cần đặt tên cho đề."); return; }
    if(!testDraft.questions.length){ alert("Cần thêm ít nhất 1 câu hỏi."); return; }
    testDraft.name = name;
    if(testDraftEditIdx!==null) await updateCustomTest(testDraftEditIdx, testDraft);
    else await addCustomTest(testDraft);
    testDraft = null; testDraftEditIdx = null; qFormType = null;
    customTestEditor();
  };
}

function questionFormHtml(){
  const abcd = i=>String.fromCharCode(65+i);
  const editing = qEditIdx !== null ? testDraft.questions[qEditIdx] : null;
  const saveLabel = editing ? `<span class="btnicon">${renderEmblem("save")}</span>Lưu câu hỏi` : "+ Thêm câu";
  if(qFormType==="mc" || qFormType==="fill"){
    const isMc = qFormType==="mc";
    const qVal = editing ? (isMc ? editing.q : editing.sentence) : "";
    const opts = editing ? editing.opts : ["","","",""];
    return `<div class="editform">
      <input class="type-in small" id="qf_sentence" placeholder="${isMc ? "Câu hỏi (VD: 'book' nghĩa là gì?)" : "Câu có chỗ trống, dùng đúng _____ (VD: I have a _____.)"}" value="${esc(qVal)}">
      ${[0,1,2,3].map(i=>`<input class="type-in small" id="qf_o${i}" placeholder="Đáp án ${abcd(i)}" value="${esc(opts[i]||"")}">`).join("")}
      <div class="sub" style="margin:4px 0 0">Đáp án đúng:</div>
      <div class="row">${[0,1,2,3].map(i=>`<button class="ghostbtn" data-correct="${i}" aria-pressed="${qFormCorrect===i}" style="${qFormCorrect===i?"box-shadow:var(--pressed-sm), 0 0 0 2px var(--hero-blue)":""}">${abcd(i)}</button>`).join("")}</div>
      <div class="row" style="margin-top:10px">${goBtn("qf_add",saveLabel)}${goBtn("qf_cancel","Huỷ",{ghost:true})}</div>
    </div>`;
  }
  if(qFormType==="match"){
    const pairs = editing ? editing.pairs : [];
    return `<div class="editform">
      <p class="sub" style="margin:0 0 6px">Nhập tối đa 6 cặp (cần ít nhất 3 cặp đầy đủ):</p>
      ${[0,1,2,3,4,5].map(i=>`
        <div class="row" style="margin-top:6px">
          <input class="type-in small" id="qf_l${i}" placeholder="Từ tiếng Anh" value="${esc((pairs[i]&&pairs[i][0])||"")}">
          <input class="type-in small" id="qf_r${i}" placeholder="Nghĩa tiếng Việt" value="${esc((pairs[i]&&pairs[i][1])||"")}">
        </div>`).join("")}
      <div class="row" style="margin-top:10px">${goBtn("qf_add",saveLabel)}${goBtn("qf_cancel","Huỷ",{ghost:true})}</div>
    </div>`;
  }
  if(qFormType==="rearrange"){
    return `<div class="editform">
      <input class="type-in small" id="qf_sentence" placeholder="Câu đúng hoàn chỉnh, VD: I am a good student." value="${esc(editing?editing.sentence:"")}">
      <div class="row" style="margin-top:10px">${goBtn("qf_add",saveLabel)}${goBtn("qf_cancel","Huỷ",{ghost:true})}</div>
    </div>`;
  }
  if(qFormType==="build" || qFormType==="write" || qFormType==="dictation"){
    return `<div class="editform">
      <input class="type-in small" id="qf_en" placeholder="Từ tiếng Anh (đáp án đúng)" value="${esc(editing?editing.en:"")}">
      <input class="type-in small" id="qf_vi" placeholder="Nghĩa tiếng Việt (gợi ý cho con)" value="${esc(editing?editing.vi:"")}">
      <div class="row" style="margin-top:10px">${goBtn("qf_add",saveLabel)}${goBtn("qf_cancel","Huỷ",{ghost:true})}</div>
    </div>`;
  }
  if(qFormType==="picture"){
    const opts = editing ? editing.opts : ["","","",""];
    return `<div class="editform">
      <p class="sub" style="margin:0 0 6px">Từ tiếng Anh cần trùng với 1 từ đã có trong kho từ vựng (để dùng lại hình có sẵn):</p>
      ${[0,1,2,3].map(i=>`<input class="type-in small" id="qf_o${i}" placeholder="Đáp án ${abcd(i)}" value="${esc(opts[i]||"")}">`).join("")}
      <div class="sub" style="margin:4px 0 0">Đáp án đúng (từ có hình):</div>
      <div class="row">${[0,1,2,3].map(i=>`<button class="ghostbtn" data-correct="${i}" aria-pressed="${qFormCorrect===i}" style="${qFormCorrect===i?"box-shadow:var(--pressed-sm), 0 0 0 2px var(--hero-blue)":""}">${abcd(i)}</button>`).join("")}</div>
      <div class="row" style="margin-top:10px">${goBtn("qf_add",saveLabel)}${goBtn("qf_cancel","Huỷ",{ghost:true})}</div>
    </div>`;
  }
  if(qFormType==="sentence"){
    const qVal = editing ? editing.q : "";
    const opts = editing ? editing.opts : ["","","",""];
    return `<div class="editform">
      <input class="type-in small" id="qf_sentence" placeholder="Câu hỏi mẫu (VD: What's your name?)" value="${esc(qVal)}">
      ${[0,1,2,3].map(i=>`<input class="type-in small" id="qf_o${i}" placeholder="Câu trả lời ${abcd(i)}" value="${esc(opts[i]||"")}">`).join("")}
      <div class="sub" style="margin:4px 0 0">Đáp án đúng:</div>
      <div class="row">${[0,1,2,3].map(i=>`<button class="ghostbtn" data-correct="${i}" aria-pressed="${qFormCorrect===i}" style="${qFormCorrect===i?"box-shadow:var(--pressed-sm), 0 0 0 2px var(--hero-blue)":""}">${abcd(i)}</button>`).join("")}</div>
      <div class="row" style="margin-top:10px">${goBtn("qf_add",saveLabel)}${goBtn("qf_cancel","Huỷ",{ghost:true})}</div>
    </div>`;
  }
  if(qFormType==="odd"){
    const words = editing ? editing.words : ["","","",""];
    return `<div class="editform">
      <p class="sub" style="margin:0 0 6px">Nhập 4 từ tiếng Anh — 3 từ cùng nhóm + 1 từ khác loại:</p>
      ${[0,1,2,3].map(i=>`<input class="type-in small" id="qf_o${i}" placeholder="Từ ${abcd(i)}" value="${esc(words[i]||"")}">`).join("")}
      <div class="sub" style="margin:4px 0 0">Từ khác loại (đáp án đúng):</div>
      <div class="row">${[0,1,2,3].map(i=>`<button class="ghostbtn" data-correct="${i}" aria-pressed="${qFormCorrect===i}" style="${qFormCorrect===i?"box-shadow:var(--pressed-sm), 0 0 0 2px var(--hero-blue)":""}">${abcd(i)}</button>`).join("")}</div>
      <div class="row" style="margin-top:10px">${goBtn("qf_add",saveLabel)}${goBtn("qf_cancel","Huỷ",{ghost:true})}</div>
    </div>`;
  }
  return "";
}
function bindQuestionForm(){
  if(!qFormType) return;
  app.querySelectorAll("[data-correct]").forEach(b=>b.onclick=()=>{
    qFormCorrect = +b.dataset.correct;
    app.querySelectorAll("[data-correct]").forEach(x=>{
      const on = +x.dataset.correct === qFormCorrect;
      x.setAttribute("aria-pressed", String(on));
      x.style.boxShadow = on ? "var(--pressed-sm), 0 0 0 2px var(--hero-blue)" : "";
    });
  });
  const cancelBtn = document.getElementById("qf_cancel");
  if(cancelBtn) cancelBtn.onclick = ()=>{ syncDraftName(); qFormType=null; qEditIdx=null; testBuilderView(); };
  const addBtn = document.getElementById("qf_add");
  if(!addBtn) return;
  addBtn.onclick = ()=>{
    syncDraftName();
    let newQ = null;
    if(qFormType==="mc"){
      const q = document.getElementById("qf_sentence").value.trim();
      const opts = [0,1,2,3].map(i=>document.getElementById("qf_o"+i).value.trim());
      if(!q || opts.some(o=>!o)){ alert("Cần nhập đủ câu hỏi và cả 4 đáp án."); return; }
      newQ = {type:"mc", q, opts, correct:qFormCorrect};
    } else if(qFormType==="fill"){
      const sentence = document.getElementById("qf_sentence").value.trim();
      const opts = [0,1,2,3].map(i=>document.getElementById("qf_o"+i).value.trim());
      if(!sentence || opts.some(o=>!o)){ alert("Cần nhập đủ câu và cả 4 đáp án."); return; }
      if(!sentence.includes("_____")){ alert("Câu cần có chỗ trống, dùng đúng 5 dấu gạch dưới: _____"); return; }
      newQ = {type:"fill", sentence, opts, correct:qFormCorrect};
    } else if(qFormType==="match"){
      const pairs = [];
      for(let i=0;i<6;i++){
        const l = document.getElementById("qf_l"+i).value.trim();
        const r = document.getElementById("qf_r"+i).value.trim();
        if(l && r) pairs.push([l,r]);
      }
      if(pairs.length<3){ alert("Cần ít nhất 3 cặp đầy đủ (cả 2 cột)."); return; }
      newQ = {type:"match", pairs};
    } else if(qFormType==="rearrange"){
      const sentence = document.getElementById("qf_sentence").value.trim();
      if(!sentence || sentence.split(" ").length<3){ alert("Cần nhập câu đầy đủ, ít nhất 3 từ."); return; }
      newQ = {type:"rearrange", sentence};
    } else if(qFormType==="build" || qFormType==="write" || qFormType==="dictation"){
      const en = document.getElementById("qf_en").value.trim();
      const vi = document.getElementById("qf_vi").value.trim();
      if(!en){ alert("Cần nhập từ tiếng Anh."); return; }
      newQ = {type:qFormType, en, vi};
    } else if(qFormType==="picture"){
      const opts = [0,1,2,3].map(i=>document.getElementById("qf_o"+i).value.trim());
      if(opts.some(o=>!o)){ alert("Cần nhập đủ cả 4 đáp án."); return; }
      newQ = {type:"picture", opts, correct:qFormCorrect};
    } else if(qFormType==="sentence"){
      const q = document.getElementById("qf_sentence").value.trim();
      const opts = [0,1,2,3].map(i=>document.getElementById("qf_o"+i).value.trim());
      if(!q || opts.some(o=>!o)){ alert("Cần nhập đủ câu hỏi và cả 4 câu trả lời."); return; }
      newQ = {type:"sentence", q, opts, correct:qFormCorrect};
    } else if(qFormType==="odd"){
      const words = [0,1,2,3].map(i=>document.getElementById("qf_o"+i).value.trim());
      if(words.some(w=>!w)){ alert("Cần nhập đủ 4 từ."); return; }
      newQ = {type:"odd", words, oddIndex:qFormCorrect};
    }
    if(qEditIdx !== null) testDraft.questions[qEditIdx] = newQ;
    else testDraft.questions.push(newQ);
    qFormType = null; qEditIdx = null;
    testBuilderView();
  };
}

/* ---------- CÀI ĐẶT APP (trung tâm cài đặt của phụ huynh) ---------- */
const UNIT_EMBLEM_CHOICES = ["spider","core","shield","swirl","hammer","fist","moonstar","bow","paw","hex","ant","wing","gear","rocket","tree","gem","helmet","eyemask","raccoonface","cometstar","crown","lightning","target","atom","orb","star","wave","claws","flame","banner"];
const SETTINGS_LABELS = {
  perCorrect:     {label:"Mỗi câu trả lời đúng (học thường)",   unit:"sao / câu"},
  perTestCorrect: {label:"Mỗi câu trả lời đúng (bài kiểm tra)", unit:"sao / câu"},
  perUnitDone:    {label:"Khi hoàn thành trọn 1 Unit",          unit:"sao / Unit"},
  perBadge:       {label:"Khi mở được 1 huy hiệu mới",          unit:"sao / huy hiệu"}
};

function appSettings(){
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">CÀI ĐẶT APP</div>
    </div>
    <p class="sub">Tiêu đề, lời chào, Unit, cách học, đề ôn tập, giọng đọc và kho thưởng — tất cả ở một chỗ.</p>
    <div class="card">
      <h3>Tiêu đề & lời chào</h3>
      <p class="sub" style="margin:0 0 10px">Đổi tên app và tên gọi của con — hữu ích khi dùng lại app cho lớp sau.</p>
      ${goBtn("go_title", `<span class="btnicon">${renderEmblem("banner")}</span>Sửa tiêu đề & lời chào`, {ghost:true})}
    </div>
    <div class="card">
      <h3>Cài đặt Unit</h3>
      <p class="sub" style="margin:0 0 10px">Đổi tên chủ đề, nhân vật, icon, màu chữ từng Unit — hoặc ẩn Unit không dùng đến.</p>
      ${goBtn("go_units", `<span class="btnicon">${renderEmblem("book")}</span>Mở cài đặt Unit`, {ghost:true})}
    </div>
    <div class="card">
      <h3>Cách học</h3>
      <p class="sub" style="margin:0 0 10px">Bật/ẩn, đổi thứ tự, tên, icon và màu cho từng cách học.</p>
      ${goBtn("go_modes", `<span class="btnicon">${renderEmblem("atom")}</span>Mở cài đặt cách học`, {ghost:true})}
    </div>
    <div class="card">
      <h3>Ôn tập kiểm tra</h3>
      <p class="sub" style="margin:0 0 10px">Đổi tên và các Unit thuộc từng giai đoạn (giữa kỳ, cuối kỳ...).</p>
      ${goBtn("go_tests", `<span class="btnicon">${renderEmblem("target")}</span>Mở cài đặt ôn tập`, {ghost:true})}
    </div>
    <div class="card">
      <h3>Giọng đọc</h3>
      <p class="sub" style="margin:0 0 10px">Chọn giọng đọc tiếng Anh dùng trong app của con.</p>
      ${goBtn("go_voice", `<span class="btnicon">${renderEmblem("speaker")}</span>Mở cài đặt giọng đọc`, {ghost:true})}
    </div>
    <div class="card">
      <h3>Kho thưởng</h3>
      <p class="sub" style="margin:0 0 10px">Chỉnh số sao, quy tắc thưởng sao, và tự soạn huy hiệu.</p>
      ${goBtn("go_rewards", `<span class="btnicon">${renderEmblem("star")}</span>Mở cài đặt kho thưởng`, {ghost:true})}
    </div>
    <div class="card">
      <h3>Lưu trữ dữ liệu học</h3>
      <p class="sub" style="margin:0 0 10px">Đóng băng lại toàn bộ từ vựng, mẫu câu và kết quả hiện tại trước khi đổi sang nội dung mới (VD: lên lớp 4) — xem lại bất cứ lúc nào, không mất dữ liệu cũ.</p>
      ${goBtn("go_archive", `<span class="btnicon">${renderEmblem("save")}</span>Mở lưu trữ dữ liệu học`, {ghost:true})}
    </div>
    ${goBtn("done", "Xong, quay lại báo cáo", {ghost:true})}`;
  document.getElementById("back").onclick = dashboard;
  document.getElementById("done").onclick = dashboard;
  document.getElementById("go_title").onclick = titleSettings;
  document.getElementById("go_units").onclick = unitListSettings;
  document.getElementById("go_modes").onclick = modeSettings;
  document.getElementById("go_tests").onclick = testSettings;
  document.getElementById("go_voice").onclick = voiceSettings;
  document.getElementById("go_rewards").onclick = rewardSettings;
  document.getElementById("go_archive").onclick = archiveSettings;
}

/* ---- Tiêu đề & lời chào ---- */
function titleSettings(){
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">TIÊU ĐỀ & LỜI CHÀO</div>
    </div>
    <div class="card">
      <h3>Tên gọi ở nhà của con</h3>
      <p class="sub" style="margin:0 0 10px">Dùng để app gọi tên con cho gần gũi, ví dụ trong lời khen khi làm đúng.</p>
      <input class="type-in small" id="kidName" placeholder="Tên ở nhà (không bắt buộc)" value="${esc(settings.kidName||"")}">
    </div>
    <div class="card">
      <h3>Tiêu đề chính của app</h3>
      <input class="type-in small" id="appTitle" placeholder="VD: Tiếng Anh 3 · Global Success" value="${esc(settings.appTitle||"")}">
    </div>
    <div class="card">
      <h3>Lời nhắn cho con</h3>
      <p class="sub" style="margin:0 0 10px">Lời nhắn mỗi ngày hoặc mỗi đợt ra bài — con sẽ đọc ở đây và làm theo. Để trống thì app chỉ hiện lời chào mặc định.</p>
      <textarea class="type-in" id="greeting" rows="3" placeholder="VD: Hôm nay con học Unit 5 và ôn lại Unit 4 nhé!">${esc(settings.greeting||"")}</textarea>
    </div>
    ${goBtn("save", `<span class="btnicon">${renderEmblem("save")}</span>Lưu`)}
    ${goBtn("done", "Xong, quay lại", {ghost:true})}`;
  document.getElementById("back").onclick = appSettings;
  document.getElementById("done").onclick = appSettings;
  document.getElementById("save").onclick = async()=>{
    settings.kidName = document.getElementById("kidName").value.trim();
    settings.appTitle = document.getElementById("appTitle").value.trim() || "Tiếng Anh 3 · Global Success";
    settings.greeting = document.getElementById("greeting").value.trim();
    await saveSettings();
    appSettings();
  };
}

/* ---- Danh sách Unit → mở cài đặt riêng từng Unit ---- */
function unitListSettings(){
  const hidden = customContent.hiddenUnits || [];
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">CÀI ĐẶT UNIT</div>
    </div>
    <p class="sub">Chọn 1 Unit để đổi tên chủ đề, nhân vật, icon, màu — hoặc ẩn Unit không dùng đến.</p>
    <div class="card">
      ${DATA.map(u=>{
        const um = unitMeta(u.u);
        const isHidden = hidden.includes(u.u);
        return `<div class="wordrow">
          <span>${isHidden?"🚫 ":""}Unit ${u.u} — ${esc(um.t)} <em style="color:var(--mist);font-style:normal">(${esc(um.hero.name)})</em></span>
          <button class="ghostbtn" data-openunit="${u.u}">Cài đặt</button>
        </div>`;
      }).join("")}
    </div>
    ${goBtn("done", "Xong, quay lại", {ghost:true})}`;
  document.getElementById("back").onclick = appSettings;
  document.getElementById("done").onclick = appSettings;
  app.querySelectorAll("[data-openunit]").forEach(b=>b.onclick=()=>unitSettingsEditor(+b.dataset.openunit));
}

/* ---- Cách học: bật/ẩn, thứ tự, tên, icon, màu ---- */
const MODE_EMBLEM_CHOICES = ["stone","book","pencil","headphones","puzzlepc","eye","chatbubble","camera","keyboard","fillblank","linktwo","reorder"].concat(UNIT_EMBLEM_CHOICES);

function modeSettings(){
  const eff = effectiveModes();
  const hiddenIds = MODES.filter(m=>{ const o=(customContent.modeOverrides||{})[m.id]; return o&&o.hidden; }).map(m=>m.id);
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">CÀI ĐẶT CÁCH HỌC</div>
    </div>
    <p class="sub">Bật/ẩn, đổi thứ tự, tên, icon, màu cho từng cách học của con.</p>
    <div class="card">
      ${eff.map((m,i)=>`
        <div class="wordrow">
          <span><span style="display:inline-flex;width:20px;height:20px;color:var(--ink);vertical-align:middle;margin-right:6px">${renderEmblem(m.icon||"stone")}</span>${esc(m.name)}</span>
          <div style="display:flex;gap:4px">
            <button class="ghostbtn" data-up="${m.id}" ${i===0?"disabled":""}>↑</button>
            <button class="ghostbtn" data-down="${m.id}" ${i===eff.length-1?"disabled":""}>↓</button>
            <button class="ghostbtn" data-editmode="${m.id}">Sửa</button>
            <button class="ghostbtn" data-hidemode="${m.id}">Ẩn</button>
          </div>
        </div>`).join("")}
      ${hiddenIds.map(id=>{
        const base = MODES.find(m=>m.id===id);
        return `<div class="wordrow"><span style="color:var(--mist)">🚫 ${esc(base.name)} (đã ẩn)</span><button class="ghostbtn" data-showmode="${id}">Hiện lại</button></div>`;
      }).join("")}
    </div>
    ${goBtn("done", "Xong, quay lại", {ghost:true})}`;
  document.getElementById("back").onclick = appSettings;
  document.getElementById("done").onclick = appSettings;
  app.querySelectorAll("[data-hidemode]").forEach(b=>b.onclick=async()=>{ await setModeOverride(b.dataset.hidemode, {hidden:true}); modeSettings(); });
  app.querySelectorAll("[data-showmode]").forEach(b=>b.onclick=async()=>{ await setModeOverride(b.dataset.showmode, {hidden:false}); modeSettings(); });
  app.querySelectorAll("[data-editmode]").forEach(b=>b.onclick=()=>modeEditForm(b.dataset.editmode));
  app.querySelectorAll("[data-up]").forEach(b=>b.onclick=()=>swapModeOrder(b.dataset.up, -1));
  app.querySelectorAll("[data-down]").forEach(b=>b.onclick=()=>swapModeOrder(b.dataset.down, 1));
}
async function swapModeOrder(id, dir){
  const eff = effectiveModes();
  const i = eff.findIndex(m=>m.id===id);
  const j = i+dir;
  if(j<0 || j>=eff.length) return;
  const ids = eff.map(m=>m.id);
  [ids[i], ids[j]] = [ids[j], ids[i]];
  for(let k=0;k<ids.length;k++) await setModeOverride(ids[k], {order:k});
  modeSettings();
}
function modeEditForm(id){
  const base = MODES.find(m=>m.id===id);
  const o = (customContent.modeOverrides||{})[id] || {};
  const curColor = o.color || STONES[id];
  let pickedIcon = o.icon || "stone";
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">SỬA: ${esc(base.name).toUpperCase()}</div>
    </div>
    <div class="card">
      <h3>Tên nhãn</h3>
      <input class="type-in small" id="m_name" placeholder="${esc(base.name)}" value="${esc(o.name||base.name)}">
    </div>
    <div class="card">
      <h3>Màu</h3>
      <input type="color" id="m_color" value="${curColor}">
    </div>
    <div class="card">
      <h3>Icon</h3>
      <div class="row" style="flex-wrap:wrap;gap:8px">
        ${MODE_EMBLEM_CHOICES.map(k=>`
          <button class="ghostbtn" data-emblem="${k}" style="width:44px;height:44px;padding:0;display:flex;align-items:center;justify-content:center;color:var(--ink);${k===pickedIcon?"box-shadow:var(--pressed-sm), 0 0 0 2px "+curColor:""}">
            <span style="width:26px;height:26px;display:block">${renderEmblem(k)}</span>
          </button>`).join("")}
      </div>
    </div>
    <div class="row">
      ${goBtn("save", `<span class="btnicon">${renderEmblem("save")}</span>Lưu`)}
      ${Object.keys(o).length ? goBtn("reset","Khôi phục mặc định",{ghost:true}) : ""}
    </div>
    ${goBtn("done", "Xong, quay lại", {ghost:true})}`;
  document.getElementById("back").onclick = modeSettings;
  document.getElementById("done").onclick = modeSettings;
  app.querySelectorAll("[data-emblem]").forEach(b=>b.onclick=()=>{
    pickedIcon = b.dataset.emblem;
    app.querySelectorAll("[data-emblem]").forEach(x=>{ x.style.boxShadow = x.dataset.emblem===pickedIcon ? "var(--pressed-sm), 0 0 0 2px "+curColor : ""; });
  });
  document.getElementById("save").onclick = async()=>{
    const name = document.getElementById("m_name").value.trim();
    const color = document.getElementById("m_color").value;
    await setModeOverride(id, { name: name||base.name, color, icon: pickedIcon });
    modeSettings();
  };
  const resetBtn = document.getElementById("reset");
  if(resetBtn) resetBtn.onclick = async()=>{ await resetModeOverride(id); modeSettings(); };
}

/* ---- Ôn tập kiểm tra: tên + các Unit thuộc từng giai đoạn ---- */
function testSettings(){
  const eff = effectiveTests();
  const advMenu = effectiveAdvancedMenu();
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">CÀI ĐẶT ÔN TẬP KIỂM TRA</div>
    </div>
    <p class="sub">Đổi tên và các Unit thuộc từng giai đoạn — hữu ích khi số Unit thay đổi ở lớp sau.</p>
    <div class="card">
      <h3>5 giai đoạn</h3>
      ${eff.map(t=>`
        <div class="wordrow">
          <span>${t.hidden?"🚫 ":""}${esc(t.name)} <em style="color:var(--mist);font-style:normal">— ${t.units.length} Unit</em></span>
          <div style="display:flex;gap:6px">
            <button class="ghostbtn" data-edittest="${t.id}">Sửa</button>
            <button class="ghostbtn" data-hidetest="${t.id}">${t.hidden?"Hiện":"Ẩn"}</button>
          </div>
        </div>`).join("")}
    </div>
    <div class="card">
      <h3>Điểm vào "Đề nâng cao"</h3>
      <p class="sub" style="margin:0 0 10px">Nút gộp chung 5 giai đoạn trên + các đề tự soạn — đổi tên/icon/màu, hoặc ẩn hẳn nút này.</p>
      <div class="wordrow">
        <span>${advMenu.hidden?"🚫 ":""}${esc(advMenu.name)}</span>
        <div style="display:flex;gap:6px">
          <button class="ghostbtn" id="editAdvMenu">Sửa</button>
          <button class="ghostbtn" id="hideAdvMenu">${advMenu.hidden?"Hiện":"Ẩn"}</button>
        </div>
      </div>
    </div>
    ${goBtn("done", "Xong, quay lại", {ghost:true})}`;
  document.getElementById("back").onclick = appSettings;
  document.getElementById("done").onclick = appSettings;
  app.querySelectorAll("[data-edittest]").forEach(b=>b.onclick=()=>testEditForm(b.dataset.edittest));
  app.querySelectorAll("[data-hidetest]").forEach(b=>b.onclick=async()=>{
    const t = eff.find(x=>x.id===b.dataset.hidetest);
    await setTestOverride(b.dataset.hidetest, { hidden: !t.hidden });
    testSettings();
  });
  document.getElementById("editAdvMenu").onclick = advancedMenuEditForm;
  document.getElementById("hideAdvMenu").onclick = async()=>{
    await setAdvancedMenuOverride({ hidden: !advMenu.hidden });
    testSettings();
  };
}
function advancedMenuEditForm(){
  const eff = effectiveAdvancedMenu();
  const hasOverride = Object.keys(customContent.advancedMenu||{}).length>0;
  const curColor = eff.color || "#7C3AED";
  let pickedIcon = eff.icon;
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">SỬA: ĐỀ NÂNG CAO</div>
    </div>
    <div class="card">
      <h3>Tên nút</h3>
      <input class="type-in small" id="am_name" placeholder="Đề nâng cao" value="${esc(eff.name)}">
    </div>
    <div class="card">
      <h3>Màu</h3>
      <input type="color" id="am_color" value="${curColor}">
    </div>
    <div class="card">
      <h3>Icon</h3>
      <div class="row" style="flex-wrap:wrap;gap:8px">
        ${["gauntlet","cometstar"].concat(MODE_EMBLEM_CHOICES).map(k=>`
          <button class="ghostbtn" data-emblem="${k}" style="width:44px;height:44px;padding:0;display:flex;align-items:center;justify-content:center;color:var(--ink);${k===pickedIcon?"box-shadow:var(--pressed-sm), 0 0 0 2px "+curColor:""}">
            <span style="width:26px;height:26px;display:block">${renderEmblem(k)}</span>
          </button>`).join("")}
      </div>
    </div>
    <div class="row">
      ${goBtn("save", `<span class="btnicon">${renderEmblem("save")}</span>Lưu`)}
      ${hasOverride ? goBtn("reset","Khôi phục mặc định",{ghost:true}) : ""}
    </div>
    ${goBtn("done", "Xong, quay lại", {ghost:true})}`;
  document.getElementById("back").onclick = testSettings;
  document.getElementById("done").onclick = testSettings;
  app.querySelectorAll("[data-emblem]").forEach(b=>b.onclick=()=>{
    pickedIcon = b.dataset.emblem;
    app.querySelectorAll("[data-emblem]").forEach(x=>{
      x.style.boxShadow = x.dataset.emblem===pickedIcon ? "var(--pressed-sm), 0 0 0 2px "+curColor : "";
    });
  });
  document.getElementById("save").onclick = async()=>{
    const name = document.getElementById("am_name").value.trim();
    const color = document.getElementById("am_color").value;
    await setAdvancedMenuOverride({ name: name||"Đề nâng cao", color, icon: pickedIcon });
    testSettings();
  };
  const resetBtn = document.getElementById("reset");
  if(resetBtn) resetBtn.onclick = async()=>{ await resetAdvancedMenuOverride(); testSettings(); };
}
function testEditForm(id){
  const base = TESTS.find(t=>t.id===id);
  const eff = effectiveTests().find(t=>t.id===id);
  const o = (customContent.testOverrides||{})[id] || {};
  const picked = new Set(eff.units);
  const curColor = eff.color || "#3D6BFF";
  let pickedIcon = eff.icon || "gauntlet";
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">SỬA: ${esc(base.name).toUpperCase()}</div>
    </div>
    <div class="card">
      <h3>Tên giai đoạn</h3>
      <input class="type-in small" id="t_name" placeholder="${esc(base.name)}" value="${esc(o.name||base.name)}">
    </div>
    <div class="card">
      <h3>Màu</h3>
      <input type="color" id="t_color" value="${curColor}">
    </div>
    <div class="card">
      <h3>Icon</h3>
      <div class="row" style="flex-wrap:wrap;gap:8px">
        ${["gauntlet","cometstar"].concat(MODE_EMBLEM_CHOICES).map(k=>`
          <button class="ghostbtn" data-emblem="${k}" style="width:44px;height:44px;padding:0;display:flex;align-items:center;justify-content:center;color:var(--ink);${k===pickedIcon?"box-shadow:var(--pressed-sm), 0 0 0 2px "+curColor:""}">
            <span style="width:26px;height:26px;display:block">${renderEmblem(k)}</span>
          </button>`).join("")}
      </div>
    </div>
    <div class="card">
      <h3>Các Unit thuộc giai đoạn này</h3>
      <div class="units">
        ${DATA.map(u=>`
          <button class="unit" data-tu="${u.u}" aria-pressed="${picked.has(u.u)}" style="padding:10px 8px">
            <b style="font-size:13px">Unit ${u.u}</b>
          </button>`).join("")}
      </div>
    </div>
    <div class="row">
      ${goBtn("save", `<span class="btnicon">${renderEmblem("save")}</span>Lưu`)}
      ${Object.keys(o).length ? goBtn("reset","Khôi phục mặc định",{ghost:true}) : ""}
    </div>
    ${goBtn("done", "Xong, quay lại", {ghost:true})}`;
  document.getElementById("back").onclick = testSettings;
  document.getElementById("done").onclick = testSettings;
  app.querySelectorAll("[data-tu]").forEach(b=>b.onclick=()=>{
    const n = +b.dataset.tu;
    picked.has(n) ? picked.delete(n) : picked.add(n);
    b.setAttribute("aria-pressed", String(picked.has(n)));
  });
  app.querySelectorAll("[data-emblem]").forEach(b=>b.onclick=()=>{
    pickedIcon = b.dataset.emblem;
    app.querySelectorAll("[data-emblem]").forEach(x=>{
      x.style.boxShadow = x.dataset.emblem===pickedIcon ? "var(--pressed-sm), 0 0 0 2px "+curColor : "";
    });
  });
  document.getElementById("save").onclick = async()=>{
    const name = document.getElementById("t_name").value.trim();
    const color = document.getElementById("t_color").value;
    if(!picked.size){ alert("Cần chọn ít nhất 1 Unit."); return; }
    await setTestOverride(id, { name: name||base.name, units:[...picked].sort((a,b)=>a-b), color, icon:pickedIcon });
    testSettings();
  };
  const resetBtn = document.getElementById("reset");
  if(resetBtn) resetBtn.onclick = async()=>{ await resetTestOverride(id); testSettings(); };
}

/* ---- Giọng đọc (chuyển từ trang của con sang đây) ---- */
function voiceSettings(){
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">GIỌNG ĐỌC</div>
    </div>
    <div class="card">
      ${enVoices().length ? `
        <select id="vsel" class="type-in">
          ${enVoices().map(v=>`<option value="${esc(v.name)}" ${v.name===voiceName?"selected":""}>${esc(v.name)} · ${esc(v.lang)}</option>`).join("")}
        </select>
        ${goBtn("vtry", `<span class="btnicon">${renderEmblem("speaker")}</span>Nghe thử "school"`, {ghost:true, attrs:'style="margin-top:10px"'})}
      ` : `<p class="sub" style="margin:0">Chưa tìm thấy giọng đọc nào. Bấm "Làm mới" bên dưới sau khi tải giọng mới trên thiết bị của con.</p>`}
      ${goBtn("vrefresh", `<span class="btnicon">${renderEmblem("refresh")}</span>Làm mới danh sách giọng đọc`, {ghost:true, attrs:'style="margin-top:10px"'})}
      <p class="sub" style="margin-top:10px">Muốn có thêm giọng hay hơn: trên iPad của con → Cài đặt → Trợ năng → Nội dung được nói → Giọng nói → English, tải giọng về, rồi quay lại đây bấm "Làm mới".</p>
    </div>
    ${goBtn("done", "Xong, quay lại", {ghost:true})}`;
  document.getElementById("back").onclick = appSettings;
  document.getElementById("done").onclick = appSettings;
  const vsel = document.getElementById("vsel");
  if(vsel){
    vsel.onchange = ()=>{ voiceName = vsel.value; saveVoicePref(); say("school"); };
    document.getElementById("vtry").onclick = ()=>say("school");
  }
  document.getElementById("vrefresh").onclick = ()=>{ loadVoices(()=>{}); setTimeout(voiceSettings, 300); };
}

/* ---- Kho thưởng: quy tắc, điều chỉnh sao trực tiếp, huy hiệu ---- */
function rewardSettings(){
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">KHO THƯỞNG</div>
    </div>
    <div class="card">
      <h3>Số sao hiện tại</h3>
      <p class="sub" style="margin:0 0 10px">Con đang có <b style="color:var(--stud)">⭐ ${progress.stars||0} sao</b>. Cộng/trừ trực tiếp khi đổi thưởng hoặc muốn thưởng thêm.</p>
      <div class="row">
        <input class="type-in small" id="starDelta" type="number" placeholder="Số sao (VD: 10 hoặc -10)" style="flex:2">
        ${goBtn("applyStars","Áp dụng",{attrs:'style="flex:1"'})}
      </div>
    </div>
    <div class="card">
      <h3>Quy tắc thưởng sao</h3>
      ${Object.keys(SETTINGS_LABELS).map(key=>{
        const opts = SETTINGS_OPTIONS[key];
        const info = SETTINGS_LABELS[key];
        return `<div class="wordrow" style="align-items:center">
          <span>${info.label}</span>
          <select class="type-in small" style="width:auto;padding:8px 10px" data-setting="${key}">
            ${opts.map(v=>`<option value="${v}" ${settings[key]===v?"selected":""}>${v} ${esc(info.unit)}</option>`).join("")}
          </select>
        </div>`;
      }).join("")}
      <p class="sub" style="margin-top:10px">💡 Gợi ý: dùng số sao làm căn cứ đổi thưởng với con (ví dụ: 100 sao = 1 lần đi chơi cuối tuần).</p>
    </div>
    <div class="card">
      <h3>Huy hiệu</h3>
      <p class="sub" style="margin:0 0 10px">Tự thêm, xoá, đổi tên, icon và điều kiện đạt huy hiệu.</p>
      ${goBtn("go_badges", `<span class="btnicon">${renderEmblem("crown")}</span>Mở soạn huy hiệu`, {ghost:true})}
    </div>
    ${goBtn("done", "Xong, quay lại", {ghost:true})}`;
  document.getElementById("back").onclick = appSettings;
  document.getElementById("done").onclick = appSettings;
  document.getElementById("go_badges").onclick = badgeSettings;
  app.querySelectorAll("[data-setting]").forEach(sel=>sel.onchange = async()=>{
    settings[sel.dataset.setting] = +sel.value;
    await saveSettings();
  });
  document.getElementById("applyStars").onclick = async()=>{
    const v = +document.getElementById("starDelta").value;
    if(!v){ alert("Nhập số sao khác 0."); return; }
    await adjustStars(v);
    rewardSettings();
  };
}

function badgeSettings(){
  const hidden = customContent.hiddenBadges || [];
  const custom = customContent.customBadges || [];
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">SOẠN HUY HIỆU</div>
    </div>
    <div class="card">
      <h3>Huy hiệu có sẵn</h3>
      ${BADGES.map(b=>{
        const isHidden = hidden.includes(b.id);
        const ov = (customContent.badgeOverrides||{})[b.id];
        const eff = ov ? {...b, ...ov} : b;
        return `<div class="wordrow">
          <span>${eff.icon} ${esc(eff.name)}${isHidden?` <em style="color:var(--coral);font-style:normal">(đã ẩn)</em>`:""}</span>
          <div style="display:flex;gap:6px">
            <button class="ghostbtn" data-editbadge="${b.id}">Sửa</button>
            <button class="ghostbtn" data-hidebadge="${b.id}">${isHidden?"Hiện lại":"Ẩn"}</button>
          </div>
        </div>`;
      }).join("")}
    </div>
    <div class="card">
      <h3>Huy hiệu tự tạo</h3>
      ${custom.length ? custom.map((b,i)=>`
        <div class="wordrow">
          <span>${b.icon} ${esc(b.name)}</span>
          <div style="display:flex;gap:6px">
            <button class="ghostbtn" data-editcustombadge="${i}">Sửa</button>
            <button class="ghostbtn" data-delcustombadge="${i}">Xoá</button>
          </div>
        </div>`).join("") : `<p class="sub" style="margin:0">Chưa có huy hiệu tự tạo.</p>`}
      ${goBtn("addBadge", "+ Thêm huy hiệu mới", {ghost:true, attrs:'style="margin-top:10px"'})}
    </div>
    ${goBtn("done", "Xong, quay lại", {ghost:true})}`;
  document.getElementById("back").onclick = rewardSettings;
  document.getElementById("done").onclick = rewardSettings;
  app.querySelectorAll("[data-hidebadge]").forEach(b=>b.onclick=async()=>{
    const id = b.dataset.hidebadge;
    if(hidden.includes(id)) await unhideBaseBadge(id); else await hideBaseBadge(id);
    badgeSettings();
  });
  app.querySelectorAll("[data-editbadge]").forEach(b=>b.onclick=()=>badgeEditForm({kind:"base", id:b.dataset.editbadge}));
  app.querySelectorAll("[data-editcustombadge]").forEach(b=>b.onclick=()=>badgeEditForm({kind:"custom", idx:+b.dataset.editcustombadge}));
  app.querySelectorAll("[data-delcustombadge]").forEach(b=>b.onclick=async()=>{ await removeCustomBadge(+b.dataset.delcustombadge); badgeSettings(); });
  document.getElementById("addBadge").onclick = ()=>badgeEditForm({kind:"new"});
}
function badgeEditForm(target){
  let data;
  if(target.kind==="base"){
    const b = BADGES.find(x=>x.id===target.id);
    const ov = (customContent.badgeOverrides||{})[target.id] || {};
    data = {...b, ...ov};
  } else if(target.kind==="custom"){
    data = customContent.customBadges[target.idx];
  } else {
    data = {name:"", icon:"🏅", desc:"", conditionType:"wordsLearned", conditionValue:10};
  }
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">${target.kind==="new"?"THÊM HUY HIỆU":"SỬA HUY HIỆU"}</div>
    </div>
    <div class="card">
      <input class="type-in small" id="b_icon" placeholder="Icon (1 emoji, VD: 🏅)" value="${esc(data.icon||"")}" style="max-width:100px">
      <input class="type-in small" id="b_name" placeholder="Tên huy hiệu" value="${esc(data.name||"")}">
      <input class="type-in small" id="b_desc" placeholder="Mô tả ngắn (VD: Thuộc 30 từ)" value="${esc(data.desc||"")}">
    </div>
    <div class="card">
      <h3>Điều kiện đạt được</h3>
      <select class="type-in" id="b_cond">
        ${Object.keys(BADGE_CONDITIONS).map(k=>`<option value="${k}" ${data.conditionType===k?"selected":""}>${esc(BADGE_CONDITIONS[k].label)}</option>`).join("")}
      </select>
      <input class="type-in small" id="b_val" type="number" style="margin-top:10px" placeholder="Số điều kiện" value="${data.conditionValue||""}" ${BADGE_CONDITIONS[data.conditionType].needsValue?"":"disabled"}>
    </div>
    <div class="row">
      ${goBtn("save", `<span class="btnicon">${renderEmblem("save")}</span>Lưu`)}
      ${target.kind!=="new" ? goBtn("del","Xoá",{ghost:true}) : ""}
    </div>
    ${goBtn("cancel", "Huỷ", {ghost:true})}`;
  document.getElementById("back").onclick = badgeSettings;
  document.getElementById("cancel").onclick = badgeSettings;
  const condSel = document.getElementById("b_cond");
  condSel.onchange = ()=>{ document.getElementById("b_val").disabled = !BADGE_CONDITIONS[condSel.value].needsValue; };
  document.getElementById("save").onclick = async()=>{
    const icon = document.getElementById("b_icon").value.trim() || "🏅";
    const name = document.getElementById("b_name").value.trim();
    const desc = document.getElementById("b_desc").value.trim();
    const conditionType = condSel.value;
    const conditionValue = BADGE_CONDITIONS[conditionType].needsValue ? (+document.getElementById("b_val").value || 1) : 1;
    if(!name){ alert("Cần đặt tên cho huy hiệu."); return; }
    if(target.kind==="base"){
      await editBaseBadge(target.id, {icon, name, desc, conditionType, conditionValue});
    } else if(target.kind==="custom"){
      await editCustomBadge(target.idx, {icon, name, desc, conditionType, conditionValue});
    } else {
      await addCustomBadge({id:"custom_"+Date.now(), icon, name, desc, conditionType, conditionValue});
    }
    badgeSettings();
  };
  const delBtn = document.getElementById("del");
  if(delBtn) delBtn.onclick = async()=>{
    if(target.kind==="base") await hideBaseBadge(target.id);
    else await removeCustomBadge(target.idx);
    badgeSettings();
  };
}

/* ---- Lưu trữ dữ liệu học (đóng băng nội dung + kết quả trước khi đổi nội dung cho lớp sau) ---- */
function archiveSettings(){
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">LƯU TRỮ DỮ LIỆU HỌC</div>
    </div>
    <p class="sub">Tạo 1 bản lưu trữ trước khi đổi nội dung (VD: lên lớp 4) — bản lưu trữ giữ nguyên toàn bộ từ vựng, mẫu câu và kết quả hiện tại, xem lại được bất cứ lúc nào, không bị ảnh hưởng bởi thay đổi sau này.</p>
    <div class="card">
      <h3>Các bản đã lưu</h3>
      ${archives.length ? archives.map((a,i)=>{
        const s = archiveStats(a);
        return `<div class="wordrow">
          <span>${esc(a.label)} <em style="color:var(--mist);font-style:normal">— ${a.createdAt} · ${s.learned}/${s.totalWords} từ đã thuộc</em></span>
          <div style="display:flex;gap:6px">
            <button class="ghostbtn" data-viewarchive="${i}">Xem</button>
            <button class="ghostbtn" data-delarchive="${i}">Xoá</button>
          </div>
        </div>`;
      }).join("") : `<p class="sub" style="margin:0">Chưa có bản lưu trữ nào.</p>`}
    </div>
    <div class="card">
      <h3>Tạo bản lưu trữ mới</h3>
      <input class="type-in small" id="ar_label" placeholder="Tên gợi nhớ (VD: Lớp 3 — 2025-2026)" value="${esc("Lớp 3 — "+new Date().getFullYear()+"-"+(new Date().getFullYear()+1))}">
      ${goBtn("ar_create", `<span class="btnicon">${renderEmblem("save")}</span>Tạo bản lưu trữ`, {attrs:'style="margin-top:10px"'})}
    </div>
    ${goBtn("done", "Xong, quay lại", {ghost:true})}`;
  document.getElementById("back").onclick = appSettings;
  document.getElementById("done").onclick = appSettings;
  document.getElementById("ar_create").onclick = async()=>{
    const label = document.getElementById("ar_label").value.trim();
    if(!label){ alert("Cần đặt tên cho bản lưu trữ."); return; }
    await addArchive(label);
    archiveSettings();
  };
  app.querySelectorAll("[data-viewarchive]").forEach(b=>b.onclick=()=>archiveViewer(+b.dataset.viewarchive));
  app.querySelectorAll("[data-delarchive]").forEach(b=>b.onclick=()=>{
    confirmPinScreen("Xác nhận xoá vĩnh viễn bản lưu trữ này. Không thể khôi phục lại.",
      async()=>{ await removeArchive(+b.dataset.delarchive); archiveSettings(); },
      ()=>archiveSettings());
  });
}
function archiveViewer(idx){
  const a = archives[idx];
  const s = archiveStats(a);
  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">${esc(a.label).toUpperCase()}</div>
    </div>
    <p class="sub">Lưu ngày ${a.createdAt} · ${a.units.length} Unit · ⭐ ${a.stars} sao lúc lưu</p>
    <div class="card">
      <h3>Tổng quan</h3>
      <div class="statgrid">
        <div class="stat"><b>${s.learned}</b><span>từ đã thuộc / ${s.totalWords}</span></div>
        <div class="stat"><b>${s.learnedP}</b><span>câu đã thuộc / ${s.totalPatterns}</span></div>
        <div class="stat"><b>${a.badgeCount}</b><span>huy hiệu đã đạt</span></div>
      </div>
    </div>
    <div class="card">
      <h3>Từ cần ôn lại nhất (lúc lưu)</h3>
      ${s.weak.length ? s.weak.map(w=>{
        const acc = Math.round(100*w.c/w.n);
        return `<div class="wordrow"><span>${esc(w.en)} <em style="color:var(--mist);font-style:normal">· Unit ${w.u}</em></span><span class="acc ${accClass(w.c/w.n)}">${acc}% (${w.c}/${w.n})</span></div>`;
      }).join("") : `<p class="sub" style="margin:0">Không có dữ liệu.</p>`}
    </div>
    <div class="card">
      <h3>Câu cần ôn lại nhất (lúc lưu)</h3>
      ${s.weakP.length ? s.weakP.map(p=>{
        const acc = Math.round(100*p.c/p.n);
        return `<div class="wordrow"><span>${esc(p.q)} <em style="color:var(--mist);font-style:normal">· Unit ${p.u}</em></span><span class="acc ${accClass(p.c/p.n)}">${acc}% (${p.c}/${p.n})</span></div>`;
      }).join("") : `<p class="sub" style="margin:0">Không có dữ liệu.</p>`}
    </div>
    <div class="card">
      <h3>Danh sách từ vựng theo Unit</h3>
      ${a.units.map(u=>`
        <details style="margin-bottom:8px">
          <summary style="cursor:pointer;font-weight:800;padding:6px 0">Unit ${u.u} — ${esc(u.t)} (${esc(u.heroName)}) · ${u.words.length} từ</summary>
          ${u.words.map(w=>`<div class="wordrow"><span>${esc(w.en)} <em style="color:var(--mist);font-style:normal">— ${esc(w.vi)}</em></span></div>`).join("")}
        </details>`).join("")}
    </div>
    ${goBtn("done", "Xong, quay lại", {ghost:true})}`;
  document.getElementById("back").onclick = archiveSettings;
  document.getElementById("done").onclick = archiveSettings;
}

/* ---- xác nhận hành động nguy hiểm bằng mã PIN (VD: ẩn/xoá 1 Unit) ---- */
let confirmPinInput = "";
function confirmPinScreen(message, onSuccess, onCancel){
  confirmPinInput = "";
  const render = ()=>{
    app.innerHTML = `
      <div class="eyebrow">Xác nhận bằng mã PIN</div>
      <h1>Nhập mã PIN</h1>
      <p class="sub">${esc(message)}</p>
      <div class="pindots">${[0,1,2,3].map(i=>`<span class="pindot ${i<confirmPinInput.length?"on":""}"></span>`).join("")}</div>
      ${pinPad()}
      ${goBtn("cpcancel","Huỷ",{ghost:true})}`;
    document.getElementById("cpcancel").onclick = onCancel;
    bindPinPad(
      d=>{
        if(confirmPinInput.length>=4) return;
        confirmPinInput += d;
        if(confirmPinInput.length===4){
          setTimeout(()=>{ if(confirmPinInput===pin) onSuccess(); else { alert("Sai mã PIN."); onCancel(); } }, 150);
        } else render();
      },
      ()=>{ confirmPinInput = confirmPinInput.slice(0,-1); render(); }
    );
  };
  render();
}

function unitDoneP(u, words){
  const ws = unitWords(u.u);
  return ws.length>0 && ws.every(w=>{ const s = words[w.en]; return s && s.c>=3 && s.streak>=3; });
}

/* ---------- trình soạn nội dung (thêm/ẩn/sửa/xoá từ & mẫu câu, kèm ảnh) ---------- */
let editState = null; // {kind:'baseWord'|'addedWord'|'basePattern'|'addedPattern', key}
let pendingPhoto = undefined; // data URL đang chờ lưu khi sửa 1 từ, undefined = không đổi, null = đã xoá ảnh

function photoPreviewHtml(currentPhoto){
  return `
      ${currentPhoto ? `<img class="photoprev" src="${currentPhoto}" alt="">` : `<div class="photoprev empty">Chưa có ảnh</div>`}
      <div class="photoedit-btns">
        <label class="ghostbtn" style="cursor:pointer">Chọn ảnh…<input type="file" accept="image/*" id="f_photo" style="display:none"></label>
        ${currentPhoto ? `<button class="ghostbtn" id="f_delphoto">Xoá ảnh</button>` : ""}
      </div>`;
}
function photoPickerHtml(currentPhoto){
  return `<div class="photoedit" id="photoedit-box">${photoPreviewHtml(currentPhoto)}</div>`;
}

function wordEditFormHtml(w, enEditable){
  return `
    <div class="editform">
      ${enEditable ? `<input class="type-in small" id="e_en" placeholder="Từ tiếng Anh" value="${esc(w.en||"")}">` : `<div class="sub" style="margin:0 0 6px"><b>${esc(w.en)}</b></div>`}
      <input class="type-in small" id="e_ipa" placeholder="Phiên âm IPA" value="${esc(w.ipa||"")}">
      <input class="type-in small" id="e_vi" placeholder="Nghĩa tiếng Việt" value="${esc(w.vi||"")}">
      <input class="type-in small" id="e_ex" placeholder="Câu ví dụ" value="${esc(w.ex||"")}">
      ${photoPickerHtml(pendingPhoto !== undefined ? pendingPhoto : w.photo)}
      <div class="row" style="margin-top:8px">
        ${goBtn("e_save","Lưu",{})}
        ${goBtn("e_cancel","Huỷ",{ghost:true})}
      </div>
    </div>`;
}

function bindPhotoPicker(){
  const box = document.getElementById("photoedit-box");
  if(!box) return;
  const doBind = ()=>{
    const inp = document.getElementById("f_photo");
    if(inp) inp.onchange = async()=>{
      const file = inp.files && inp.files[0];
      if(!file) return;
      pendingPhoto = await fileToPhoto(file);
      box.innerHTML = photoPreviewHtml(pendingPhoto);
      doBind();
    };
    const del = document.getElementById("f_delphoto");
    if(del) del.onclick = ()=>{
      pendingPhoto = null;
      box.innerHTML = photoPreviewHtml(null);
      doBind();
    };
  };
  doBind();
}

function contentEditor(unitNum){
  const unit = DATA.find(u=>u.u===unitNum);
  const hiddenW = customContent.hiddenWords[unitNum] || [];
  const addedW = customContent.words[unitNum] || [];
  const overridesW = customContent.wordOverrides[unitNum] || {};
  const hiddenP = customContent.hiddenPatterns[unitNum] || [];
  const addedP = customContent.patterns[unitNum] || [];
  const overridesP = customContent.patternOverrides[unitNum] || {};
  const basePatterns = PATTERNS[unitNum] || [];

  const renderBaseWordRow = w=>{
    const eff = overridesW[w.en] ? {...w, ...overridesW[w.en]} : w;
    if(editState && editState.kind==="baseWord" && editState.key===w.en){
      return `<div class="wordrow" style="display:block">${wordEditFormHtml(eff,false)}</div>`;
    }
    return `<div class="wordrow">
      <span>${esc(eff.en)} <em style="color:var(--mist);font-style:normal">— ${esc(eff.vi)}</em>${eff.photo||REAL_PHOTOS.has(eff.img)?` <span class="badgechip" style="padding:2px 8px;font-size:10px">📷 có ảnh</span>`:""}</span>
      <div style="display:flex;gap:6px">
        <button class="ghostbtn" data-editbase="${esc(w.en)}">Sửa</button>
        <button class="ghostbtn" data-hideword="${esc(w.en)}">${hiddenW.includes(w.en)?"Hiện lại":"Ẩn"}</button>
      </div>
    </div>`;
  };
  const renderAddedWordRow = (w,i)=>{
    if(editState && editState.kind==="addedWord" && editState.key===i){
      return `<div class="wordrow" style="display:block">${wordEditFormHtml(w,true)}</div>`;
    }
    return `<div class="wordrow">
      <span>${esc(w.en)} <em style="color:var(--mist);font-style:normal">— ${esc(w.vi)}</em> <span class="badgechip" style="padding:2px 8px;font-size:10px">tự thêm${w.photo?" · 📷":""}</span></span>
      <div style="display:flex;gap:6px">
        <button class="ghostbtn" data-editadded="${i}">Sửa</button>
        <button class="ghostbtn" data-delword="${i}">Xoá</button>
      </div>
    </div>`;
  };
  const renderBasePatRow = (p,i)=>{
    const eff = overridesP[i] || p;
    if(editState && editState.kind==="basePattern" && editState.key===i){
      return `<div class="wordrow" style="display:block">
        <input class="type-in small" id="e_pq" placeholder="Câu hỏi" value="${esc(eff[0])}">
        <input class="type-in small" id="e_pa" placeholder="Câu trả lời" value="${esc(eff[1])}">
        <div class="row" style="margin-top:8px">${goBtn("e_psave","Lưu",{})}${goBtn("e_pcancel","Huỷ",{ghost:true})}</div>
      </div>`;
    }
    return `<div class="wordrow">
      <span>${esc(eff[0])} <em style="color:var(--mist);font-style:normal">→ ${esc(eff[1])}</em></span>
      <div style="display:flex;gap:6px">
        <button class="ghostbtn" data-editbasepat="${i}">Sửa</button>
        <button class="ghostbtn" data-hidepat="${i}">${hiddenP.includes(i)?"Hiện lại":"Ẩn"}</button>
      </div>
    </div>`;
  };
  const renderAddedPatRow = (p,i)=>{
    if(editState && editState.kind==="addedPattern" && editState.key===i){
      return `<div class="wordrow" style="display:block">
        <input class="type-in small" id="e_pq" placeholder="Câu hỏi" value="${esc(p[0])}">
        <input class="type-in small" id="e_pa" placeholder="Câu trả lời" value="${esc(p[1])}">
        <div class="row" style="margin-top:8px">${goBtn("e_psave","Lưu",{})}${goBtn("e_pcancel","Huỷ",{ghost:true})}</div>
      </div>`;
    }
    return `<div class="wordrow">
      <span>${esc(p[0])} <em style="color:var(--mist);font-style:normal">→ ${esc(p[1])}</em> <span class="badgechip" style="padding:2px 8px;font-size:10px">tự thêm</span></span>
      <div style="display:flex;gap:6px">
        <button class="ghostbtn" data-editaddedpat="${i}">Sửa</button>
        <button class="ghostbtn" data-delpat="${i}">Xoá</button>
      </div>
    </div>`;
  };

  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">SOẠN NỘI DUNG</div>
    </div>
    <select id="usel" class="type-in" style="font-size:16px;padding:12px;margin-bottom:14px">
      ${DATA.map(u=>{ const um=unitMeta(u.u); return `<option value="${u.u}" ${u.u===unitNum?"selected":""}>Unit ${u.u} — ${esc(um.t)} (${esc(um.hero.name)})</option>`; }).join("")}
    </select>

    <div class="card">
      <h3>Từ vựng trong Unit ${unit.u}</h3>
      ${unit.w.map(renderBaseWordRow).join("")}
      ${addedW.map(renderAddedWordRow).join("")}
      ${(!editState) ? `
      <div class="addform">
        <input class="type-in small" id="w_en" placeholder="Từ tiếng Anh (bắt buộc)">
        <input class="type-in small" id="w_ipa" placeholder="Phiên âm IPA (không bắt buộc)">
        <input class="type-in small" id="w_vi" placeholder="Nghĩa tiếng Việt (bắt buộc)">
        <input class="type-in small" id="w_ex" placeholder="Câu ví dụ (không bắt buộc)">
        ${photoPickerHtml(pendingPhoto)}
        ${goBtn("addWord", `+ Thêm từ vào Unit ${unit.u}`, {attrs:'style="margin-top:8px"'})}
      </div>` : ""}
    </div>

    <div class="card">
      <h3>Mẫu câu trong Unit ${unit.u}</h3>
      ${basePatterns.map(renderBasePatRow).join("")}
      ${addedP.map(renderAddedPatRow).join("")}
      ${(!editState) ? `
      <div class="addform">
        <input class="type-in small" id="p_q" placeholder="Câu hỏi tiếng Anh (bắt buộc)">
        <input class="type-in small" id="p_a" placeholder="Câu trả lời tiếng Anh (bắt buộc)">
        ${goBtn("addPattern", `+ Thêm mẫu câu vào Unit ${unit.u}`, {attrs:'style="margin-top:8px"'})}
      </div>` : ""}
    </div>

    ${goBtn("done", "Xong, quay lại báo cáo", {ghost:true})}`;

  document.getElementById("back").onclick = dashboard;
  document.getElementById("done").onclick = dashboard;
  document.getElementById("usel").onchange = e => { editState=null; pendingPhoto=undefined; contentEditor(+e.target.value); };

  const rerender = ()=>contentEditor(unitNum);
  const startEdit = (kind,key)=>{ editState={kind,key}; pendingPhoto=undefined; rerender(); };
  const cancelEdit = ()=>{ editState=null; pendingPhoto=undefined; rerender(); };

  app.querySelectorAll("[data-editbase]").forEach(b=>b.onclick=()=>startEdit("baseWord", b.dataset.editbase));
  app.querySelectorAll("[data-editadded]").forEach(b=>b.onclick=()=>startEdit("addedWord", +b.dataset.editadded));
  app.querySelectorAll("[data-editbasepat]").forEach(b=>b.onclick=()=>startEdit("basePattern", +b.dataset.editbasepat));
  app.querySelectorAll("[data-editaddedpat]").forEach(b=>b.onclick=()=>startEdit("addedPattern", +b.dataset.editaddedpat));

  bindPhotoPicker();

  app.querySelectorAll("[data-hideword]").forEach(b=>b.onclick=async()=>{
    const en = b.dataset.hideword;
    if(hiddenW.includes(en)) await unhideBaseWord(unitNum, en); else await hideBaseWord(unitNum, en);
    contentEditor(unitNum);
  });
  app.querySelectorAll("[data-delword]").forEach(b=>b.onclick=async()=>{
    await removeCustomWord(unitNum, +b.dataset.delword);
    contentEditor(unitNum);
  });
  app.querySelectorAll("[data-hidepat]").forEach(b=>b.onclick=async()=>{
    const idx = +b.dataset.hidepat;
    if(hiddenP.includes(idx)) await unhideBasePattern(unitNum, idx); else await hideBasePattern(unitNum, idx);
    contentEditor(unitNum);
  });
  app.querySelectorAll("[data-delpat]").forEach(b=>b.onclick=async()=>{
    await removeCustomPattern(unitNum, +b.dataset.delpat);
    contentEditor(unitNum);
  });

  if(editState && editState.kind==="baseWord"){
    document.getElementById("e_cancel").onclick = cancelEdit;
    document.getElementById("e_save").onclick = async()=>{
      const fields = {
        ipa: document.getElementById("e_ipa").value.trim(),
        vi: document.getElementById("e_vi").value.trim(),
        ex: document.getElementById("e_ex").value.trim()
      };
      if(pendingPhoto !== undefined) fields.photo = pendingPhoto;
      await editBaseWord(unitNum, editState.key, fields);
      editState=null; pendingPhoto=undefined;
      contentEditor(unitNum);
    };
  }
  if(editState && editState.kind==="addedWord"){
    document.getElementById("e_cancel").onclick = cancelEdit;
    document.getElementById("e_save").onclick = async()=>{
      const fields = {
        en: document.getElementById("e_en").value.trim().toLowerCase(),
        ipa: document.getElementById("e_ipa").value.trim(),
        vi: document.getElementById("e_vi").value.trim(),
        ex: document.getElementById("e_ex").value.trim()
      };
      if(pendingPhoto !== undefined) fields.photo = pendingPhoto;
      await editCustomWord(unitNum, editState.key, fields);
      editState=null; pendingPhoto=undefined;
      contentEditor(unitNum);
    };
  }
  if(editState && (editState.kind==="basePattern" || editState.kind==="addedPattern")){
    document.getElementById("e_pcancel").onclick = cancelEdit;
    document.getElementById("e_psave").onclick = async()=>{
      const q = document.getElementById("e_pq").value.trim();
      const a = document.getElementById("e_pa").value.trim();
      if(!q || !a){ alert("Cần nhập cả câu hỏi và câu trả lời."); return; }
      if(editState.kind==="basePattern") await editBasePattern(unitNum, editState.key, [q,a]);
      else await editCustomPattern(unitNum, editState.key, [q,a]);
      editState=null;
      contentEditor(unitNum);
    };
  }

  const addWordBtn = document.getElementById("addWord");
  if(addWordBtn) addWordBtn.onclick = async()=>{
    const en = document.getElementById("w_en").value.trim().toLowerCase();
    const vi = document.getElementById("w_vi").value.trim();
    const ipa = document.getElementById("w_ipa").value.trim();
    const ex = document.getElementById("w_ex").value.trim();
    if(!en || !vi){ alert("Cần nhập ít nhất từ tiếng Anh và nghĩa tiếng Việt."); return; }
    const word = {en, vi, ipa: ipa||"—", ex: ex||undefined};
    if(pendingPhoto) word.photo = pendingPhoto;
    await addCustomWord(unitNum, word);
    pendingPhoto = undefined;
    contentEditor(unitNum);
  };
  const addPatternBtn = document.getElementById("addPattern");
  if(addPatternBtn) addPatternBtn.onclick = async()=>{
    const q = document.getElementById("p_q").value.trim();
    const a = document.getElementById("p_a").value.trim();
    if(!q || !a){ alert("Cần nhập cả câu hỏi và câu trả lời."); return; }
    await addCustomPattern(unitNum, [q, a]);
    contentEditor(unitNum);
  };
}

/* ---------- cài đặt riêng từng Unit (đổi tên, icon, màu nhân vật, màu chữ) ---------- */
function unitSettingsEditor(unitNum){
  const um = unitMeta(unitNum);
  const hasOverride = !!(customContent.unitOverrides && customContent.unitOverrides[unitNum]);
  const isHidden = (customContent.hiddenUnits||[]).includes(unitNum);
  let pickedEmblem = um.hero.emblem;

  app.innerHTML = `
    <div class="bar">
      <button class="quit" id="back" aria-label="Quay lại">✕</button>
      <div class="eyebrow" style="margin:0">CÀI ĐẶT UNIT ${unitNum}</div>
    </div>
    <p class="sub">Đổi chủ đề, tên nhân vật, icon, màu — hữu ích nếu sau này bạn muốn dùng lại app này cho bộ từ vựng của lớp khác.</p>
    ${isHidden ? `<p class="sub" style="color:var(--coral)">🚫 Unit này đang bị ẩn khỏi app của con.</p>` : ""}
    <div class="card">
      <h3>Chủ đề Unit</h3>
      <input class="type-in small" id="us_topic" placeholder="VD: Hello" value="${esc(um.t)}">
      <label class="sub" style="display:flex;align-items:center;gap:8px;margin:10px 0 0">Màu chữ chủ đề <input type="color" id="us_topicColor" value="${um.topicColor||"#8f97a8"}"></label>
    </div>
    <div class="card">
      <h3>Số Unit</h3>
      <label class="sub" style="display:flex;align-items:center;gap:8px;margin:0">Màu chữ "Unit ${unitNum}" <input type="color" id="us_numColor" value="${um.unitNumColor||"#141824"}"></label>
    </div>
    <div class="card">
      <h3>Nhân vật đại diện</h3>
      <input class="type-in small" id="us_name" placeholder="VD: Spider-Man" value="${esc(um.hero.name)}">
      <div class="row" style="margin-top:10px;gap:18px;flex-wrap:wrap">
        <label class="sub" style="display:flex;align-items:center;gap:8px;margin:0">Màu chính <input type="color" id="us_a" value="${um.hero.a}"></label>
        <label class="sub" style="display:flex;align-items:center;gap:8px;margin:0">Màu phụ <input type="color" id="us_b" value="${um.hero.b}"></label>
        <label class="sub" style="display:flex;align-items:center;gap:8px;margin:0">Màu chữ tên <input type="color" id="us_nameColor" value="${um.heroNameColor||um.hero.a}"></label>
      </div>
    </div>
    <div class="card">
      <h3>Icon</h3>
      <div class="row" style="flex-wrap:wrap;gap:8px">
        ${UNIT_EMBLEM_CHOICES.map(k=>`
          <button class="ghostbtn" data-emblem="${k}" aria-pressed="${k===um.hero.emblem}" style="width:44px;height:44px;padding:0;display:flex;align-items:center;justify-content:center;color:var(--ink);${k===um.hero.emblem?"box-shadow:var(--pressed-sm), 0 0 0 2px "+um.hero.a:""}">
            <span style="width:26px;height:26px;display:block">${renderEmblem(k)}</span>
          </button>`).join("")}
      </div>
    </div>
    <div class="row">
      ${goBtn("us_save", `<span class="btnicon">${renderEmblem("save")}</span>Lưu cài đặt`)}
      ${hasOverride ? goBtn("us_reset", "Khôi phục mặc định", {ghost:true}) : ""}
    </div>
    <div class="card">
      <h3>${isHidden?"Khôi phục Unit":"Xoá Unit khỏi app của con"}</h3>
      <p class="sub" style="margin:0 0 10px">${isHidden?"Unit sẽ hiện lại trong danh sách bài học của con.":"Dùng khi lớp sau có ít Unit hơn. Unit sẽ biến mất khỏi app của con nhưng dữ liệu vẫn được giữ, có thể khôi phục lại bất cứ lúc nào."}</p>
      ${isHidden ? goBtn("us_restore","Khôi phục Unit này",{ghost:true}) : goBtn("us_delete","🗑️ Xoá Unit này",{ghost:true})}
    </div>
    ${goBtn("done", "Xong, quay lại", {ghost:true})}`;

  document.getElementById("back").onclick = unitListSettings;
  document.getElementById("done").onclick = unitListSettings;
  app.querySelectorAll("[data-emblem]").forEach(b=>b.onclick=()=>{
    pickedEmblem = b.dataset.emblem;
    app.querySelectorAll("[data-emblem]").forEach(x=>{
      x.style.boxShadow = x.dataset.emblem===pickedEmblem ? "var(--pressed-sm), 0 0 0 2px "+um.hero.a : "";
    });
  });
  document.getElementById("us_save").onclick = async()=>{
    const t = document.getElementById("us_topic").value.trim();
    const heroName = document.getElementById("us_name").value.trim();
    const a = document.getElementById("us_a").value;
    const b = document.getElementById("us_b").value;
    const topicColor = document.getElementById("us_topicColor").value;
    const unitNumColor = document.getElementById("us_numColor").value;
    const heroNameColor = document.getElementById("us_nameColor").value;
    await setUnitOverride(unitNum, { t, heroName, a, b, emblem: pickedEmblem, topicColor, unitNumColor, heroNameColor });
    unitSettingsEditor(unitNum);
  };
  const resetBtn = document.getElementById("us_reset");
  if(resetBtn) resetBtn.onclick = async()=>{
    await resetUnitOverride(unitNum);
    unitSettingsEditor(unitNum);
  };
  const delBtn = document.getElementById("us_delete");
  if(delBtn) delBtn.onclick = ()=>{
    confirmPinScreen(`Xác nhận xoá Unit ${unitNum} — ${um.t} khỏi app của con. Có thể khôi phục lại sau.`,
      async()=>{ await hideUnit(unitNum); unitSettingsEditor(unitNum); },
      ()=>unitSettingsEditor(unitNum));
  };
  const restoreBtn = document.getElementById("us_restore");
  if(restoreBtn) restoreBtn.onclick = async()=>{ await unhideUnit(unitNum); unitSettingsEditor(unitNum); };
}

async function boot(){
  await Promise.all([loadProgress(), loadCustom(), loadSettings(), loadVoicePref(), loadArchives()]);
  loadVoices(()=>{});
  pin = await getPin();
  subscribeProgress((p, live)=>{ if(unlocked) dashboard(); });
  subscribeCustom((c, live)=>{ if(unlocked) dashboard(); });
  subscribeSettings((s, live)=>{ if(unlocked) dashboard(); });
  subscribeArchives((a, live)=>{});
  lockScreen();
}
boot();
