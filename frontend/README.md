# frontend

domain 소개 페이지(랜딩)와 앱(PWA)을 한 프로젝트에 담았어요.
React 19 + TypeScript + Vite. 스타일은 CSS 파일 그대로 써요(Tailwind 없음).

| 주소                                         | 내용                              | 시작 파일                             |
| -------------------------------------------- | --------------------------------- | ------------------------------------- |
| `/` `/contact` `/thanks` `/terms` `/privacy` | 소개 랜딩 (PC 꽉 찬 화면)         | `index.html` → `src/landing/main.tsx` |
| `/app/`                                      | domain 앱 (PC에서는 가운데 480px) | `app/index.html` → `src/app/main.tsx` |

## 실행

```bash
npm install
cp .env.example .env   # 값은 비워 둬도 체험 모드로 돌아가요
npm run dev            # http://localhost:5173  /  http://localhost:5173/app/
```

| 명령              | 하는 일                           |
| ----------------- | --------------------------------- |
| `npm run dev`     | 개발 서버                         |
| `npm run build`   | 타입 검사 + 배포용 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 미리보기                |
| `npm run lint`    | ESLint                            |
| `npm run test`    | 계산 로직 테스트 (vitest)         |
| `npm run format`  | Prettier 정리                     |

VS Code에서 열면 ESLint·Prettier 확장 설치를 추천해 줘요. 저장하면 자동 정리돼요.

## 폴더

```
src/
  shared/            랜딩·앱 같이 쓰는 것: 설정(config), GA4, 토스트
  app/
    main.tsx         앱 시작 (글꼴, 서비스워커, 시작 화면)
    App.tsx          화면 전환 + 탭 바 + 시트
    AppProvider.tsx  화면 상태, 가입 유도, 정리 알림
    store.ts         데이터 저장소 (지금은 localStorage → ERD 나오면 Supabase로 교체)
    types.ts         데이터 모양 (메뉴, 식자재, 채널, 판매…)
    auth.ts          카카오·구글·이메일 로그인 (Supabase, 키 없으면 체험 모드)
    data/            업종 템플릿 (한식당·카페·분식집 예시)
    lib/             계산 로직 — margin.ts(원가·마진), receipt.ts(영수증 읽기), *.test.ts
    views/           홈(달력) · 메뉴 마진 · 식자재 · 설정 · 로그인 · 첫 설정
    sheets/          판매 입력 · 메뉴 수정 · 식자재 수정 · 가입 유도 · 약관
    receipt/         영수증 사용법 · 인식 → 결과 수정 → 저장 전 확인
    ui/              Icon, Sheet, TabBar, Receipt(영수증 카드), Thumb…
    app.css          앱 디자인 (--hwp-* 토큰)
  landing/
    Layout.tsx       머리글·바닥글
    pages/           Home · Contact · Thanks · Terms · Privacy · NotFound
    components/      장면 모션(InView, TapScene, CountUp), 움직임 멈추기
    content/         약관·개인정보처리방침 본문
    landing.css      랜딩 디자인
public/
  img/               로고, 마스코트, 메뉴 임시 사진, 가이드 이미지
  icons/             앱 아이콘
```

## 바꿔야 할 임시 값

- `.env`: Supabase URL·anon 키, FastAPI 주소, GA4 ID
- `src/shared/config.ts` 의 `SITE`: 도메인, 이메일, 카카오톡 채널, 인스타그램 (지금은 임시)
- `index.html`: 공유 미리보기(og) 주소
- `public/img/menu-*.webp`: 메뉴 임시 사진 → 실제 사진

## 배포 (Vercel)

Root Directory를 `frontend`로 두고 Framework는 Vite. `vercel.json` 이 `/app/*` 는 앱으로, 나머지는 랜딩으로 보내요.
환경 변수는 Vercel 프로젝트 설정에 `.env` 와 같은 이름으로 넣어요.
