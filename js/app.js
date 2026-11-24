(() => {
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const titleFor = (score) => TITLES.find((t) => score >= t.min).title;

  // ---------- 라우팅 (S01~S05) ----------
  const ROUTES = ["home", "cards", "quiz", "ranking", "guestbook"];
  function show(route) {
    if (!ROUTES.includes(route)) route = "home";
    document.querySelectorAll(".page").forEach((p) => (p.hidden = p.dataset.page !== route));
    document.querySelectorAll(".menu a").forEach((a) => a.classList.toggle("active", a.dataset.route === route));
    if (route === "quiz" && !quiz.items.length) startQuiz();
    if (route === "ranking") renderRanking();
    if (route === "guestbook") renderGuestbook();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", () => show(location.hash.slice(1)));

  // ---------- S01 Home ----------
  $("#site-owner").textContent = PROFILE.name;
  $("#hero-hello").textContent = PROFILE.hello;
  $("#btn-start").addEventListener("click", () => { quiz.items = []; location.hash = "quiz"; show("quiz"); });

  // ---------- S02 취향 카드 ----------
  $("#card-grid").innerHTML = CARDS.map((c) => `
    <button class="flip" aria-pressed="false">
      <span class="face front"><span class="emoji">${esc(c.emoji)}</span><span class="lbl">${esc(c.label)}</span><strong>${esc(c.value)}</strong></span>
      <span class="face back"><span class="lbl">왜냐하면</span>${esc(c.reason)}</span>
    </button>`).join("");
  $("#card-grid").addEventListener("click", (e) => {
    const card = e.target.closest(".flip");
    if (!card) return;
    card.classList.toggle("flipped");
    card.setAttribute("aria-pressed", card.classList.contains("flipped"));
  });

  // ---------- S03 퀴즈 ----------
  const quiz = { items: [], index: 0, score: 0, picked: null };

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  async function startQuiz() {
    $("#q-text").textContent = "문제를 불러오는 중…";
    $("#q-choices").innerHTML = "";
    try {
      // 데이터의 answer는 1~4(첫 번째 보기 = 1) → 화면 처리용 0~3으로 변환
      quiz.items = shuffle(await Api.listQuestions())
        .slice(0, 10)
        .map((q) => ({ ...q, answer: Number(q.answer) - 1 }));
    } catch (err) {
      $("#q-text").textContent = "문제를 불러오지 못했어요: " + err.message;
      return;
    }
    quiz.index = 0;
    quiz.score = 0;
    renderQuestion();
  }

  function renderQuestion() {
    const q = quiz.items[quiz.index];
    const total = quiz.items.length;
    quiz.picked = null;
    $("#q-num").textContent = `${quiz.index + 1} / ${total}`;
    $("#q-bar").style.width = `${(quiz.index / total) * 100}%`;
    $("#q-text").textContent = q.text;
    $("#q-feedback").textContent = "";
    $("#q-feedback").className = "feedback";
    $("#q-choices").innerHTML = q.choices
      .map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join("");
    const next = $("#btn-next");
    next.disabled = true; // 보기를 고르지 않으면 비활성화
    next.textContent = quiz.index === total - 1 ? "결과 보기" : "다음";
  }

  $("#q-choices").addEventListener("click", (e) => {
    const btn = e.target.closest(".choice");
    if (!btn || quiz.picked !== null) return;
    const q = quiz.items[quiz.index];
    quiz.picked = Number(btn.dataset.i);
    const correct = quiz.picked === q.answer;
    if (correct) quiz.score++;
    document.querySelectorAll(".choice").forEach((b, i) => {
      b.disabled = true;
      if (i === q.answer) b.classList.add("correct");
      else if (i === quiz.picked) b.classList.add("wrong");
    });
    const fb = $("#q-feedback");
    fb.textContent = correct ? "정답이에요! 🎉" : `아쉬워요! 정답은 "${q.choices[q.answer]}"`;
    fb.classList.add(correct ? "ok" : "no");
    $("#btn-next").disabled = false;
  });

  $("#btn-next").addEventListener("click", () => {
    if (quiz.picked === null) return;
    if (quiz.index < quiz.items.length - 1) {
      quiz.index++;
      renderQuestion();
    } else {
      $("#q-bar").style.width = "100%";
      finishQuiz();
    }
  });

  // ---------- S04 결과 / 랭킹 ----------
  let lastResult = null;   // { score, title }
  let myRankId = null;

  function finishQuiz() {
    lastResult = { score: quiz.score, title: titleFor(quiz.score) };
    myRankId = null;
    $("#result-box").hidden = false;
    $("#my-score").textContent = `${quiz.score} / ${quiz.items.length}`;
    $("#my-title").textContent = lastResult.title;
    $("#rank-msg").textContent = "";
    $("#rank-form").hidden = false;
    quiz.items = [];
    location.hash = "ranking";
    show("ranking");
  }

  $("#rank-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nickname = $("#rank-nick").value.trim();
    const msg = $("#rank-msg");
    if (!nickname) { msg.textContent = "닉네임을 입력해 주세요."; msg.className = "notice no"; return; }
    if (!lastResult) return;
    try {
      const saved = await Api.createScore({ nickname, ...lastResult });
      myRankId = saved.id;
      msg.textContent = "등록되었습니다!";
      msg.className = "notice ok";
      $("#rank-form").hidden = true;
      lastResult = null;
      renderRanking();
    } catch (err) {
      msg.textContent = "등록에 실패했어요: " + err.message;
      msg.className = "notice no";
    }
  });

  async function renderRanking() {
    const body = $("#rank-body");
    let list;
    try { list = await Api.listScores(); } catch (err) {
      body.innerHTML = `<tr><td colspan="4" class="empty">불러오지 못했어요: ${esc(err.message)}</td></tr>`;
      return;
    }
    // 점수 높은 순, 같으면 먼저 등록한 순
    list.sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt));
    const top = list.slice(0, 10);
    body.innerHTML = top.length
      ? top.map((r, i) => `
        <tr class="${r.id === myRankId ? "me" : ""}">
          <td>${i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</td>
          <td>${esc(r.nickname)}</td><td>${r.score}</td><td>${esc(r.title || titleFor(r.score))}</td>
        </tr>`).join("")
      : `<tr><td colspan="4" class="empty">아직 기록이 없어요. 첫 번째 주인공이 되어 보세요!</td></tr>`;
  }

  $("#btn-retry").addEventListener("click", () => { quiz.items = []; location.hash = "quiz"; show("quiz"); });

  // ---------- S05 방명록 ----------
  let sticker = STICKERS[0];
  $("#stickers").innerHTML = STICKERS
    .map((s, i) => `<button type="button" role="radio" aria-checked="${i === 0}" class="sticker${i === 0 ? " on" : ""}">${s}</button>`).join("");
  $("#stickers").addEventListener("click", (e) => {
    const b = e.target.closest(".sticker");
    if (!b) return;
    sticker = b.textContent;
    document.querySelectorAll(".sticker").forEach((x) => {
      x.classList.toggle("on", x === b);
      x.setAttribute("aria-checked", x === b);
    });
  });

  $("#gb-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nickname = $("#gb-nick").value.trim();
    const message = $("#gb-msg").value.trim();
    const n = $("#gb-notice");
    if (!nickname || !message) { n.textContent = "닉네임과 메시지를 모두 입력해 주세요."; n.className = "notice no"; return; }
    try {
      await Api.createGuestbook({ nickname, message, sticker });
      $("#gb-nick").value = "";
      $("#gb-msg").value = "";
      n.textContent = "";
      renderGuestbook();
    } catch (err) {
      n.textContent = "저장에 실패했어요: " + err.message;
      n.className = "notice no";
    }
  });

  async function renderGuestbook() {
    const ul = $("#gb-list");
    let list;
    try { list = await Api.listGuestbooks(); } catch (err) {
      ul.innerHTML = `<li class="empty">불러오지 못했어요: ${esc(err.message)}</li>`;
      return;
    }
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // 최신순
    const recent = list.slice(0, 20);
    ul.innerHTML = recent.length
      ? recent.map((g) => `
        <li><span class="st">${esc(g.sticker)}</span>
          <div><strong>${esc(g.nickname)}</strong><time>${new Date(g.createdAt).toLocaleString("ko-KR")}</time>
          <p>${esc(g.message)}</p></div></li>`).join("")
      : `<li class="empty">첫 방명록을 남겨 주세요!</li>`;
  }

  show(location.hash.slice(1));
})();
