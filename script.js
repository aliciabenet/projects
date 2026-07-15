/* Benet Arquitectura — script compartit per totes les pàgines.
   Cada bloc només s'executa si els seus elements existeixen a la pàgina. */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v,a,b) => Math.min(b,Math.max(a,v));
  const root = document.documentElement;

  /* ---------- nav bg on scroll (només portada) ---------- */
  const hdr = document.getElementById("hdr");
  if (hdr){
    const onScrollNav = () => hdr.classList.toggle("scrolled", scrollY > 12);
    onScrollNav(); addEventListener("scroll", onScrollNav, {passive:true});
  }

  /* ---------- theme toggle (persistit entre pàgines) ---------- */
  try { const t = localStorage.getItem("theme"); if (t) root.setAttribute("data-theme", t); } catch(e){}
  const themeBtn = document.getElementById("theme");
  if (themeBtn){
    themeBtn.addEventListener("click", () => {
      const dark = matchMedia("(prefers-color-scheme: dark)").matches;
      const cur = root.getAttribute("data-theme") || (dark ? "dark" : "light");
      const next = cur === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch(e){}
    });
  }

  /* ---------- typewriter ---------- */
  function typeEl(el){
    const text = el.dataset.text;
    el.textContent = "";
    if (reduce){ el.textContent = text; return; }
    const node = document.createTextNode("");
    const caret = document.createElement("span");
    caret.className = "caret"; caret.setAttribute("aria-hidden","true");
    el.append(node, caret);
    let i = 0;
    (function step(){
      node.data = text.slice(0, i);
      if (i < text.length){ i++; setTimeout(step, 34 + Math.random()*46); }
    })();
  }
  const heroH1 = document.querySelector(".hero h1");
  if (heroH1) typeEl(heroH1);
  const typeTargets = document.querySelectorAll(".type:not(.hero h1), .ptype, .ctaPanel h2.type");
  if (typeTargets.length){
    const typeObs = new IntersectionObserver((ents) => {
      ents.forEach(e => {
        if (e.isIntersecting && !e.target.dataset.done){
          e.target.dataset.done = "1"; typeEl(e.target); typeObs.unobserve(e.target);
        }
      });
    }, {threshold:.6});
    typeTargets.forEach(el => { if (el !== heroH1) typeObs.observe(el); });
  }

  /* ---------- scroll word reveal ---------- */
  const reveals = [...document.querySelectorAll(".reveal")];
  reveals.forEach(el => {
    const html = el.innerHTML;
    const frag = document.createElement("div"); frag.innerHTML = html;
    el.textContent = "";
    frag.childNodes.forEach(n => {
      if (n.nodeType === 3){
        n.textContent.split(/(\s+)/).forEach(tok => {
          if (/^\s+$/.test(tok)) el.append(document.createTextNode(tok));
          else if (tok){ const s=document.createElement("span"); s.className="word"; s.textContent=tok; el.append(s); }
        });
      } else {
        n.querySelectorAll ? n.textContent.split(/(\s+)/).forEach(tok=>{
          if(/^\s+$/.test(tok)) el.append(document.createTextNode(tok));
          else if(tok){ const s=document.createElement("span"); s.className="word accent"; s.textContent=tok; el.append(s); }
        }) : null;
      }
    });
  });
  function updateReveal(){
    if (!reveals.length) return;
    const vh = innerHeight;
    reveals.forEach(el => {
      const r = el.getBoundingClientRect();
      const start = vh*0.82, end = vh*0.30;
      const p = clamp((start - r.top)/(start - end + r.height*0.15), 0, 1);
      const words = el.querySelectorAll(".word");
      const n = Math.round(p * words.length);
      words.forEach((w,idx)=> w.classList.toggle("lit", idx < n));
    });
  }

  /* ---------- fade-in on scroll ---------- */
  const fadeObs = new IntersectionObserver((ents)=>{
    ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); fadeObs.unobserve(e.target);} });
  }, {threshold:.15});
  document.querySelectorAll(".fade").forEach(el=>fadeObs.observe(el));

  /* ---------- marquee content (només portada) ---------- */
  const row = document.getElementById("mrow");
  if (row){
    const words = ["Llum natural","Formigó","Roure","Terratzo","Estuc de calç","Acer","Context","Secció","Pati","Llindar","Rehabilitació","Pedra","Vidre","Proporció"];
    const set = words.map(w=>`<span class="chip"><b></b>${w}</span>`).join("");
    row.innerHTML = set + set;
  }

  /* ---------- carousel arrows (només portada) ---------- */
  const car = document.getElementById("carousel");
  if (car){
    const step = () => (car.querySelector(".pcard")?.offsetWidth || 320) + 22;
    const next = document.getElementById("next");
    const prev = document.getElementById("prev");
    if (next) next.onclick = () => car.scrollBy({left: step(), behavior:"smooth"});
    if (prev) prev.onclick = () => car.scrollBy({left:-step(), behavior:"smooth"});
  }

  /* ---------- lightbox (portada: per galeria · detall: totes les .zoom) ---------- */
  const lb = document.getElementById("lightbox");
  if (lb){
    const lbImg = document.getElementById("lbImg");
    const lbCap = document.getElementById("lbCap");
    const lbCount = document.getElementById("lbCount");
    let group = [], idx = 0, lastFocus = null;
    const show = i => {
      idx = (i + group.length) % group.length;
      lbImg.src = group[idx].src; lbImg.alt = group[idx].alt;
      lbCap.textContent = group[idx].alt;
      lbCount.textContent = (idx+1) + " / " + group.length;
    };
    const open = (items,i) => { group = items; lastFocus = document.activeElement; show(i);
      lb.classList.add("open"); document.body.style.overflow = "hidden"; document.getElementById("lbClose").focus(); };
    const close = () => { lb.classList.remove("open"); document.body.style.overflow = "";
      lbImg.src = ""; if (lastFocus) lastFocus.focus(); };
    const bind = btns => {
      const items = btns.map(b => { const im = b.querySelector("img"); return {src: im.src, alt: im.alt}; });
      btns.forEach((b,i) => b.addEventListener("click", () => open(items,i)));
    };
    const galleries = document.querySelectorAll(".gallery");
    if (galleries.length){
      galleries.forEach(g => bind([...g.querySelectorAll(".gitem")]));   // portada: cada galeria és un grup
    } else {
      const zooms = [...document.querySelectorAll(".zoom")];
      if (zooms.length) bind(zooms);                                     // detall: totes les fotos, un grup
    }
    document.getElementById("lbClose").onclick = close;
    document.getElementById("lbPrev").onclick = e => { e.stopPropagation(); show(idx-1); };
    document.getElementById("lbNext").onclick = e => { e.stopPropagation(); show(idx+1); };
    lb.addEventListener("click", e => { if (e.target === lb) close(); });
    addEventListener("keydown", e => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") show(idx+1);
      else if (e.key === "ArrowLeft") show(idx-1);
    });
  }

  /* ---------- rAF scroll loop (word reveal) ---------- */
  if (reveals.length){
    let ticking = false;
    const loopFn = () => { updateReveal(); ticking = false; };
    addEventListener("scroll", () => { if(!ticking){ ticking = true; requestAnimationFrame(loopFn);} }, {passive:true});
    addEventListener("resize", updateReveal); updateReveal();
  }

  /* ================= CANVAS (només portada) ================= */
  function setupCanvas(cv){
    const ctx = cv.getContext("2d");
    let w,h,dpr;
    function size(){
      dpr = Math.min(devicePixelRatio||1, 2);
      const r = cv.getBoundingClientRect();
      w = cv.width = r.width*dpr; h = cv.height = r.height*dpr;
    }
    size(); addEventListener("resize", size);
    return {ctx, get w(){return w}, get h(){return h}, get dpr(){return dpr}};
  }
  const A = [[59,110,246],[123,97,255],[224,138,90]];
  const lerp = (a,b,t)=>a+(b-a)*t;
  function mix(t){
    t = clamp(t,0,1)*2; const i = t<1?0:1; const f = t<1?t:t-1;
    const c1=A[i], c2=A[i+1];
    return `rgb(${lerp(c1[0],c2[0],f)|0},${lerp(c1[1],c2[1],f)|0},${lerp(c1[2],c2[2],f)|0})`;
  }

  // HERO: rising particle cone + faint starfield
  (function heroAnim(){
    const cv = document.getElementById("c-hero");
    if (!cv) return;
    const S = setupCanvas(cv);
    let stars=[], parts=[], run=true, t=0;
    function seed(){
      stars = Array.from({length:120},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.2+.2,tw:Math.random()*6}));
      parts = Array.from({length:reduce?60:150},()=>spawn());
    }
    function spawn(){
      return { x:0, y:Math.random(), spread:(Math.random()-.5), speed:Math.random()*.004+.002, life:Math.random() };
    }
    seed(); addEventListener("resize", seed);
    const io = new IntersectionObserver(es=>es.forEach(e=>{run=e.isIntersecting; if(run&&!reduce)frame();}),{threshold:0});
    io.observe(cv);
    function frame(){
      const {ctx,w,h}=S; t+=0.006;
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle="#0B0C0E"; ctx.fillRect(0,0,w,h);
      for(const s of stars){
        const a = .28 + .28*Math.sin(t*3 + s.tw);
        ctx.fillStyle=`rgba(150,170,255,${a*.5})`;
        ctx.beginPath(); ctx.arc(s.x*w, s.y*h, s.r*S.dpr, 0, 6.28); ctx.fill();
      }
      const cx=w*.5, base=h*1.02;
      ctx.globalCompositeOperation="lighter";
      for(const p of parts){
        p.life += p.speed; if(p.life>1){ Object.assign(p, spawn()); p.life=0; }
        const up = p.life;
        const y = base - up*h*1.05;
        const fan = (1-up)*0.06 + 0.16*up;
        const x = cx + p.spread*w*fan + Math.sin(up*6+p.spread*8)*6*S.dpr;
        const alpha = Math.sin(up*Math.PI)*0.9;
        const rad = (2.4 - up*1.6)*S.dpr;
        ctx.fillStyle = mix(up).replace("rgb","rgba").replace(")",`,${alpha})`);
        ctx.beginPath(); ctx.arc(x,y,Math.max(rad,.4),0,6.28); ctx.fill();
      }
      const g=ctx.createRadialGradient(cx,base,0,cx,base,h*0.9);
      g.addColorStop(0,"rgba(90,120,255,.20)"); g.addColorStop(1,"rgba(11,12,14,0)");
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      ctx.globalCompositeOperation="source-over";
      if(run && !reduce) requestAnimationFrame(frame);
    }
    frame();
  })();

  // CTA: slow drifting dashes on black
  (function ctaAnim(){
    const cv = document.getElementById("c-cta");
    if (!cv) return;
    const S = setupCanvas(cv);
    let dashes=[], run=true;
    function seed(){
      dashes = Array.from({length:reduce?50:110},()=>({
        x:Math.random(), y:Math.random(), len:Math.random()*10+4,
        vx:(Math.random()*.0004+.0002), vy:(Math.random()*.0002-.0001),
        a:Math.random()*.5+.2, hue:Math.random()
      }));
    }
    seed(); addEventListener("resize", seed);
    const io=new IntersectionObserver(es=>es.forEach(e=>{run=e.isIntersecting; if(run&&!reduce)frame();}),{threshold:0});
    io.observe(cv);
    function frame(){
      const {ctx,w,h,dpr}=S;
      ctx.clearRect(0,0,w,h); ctx.fillStyle="#0B0C0E"; ctx.fillRect(0,0,w,h);
      ctx.lineCap="round";
      for(const d of dashes){
        d.x+=d.vx; d.y+=d.vy;
        if(d.x>1.02){d.x=-.02} if(d.y<-.02){d.y=1.02} if(d.y>1.02){d.y=-.02}
        const x=d.x*w, y=d.y*h;
        ctx.strokeStyle = mix(d.hue).replace("rgb","rgba").replace(")",`,${d.a})`);
        ctx.lineWidth = 1.4*dpr;
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+d.len*dpr, y+d.len*.35*dpr); ctx.stroke();
      }
      if(run && !reduce) requestAnimationFrame(frame);
    }
    frame();
  })();

})();
