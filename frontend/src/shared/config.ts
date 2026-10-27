/** 배포 값은 .env 에 넣는다 (.env.example 참고). 비어 있으면 체험 모드로 동작. */
export const ENV = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  ga4: import.meta.env.VITE_GA4_ID ?? '',
  apiBase: import.meta.env.VITE_API_BASE ?? '',
}

/** 랜딩 공통 정보 — 임시 값은 확정되면 교체 */
export const SITE = {
  name: 'domain',
  url: 'https://domain-app.kr', // 임시 도메인
  appUrl: '/app/',
  email: 'hello@domain-app.kr', // 임시
  kakaoId: '@domain사장님', // 임시 카카오톡 채널
  kakaoUrl: 'https://pf.kakao.com/_domain', // 임시
  instagram: '@domain.app', // 임시
  hours: '평일 10:00~18:00',
  reply: '접수 후 24시간 안에 답변 (주말·공휴일은 다음 영업일)',
}
