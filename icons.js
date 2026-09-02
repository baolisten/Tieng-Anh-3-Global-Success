/* Thư viện hình minh hoạ — vẽ bằng SVG thuần (không dùng ảnh/emoji ngoài).
   Mỗi icon là các shape bên trong viewBox 0 0 64 64, phong cách flat, màu rực rỡ. */

const ICONS = {
  /* ---- cơ thể ---- */
  ear:   `<path d="M26 12c10 0 16 8 16 18 0 9-6 14-13 14-6 0-9-4-9-9 0-4 3-6 6-6 2 0 3 1 3 3" fill="none" stroke="#f2b48c" stroke-width="6" stroke-linecap="round"/>`,
  eye:   `<ellipse cx="32" cy="32" rx="22" ry="13" fill="#fff"/><circle cx="32" cy="32" r="9" fill="#2f6fed"/><circle cx="32" cy="32" r="4" fill="#12213f"/>`,
  face:  `<circle cx="32" cy="32" r="24" fill="#f2b48c"/><circle cx="23" cy="28" r="3" fill="#12213f"/><circle cx="41" cy="28" r="3" fill="#12213f"/><path d="M22 40q10 8 20 0" fill="none" stroke="#12213f" stroke-width="3" stroke-linecap="round"/>`,
  hair:  `<circle cx="32" cy="34" r="22" fill="#f2b48c"/><path d="M10 30c0-16 12-22 22-22s22 6 22 22c-6-6-14-9-22-9s-16 3-22 9" fill="#3b2415"/>`,
  hand:  `<path d="M20 58V34a4 4 0 018 0v-8a4 4 0 018 0v-6a4 4 0 018 0v6a4 4 0 018 0v20c0 8-6 12-12 12H30c-5 0-10-3-10-8z" fill="#f2b48c"/>`,
  mouth: `<path d="M10 26c8 14 36 14 44 0" fill="none" stroke="#e2536b" stroke-width="8" stroke-linecap="round"/><path d="M14 27c7 8 29 8 36 0" fill="#fff"/>`,
  nose:  `<path d="M28 10c-2 12-8 20-8 28a12 12 0 0024 0c0-8-6-16-8-28" fill="#f2b48c"/>`,

  /* ---- gia đình ---- */
  father:  `<circle cx="32" cy="20" r="10" fill="#f2b48c"/><rect x="23" y="10" width="18" height="8" rx="4" fill="#3b2415"/><rect x="16" y="32" width="32" height="26" rx="8" fill="#2f6fed"/><path d="M28 32h8l3 9-7 6-7-6z" fill="#c0392b"/>`,
  mother:  `<rect x="22" y="8" width="20" height="9" rx="4" fill="#6b3a1f"/><rect x="14" y="13" width="9" height="24" rx="4" fill="#6b3a1f"/><rect x="41" y="13" width="9" height="24" rx="4" fill="#6b3a1f"/><circle cx="32" cy="21" r="10" fill="#f2b48c"/><path d="M16 58l6-27h20l6 27z" fill="#ff6fb0"/><circle cx="22" cy="24" r="1.6" fill="#ffd23c"/><circle cx="42" cy="24" r="1.6" fill="#ffd23c"/>`,
  brother: `<circle cx="32" cy="22" r="8" fill="#f2b48c"/><path d="M21 15l3-7 3 7M29 13l3-8 3 8M37 15l3-7 3 7" fill="#3b2415"/><rect x="19" y="32" width="26" height="24" rx="7" fill="#3ecf8e"/><path d="M19 38h26" stroke="#1f7a52" stroke-width="3"/>`,
  sister:  `<circle cx="32" cy="22" r="8" fill="#f2b48c"/><circle cx="19" cy="26" r="5" fill="#3b2415"/><circle cx="45" cy="26" r="5" fill="#3b2415"/><path d="M15 22l6 3-3 5zM49 22l-6 3 3 5z" fill="#ff6fb0"/><path d="M20 32l12-3 12 3-4 24H24z" fill="#ff8a3c"/>`,
  friend:  `<circle cx="22" cy="18" r="8" fill="#f2b48c"/><rect x="10" y="28" width="24" height="24" rx="7" fill="#2f6fed"/><circle cx="44" cy="18" r="8" fill="#e8a06e"/><rect x="32" y="28" width="24" height="24" rx="7" fill="#ff8a3c"/>`,
  mr:      `<circle cx="32" cy="20" r="10" fill="#e8a06e"/><rect x="16" y="32" width="32" height="26" rx="8" fill="#2f6fed"/><rect x="29" y="32" width="6" height="16" fill="#ffd23c"/>`,
  ms:      `<circle cx="32" cy="20" r="10" fill="#f2b48c"/><path d="M18 12c2-6 24-6 28 0" fill="none" stroke="#3b2415" stroke-width="5" stroke-linecap="round"/><path d="M16 58l6-28h20l6 28z" fill="#ff6fb0"/>`,

  /* ---- nghề nghiệp ---- */
  teacher: `<circle cx="32" cy="18" r="9" fill="#f2b48c"/><rect x="18" y="28" width="28" height="26" rx="7" fill="#8b5cf6"/><rect x="14" y="46" width="36" height="8" rx="2" fill="#ffd23c"/>`,
  cook:    `<circle cx="32" cy="24" r="9" fill="#f2b48c"/><path d="M14 18c0-10 36-10 36 0 0 4-3 6-3 6H17s-3-2-3-6z" fill="#fff"/><rect x="18" y="34" width="28" height="22" rx="4" fill="#fff"/>`,
  doctor:  `<circle cx="32" cy="18" r="9" fill="#f2b48c"/><rect x="18" y="28" width="28" height="26" rx="7" fill="#fff"/><rect x="28" y="34" width="8" height="16" fill="#ff4d4d"/><rect x="24" y="38" width="16" height="8" fill="#ff4d4d"/>`,
  driver:  `<circle cx="32" cy="18" r="9" fill="#f2b48c"/><rect x="18" y="28" width="28" height="26" rx="7" fill="#2f6fed"/><circle cx="32" cy="44" r="9" fill="none" stroke="#12213f" stroke-width="3"/>`,
  farmer:  `<circle cx="32" cy="22" r="9" fill="#f2b48c"/><ellipse cx="32" cy="14" rx="20" ry="6" fill="#ffd23c"/><rect x="18" y="30" width="28" height="24" rx="6" fill="#3ecf8e"/>`,
  nurse:   `<circle cx="32" cy="20" r="9" fill="#f2b48c"/><path d="M18 16h28v6H18z" fill="#fff"/><rect x="20" y="10" width="24" height="8" rx="2" fill="#fff"/><rect x="18" y="30" width="28" height="24" rx="6" fill="#fff"/><rect x="28" y="34" width="8" height="16" fill="#ff6fb0"/><rect x="24" y="38" width="16" height="8" fill="#ff6fb0"/>`,
  singer:  `<circle cx="32" cy="16" r="9" fill="#f2b48c"/><rect x="18" y="26" width="28" height="26" rx="7" fill="#ff6fb0"/><rect x="29" y="50" width="6" height="10" rx="3" fill="#93a5c4"/><ellipse cx="32" cy="58" rx="9" ry="4" fill="#12213f"/>`,
  worker:  `<circle cx="32" cy="22" r="9" fill="#f2b48c"/><path d="M16 20a16 16 0 0132 0z" fill="#ffd23c"/><rect x="18" y="30" width="28" height="24" rx="6" fill="#ff8a3c"/>`,

  /* ---- sở thích / hoạt động ---- */
  cooking:   `<path d="M14 30h36v14a10 10 0 01-10 10H24a10 10 0 01-10-10z" fill="#93a5c4"/><rect x="10" y="26" width="44" height="6" rx="3" fill="#2f6fed"/><path d="M22 20c0-4 3-6 3-10M32 20c0-4 3-6 3-10M42 20c0-4 3-6 3-10" fill="none" stroke="#93a5c4" stroke-width="3" stroke-linecap="round"/>`,
  dancing:   `<circle cx="32" cy="14" r="8" fill="#f2b48c"/><path d="M32 22v18M32 26l-16-8M32 26l16-8M32 40l-12 18M32 40l12 18" fill="none" stroke="#ff6fb0" stroke-width="6" stroke-linecap="round"/>`,
  drawing:   `<rect x="12" y="34" width="30" height="22" rx="2" fill="#fff"/><path d="M46 14l6 6-22 22-8 2 2-8z" fill="#ffd23c" stroke="#12213f" stroke-width="2"/>`,
  painting:  `<path d="M32 10c14 0 22 9 22 18 0 6-4 9-9 9-3 0-4-2-7-2s-4 3-9 3c-10 0-16-8-16-16C13 12 22 10 32 10z" fill="#e8a06e"/><circle cx="24" cy="24" r="3" fill="#ff4d4d"/><circle cx="34" cy="20" r="3" fill="#3ecf8e"/><circle cx="42" cy="26" r="3" fill="#2f6fed"/><circle cx="26" cy="34" r="3" fill="#ffd23c"/>`,
  running:   `<circle cx="38" cy="12" r="7" fill="#f2b48c"/><path d="M38 20l-6 10 10 6-4 16M32 30l-14 4M38 36l12-4" fill="none" stroke="#3ecf8e" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
  singing:   `<rect x="29" y="8" width="6" height="22" rx="3" fill="#93a5c4"/><ellipse cx="32" cy="10" rx="10" ry="8" fill="#12213f"/><rect x="26" y="30" width="12" height="6" rx="2" fill="#93a5c4"/><path d="M20 42a12 12 0 0024 0" fill="none" stroke="#ff8a3c" stroke-width="3"/>`,
  swimming:  `<circle cx="16" cy="24" r="7" fill="#f2b48c"/><path d="M16 31c4 6 10 8 16 4s10-2 14 2" fill="none" stroke="#2f6fed" stroke-width="5" stroke-linecap="round"/><path d="M6 44c6 4 12 4 18 0s12-4 18 0 12 4 16 0" fill="none" stroke="#2f6fed" stroke-width="5" stroke-linecap="round"/>`,
  walking:   `<path d="M14 40l10-4 4 6-6 4v10h-4V44l-8 2z" fill="#3ecf8e"/><path d="M32 22l12-4 4 6-8 4v10h-4V26l-10 2z" fill="#3ecf8e"/>`,
  listening: `<path d="M14 40v-8a18 18 0 0136 0v8" fill="none" stroke="#93a5c4" stroke-width="5"/><rect x="10" y="38" width="10" height="16" rx="4" fill="#8b5cf6"/><rect x="44" y="38" width="10" height="16" rx="4" fill="#8b5cf6"/>`,
  reading:   `<path d="M32 16c-6-4-16-4-20 0v30c4-4 14-4 20 0z" fill="#2f6fed"/><path d="M32 16c6-4 16-4 20 0v30c-4-4-14-4-20 0z" fill="#3ecf8e"/>`,
  writing:   `<path d="M14 50l3-10 26-26 7 7-26 26z" fill="#ffd23c" stroke="#12213f" stroke-width="2"/><path d="M40 17l7 7" stroke="#12213f" stroke-width="2"/><path d="M10 56h20" stroke="#93a5c4" stroke-width="3" stroke-linecap="round"/>`,
  watchingtv:`<rect x="10" y="14" width="44" height="28" rx="4" fill="#12213f"/><rect x="14" y="18" width="36" height="20" fill="#2f6fed"/><rect x="24" y="44" width="16" height="4" fill="#93a5c4"/><rect x="18" y="50" width="28" height="4" rx="2" fill="#93a5c4"/>`,
  cycling:   `<circle cx="16" cy="46" r="10" fill="none" stroke="#ff8a3c" stroke-width="4"/><circle cx="48" cy="46" r="10" fill="none" stroke="#ff8a3c" stroke-width="4"/><path d="M16 46l10-20h10l12 20M26 26h10" fill="none" stroke="#12213f" stroke-width="4" stroke-linecap="round"/>`,
  flyingkite:`<path d="M32 8l16 16-16 16-16-16z" fill="#ff6fb0"/><path d="M32 40q-4 10 2 18" fill="none" stroke="#93a5c4" stroke-width="2"/>`,
  skating:   `<path d="M14 40h26l-4 8H18z" fill="#93a5c4"/><rect x="16" y="30" width="20" height="10" rx="4" fill="#ff4d4d"/><circle cx="20" cy="50" r="4" fill="#12213f"/><circle cx="32" cy="50" r="4" fill="#12213f"/>`,
  skipping:  `<circle cx="32" cy="14" r="8" fill="#f2b48c"/><path d="M14 44c0-16 36-16 36 0" fill="none" stroke="#ffd23c" stroke-width="4"/><rect x="30" y="22" width="4" height="18" fill="#3ecf8e"/>`,

  /* ---- trường học / phòng ---- */
  artroom:      `<path d="M32 10c14 0 22 9 22 18 0 6-4 9-9 9-3 0-4-2-7-2s-4 3-9 3c-10 0-16-8-16-16C13 12 22 10 32 10z" fill="#e8a06e"/><circle cx="24" cy="24" r="3" fill="#ff4d4d"/><circle cx="34" cy="20" r="3" fill="#3ecf8e"/><circle cx="42" cy="26" r="3" fill="#2f6fed"/>`,
  classroom:    `<rect x="8" y="12" width="48" height="30" rx="3" fill="#3ecf8e"/><rect x="12" y="16" width="40" height="22" fill="#12213f"/><rect x="26" y="42" width="12" height="12" fill="#93a5c4"/>`,
  computerroom: `<rect x="12" y="12" width="40" height="26" rx="3" fill="#12213f"/><rect x="16" y="16" width="32" height="18" fill="#2f6fed"/><rect x="26" y="40" width="12" height="6" fill="#93a5c4"/><rect x="18" y="46" width="28" height="6" rx="3" fill="#93a5c4"/>`,
  gym:          `<rect x="8" y="28" width="8" height="8" rx="2" fill="#ff4d4d"/><rect x="48" y="28" width="8" height="8" rx="2" fill="#ff4d4d"/><rect x="14" y="30" width="36" height="4" fill="#93a5c4"/>`,
  library:      `<rect x="10" y="38" width="44" height="8" rx="2" fill="#8a5a34"/><rect x="14" y="20" width="10" height="18" fill="#ff4d4d"/><rect x="26" y="16" width="10" height="22" fill="#3ecf8e"/><rect x="38" y="22" width="10" height="16" fill="#2f6fed"/>`,
  musicroom:    `<circle cx="20" cy="46" r="8" fill="#8b5cf6"/><circle cx="42" cy="42" r="8" fill="#8b5cf6"/><path d="M28 46V14l20-4v32" fill="none" stroke="#8b5cf6" stroke-width="4"/>`,
  playground:   `<path d="M10 56V14M54 56V14M10 16h44" fill="none" stroke="#8a5a34" stroke-width="5" stroke-linecap="round"/><path d="M32 16v14" stroke="#93a5c4" stroke-width="3"/><rect x="22" y="30" width="20" height="6" rx="3" fill="#ffd23c"/>`,
  school:       `<path d="M32 8l24 14v6H8v-6z" fill="#ff4d4d"/><rect x="12" y="28" width="40" height="26" fill="#2f6fed"/><rect x="28" y="38" width="8" height="16" fill="#12213f"/><rect x="16" y="32" width="8" height="8" fill="#fff"/><rect x="40" y="32" width="8" height="8" fill="#fff"/>`,

  /* ---- đồ dùng học tập ---- */
  book:        `<path d="M32 16c-6-4-16-4-20 0v30c4-4 14-4 20 0z" fill="#2f6fed"/><path d="M32 16c6-4 16-4 20 0v30c-4-4-14-4-20 0z" fill="#3ecf8e"/>`,
  eraser:      `<rect x="14" y="24" width="36" height="18" rx="4" fill="#ff6fb0"/><rect x="14" y="24" width="16" height="18" rx="4" fill="#fff"/>`,
  notebook:    `<rect x="14" y="10" width="36" height="44" rx="3" fill="#ffd23c"/><rect x="10" y="14" width="6" height="4" fill="#93a5c4"/><rect x="10" y="24" width="6" height="4" fill="#93a5c4"/><rect x="10" y="34" width="6" height="4" fill="#93a5c4"/><rect x="10" y="44" width="6" height="4" fill="#93a5c4"/>`,
  pen:         `<path d="M44 8l12 12-30 30-14 4 4-14z" fill="#2f6fed"/><path d="M40 12l12 12" stroke="#12213f" stroke-width="2"/>`,
  pencil:      `<path d="M46 6l12 12-32 32-14 4 4-14z" fill="#ffd23c"/><path d="M42 10l12 12" stroke="#12213f" stroke-width="2"/><path d="M12 50l4 4" stroke="#12213f" stroke-width="2"/>`,
  pencilcase:  `<rect x="8" y="22" width="48" height="20" rx="10" fill="#3ecf8e"/><path d="M8 32h48" stroke="#12213f" stroke-width="2"/>`,
  ruler:       `<rect x="8" y="26" width="48" height="12" rx="2" fill="#ffd23c" transform="rotate(-8 32 32)"/>`,
  schoolbag:   `<rect x="14" y="22" width="36" height="32" rx="8" fill="#ff4d4d"/><path d="M22 22v-6a10 10 0 0120 0v6" fill="none" stroke="#93a5c4" stroke-width="4"/><rect x="26" y="32" width="12" height="10" rx="2" fill="#ffd23c"/>`,

  /* ---- thể thao ---- */
  badminton:    `<path d="M32 8l10 20-10 6-10-6z" fill="#fff"/><rect x="30" y="34" width="4" height="20" fill="#8a5a34"/>`,
  basketball:   `<circle cx="32" cy="32" r="22" fill="#ff8a3c"/><path d="M10 32h44M32 10v44M16 16c8 8 24 8 32 0M16 48c8-8 24-8 32 0" fill="none" stroke="#12213f" stroke-width="2"/>`,
  chess:        `<circle cx="32" cy="18" r="8" fill="#93a5c4"/><path d="M22 50l4-20h12l4 20z" fill="#93a5c4"/>`,
  football:     `<circle cx="32" cy="32" r="22" fill="#fff"/><path d="M32 20l8 6-3 9h-10l-3-9z" fill="#12213f"/><path d="M32 8v12M12 26l10-6M12 38l10 6M52 26l-10-6M52 38l-10 6M32 56V44" stroke="#12213f" stroke-width="2"/>`,
  tabletennis:  `<circle cx="22" cy="26" r="12" fill="#ff4d4d"/><rect x="28" y="34" width="6" height="18" rx="3" fill="#8a5a34"/><circle cx="44" cy="44" r="5" fill="#fff" stroke="#12213f" stroke-width="1"/>`,
  volleyball:   `<circle cx="32" cy="32" r="22" fill="#ffd23c"/><path d="M14 20c10 4 14 14 8 26M50 20c-10 4-14 14-8 26M12 32h40" fill="none" stroke="#12213f" stroke-width="2"/>`,

  /* ---- nhà cửa & đồ nội thất ---- */
  house:      `<path d="M32 8l24 18v2H8v-2z" fill="#ff4d4d"/><rect x="14" y="26" width="36" height="28" fill="#ffd23c"/><rect x="27" y="38" width="10" height="16" fill="#8a5a34"/>`,
  bathroom:   `<path d="M12 34h40v6a12 12 0 01-12 12H24A12 12 0 0112 40z" fill="#fff"/><rect x="8" y="30" width="48" height="6" rx="3" fill="#93a5c4"/>`,
  bedroom:    `<rect x="10" y="34" width="44" height="16" rx="4" fill="#ff6fb0"/><rect x="10" y="26" width="14" height="10" rx="3" fill="#fff"/><rect x="8" y="48" width="48" height="6" rx="2" fill="#8a5a34"/>`,
  kitchen:    `<path d="M14 30h36v14a10 10 0 01-10 10H24a10 10 0 01-10-10z" fill="#93a5c4"/><rect x="10" y="26" width="44" height="6" rx="3" fill="#ff8a3c"/>`,
  livingroom: `<rect x="10" y="30" width="44" height="16" rx="6" fill="#8b5cf6"/><rect x="8" y="42" width="10" height="10" rx="3" fill="#8b5cf6"/><rect x="46" y="42" width="10" height="10" rx="3" fill="#8b5cf6"/>`,
  chair:      `<rect x="18" y="10" width="28" height="6" rx="2" fill="#ff8a3c"/><rect x="18" y="16" width="6" height="20" fill="#ff8a3c"/><rect x="14" y="36" width="36" height="6" rx="2" fill="#ff8a3c"/><rect x="18" y="42" width="5" height="14" fill="#8a5a34"/><rect x="41" y="42" width="5" height="14" fill="#8a5a34"/>`,
  lamp:       `<path d="M20 8h24l6 18H14z" fill="#ffd23c"/><rect x="30" y="26" width="4" height="22" fill="#93a5c4"/><rect x="22" y="48" width="20" height="6" rx="2" fill="#93a5c4"/>`,
  table:      `<rect x="10" y="22" width="44" height="8" rx="2" fill="#8a5a34"/><rect x="14" y="30" width="6" height="20" fill="#8a5a34"/><rect x="44" y="30" width="6" height="20" fill="#8a5a34"/>`,
  bed:        `<rect x="8" y="34" width="48" height="14" rx="4" fill="#2f6fed"/><rect x="8" y="24" width="14" height="12" rx="3" fill="#fff"/><rect x="6" y="48" width="4" height="8" fill="#8a5a34"/><rect x="54" y="48" width="4" height="8" fill="#8a5a34"/>`,
  desk:       `<rect x="10" y="24" width="44" height="8" rx="2" fill="#93a5c4"/><rect x="14" y="32" width="10" height="18" fill="#93a5c4"/><rect x="40" y="32" width="10" height="18" fill="#93a5c4"/><rect x="26" y="34" width="12" height="8" fill="#2f6fed"/>`,
  door:       `<rect x="18" y="8" width="28" height="48" rx="3" fill="#8a5a34"/><circle cx="40" cy="32" r="2.5" fill="#ffd23c"/>`,
  window:     `<rect x="12" y="12" width="40" height="40" rx="3" fill="#bfe4ff"/><path d="M32 12v40M12 32h40" stroke="#fff" stroke-width="3"/>`,

  /* ---- đồ ăn ---- */
  bean:   `<ellipse cx="24" cy="26" rx="8" ry="12" fill="#3ecf8e" transform="rotate(-20 24 26)"/><ellipse cx="38" cy="34" rx="8" ry="12" fill="#3ecf8e" transform="rotate(-20 38 34)"/><ellipse cx="30" cy="44" rx="8" ry="12" fill="#3ecf8e" transform="rotate(-20 30 44)"/>`,
  bread:  `<path d="M10 40c0-16 44-16 44 0v6a4 4 0 01-4 4H14a4 4 0 01-4-4z" fill="#e8a06e"/><path d="M10 40a22 18 0 0144 0" fill="#f6c98a"/>`,
  chicken:`<circle cx="26" cy="20" r="12" fill="#e8a06e"/><path d="M30 28c8 4 12 12 8 20-3 6-10 6-13 0" fill="#e8a06e"/><rect x="20" y="46" width="6" height="10" fill="#fff"/>`,
  egg:    `<path d="M32 8C20 24 16 36 16 44a16 16 0 0032 0c0-8-4-20-16-36z" fill="#fff"/><ellipse cx="32" cy="46" rx="10" ry="6" fill="#ffd23c"/>`,
  fish:   `<path d="M10 32c10-12 28-12 38 0-10 12-28 12-38 0z" fill="#2f6fed"/><path d="M48 32l8-8v16z" fill="#2f6fed"/><circle cx="18" cy="30" r="2.5" fill="#fff"/>`,
  juice:  `<path d="M20 12h24l-4 40a4 4 0 01-4 4H28a4 4 0 01-4-4z" fill="#fff"/><path d="M22 24h20l-3 28a3 3 0 01-3 3H28a3 3 0 01-3-3z" fill="#ff8a3c"/><rect x="30" y="4" width="4" height="12" fill="#3ecf8e"/>`,
  meat:   `<ellipse cx="30" cy="30" rx="18" ry="14" fill="#e2536b"/><path d="M44 30c6 0 12 4 12 10s-6 8-10 4" fill="#e8a06e"/>`,
  milk:   `<path d="M22 8h20v10l4 6v28a4 4 0 01-4 4H22a4 4 0 01-4-4V24l4-6z" fill="#fff"/><path d="M18 30h28v18a4 4 0 01-4 4H22a4 4 0 01-4-4z" fill="#bfe4ff"/>`,
  rice:   `<path d="M12 34a20 10 0 0140 0z" fill="#fff"/><path d="M12 34h40v6a4 4 0 01-4 4H16a4 4 0 01-4-4z" fill="#e8e8e8"/><path d="M22 30l4-8M32 30l0-9M42 30l-4-8" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
  water:  `<path d="M32 8c10 14 16 22 16 30a16 16 0 01-32 0c0-8 6-16 16-30z" fill="#bfe4ff"/><path d="M24 34a8 8 0 008 8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,

  /* ---- thú cưng / động vật ---- */
  bird:     `<circle cx="34" cy="26" r="14" fill="#2f6fed"/><path d="M20 26l-10-4 6 8z" fill="#ffd23c"/><path d="M34 40c-4 8-14 12-22 8 6 0 10-4 10-10" fill="#2f6fed"/><circle cx="40" cy="22" r="2" fill="#12213f"/>`,
  cat:      `<circle cx="32" cy="34" r="18" fill="#ff8a3c"/><path d="M18 22l4 12-10-4zM46 22l-4 12 10-4z" fill="#ff8a3c"/><circle cx="26" cy="32" r="2" fill="#12213f"/><circle cx="38" cy="32" r="2" fill="#12213f"/><path d="M28 40q4 3 8 0" stroke="#12213f" stroke-width="2" fill="none"/><path d="M10 36h10M10 40h10M44 36h10M44 40h10" stroke="#12213f" stroke-width="1.5"/>`,
  dog:      `<circle cx="32" cy="34" r="18" fill="#e8a06e"/><path d="M16 22c-6 4-8 14-2 20 0-8 2-14 2-20zM48 22c6 4 8 14 2 20 0-8-2-14-2-20z" fill="#8a5a34"/><circle cx="26" cy="32" r="2" fill="#12213f"/><circle cx="38" cy="32" r="2" fill="#12213f"/><ellipse cx="32" cy="40" rx="4" ry="3" fill="#12213f"/>`,
  goldfish: `<path d="M10 32c10-12 28-12 38 0-10 12-28 12-38 0z" fill="#ff8a3c"/><path d="M48 32l10-10v20z" fill="#ff8a3c"/><circle cx="18" cy="30" r="2.5" fill="#fff"/>`,
  parrot:   `<circle cx="30" cy="24" r="12" fill="#3ecf8e"/><path d="M20 24l-8-2 6 6z" fill="#ffd23c"/><path d="M30 34c10 2 18 10 16 22-8-2-14-8-16-14z" fill="#ff4d4d"/><circle cx="34" cy="20" r="2" fill="#12213f"/>`,
  rabbit:   `<ellipse cx="20" cy="12" rx="5" ry="14" fill="#fff" stroke="#e5e5e5"/><ellipse cx="34" cy="10" rx="5" ry="14" fill="#fff" stroke="#e5e5e5"/><circle cx="27" cy="36" r="18" fill="#fff" stroke="#e5e5e5"/><circle cx="20" cy="34" r="2" fill="#12213f"/><circle cx="32" cy="34" r="2" fill="#12213f"/>`,
  elephant: `<circle cx="28" cy="30" r="16" fill="#93a5c4"/><circle cx="12" cy="26" r="12" fill="#7f92b3"/><path d="M32 34c4 6 4 14-2 18" fill="none" stroke="#93a5c4" stroke-width="7" stroke-linecap="round"/><circle cx="24" cy="26" r="2" fill="#12213f"/>`,
  horse:    `<path d="M20 50V32c0-10 8-18 18-18 6 0 10 4 10 4l6-4-2 8s4 4 4 10-4 10-10 10h-6v10z" fill="#8a5a34"/><path d="M28 14c4-4 12-4 16 2" fill="none" stroke="#3b2415" stroke-width="4" stroke-linecap="round"/><circle cx="42" cy="24" r="2" fill="#12213f"/>`,
  monkey:   `<circle cx="32" cy="32" r="16" fill="#8a5a34"/><circle cx="16" cy="28" r="7" fill="#8a5a34"/><circle cx="48" cy="28" r="7" fill="#8a5a34"/><ellipse cx="32" cy="34" rx="9" ry="8" fill="#e8c39e"/><circle cx="28" cy="32" r="2" fill="#12213f"/><circle cx="36" cy="32" r="2" fill="#12213f"/>`,
  peacock:  `<circle cx="42" cy="42" r="20" fill="none" stroke="#3ecf8e" stroke-width="4"/><circle cx="42" cy="42" r="12" fill="none" stroke="#2f6fed" stroke-width="4"/><circle cx="18" cy="26" r="9" fill="#2f6fed"/><path d="M18 26l-8-8" stroke="#2f6fed" stroke-width="3"/>`,
  tiger:    `<circle cx="32" cy="34" r="19" fill="#f0862a"/><path d="M17 20l6 13-12-3zM47 20l-6 13 12-3z" fill="#f0862a"/><path d="M20 25l6 3M44 25l-6 3M17 34l7 1M47 34l-7 1M21 44l6-2M43 44l-6-2" stroke="#2b1607" stroke-width="3" stroke-linecap="round"/><circle cx="25" cy="32" r="2.3" fill="#12213f"/><circle cx="39" cy="32" r="2.3" fill="#12213f"/><path d="M28 42l4 3 4-3" stroke="#12213f" stroke-width="2" fill="none"/><path d="M29.5 43l.8 4M34.5 43l-.8 4" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`,
  swinging: `<path d="M14 10v40M50 10v40M14 12h36" fill="none" stroke="#8a5a34" stroke-width="4" stroke-linecap="round"/><path d="M24 12v14M40 12v14" stroke="#93a5c4" stroke-width="2"/><rect x="22" y="26" width="20" height="5" rx="2" fill="#ffd23c"/>`,
  climbing: `<path d="M32 8l22 48H10z" fill="#3ecf8e"/><path d="M22 38h20M26 28h12" stroke="#fff" stroke-width="3"/>`,
  counting: `<circle cx="16" cy="32" r="10" fill="#ff4d4d"/><circle cx="32" cy="32" r="10" fill="#ffd23c"/><circle cx="48" cy="32" r="10" fill="#3ecf8e"/>`,

  /* ---- xe cộ / đồ chơi ---- */
  bus:       `<rect x="8" y="18" width="48" height="26" rx="4" fill="#ffd23c"/><rect x="12" y="22" width="10" height="10" fill="#bfe4ff"/><rect x="26" y="22" width="10" height="10" fill="#bfe4ff"/><rect x="40" y="22" width="10" height="10" fill="#bfe4ff"/><circle cx="18" cy="48" r="5" fill="#12213f"/><circle cx="46" cy="48" r="5" fill="#12213f"/>`,
  car:       `<path d="M8 40l4-12a6 6 0 016-4h28a6 6 0 016 4l4 12z" fill="#ff4d4d"/><rect x="8" y="38" width="48" height="8" rx="3" fill="#e2536b"/><circle cx="18" cy="48" r="5" fill="#12213f"/><circle cx="46" cy="48" r="5" fill="#12213f"/><rect x="18" y="26" width="12" height="8" fill="#bfe4ff"/><rect x="34" y="26" width="12" height="8" fill="#bfe4ff"/>`,
  kite:      `<path d="M32 8l16 16-16 16-16-16z" fill="#ff6fb0"/><path d="M32 40q-4 10 2 18" fill="none" stroke="#93a5c4" stroke-width="2"/>`,
  plane:     `<path d="M28 8h8v20l18 10v6l-18-4v10l6 6v4l-10-3-10 3v-4l6-6V44L10 48v-6l18-10z" fill="#93a5c4"/>`,
  ship:      `<path d="M14 38h36l-6 12H20z" fill="#2f6fed"/><rect x="30" y="10" width="3" height="26" fill="#8a5a34"/><path d="M33 12l14 8-14 6z" fill="#fff"/>`,
  teddybear: `<circle cx="18" cy="14" r="7" fill="#e8a06e"/><circle cx="46" cy="14" r="7" fill="#e8a06e"/><circle cx="32" cy="26" r="16" fill="#e8a06e"/><circle cx="16" cy="42" r="10" fill="#e8a06e"/><circle cx="48" cy="42" r="10" fill="#e8a06e"/><circle cx="26" cy="24" r="2" fill="#12213f"/><circle cx="38" cy="24" r="2" fill="#12213f"/><ellipse cx="32" cy="30" rx="5" ry="4" fill="#8a5a34"/>`,
  train:     `<rect x="10" y="24" width="18" height="18" rx="3" fill="#ff4d4d"/><rect x="32" y="18" width="22" height="24" rx="3" fill="#2f6fed"/><rect x="36" y="24" width="14" height="8" fill="#bfe4ff"/><circle cx="18" cy="46" r="4" fill="#12213f"/><circle cx="26" cy="46" r="4" fill="#12213f"/><circle cx="38" cy="46" r="4" fill="#12213f"/><circle cx="48" cy="46" r="4" fill="#12213f"/>`,
  truck:     `<rect x="8" y="26" width="26" height="16" fill="#ffd23c"/><path d="M34 30h12l8 8v4H34z" fill="#93a5c4"/><rect x="38" y="32" width="8" height="6" fill="#bfe4ff"/><circle cx="18" cy="46" r="5" fill="#12213f"/><circle cx="46" cy="46" r="5" fill="#12213f"/>`
};

function renderIcon(key, opts){
  opts = opts || {};
  if(key === "swatch"){
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="26" fill="${opts.color||"#93a5c4"}" stroke="rgba(0,0,0,.15)" stroke-width="2"/></svg>`;
  }
  const inner = ICONS[key];
  if(!inner) return null;
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}
