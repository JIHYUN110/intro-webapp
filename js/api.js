/*
 * 데이터 계층 (기획서의 AppSync 쿼리/뮤테이션 이름 그대로)
 *  - listQuestions  : Question 테이블 조회
 *  - createScore    : Score 테이블에 저장
 *  - listScores     : Score 테이블 조회
 *  - createGuestbook: Guestbook 테이블에 저장
 *  - listGuestbooks : Guestbook 테이블 조회
 *
 * APPSYNC.url이 비어 있으면 "로컬 모드"로 동작해요(브라우저 localStorage 사용).
 * 이후 주차에 AppSync API를 만들고 url, apiKey만 채우면 DynamoDB로 저장돼요.
 */
const APPSYNC = {
  url: "https://b3czplolvrczjaqnva37gunmaa.appsync-api.ap-northeast-2.amazonaws.com/graphql",
  apiKey: "da2-jp77ahbghrffbd4i5bklc2iyua", // 공개용 API 키 (IAM 최소 권한으로 저장·조회만 가능)
};

const Api = (() => {
  const remote = Boolean(APPSYNC.url && APPSYNC.apiKey);

  async function gql(query, variables) {
    const res = await fetch(APPSYNC.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": APPSYNC.apiKey },
      body: JSON.stringify({ query, variables }),
    });
    let json;
    try { json = await res.json(); } catch { throw new Error(`서버 응답 오류 (HTTP ${res.status})`); }
    if (json.errors) throw new Error(json.errors[0].message);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return json.data;
  }

  // ---- 로컬 모드 저장소 ----
  function load(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  }
  function save(key, list) {
    try { localStorage.setItem(key, JSON.stringify(list)); } catch { /* 저장 불가 환경 */ }
  }
  const memory = { scores: load("intro.scores"), guestbook: load("intro.guestbook") };
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  return {
    mode: remote ? "AppSync" : "로컬",

    async listQuestions() {
      if (!remote) return QUESTIONS.map((q) => ({ ...q }));
      const d = await gql(`query { listQuestions { items { id text choices answer } } }`);
      return d.listQuestions.items;
    },

    async createScore({ nickname, score, title }) {
      const item = { id: newId(), nickname, score, title, createdAt: new Date().toISOString() };
      if (!remote) { memory.scores.push(item); save("intro.scores", memory.scores); return item; }
      const d = await gql(
        `mutation($input: CreateScoreInput!) { createScore(input: $input) { id nickname score title createdAt } }`,
        { input: { nickname, score, title } }
      );
      return d.createScore;
    },

    async listScores() {
      if (!remote) return [...memory.scores];
      const d = await gql(`query { listScores(limit: 1000) { items { id nickname score title createdAt } } }`);
      return d.listScores.items;
    },

    async createGuestbook({ nickname, message, sticker }) {
      const item = { id: newId(), nickname, message, sticker, createdAt: new Date().toISOString() };
      if (!remote) { memory.guestbook.push(item); save("intro.guestbook", memory.guestbook); return item; }
      const d = await gql(
        `mutation($input: CreateGuestbookInput!) { createGuestbook(input: $input) { id nickname message sticker createdAt } }`,
        { input: { nickname, message, sticker } }
      );
      return d.createGuestbook;
    },

    async listGuestbooks() {
      if (!remote) return [...memory.guestbook];
      const d = await gql(`query { listGuestbooks(limit: 20) { items { id nickname message sticker createdAt } } }`);
      return d.listGuestbooks.items;
    },
  };
})();
