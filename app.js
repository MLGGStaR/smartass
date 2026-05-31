(function () {
  "use strict";

  var G = window.GAME || { who: [], what: [], where: [], hard: [] };
  var CAT_LABEL = { who: "WHO AM I?", what: "WHAT AM I?", where: "WHERE AM I?", hard: "HARD ASS" };
  var CAT_QWORD = { who: "Who am I", what: "What am I", where: "Where am I" };

  // ---- de-duplicate answers across batches (keep first occurrence) ----
  function norm(s){ return String(s).toLowerCase().replace(/^the\s+/,"").replace(/[^a-z0-9]+/g,""); }
  ["who", "what", "where"].forEach(function (cat) {
    var seen = {};
    G[cat] = G[cat].filter(function (e) {
      var k = norm(e.a);
      if (seen[k]) return false;
      seen[k] = true; return true;
    });
  });

  // ---- stable ids ----
  function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }
  Object.keys(G).forEach(function (cat) {
    G[cat].forEach(function (e, i) { e._id = cat + "_" + i + "_" + slug(cat === "hard" ? e.a1 : e.a); });
  });

  // ---- persistence ----
  var LS_REMOVED = "smartass_removed_v1";
  var LS_DISCARD = "smartass_discarded_v1";
  function load(key){ try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; } }
  function save(key, arr){ try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) {} }
  var removed = new Set(load(LS_REMOVED));     // perma, persists forever
  var discarded = new Set(load(LS_DISCARD));   // until New Game

  function persistRemoved(){ save(LS_REMOVED, Array.from(removed)); }
  function persistDiscard(){ save(LS_DISCARD, Array.from(discarded)); }

  function available(cat){
    return G[cat].filter(function (e) { return !removed.has(e._id) && !discarded.has(e._id); });
  }

  // ---- dom ----
  var overlay = document.getElementById("overlay");
  var drawCard = document.getElementById("drawCard");
  var drawCat = document.getElementById("drawCat");
  var drawNum = document.getElementById("drawNum");
  var drawBody = document.getElementById("drawBody");
  var anotherBtn = document.getElementById("anotherBtn");
  var discardBtn = document.getElementById("discardBtn");
  var removeBtn = document.getElementById("removeBtn");
  var backBtn = document.getElementById("backBtn");
  var poolStatus = document.getElementById("poolStatus");

  var current = null;      // current entry
  var currentCat = null;

  function updatePoolStatus(){
    var parts = ["who", "what", "where", "hard"].map(function (c) {
      return CAT_LABEL[c].replace(" AM I?", "").replace("HARD ASS","HARD") + " " + available(c).length;
    });
    poolStatus.textContent = parts.join(" · ");
  }

  function draw(cat){
    var pool = available(cat);
    if (!pool.length){
      drawBody.innerHTML = '<p class="clue show">Out of cards in this pile! Tap <b>New Game</b> to reshuffle discards, or pick another pile.</p>';
      currentCat = cat; current = null;
      drawCard.className = "draw-card " + cat;
      drawCat.textContent = CAT_LABEL[cat];
      drawNum.textContent = "";
      hide(discardBtn); hide(removeBtn);
      show(anotherBtn);
      overlay.classList.remove("hidden");
      return;
    }
    var pick = pool[Math.floor(Math.random() * pool.length)];
    current = pick; currentCat = cat;
    renderCard();
    overlay.classList.remove("hidden");
  }

  function renderCard(){
    drawCard.className = "draw-card " + currentCat;
    drawCat.textContent = CAT_LABEL[currentCat];
    drawNum.textContent = "#" + (G[currentCat].indexOf(current) + 1);
    drawBody.innerHTML = "";
    show(discardBtn); show(removeBtn); show(anotherBtn);

    if (currentCat === "hard"){
      renderHard();
      return;
    }

    // show every fact at once, like the real card
    var qline = CAT_QWORD[currentCat] + ", with the initial" +
      (current.init && current.init.replace(/[^A-Za-z]/g,"").length > 1 ? "s " : " ") +
      current.init + "?";
    current.clues.forEach(function (c) {
      var p = document.createElement("p");
      p.className = "clue show";
      p.textContent = c;
      drawBody.appendChild(p);
    });
    var qp = document.createElement("p");
    qp.className = "clue q-line show";
    qp.textContent = qline;
    drawBody.appendChild(qp);

    // answer printed right on the card, like the real thing
    var a = document.createElement("div");
    a.className = "answer";
    a.textContent = "Answer: " + current.a;
    drawBody.appendChild(a);

    drawBody.scrollTop = 0;
  }

  // hard ass: both questions and both answers, all shown at once
  function renderHard(){
    drawBody.innerHTML =
      '<p class="hard-q">1. ' + esc(current.q1) + '</p>' +
      '<p class="hard-a"><span class="lbl">ANSWER</span>' + esc(current.a1) + '</p>' +
      '<div class="hr"></div>' +
      '<p class="hard-q">2. ' + esc(current.q2) + '</p>' +
      '<p class="hard-a"><span class="lbl">ANSWER</span>' + esc(current.a2) + '</p>';
    drawBody.scrollTop = 0;
  }

  // ---- helpers ----
  function esc(s){ var d = document.createElement("div"); d.textContent = s == null ? "" : s; return d.innerHTML; }
  function show(el){ el.classList.remove("hidden"); }
  function hide(el){ el.classList.add("hidden"); }
  function closeOverlay(){ overlay.classList.add("hidden"); current = null; }

  // ---- events ----
  document.querySelectorAll(".cat-card").forEach(function (b) {
    b.addEventListener("click", function () { draw(b.getAttribute("data-cat")); });
  });

  anotherBtn.addEventListener("click", function () { if (currentCat) draw(currentCat); });
  backBtn.addEventListener("click", closeOverlay);

  discardBtn.addEventListener("click", function () {
    if (!current) return;
    discarded.add(current._id); persistDiscard(); updatePoolStatus();
    closeOverlay(); // back to the 4-card game page
  });
  removeBtn.addEventListener("click", function () {
    if (!current) return;
    removed.add(current._id); persistRemoved(); updatePoolStatus();
    closeOverlay(); // back to the 4-card game page
  });

  document.getElementById("newGameBtn").addEventListener("click", function () {
    discarded.clear(); persistDiscard(); updatePoolStatus();
    if (!overlay.classList.contains("hidden") && currentCat) draw(currentCat);
  });

  overlay.addEventListener("click", function (e) { if (e.target === overlay) closeOverlay(); });
  document.addEventListener("keydown", function (e) {
    if (overlay.classList.contains("hidden")) return;
    if (e.key === "Escape") closeOverlay();
    else if (e.key === "Enter" || e.key === " "){
      e.preventDefault();
      if (currentCat) draw(currentCat); // next card
    }
  });

  // ---- start screen ----
  var startScreen = document.getElementById("startScreen");
  var startBtn = document.getElementById("startBtn");
  var heroFoot = document.getElementById("heroFoot");
  if (heroFoot){
    var totalCards = G.who.length + G.what.length + G.where.length + G.hard.length;
    heroFoot.textContent = totalCards + " cards loaded — pick a pile and guess.";
  }
  if (startBtn){
    startBtn.addEventListener("click", function () {
      document.body.classList.remove("on-landing");
      startScreen.classList.add("hidden");
      document.getElementById("home").classList.remove("hidden");
    });
  }

  updatePoolStatus();
})();
