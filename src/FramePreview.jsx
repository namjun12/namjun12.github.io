import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { BIBLE, STEP_CAPTIONS, SUBTITLE, TITLE } from "./frameContent";
import { LAYOUTS } from "./frameLayouts";
import "./frame.css";

// 화면 폭에 맞춰 프레임을 축소해 보여준다. 축소는 바깥 래퍼에만 걸어서
// 캡처 대상인 .frame 자체는 원래 크기를 유지한다.
function useFitScale(frameWidth) {
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(1);

  // 레이아웃이 바뀌면 기준 폭이 달라지므로 비율을 다시 잰다
  useLayoutEffect(() => {
    const el = viewportRef.current;
    const fit = (width) => setScale(Math.min(1, width / frameWidth));

    fit(el.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) =>
      fit(entry.contentRect.width),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [frameWidth]);

  return [viewportRef, scale];
}

function FramePreview({ photos, frameRef, layout }) {
  const { width, height } = LAYOUTS[layout];
  const [viewportRef, scale] = useFitScale(width);

  // 세로형은 아래 한 줄에 다 들어가야 해서 제목과 구절을 한 줄로 편다
  const portrait = layout === "portrait";

  return (
    <div
      className="frame-viewport"
      ref={viewportRef}
      style={{ height: height * scale }}
    >
      <div className="frame-scaler" style={{ transform: `scale(${scale})` }}>
        <div className={`frame frame--${layout}`} ref={frameRef}>
          {photos.map((photo, i) => (
            // --i 는 완성 화면의 등장 애니메이션이 칸마다 시간차를 두는 데 쓴다
            <div className="frame__cut" key={i} style={{ "--i": i }}>
              <img className="frame__photo" src={photo} alt="" />
              <p className="frame__caption font-jaram">{STEP_CAPTIONS[i]}</p>
            </div>
          ))}

          <div className="frame__side">
            <div>
              <p className="frame__title">
                {portrait ? (
                  TITLE
                ) : (
                  <>
                    사랑
                    <br />
                    네컷
                  </>
                )}
              </p>
              <p className="frame__subtitle">{SUBTITLE}</p>
            </div>
            <div>
              <p className="font-jaram frame__bible">
                {portrait
                  ? BIBLE.join(" ")
                  : BIBLE.map((line, i) => (
                      <Fragment key={i}>
                        {i > 0 && <br />}
                        {line}
                      </Fragment>
                    ))}
              </p>
              {/* <p className="frame__date">2026.11.15</p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FramePreview;
