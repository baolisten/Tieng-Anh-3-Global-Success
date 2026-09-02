/* Bộ nhận diện "siêu anh hùng" cho từng Unit — nhân vật GỐC lấy cảm hứng từ
   phong cách phim siêu anh hùng (màu sắc, hoạ tiết, biểu tượng chung chung),
   KHÔNG dùng tên, logo hay hình ảnh thật của nhân vật có bản quyền.
   Mỗi hero: a/b = 2 màu chủ đạo, pattern = hoạ tiết nền, emblem = huy hiệu SVG. */

const HEROES = {
  1:  {name:"Spider-Man",     a:"#E63946", b:"#2B4C9B", pattern:"web",     emblem:"spider"},
  2:  {name:"Iron Man",       a:"#C6362A", b:"#FFC93C", pattern:"circuit", emblem:"core"},
  3:  {name:"Captain America", a:"#3D6BFF", b:"#E63946", pattern:"dots",   emblem:"shield"},
  4:  {name:"Doctor Strange", a:"#8E2A5B", b:"#D4A017", pattern:"hex",     emblem:"swirl"},
  5:  {name:"Thor",           a:"#4A6FA5", b:"#C9CED6", pattern:"bolt",    emblem:"hammer"},
  6:  {name:"Hulk",           a:"#3FA34D", b:"#1F5C2E", pattern:"claw",    emblem:"fist"},
  7:  {name:"Black Widow",    a:"#2B2B38", b:"#7C5CFF", pattern:"dots",    emblem:"moonstar"},
  8:  {name:"Hawkeye",        a:"#6B3FA0", b:"#B98CE0", pattern:"stripes", emblem:"bow"},
  9:  {name:"Black Panther",  a:"#7C3AED", b:"#111827", pattern:"claw",    emblem:"paw"},
  10: {name:"Scarlet Witch",  a:"#C81E45", b:"#FF6B84", pattern:"hex",     emblem:"hex"},
  11: {name:"Ant-Man",        a:"#B3122E", b:"#C9CED6", pattern:"hex",     emblem:"ant"},
  12: {name:"Falcon",         a:"#C0392B", b:"#ECECEC", pattern:"stripes", emblem:"wing"},
  13: {name:"Winter Soldier", a:"#8A8F98", b:"#3FA34D", pattern:"dots",    emblem:"gear"},
  14: {name:"Star-Lord",      a:"#E0752A", b:"#C0392B", pattern:"dots",    emblem:"rocket"},
  15: {name:"Groot",          a:"#8A5A34", b:"#4C9A5B", pattern:"wood",    emblem:"tree"},
  16: {name:"Vision",         a:"#C0392B", b:"#2F9E6B", pattern:"circuit", emblem:"gem"},
  17: {name:"War Machine",    a:"#7A7F87", b:"#FFC93C", pattern:"circuit", emblem:"helmet"},
  18: {name:"Nick Fury",      a:"#1B1F2A", b:"#3D6BFF", pattern:"stripes", emblem:"eyemask"},
  19: {name:"Rocket Raccoon", a:"#8A5A34", b:"#FFC93C", pattern:"wood",    emblem:"raccoonface"},
  20: {name:"Captain Marvel", a:"#7C3AED", b:"#3D6BFF", pattern:"dots",    emblem:"cometstar"}
};
function heroFor(u){ return HEROES[u] || {name:"", a:"#3D6BFF", b:"#212F55", pattern:"dots", emblem:"cometstar"}; }

/* Viên đá vô cực — mỗi chế độ học 1 màu, dùng cho icon "Chọn cách học" */
const STONES = {
  learn:"#E8C93E", pick:"#D8432C", build:"#8B2FC9", write:"#3FA34D",
  picture:"#2F6FE4", sentence:"#E8791E", dictation:"#9AA5B4", odd:"#1FB6B6",
  fill:"#5AC8FA", match:"#FF6FA5", rearrange:"#8D6E63"
};

