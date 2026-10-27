import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import FramePreview from "./FramePreview";
import { BIBLE, STEP_CAPTIONS, SUBTITLE, TITLE } from "./frameContent";
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

// 결과 화면에 들어올 때마다 새로 마운트된다. 그래야 안내 모달의
// 최소 노출 시간이 앱을 연 시점이 아니라 "완성하기"를 누른 시점부터 센다.
function ResultView({ photos }) {
  const frameRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 프레임에 그려지는 모든 글자. 글꼴 로딩과 PNG 에 심을 서브셋을 고르는 데 쓴다.
  const frameText = STEP_CAPTIONS.join("") + BIBLE.join("") + TITLE + SUBTITLE;
  const fontsReady = useFontsReady(frameText);

  async function download() {
    setSaving(true);
    setError(null);
    try {
      const fontEmbedCSS = await buildFontEmbedCss(frameText);
      const dataUrl = await toPng(frameRef.current, {
        pixelRatio: 2,
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

      {/* 글꼴이 다 오기 전에는 감춘다. display:none 이 아니라 visibility 라야
          레이아웃이 잡혀서 FramePreview 가 축소 비율을 제대로 잰다. */}
      <div className="frame-gate" data-ready={fontsReady}>
        <FramePreview photos={photos} frameRef={frameRef} />
      </div>

      {fontsReady && (
        <div className="actions reveal reveal--3">
          <button
            className="btn btn--primary"
            type="button"
            disabled={saving}
            onClick={download}
          >
            {saving ? "저장 중…" : "다운로드"}
          </button>
        </div>
      )}
    </main>
  );
}

export default ResultView;
