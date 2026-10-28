import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import FramePreview from "./FramePreview";
import { BIBLE, STEP_CAPTIONS, SUBTITLE, TITLE } from "./frameContent";
import { LAYOUTS } from "./frameLayouts";
import { buildFontEmbedCss } from "./fontEmbed";
import { useFontsReady } from "./useFontsReady";

// "짜잔" 문구 영역에서 좌우로 퍼지며 포물선을 그리는 조각들.
// 한 점에서만 나오면 어색해서 가운데 근처 다섯 군데로 출발점을 나눴다.
const ORIGINS_X = ["-16%", "-8%", "0%", "8%", "16%"];
// 문구 영역 높이 기준. 출발점이 페이지 최상단에 가까워서 아래쪽에 둬야
// 솟는 정점이 화면 밖으로 잘리지 않는다.
const ORIGINS_Y = ["65%", "78%", "90%"];

const PIECE_COUNT = 28;
const CONFETTI = Array.from({ length: PIECE_COUNT }, (_, i) => {
  const side = i % 2 === 0 ? -1 : 1;
  const spread = 0.28 + (Math.floor(i / 2) / (PIECE_COUNT / 2 - 1)) * 0.72;
  return {
    "--origin-x": ORIGINS_X[i % ORIGINS_X.length],
    "--origin-y": ORIGINS_Y[i % ORIGINS_Y.length],
    "--x": (side * spread).toFixed(3),
    "--rise": `${-(60 + spread * 80).toFixed(0)}px`,
    "--fall": `${(60 + ((i * 7) % 4) * 14).toFixed(0)}vh`,
    "--spin": `${((i * 149) % 900) - 450}deg`,
    "--delay": `${(i % 8) * 45}ms`,
  };
});

// 한 칸씩 보여 주는 동안 화면 양옆에 남길 여백(px)
const HERO_GUTTER = 8;

// 처음 보여줄 레이아웃. 등장 애니메이션은 이 레이아웃 기준으로 한 번만 재므로
// 상태가 아니라 상수로 둔다.
const INITIAL_LAYOUT = "portrait";