const EMBLEMS = {
  stone: `<path d="M32 4 L47 17 L53 34 L40 59 L24 59 L11 34 L17 17 Z" fill="currentColor"/><path d="M32 4 L47 17 L32 30 L17 17 Z" fill="#ffffff" opacity=".35"/><path d="M11 34 L32 30 L24 59 Z" fill="#000000" opacity=".18"/><path d="M53 34 L32 30 L40 59 Z" fill="#000000" opacity=".28"/><circle cx="32" cy="29" r="5" fill="#ffffff" opacity=".65"/>`,
  gauntlet: `<g transform="translate(5,-4) scale(0.9)"><g fill="currentColor"><circle cx="19" cy="18" r="9"/><circle cx="29" cy="18" r="9"/><circle cx="39" cy="18" r="9"/><circle cx="49" cy="18" r="9"/><rect x="10" y="16" width="48" height="38" rx="8"/><circle cx="10" cy="38" r="9"/><rect x="11" y="50" width="46" height="26" rx="8"/></g><path d="M16,30 Q34,25 52,30" stroke="var(--surf,#fff)" stroke-width="2.2" fill="none" stroke-linecap="round"/><g fill="var(--surf,#fff)"><circle cx="16" cy="30" r="2.6"/><circle cx="25.5" cy="27.3" r="2.6"/><circle cx="35" cy="26.3" r="2.6"/><circle cx="44.5" cy="27.3" r="2.6"/><circle cx="52" cy="30" r="2.6"/></g><polyline points="16,68 16,60 22,60 22,68 28,68 28,60 34,60 34,68 40,68 40,60 46,60 46,68 52,68 52,60" stroke="var(--surf,#fff)" stroke-width="3.2" fill="none" stroke-linecap="square" stroke-linejoin="miter"/></g>`,
  speaker: `<path d="M12 24h8l14-11v42l-14-11h-8z" fill="currentColor"/><path d="M40 21a11 11 0 010 22" stroke="currentColor" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M47 14a20 20 0 010 36" stroke="currentColor" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".5"/>`,
  refresh: `<path d="M50 32a18 18 0 11-5-12.5" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M50 10v13H37" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  save:      `<path d="M12 8h32l8 8v40a4 4 0 01-4 4H12a4 4 0 01-4-4V12a4 4 0 014-4z" fill="currentColor"/><rect x="18" y="8" width="20" height="14" rx="2" fill="#ffffff" opacity=".85"/><rect x="16" y="32" width="32" height="20" rx="2" fill="#ffffff" opacity=".85"/>`,
  lock:      `<rect x="16" y="28" width="32" height="28" rx="6" fill="currentColor"/><path d="M22 28v-8a10 10 0 0120 0v8" fill="none" stroke="currentColor" stroke-width="6"/><circle cx="32" cy="42" r="5" fill="#ffffff" opacity=".85"/>`,
  check:     `<path d="M12 34l14 14L52 16" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
  spider:    `<circle cx="32" cy="36" r="10" fill="currentColor"/><circle cx="32" cy="22" r="7" fill="currentColor"/><path d="M22 30L6 20M22 34L4 34M22 40L6 50M42 30l16-10M42 34l18 0M42 40l16 10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  core:      `<circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="3" opacity=".5"/><circle cx="32" cy="32" r="13" fill="currentColor" opacity=".3"/><circle cx="32" cy="32" r="7" fill="currentColor"/>`,
  shield:    `<circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="4"/><path d="M32 16l4.5 9.5L47 27l-7.5 7 2 10.5L32 39l-9.5 5.5 2-10.5L17 27l10.5-1.5z" fill="currentColor"/>`,
  swirl:     `<path d="M32 8a24 24 0 0124 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M32 56a24 24 0 01-24-24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".6"/><circle cx="32" cy="32" r="6" fill="currentColor"/><circle cx="52" cy="16" r="3" fill="currentColor"/><circle cx="12" cy="48" r="3" fill="currentColor" opacity=".6"/>`,
  hammer:    `<rect x="14" y="14" width="24" height="16" rx="3" fill="currentColor"/><rect x="23" y="30" width="6" height="24" fill="currentColor"/><path d="M44 14l6 6-4 4-6-6zM46 34l8 4-4 8-8-4z" fill="currentColor" opacity=".7"/>`,
  fist:      `<path d="M20 30v-6a4 4 0 018 0v-4a4 4 0 018 0v-3a4 4 0 018 0v3a4 4 0 018 0v16c0 9-7 15-16 15h-4c-7 0-13-5-14-12l-3-9a4 4 0 017-3z" fill="currentColor"/>`,
  moonstar:  `<path d="M40 12a20 20 0 100 40 16 16 0 010-40z" fill="currentColor"/><path d="M46 40l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="currentColor"/>`,
  bow:       `<path d="M20 8a34 34 0 000 48" fill="none" stroke="currentColor" stroke-width="4"/><path d="M20 8v48" stroke="currentColor" stroke-width="2" opacity=".6"/><path d="M14 32h34l-8-6m8 6l-8 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,
  paw:       `<circle cx="32" cy="40" r="13" fill="currentColor"/><circle cx="16" cy="24" r="6" fill="currentColor"/><circle cx="30" cy="16" r="6" fill="currentColor"/><circle cx="46" cy="22" r="6" fill="currentColor"/>`,
  hex:       `<path d="M32 8l20 12v24L32 56 12 44V20z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="32" cy="32" r="7" fill="currentColor"/>`,
  ant:       `<circle cx="32" cy="20" r="7" fill="currentColor"/><ellipse cx="32" cy="34" rx="9" ry="7" fill="currentColor"/><ellipse cx="32" cy="48" rx="11" ry="9" fill="currentColor"/><path d="M24 32l-12-4M24 36l-14 2M40 32l12-4M40 36l14 2" stroke="currentColor" stroke-width="2.5" fill="none"/>`,
  wing:      `<path d="M12 48c8-4 12-14 12-26 6 6 8 16 6 26 8-6 12-16 10-30 8 8 10 22 4 34-8 6-20 4-32-4z" fill="currentColor"/>`,
  gear:      `<circle cx="32" cy="32" r="10" fill="none" stroke="currentColor" stroke-width="6"/><path d="M32 6v8M32 50v8M6 32h8M50 32h8M13 13l6 6M45 45l6 6M13 51l6-6M45 19l6-6" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`,
  rocket:    `<path d="M32 6c8 8 10 20 6 30l-6 6-6-6c-4-10-2-22 6-30z" fill="currentColor"/><path d="M26 34l-8 4 4 10 4-6zM38 34l8 4-4 10-4-6z" fill="currentColor" opacity=".7"/><circle cx="32" cy="22" r="4" fill="#00000055"/>`,
  tree:      `<path d="M32 6l14 18H36l12 16H38l10 14H16l10-14H14l12-16H18z" fill="currentColor"/><rect x="28" y="52" width="8" height="8" fill="currentColor" opacity=".7"/>`,
  gem:       `<path d="M32 8l16 12-6 12H22l-6-12z" fill="currentColor"/><path d="M22 32h20l-10 24z" fill="currentColor" opacity=".75"/>`,
  helmet:    `<path d="M14 38c0-12 8-22 18-22s18 10 18 22v4a7 7 0 01-7 7H21a7 7 0 01-7-7z" fill="currentColor"/><rect x="28" y="13" width="8" height="7" rx="2" fill="currentColor"/><rect x="18" y="31" width="28" height="10" rx="3" fill="#00000060"/><circle cx="14" cy="38" r="4" fill="currentColor"/><circle cx="50" cy="38" r="4" fill="currentColor"/>`,
  eyemask:   `<ellipse cx="32" cy="32" rx="17" ry="19" fill="currentColor"/><path d="M6 16l24 10M58 16l-24 10" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`,
  raccoonface: `<path d="M13 8l8 12M51 8l-8 12" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="35" r="19" fill="currentColor"/><rect x="14" y="28" width="36" height="10" rx="5" fill="#00000070"/><ellipse cx="32" cy="45" rx="6" ry="4" fill="#00000055"/><circle cx="24" cy="33" r="2" fill="#ffffff" opacity=".8"/><circle cx="40" cy="33" r="2" fill="#ffffff" opacity=".8"/>`,
  cometstar: `<path d="M36 8l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="currentColor"/><path d="M10 54l14-14" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".6"/>`,

  crown:     `<path d="M10 44 L6 20 L18 30 L32 10 L46 30 L58 20 L54 44 Z" fill="currentColor"/><rect x="8" y="46" width="48" height="9" rx="2" fill="currentColor"/><circle cx="10" cy="20" r="4" fill="currentColor" opacity=".8"/><circle cx="32" cy="10" r="4" fill="currentColor" opacity=".8"/><circle cx="54" cy="20" r="4" fill="currentColor" opacity=".8"/>`,
  lightning: `<path d="M36 4 L14 36 L28 36 L22 60 L50 26 L34 26 Z" fill="currentColor"/>`,
  target:    `<circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="32" cy="32" r="15" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="32" cy="32" r="5" fill="currentColor"/>`,
  atom:      `<circle cx="32" cy="32" r="5" fill="currentColor"/><ellipse cx="32" cy="32" rx="27" ry="10" fill="none" stroke="currentColor" stroke-width="3.5"/><ellipse cx="32" cy="32" rx="27" ry="10" fill="none" stroke="currentColor" stroke-width="3.5" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="27" ry="10" fill="none" stroke="currentColor" stroke-width="3.5" transform="rotate(120 32 32)"/>`,
  orb:       `<circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="2.5" opacity=".4"/><circle cx="32" cy="32" r="19" fill="currentColor"/><circle cx="25" cy="24" r="6" fill="#ffffff" opacity=".45"/>`,
  star:      `<path d="M32 6 L39.5 22.2 L57 25 L44 37.4 L47.5 58 L32 48.5 L16.5 58 L20 37.4 L7 25 L24.5 22.2 Z" fill="currentColor"/>`,
  wave:      `<path d="M6 22c8-8 16-8 24 0s16 8 24 0" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M6 36c8-8 16-8 24 0s16 8 24 0" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/><path d="M6 50c8-8 16-8 24 0s16 8 24 0" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" opacity=".3"/>`,
  claws:     `<path d="M14 8l8 48M32 4l8 52M50 8l8 48" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  flame:     `<path d="M32 4c10 12-5 17 1 28 3-5 6-7 6-7 4 6 7 12 7 17a14 14 0 01-28 0c0-16 9-25 14-38z" fill="currentColor"/>`,
  banner:    `<rect x="15" y="4" width="34" height="7" rx="2" fill="currentColor" opacity=".7"/><path d="M17 11h30v38l-15-11-15 11z" fill="currentColor"/>`,

  book:      `<path d="M8 12c8-4 16-4 24 4v36c-8-8-16-8-24-4z" fill="currentColor"/><path d="M56 12c-8-4-16-4-24 4v36c8-8 16-8 24-4z" fill="currentColor" opacity=".7"/>`,
  pencil:    `<path d="M10 54l4-14 30-30 10 10-30 30z" fill="currentColor"/><path d="M40 14l10 10" stroke="#ffffff" stroke-width="3" opacity=".7"/><path d="M10 54l4-14 10 10z" fill="currentColor" opacity=".6"/>`,
  headphones:`<path d="M12 34a20 20 0 0140 0v14" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><rect x="6" y="32" width="12" height="20" rx="4" fill="currentColor"/><rect x="46" y="32" width="12" height="20" rx="4" fill="currentColor"/>`,
  puzzlepc:  `<rect x="10" y="10" width="20" height="20" rx="3" fill="currentColor"/><rect x="34" y="10" width="20" height="20" rx="3" fill="currentColor" opacity=".8"/><rect x="10" y="34" width="20" height="20" rx="3" fill="currentColor" opacity=".8"/><rect x="34" y="34" width="20" height="20" rx="3" fill="currentColor" opacity=".6"/><circle cx="32" cy="32" r="6" fill="currentColor"/>`,
  eye:       `<ellipse cx="32" cy="32" rx="26" ry="16" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="32" cy="32" r="10" fill="currentColor"/>`,
  chatbubble:`<rect x="8" y="10" width="48" height="32" rx="10" fill="currentColor"/><path d="M20 42l-2 12 14-12z" fill="currentColor"/>`,
  camera:    `<rect x="8" y="20" width="48" height="34" rx="6" fill="currentColor"/><rect x="22" y="10" width="20" height="10" rx="3" fill="currentColor"/><circle cx="32" cy="37" r="11" fill="#ffffff" opacity=".85"/><circle cx="32" cy="37" r="6" fill="currentColor"/>`,
  keyboard:  `<rect x="6" y="18" width="52" height="30" rx="5" fill="currentColor"/><g fill="#ffffff" opacity=".85"><rect x="12" y="24" width="6" height="6" rx="1"/><rect x="21" y="24" width="6" height="6" rx="1"/><rect x="30" y="24" width="6" height="6" rx="1"/><rect x="39" y="24" width="6" height="6" rx="1"/><rect x="48" y="24" width="6" height="6" rx="1"/><rect x="16" y="36" width="34" height="6" rx="2"/></g>`,
  fillblank: `<rect x="8" y="16" width="48" height="8" rx="4" fill="currentColor"/><rect x="8" y="32" width="18" height="8" rx="4" fill="currentColor"/><rect x="30" y="32" width="26" height="8" rx="4" fill="currentColor" opacity=".3"/><rect x="8" y="48" width="34" height="8" rx="4" fill="currentColor"/>`,
  linktwo:   `<rect x="6" y="20" width="24" height="24" rx="12" fill="none" stroke="currentColor" stroke-width="6" transform="rotate(-45 18 32)"/><rect x="34" y="20" width="24" height="24" rx="12" fill="none" stroke="currentColor" stroke-width="6" transform="rotate(-45 46 32)"/>`,
  reorder:   `<path d="M8 20h30l-8-8M38 20l-8 8" stroke="currentColor" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M56 44H26l8 8M26 44l8-8" stroke="currentColor" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
};

function renderEmblem(key){
  const inner = EMBLEMS[key];
  if(!inner) return "";
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}
