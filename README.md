# 나를 얼마나 알까요? — 자기소개 웹앱

새 학기 팀플 조원·동아리원에게 퀴즈와 취향 카드로 나를 소개하는 사이트 (클라우드 데이터베이스 과제).

## 화면
| ID | 화면 | 내용 |
|---|---|---|
| S01 | Home | 캐릭터, "나를 얼마나 알까요?", 퀴즈 시작 |
| S02 | 취향 카드 | MBTI·음식·음악·장소 카드, 클릭 시 뒤집혀 이유 표시 |
| S03 | 퀴즈 | 10문제 무작위 순서, 진행 바, 정답/오답 표시 |
| S04 | 결과 / 랭킹 | 점수·칭호, 닉네임으로 랭킹 등록, TOP 10 |
| S05 | 방명록 | 닉네임·메시지·이모지 스티커, 최신순 20개 |

## 아키텍처
```
User ──HTTPS──▶ CloudFront ──OAC──▶ S3 (HTML/CSS/JS/Images, 퍼블릭 액세스 차단)
User ──GraphQL─▶ AppSync ─────────▶ DynamoDB (Question / Score / Guestbook)
```
- 현재(12주차): 정적 사이트를 S3 + CloudFront로 배포. 데이터는 브라우저 로컬 저장(로컬 모드).
- 이후: `js/api.js` 의 `APPSYNC.url`, `apiKey` 를 채우면 AppSync → DynamoDB 로 전환.

## 구조
```
index.html
css/style.css
js/content.js   # 프로필·카드·퀴즈 문제 (본인 정보로 수정)
js/api.js       # 데이터 계층 (listQuestions, createScore, listScores, createGuestbook, listGuestbooks)
js/app.js       # 화면 동작
assets/character.svg
docs/           # 과제 가이드 (S3에는 올리지 않음)
```

## 로컬 실행
```
python -m http.server 8000
```
→ http://localhost:8000