// 결과 화면에 들어올 때마다 새로 마운트된다. 그래야 안내 모달의
// 최소 노출 시간이 앱을 연 시점이 아니라 "완성하기"를 누른 시점부터 센다.
function ResultView({ photos }) {
  const frameRef = useRef(null);
  const gateRef = useRef(null);
  const [hero, setHero] = useState(null);
  const [layout, setLayout] = useState(INITIAL_LAYOUT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 프레임에 그려지는 모든 글자. 글꼴 로딩과 PNG 에 심을 서브셋을 고르는 데 쓴다.
  const frameText = STEP_CAPTIONS.join("") + BIBLE.join("") + TITLE + SUBTITLE;
  const fontsReady = useFontsReady(frameText);

  // 등장 연출(frame-intro)이 쓸 좌표. 크기를 계산하지 않고 실제로 그려진 박스를
  // 잰다. 그리기가 끝난 뒤(useEffect)라야 안쪽 미리보기의 축소 비율까지 반영된
  // 값이 나온다. 재기 전에는 프레임을 감춰 두므로(data-intro="wait") 비치지 않는다.
  useEffect(() => {
    if (!fontsReady || hero) return;

    // 앞 스텝에서 스크롤이 내려가 있으면 가운데 계산이 어긋난다
    window.scrollTo(0, 0);

    const gate = gateRef.current;
    const { width, height, left, top } = gate.getBoundingClientRect();

    // 주소창이 겹치는 모바일에서는 innerHeight 가 실제로 보이는 높이보다 크다
    const view = window.visualViewport;
    const vw = view ? view.width : window.innerWidth;
    const vh = view ? view.height : window.innerHeight;

    // 확대/축소는 프레임 한가운데를 기준으로 걸린다
    const center = top + height / 2;
    // scale 배로 키운 뒤에도 y(제자리 기준 화면 세로 좌표)가 화면 한가운데에
    // 오도록 하는 이동값
    const panTo = (y, scale) =>
      `${(vh / 2 - center - scale * (y - center)).toFixed(1)}px`;

    // 한 칸씩 볼 때는 양옆 여백만 남기고 폭을 채우고,
    // 전체를 볼 때는 높이까지 들어가게 줄인다
    const zoom = (vw - HERO_GUTTER * 2) / width;
    const all = Math.min(zoom, (vh / height) * 0.95);

    // 칸 위치도 재서 쓴다. 세로형은 한 줄로 쌓여 있어서 카메라가 아래로 내려간다.
    const cuts = [...gate.querySelectorAll(".frame__cut")];

    setHero({
      "--intro-zoom": zoom.toFixed(4),
      "--intro-all": all.toFixed(4),
      // 가로는 어느 구간에서나 가운데라 하나면 된다
      "--intro-x": `${(vw / 2 - (left + width / 2)).toFixed(1)}px`,
      "--intro-all-y": panTo(center, all),
      ...Object.fromEntries(
        cuts.map((cut, i) => {
          const box = cut.getBoundingClientRect();
          return [`--intro-y${i}`, panTo(box.top + box.height / 2, zoom)];
        }),
      ),
    });
  }, [fontsReady, hero]);

  async function download() {
    setSaving(true);
    setError(null);
    try {
      const fontEmbedCSS = await buildFontEmbedCss(frameText);
      const dataUrl = await toPng(frameRef.current, {
        pixelRatio: LAYOUTS[layout].pixelRatio,
        backgroundColor: "#ffffff",
        fontEmbedCSS,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "walk-a-thon-4cut.png";
      link.click();
    } catch {
      setError("이미지를 만들지 못했어요. 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="app app--wide">
      {!fontsReady && (
        // 불투명한 배경이라 뒤가 비치지 않는다
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal__spinner" />
            <p className="modal__text font-jaram">
              선물을 만드는 중입니다 !
              <br />
              잠시만 기다려 주세요 ~
            </p>
          </div>
        </div>
      )}

      {/* 준비되기 전에는 아예 그리지 않는다. 모달 뒤에 아무것도 비치지 않도록. */}
      {/* .headline 이 색종이의 기준 영역이다. 조각이 이 문구에서 터져 나온다. */}
      {fontsReady && (
        <div className="headline">
          <h1 className="app__title font-jaram reveal reveal--1">
            <strong style={{ fontSize: "40px" }}>짜잔 !!</strong> <br />
            네컷사진으로 만들었어요!
          </h1>
          <p className="app__caption reveal reveal--2 font-jaram">
            다운로드해서 소중한 추억을 간직해주세요~~
          </p>

          {/* 캡처 대상인 .frame 바깥이라 PNG 에는 들어가지 않는다 */}
          <div className="burst" aria-hidden="true">
            {/* 바깥은 가로, 안쪽은 세로(올라갔다 떨어짐).
                둘을 나눠야 합쳐진 궤적이 포물선이 된다. */}
            {CONFETTI.map((piece, i) => (
              <span className="burst__piece" key={i} style={piece}>
                <span className="burst__body" />
              </span>
            ))}
          </div>
        </div>
      )}

      {error && <p className="app__error">{error}</p>}

      {fontsReady && (
        <div
          className="layouts reveal reveal--3"
          role="group"
          aria-label="사진 레이아웃"
        >
          {Object.entries(LAYOUTS).map(([key, { label }]) => (
            <button
              key={key}
              className={`layouts__btn${key === layout ? " is-active" : ""}`}
              type="button"
              aria-pressed={key === layout}
              onClick={() => setLayout(key)}
            >
              {/* 고른 쪽만 글자에 그라데이션이 들어간다 */}
              <span className={key === layout ? "gradient-text" : undefined}>
                {label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 글꼴이 다 오기 전에는 감춘다. display:none 이 아니라 visibility 라야
          레이아웃이 잡혀서 FramePreview 가 축소 비율을 제대로 잰다. */}
      <div
        className="frame-gate"
        data-ready={fontsReady}
        data-intro={hero ? "run" : "wait"}
        ref={gateRef}
        style={hero}
      >
        <FramePreview photos={photos} frameRef={frameRef} layout={layout} />
      </div>

      {fontsReady && (
        <div className="actions reveal reveal--3">
          <button
            className="btn btn--primary"
            type="button"
            disabled={saving}
            onClick={download}
          >
            <span className="gradient-text">
              {saving ? "저장 중…" : "다운로드"}
            </span>
          </button>
        </div>
      )}
    </main>
  );
}

export default ResultView;
