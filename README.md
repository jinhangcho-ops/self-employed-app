<div align="center">

# self-employed-app

**영업 끝나고 1분, 오늘 얼마 남았는지 바로 확인하기**

외식업 자영업자를 위한 메뉴별 실제 마진 계산 웹앱

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=black)

</div>

<br>

## 팀원

| 역할 | 이름 | GitHub | 담당 |
|---|---|---|---|
| 풀스택 | 예은 | [@yetk124](https://github.com/yetk124) | 화면 · API · 배포 |
| 데이터 분석 | 이수진 | [@arlusurge](https://github.com/arlusurge) | DB 설계 · 지표 SQL |
| 데이터 분석 | 이지원 | [@[kenjiwon](https://github.com/kenjiwon) | 데이터 수집 · OCR 정리 |

<br>

> [!NOTE]
> **2027년 1월 첫 주 MVP 시연 목표**로 개발 중이에요!

<br>

## 왜 만들었나요?

> 사장님들은 계산을 못 하는 게 아니라, **입력할 시간이 없어요.**

하루 10시간 넘게 일하는 사장님들이 영업 후 **5분 안에** 가게 정리를 끝낼 수 있도록,
메뉴마다 **실제로 얼마가 남는지** 자동으로 계산해 드려요.

<br>

## 주요 기능

| 기능 | 하는 일 |
|---|---|
| **식자재 등록** | 구매량·가격 입력 → 단위당 가격 자동 계산 |
| **메뉴 레시피 등록** | 재료·사용량 입력 → 원가율 계산 |
| **채널 수수료 설정** | 매장·배달앱 수수료율 한 번만 입력 |
| **메뉴별 실제 마진** | 채널별로 진짜 남는 돈 확인, 원가율 40% 넘으면 경고 |
| **오늘 판매 입력** | +/− 버튼으로 1분 만에 입력 → 오늘 이익 확인 |
| **정리 알림** | 영업 종료 시각에 푸시 알림 |

<details>
<summary><b>베타 이후 추가 기능</b></summary>
<br>

- 영수증 촬영(OCR)으로 식자재 입력
- 업종별 샘플 레시피 템플릿
- 식자재 가격 인상 시 영향받는 메뉴 목록

</details>

<br>

## 폴더 구조

```
self-employed-app/
├── frontend/     React + Vite (PWA)
├── backend/      FastAPI
├── db/           테이블 설계 · 지표 SQL
│   └── metrics/
└── docs/         기획서 · ERD · 지표 정의서
```

<br>

## 시작하기

<details>
<summary><b>프론트엔드 실행</b></summary>
<br>

```bash
cd frontend
npm install
npm run dev
```

</details>

<details>
<summary><b>백엔드 실행</b></summary>
<br>

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Mac: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

http://127.0.0.1:8000/api/health 에서 `{"status":"ok"}` 확인

</details>

<br>

## 일정

| 단계 | 기간 | 상태 |
|---|---|:---:|
| 설계 | 10/19 ~ 11/01 | 진행 중 |
| 개발 | 11/02 ~ 12/13 | 예정 |
| 내부 테스트 | 12/14 ~ 12/27 | 예정 |
| MVP 시연 | 2027년 1월 첫 주 | 예정 |
