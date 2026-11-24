/*
 * ✏️ 여기만 본인 정보로 고치면 돼요.
 * - PROFILE: 이름/인사말
 * - CARDS: 취향 카드 (S02)
 * - QUESTIONS: 퀴즈 문제 (S03) — 나중에 DynamoDB Question 테이블로 옮길 데이터
 * - TITLES: 점수별 칭호 (S04)
 */
const PROFILE = {
  name: "오지현",
  hello: "안녕하세요! 저는 오지현이에요 👋",
};

const CARDS = [
  { label: "MBTI", value: "ENFP", emoji: "🧭", reason: "사람 만나는 걸 좋아하고 즉흥 계획을 즐겨요." },
  { label: "좋아하는 음식", value: "떡볶이", emoji: "🍜", reason: "매운 걸 먹으면 스트레스가 풀려요." },
  { label: "좋아하는 음악", value: "밴드 음악", emoji: "🎧", reason: "공부할 때 들으면 집중이 잘 돼요." },
  { label: "좋아하는 장소", value: "바다", emoji: "🌊", reason: "파도 소리를 들으면 마음이 편해져요." },
  { label: "취미", value: "산책", emoji: "🚶", reason: "걸으면서 생각 정리를 해요." },
  { label: "요즘 빠진 것", value: "사진 찍기", emoji: "📷", reason: "일상을 기록하는 게 재미있어요." },
];

// answer: 정답 보기의 index (0~3)
const QUESTIONS = [
  { id: "q1", text: "제 MBTI는 무엇일까요?", choices: ["ISTJ", "ENFP", "INTP", "ESFJ"], answer: 1 },
  { id: "q2", text: "제가 가장 좋아하는 음식은?", choices: ["초밥", "떡볶이", "파스타", "삼겹살"], answer: 1 },
  { id: "q3", text: "주말에 저는 주로 무엇을 할까요?", choices: ["게임", "산책", "운동", "잠"], answer: 1 },
  { id: "q4", text: "제가 좋아하는 장소는?", choices: ["산", "카페", "바다", "도서관"], answer: 2 },
  { id: "q5", text: "제가 즐겨 듣는 음악 장르는?", choices: ["힙합", "클래식", "밴드 음악", "트로트"], answer: 2 },
  { id: "q6", text: "저는 아침형? 저녁형?", choices: ["완전 아침형", "약간 아침형", "약간 저녁형", "완전 저녁형"], answer: 3 },
  { id: "q7", text: "팀플에서 저는 주로 어떤 역할?", choices: ["발표", "자료 조사", "PPT 제작", "분위기 메이커"], answer: 0 },
  { id: "q8", text: "제가 요즘 빠진 취미는?", choices: ["뜨개질", "사진 찍기", "요리", "클라이밍"], answer: 1 },
  { id: "q9", text: "제가 제일 싫어하는 것은?", choices: ["벌레", "더위", "추위", "기다리기"], answer: 0 },
  { id: "q10", text: "제가 가장 가 보고 싶은 나라는?", choices: ["일본", "스페인", "호주", "캐나다"], answer: 1 },
];

const TITLES = [
  { min: 10, title: "👑 나의 소울메이트" },
  { min: 8, title: "💖 찐친 인증" },
  { min: 5, title: "🙂 친해지는 중" },
  { min: 0, title: "🌱 이제부터 알아가요" },
];

const STICKERS = ["😀", "🥳", "👍", "💪", "🍀", "❤️"];
