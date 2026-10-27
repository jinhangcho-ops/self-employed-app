import { Link } from 'react-router'
import Layout from '../Layout'
import { SITE } from '@/shared/config'
import InView from '../components/InView'
import CountUp from '../components/CountUp'
import MotionToggle from '../components/MotionToggle'
import TapScene from '../components/TapScene'

export default function Home() {
  return (
    <Layout
      home
      title="domain | 메뉴 하나 팔면 얼마 남는지 1분이면 알아요"
      description="외식업 사장님을 위한 메뉴별 실제 마진 계산 앱. 식자재 원가와 배달앱 수수료를 빼고 오늘 남은 돈을 1분 만에 확인하세요. 베타 기간 무료."
    >
      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap">
          <div>
            <span className="eyebrow">외식업 사장님 전용 · 베타 무료</span>
            <h1 id="hero-title">
              메뉴 하나 팔면
              <br />
              <em>얼마 남는지</em>
              <br />
              1분이면 알아요
            </h1>
            <p className="lead">
              식자재 원가와 배달앱 수수료까지 빼고, 메뉴마다 실제로 남는 돈을 계산해 드려요. 영업 끝나고 + 버튼 몇
              번이면 오늘 이익이 나와요.
            </p>
            <div className="ctas" data-hero-cta="">
              <a href={SITE.appUrl} className="btn btn-red" data-track="cta_click" data-loc="hero">
                무료로 시작하기
              </a>{' '}
              <a className="btn btn-white" href="#features" data-track="see_features">
                어떻게 쓰는지 보기
              </a>
            </div>
            <p className="note">가입 없이 바로 써 볼 수 있어요 · 한식당·카페·분식집 샘플 메뉴 제공</p>
          </div>
          <div className="stage" aria-hidden="true">
            <span className="float f1">
              <span className="say say-w tail-r">
                <small>오늘 이익</small>
                <b className="num">184,500원</b>
              </span>
            </span>{' '}
            <span className="float f2">
              <span className="say say-red tail-bl">김치찌개 +4,200원</span>
            </span>{' '}
            <span className="float f3">
              <span className="say say-mint tail-l">원가율 32%</span>
            </span>{' '}
            <img className="pet" src="/img/mascot.webp" width={341} height={428} alt="" fetchPriority="high" />{' '}
            <span className="floor" />
          </div>
        </div>
      </section>
      <section className="sec" id="features" aria-labelledby="f-title">
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">FEATURES</span>
            <h2 id="f-title">
              계산은{' '}
              <img
                loading="lazy"
                decoding="async"
                translate="no"
                className="inline-logo"
                src="/img/logo.png"
                width={455}
                height={102}
                alt="domain"
              />
              이,
              <br />
              사장님은 장사만
            </h2>
            <p>처음 한 번만 설정하면 매일은 1분이면 끝나요.</p>
            <MotionToggle />
          </div>
          <ol className="steps">
            <li>
              <InView className="scene sc-ocr" aria-hidden="true" loop>
                <div className="iphone">
                  <span className="island" />
                  <div className="scr">
                    <img loading="lazy" decoding="async" src="/img/scenes/cam.webp" width={520} height={1125} alt="" />{' '}
                    <span className="scanbar" />
                    <span className="flash" />{' '}
                    <img
                      loading="lazy"
                      decoding="async"
                      className="after"
                      src="/img/scenes/ocr.webp"
                      width={520}
                      height={1125}
                      alt=""
                    />
                  </div>
                </div>
                <span className="say say-w tail-l pop p1">
                  <b>양파 3kg</b> 6,900원 <em>✓</em>
                </span>{' '}
                <span className="say say-w tail-l pop p2">
                  <b>대파 1kg</b> 3,200원 <em>✓</em>
                </span>{' '}
                <span className="say say-w tail-l pop p3">
                  <b>앞다리 2kg</b> 25,800원 <em>✓</em>
                </span>{' '}
                <span className="say say-mint tail-l pop p4">1g당 단가 자동 계산</span>
              </InView>
              <b>영수증 찍어서 식자재 등록</b>
              <span>마트 영수증을 찍으면 품목·양·금액을 읽어서 1g당 가격까지 계산해요. 직접 입력해도 돼요.</span>
            </li>
            <li>
              <InView className="scene sc-cost" aria-hidden="true">
                <div className="costcard">
                  <svg className="ring" viewBox="0 0 44 44">
                    <circle className="bg" cx="22" cy="22" r="18" />
                    <circle className="fg" cx="22" cy="22" r="18" pathLength="100" />
                  </svg>
                  <div>
                    <small>김치찌개 원가율</small>
                    <b className="num">
                      <CountUp to={35.9} />%
                    </b>
                    <span className="sub">
                      1개 팔면 <em className="num">5,770원</em> 남아요
                    </span>
                  </div>
                </div>
                <div className="dishwrap">
                  <img loading="lazy" decoding="async" src="/img/scenes/jjigae.webp" width={880} height={660} alt="" />{' '}
                  <span className="pin pk">
                    <span className="say say-w tail-br">
                      김치 200g <em>600원</em>
                    </span>
                  </span>{' '}
                  <span className="pin pp">
                    <span className="say say-w tail-bl">
                      앞다리 100g <em>1,300원</em>
                    </span>
                  </span>{' '}
                  <span className="pin pt">
                    <span className="say say-w tail-t">
                      두부 ½모 <em>750원</em>
                    </span>
                  </span>
                </div>
              </InView>
              <b>메뉴 레시피 입력</b>
              <span>1인분에 들어가는 재료와 양을 고르면 원가율과 채널별로 남는 돈이 바로 나와요.</span>
            </li>
            <li>
              <TapScene />
              <b>영업 후 판매 입력</b>
              <span>메뉴마다 + 버튼으로 판 개수만 톡톡 누르면 오늘 이익이 바로 올라가요.</span>
            </li>
          </ol>
          <div className="grid2">
            <article className="feat">
              <InView className="panel" aria-hidden="true">
                <div className="rows">
                  <div className="row">
                    <div className="tile">
                      <span className="st s-red">김치찌개 +4,200원</span>
                    </div>
                    <div className="tile pe">
                      <span className="st s-off">원가율 32%</span>
                    </div>
                    <div className="tile">
                      <span className="st s-ink">오늘 이익 확인</span>
                    </div>
                    <div className="tile pe">
                      <span className="st s-mint">배민 수수료 7.8%</span>
                    </div>
                    <div className="tile">
                      <span className="st s-red">김치찌개 +4,200원</span>
                    </div>
                    <div className="tile pe">
                      <span className="st s-off">원가율 32%</span>
                    </div>
                    <div className="tile">
                      <span className="st s-ink">오늘 이익 확인</span>
                    </div>
                    <div className="tile pe">
                      <span className="st s-mint">배민 수수료 7.8%</span>
                    </div>
                  </div>
                  <div className="row r2">
                    <div className="tile pe">
                      <span className="st s-glass">영수증 자동 인식</span>
                    </div>
                    <div className="tile">
                      <span className="st s-yel">1분 입력 끝!</span>
                    </div>
                    <div className="tile pe">
                      <span className="st s-gold">제육볶음 마진 1등</span>
                    </div>
                    <div className="tile">
                      <span className="st s-off">양파 +9%</span>
                    </div>
                    <div className="tile pe">
                      <span className="st s-glass">영수증 자동 인식</span>
                    </div>
                    <div className="tile">
                      <span className="st s-yel">1분 입력 끝!</span>
                    </div>
                    <div className="tile pe">
                      <span className="st s-gold">제육볶음 마진 1등</span>
                    </div>
                    <div className="tile">
                      <span className="st s-off">양파 +9%</span>
                    </div>
                  </div>
                  <div className="row r3">
                    <div className="tile">
                      <span className="st s-mint">쿠팡이츠 실수령</span>
                    </div>
                    <div className="tile pe">
                      <span className="st s-red">원가율 40% 경고</span>
                    </div>
                    <div className="tile">
                      <span className="st s-ink">영업 마감 알림</span>
                    </div>
                    <div className="tile pe">
                      <span className="st s-yel">+ 판매 입력</span>
                    </div>
                    <div className="tile">
                      <span className="st s-mint">쿠팡이츠 실수령</span>
                    </div>
                    <div className="tile pe">
                      <span className="st s-red">원가율 40% 경고</span>
                    </div>
                    <div className="tile">
                      <span className="st s-ink">영업 마감 알림</span>
                    </div>
                    <div className="tile pe">
                      <span className="st s-yel">+ 판매 입력</span>
                    </div>
                  </div>
                </div>
              </InView>
              <h3>메뉴별 실제 마진</h3>
              <p>
                판매가에서 원가와 수수료를 빼고
                <br />
                메뉴 하나 팔 때 남는 돈을 보여줘요
              </p>
            </article>
            <article className="feat">
              <InView className="panel" aria-hidden="true">
                <div className="slot">
                  <div className="drum">
                    <div className="win" />
                    <div className="reel">
                      <div>정산 중…</div>
                      <div>0원</div>
                      <div>52,300원</div>
                      <div>오늘 이익</div>
                      <div>정산 중…</div>
                      <div>184,500원</div>
                      <div>오늘 이익</div>
                      <div>메뉴 32개</div>
                      <div>정산 중…</div>
                      <div>0원</div>
                      <div>52,300원</div>
                      <div>오늘 이익</div>
                      <div>정산 중…</div>
                      <div>184,500원</div>
                    </div>
                  </div>
                  <div className="lever" />
                </div>
                <div className="cap">
                  오늘 남은 돈 <b className="num">184,500원</b>
                </div>
              </InView>
              <h3>오늘 이익 한눈에</h3>
              <p>
                영업 끝나고 +/− 버튼으로 1분 입력하면
                <br />
                오늘 남은 돈이 바로 나와요
              </p>
            </article>
            <article className="feat">
              <InView className="panel" aria-hidden="true">
                <div className="fan">
                  <div className="ch c-hall">
                    <small>
                      <span className="chi hall">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round">
                          <path d="M4 10l1.5-5h13L20 10M4 10v9h16v-9M4 10h16M9 19v-5h6v5" />
                        </svg>
                      </span>
                      홀
                    </small>
                    <b className="num">5,770원</b>
                    <span>수수료 0원</span>
                  </div>
                  <div className="ch c-bm">
                    <small>
                      <img
                        loading="lazy"
                        decoding="async"
                        className="chi"
                        src="/img/ch-baemin.png"
                        width={72}
                        height={72}
                        alt=""
                      />
                      배달의민족
                    </small>
                    <b className="num">4,768원</b>
                    <span>수수료 1,002원</span>
                  </div>
                  <div className="ch c-cp">
                    <small>
                      <img
                        loading="lazy"
                        decoding="async"
                        className="chi"
                        src="/img/ch-coupang.png"
                        width={72}
                        height={72}
                        alt=""
                      />
                      쿠팡이츠
                    </small>
                    <b className="num">4,768원</b>
                    <span>수수료 1,002원</span>
                  </div>
                </div>
                <div className="fan-cap">김치찌개 1개 팔면 남는 돈</div>
              </InView>
              <h3>배달앱 수수료까지 빼고</h3>
              <p>
                같은 메뉴도 홀·배달앱마다 남는 돈이 달라요
                <br />
                채널별로 나눠서 보여줘요
              </p>
            </article>
            <article className="feat">
              <InView className="panel" aria-hidden="true">
                <div className="bubbles">
                  <div className="bub">
                    <small>21:30 · domain</small>영업 마감 시간이에요. 오늘 판매를 입력해 주세요
                  </div>
                  <div className="bub me">+ 버튼 몇 번으로 입력 끝!</div>
                  <div className="bub">
                    <small>21:31 · domain</small>오늘 이익 <b className="num">184,500원</b>, 어제보다 12% 늘었어요
                  </div>
                  <div className="bub">
                    <small>21:31 · domain</small>제일 많이 남긴 메뉴는 제육볶음이에요
                  </div>
                </div>
              </InView>
              <h3>영업 마감 정리 알림</h3>
              <p>
                가게 문 닫을 시간에 알림이 와요
                <br />
                잊지 않고 매일 1분이면 정리 끝
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="alert" aria-labelledby="a-title">
        <div className="wrap">
          <img
            loading="lazy"
            decoding="async"
            className="pet"
            src="/img/mascot-angry.webp"
            width={162}
            height={205}
            alt="눈썹을 찌푸린 셰프 강아지 마스코트"
          />
          <div>
            <span className="kicker">ALERT</span>
            <h2 id="a-title">
              남는 게 없는 메뉴,
              <br />
              제가 먼저 알려드릴게요
            </h2>
            <p>
              원가율이 40%를 넘거나 식자재 값이 올라 마진이 줄어든 메뉴가 생기면 바로 알려 드려요. 영업 마감 시각에는
              오늘 판매 정리 알림도 보내요.
            </p>
            <div className="push">
              <span className="ic">
                <img loading="lazy" decoding="async" src="/img/mascot-sad.webp" width={162} height={205} alt="" />
              </span>
              <div>
                <b>제육볶음 원가율이 41%가 됐어요</b>
                <span>돼지고기 앞다리 단가가 9% 올랐어요</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="sec" id="cases" aria-labelledby="c-title">
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">USE CASES</span>
            <h2 id="c-title">이런 사장님께 딱 맞아요</h2>
            <p>업종도, 가게 크기도 달라도 고민은 같아요. 많이 팔았는데 남는 게 얼마인지.</p>
          </div>
          <div className="cases">
            <article className="case">
              <div className="who">
                <span className="av" style={{ background: 'linear-gradient(180deg,#ff9a8f,#e2434a)' }}>
                  한식
                </span>
                <div>
                  <b>52세 한식당 사장님</b>
                  <span>테이블 8개 · 배민 운영</span>
                </div>
              </div>
              <q>
                제육볶음이 제일 잘 팔려서 효자 메뉴인 줄 알았는데, 배달로 나가면 1,100원밖에 안 남더라고요. 배달 가격만
                500원 올렸어요.
              </q>
              <div className="res">
                <span className="tag up">배달 마진 +45%</span>
                <span className="tag">하루 입력 1분</span>
              </div>
            </article>
            <article className="case">
              <div className="who">
                <span className="av" style={{ background: 'linear-gradient(180deg,#a9cfff,#5f97ec)' }}>
                  카페
                </span>
                <div>
                  <b>34세 1인 카페 사장님</b>
                  <span>테이크아웃 위주</span>
                </div>
              </div>
              <q>
                우유값이 오를 때마다 라떼가 얼마나 남는지 몰라 불안했어요. 영수증만 찍으면 바뀐 원가가 바로 보여서 가격
                정하기가 쉬워졌어요.
              </q>
              <div className="res">
                <span className="tag up">원가 확인 시간 0분</span>
                <span className="tag">영수증 인식</span>
              </div>
            </article>
            <article className="case">
              <div className="who">
                <span className="av" style={{ background: 'linear-gradient(180deg,#7fe2bb,#36b383)' }}>
                  분식
                </span>
                <div>
                  <b>45세 분식집 부부 사장님</b>
                  <span>홀 + 쿠팡이츠</span>
                </div>
              </div>
              <q>
                둘이 번갈아 가게를 보니 매출 정리가 늘 밀렸어요. 마감 알림이 오면 각자 휴대폰으로 + 버튼만 누르니 다툴
                일이 줄었어요.
              </q>
              <div className="res">
                <span className="tag up">마감 정리 매일</span>
                <span className="tag">정리 알림</span>
              </div>
            </article>
          </div>
          <p className="disc">
            위 사례는 서비스 기획 단계의 예시 인물이에요. 베타 테스트가 끝나면 실제 사장님 후기로 바꿀 예정이에요.
          </p>
        </div>
      </section>
      <section className="sec" id="faq" aria-labelledby="q-title" style={{ paddingTop: '0' }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">FAQ</span>
            <h2 id="q-title">자주 묻는 질문</h2>
            <p>
              더 궁금한 점은 <Link to="/contact">문의하기</Link>로 남겨 주세요.
            </p>
          </div>
          <div className="faq">
            <details>
              <summary>정말 무료인가요?</summary>
              <div className="a">
                <p>
                  네. 베타 기간에는 모든 기능을 무료로 쓸 수 있어요. 정식 출시 뒤에도 메뉴별 마진 계산 같은 기본 기능은
                  무료로 두고, POS·배달앱 자동 연동 같은 확장 기능만 유료로 준비하고 있어요.
                </p>
              </div>
            </details>
            <details>
              <summary>휴대폰을 잘 못 다뤄도 쓸 수 있나요?</summary>
              <div className="a">
                <p>
                  영업이 끝나면 메뉴마다 + / − 버튼만 누르면 돼요. 한식당·카페·분식집 샘플 메뉴를 불러와 가격만 고치면
                  바로 시작할 수 있어서 처음 설정도 10분이면 충분해요.
                </p>
              </div>
            </details>
            <details>
              <summary>앱을 따로 설치해야 하나요?</summary>
              <div className="a">
                <p>
                  설치 없이 인터넷 창에서 바로 쓸 수 있어요. 홈 화면에 추가하면 일반 앱처럼 아이콘으로 열리고, 영업 마감
                  시각에 정리 알림도 받을 수 있어요.
                </p>
              </div>
            </details>
            <details>
              <summary>배달앱 수수료는 어떻게 계산하나요?</summary>
              <div className="a">
                <p>
                  홀·배달의민족·쿠팡이츠처럼 판매 채널마다 수수료율과 포장비 같은 개당 추가 비용을 직접 넣어요. 같은
                  메뉴라도 채널별로 실제로 남는 돈이 따로 계산돼요.
                </p>
              </div>
            </details>
            <details>
              <summary>입력한 매출 정보는 안전한가요?</summary>
              <div className="a">
                <p>
                  카카오·구글·이메일로 가입하면 입력한 매출과 레시피가 사장님 계정에만 저장되고, 다른 사람은 볼 수
                  없어요. 휴대폰을 바꿔도 같은 계정으로 로그인하면 그대로 이어서 쓸 수 있어요. 자세한 내용은
                  개인정보처리방침에 적어 두었어요.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>
      <section className="final" aria-labelledby="z-title">
        <div className="wrap">
          <div className="box">
            <div>
              <h2 id="z-title">
                오늘 장사, 얼마 남았는지
                <br />
                지금 확인해 보세요
              </h2>
              <p>샘플 메뉴로 바로 시작하고, 가격만 우리 가게 기준으로 고치면 돼요.</p>
              <div className="ctas">
                <a href={SITE.appUrl} className="btn btn-red" data-track="cta_click" data-loc="final">
                  무료로 시작하기
                </a>
                <Link to="/contact" className="btn btn-white">
                  문의하기
                </Link>
              </div>
            </div>
            <img
              loading="lazy"
              decoding="async"
              className="pet"
              src="/img/mascot-happy.webp"
              width={161}
              height={205}
              alt="활짝 웃는 셰프 강아지 마스코트"
            />
          </div>
        </div>
      </section>
    </Layout>
  )
}
