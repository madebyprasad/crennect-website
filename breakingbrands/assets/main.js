/* Breaking Brands shared JS (all pages) */

/* ---------- Heat Index (renders only if table present) ---------- */
const BRANDS = [
  {name:"Amul", dom:"amul.com", cat:"FMCG / Dairy", score:92, mv:"+2", why:"Sixty years in and still faster than every startup's social team."},
  {name:"Zepto", dom:"zeptonow.com", cat:"Quick commerce", score:89, mv:"+4", why:"Speed became a personality. People quote the ads back."},
  {name:"Zomato", dom:"zomato.com", cat:"Food delivery", score:86, mv:"+1", why:"Still the only brand whose push notifications get screenshotted."},
  {name:"boAt", dom:"boat-lifestyle.com", cat:"Consumer electronics", score:84, mv:"+3", why:"Creator-led drop sold out before the ads even ran."},
  {name:"Royal Enfield", dom:"royalenfield.com", cat:"Auto", score:82, mv:"0", why:"Doesn't chase trends. Trends come to it. Enviable position."},
  {name:"Tanishq", dom:"tanishq.co.in", cat:"Jewellery", score:81, mv:"+2", why:"Storytelling with actual nerve, and craft to back it."},
  {name:"Swiggy", dom:"swiggy.com", cat:"Food delivery", score:79, mv:"-2", why:"Funny, but we've seen this joke. Format fatigue creeping in."},
  {name:"CRED", dom:"cred.club", cat:"Fintech", score:78, mv:"-1", why:"Weird still works, but weird has to keep escalating. Risky diet."},
  {name:"Titan", dom:"titan.co.in", cat:"Lifestyle", score:77, mv:"+1", why:"Quietly excellent, decade after decade. The anti-hype brand."},
  {name:"Tata Motors", dom:"tatamotors.com", cat:"Auto / EV", score:76, mv:"+2", why:"Owns 'sensible electric' while everyone else shouts specs."},
  {name:"Lenskart", dom:"lenskart.com", cat:"Eyewear / D2C", score:74, mv:"+3", why:"Retail experience doing the marketing. Stores as media."},
  {name:"Rapido", dom:"rapido.bike", cat:"Mobility", score:72, mv:"+5", why:"The challenger playbook, run patiently. Giants are noticing late."},
  {name:"Nykaa", dom:"nykaa.com", cat:"Beauty retail", score:70, mv:"-1", why:"Owned-brand push is smart; the story tying it together isn't there yet."},
  {name:"Air India", dom:"airindia.com", cat:"Aviation", score:66, mv:"-2", why:"Beautiful rebrand, but rebrands get graded on Tuesday's delayed flight."},
  {name:"Mamaearth", dom:"mamaearth.in", cat:"Beauty / D2C", score:61, mv:"-5", why:"Built on 'honest', now paying interest on every doubt. Trust debt is real."},
  {name:"Ola", dom:"olacabs.com", cat:"Mobility / EV", score:57, mv:"-4", why:"Announcement-driven branding. Customers remember service, not launches."},
];

function renderIndex(limit){
  const tbody = document.getElementById("index-body");
  if(!tbody) return;
  const rows = limit ? BRANDS.slice(0, limit) : BRANDS;
  rows.forEach((b,i)=>{
    const up = b.mv.startsWith("+");
    const flat = b.mv === "0";
    const logo = b.dom ? `<img class="blogo" src="https://logo.clearbit.com/${b.dom}" alt="${b.name} logo" loading="lazy" onerror="this.style.display='none'">` : "";
    tbody.insertAdjacentHTML("beforeend", `
      <tr>
        <td class="rank">${String(i+1).padStart(2,"0")}</td>
        <td><span class="brand-cell">${logo}<span class="brand-name">${b.name}</span></span></td>
        <td class="cat cat-col">${b.cat}</td>
        <td class="score">${b.score}</td>
        <td class="mv ${flat?"":(up?"up":"down")}">${flat?"–":(up?"▲ "+b.mv.slice(1):"▼ "+b.mv.slice(1))}</td>
        <td class="why cat-col">${b.why}</td>
      </tr>`);
  });
}
renderIndex(document.body.dataset.indexLimit ? parseInt(document.body.dataset.indexLimit) : 0);

/* ---------- Arena voting ---------- */
let votes = {hit: 234, flop: 187};
let voted = false;
function vote(choice){
  if(voted) return;
  voted = true;
  votes[choice]++;
  const btn = document.querySelector(".vote-btn."+choice);
  if(btn) btn.classList.add("chosen");
  const total = votes.hit + votes.flop;
  const hitPct = Math.round(votes.hit/total*100);
  document.getElementById("hit-fill").style.width = hitPct+"%";
  document.getElementById("flop-fill").style.width = (100-hitPct)+"%";
  document.getElementById("hit-label").textContent = "HIT "+hitPct+"%";
  document.getElementById("flop-label").textContent = "FLOP "+(100-hitPct)+"%";
  document.getElementById("vote-result").style.display = "block";
}

/* ---------- Application forms (mailto handoff until backend is wired) ---------- */
function submitForm(e, which){
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  let body = "Breaking Brands application: " + which.toUpperCase() + "%0D%0A%0D%0A";
  for (const [k,v] of data.entries()){ body += k + ": " + encodeURIComponent(v) + "%0D%0A"; }
  const ok = document.getElementById("success-"+which);
  if(ok) ok.style.display = "block";
  window.location.href = "mailto:psdani2k@gmail.com?subject=" +
    encodeURIComponent("Breaking Brands application: " + which) + "&body=" + body;
  form.reset();
  return false;
}

/* ---------- Newsletter ---------- */
function subscribe(e){
  e.preventDefault();
  const email = document.getElementById("sub-email").value;
  const note = document.getElementById("sub-note");
  if(note) note.textContent = "✔ You're on the list, " + email + ". First verdict lands Wednesday.";
  window.location.href = "mailto:psdani2k@gmail.com?subject=" +
    encodeURIComponent("Breaking Brands newsletter signup") + "&body=" + encodeURIComponent("Subscribe me: " + email);
  return false;
}

/* ---------- Tabs (apply page) ---------- */
function showTab(e, id){
  document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
  document.querySelectorAll(".form-panel").forEach(p=>p.classList.remove("active"));
  e.currentTarget.classList.add("active");
  document.getElementById("panel-"+id).classList.add("active");
}

/* ---------- Open a specific tab via #hash (e.g., apply.html#circle) ---------- */
(function(){
  const hash = window.location.hash.replace("#","");
  if(hash && document.getElementById("panel-"+hash)){
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    document.querySelectorAll(".form-panel").forEach(p=>p.classList.remove("active"));
    document.getElementById("panel-"+hash).classList.add("active");
    const btn = document.querySelector('[data-tab="'+hash+'"]');
    if(btn) btn.classList.add("active");
  }
})();

/* ---------- Scroll reveal ---------- */
const io = new IntersectionObserver(entries=>{
  entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target);} });
},{threshold:0.12});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

/* ---------- Highlight current page in nav ---------- */
(function(){
  // Normalize a path: drop trailing "index.html" / "index", drop ".html", ensure it ends how we compare
  const norm = p => p.replace(/\/index(\.html)?$/,"/").replace(/\.html$/,"");
  const here = norm(location.pathname);
  document.querySelectorAll(".nav-links a").forEach(a=>{
    const target = norm(new URL(a.getAttribute("href"), location.href).pathname);
    if(target === here) a.classList.add("active");
  });
})();
