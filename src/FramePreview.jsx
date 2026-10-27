import { useLayoutEffect, useRef, useState } from "react";
import "./frame.css";

// frame.css 의 .frame 크기와 같아야 한다. PNG 는 이 크기의 2배로 저장된다.
export const FRAME_W = 1500;
export const FRAME_H = 1000;

export const TITLE = "사랑네컷";
export const SUBTITLE = "God is love";

// 화면 폭에 맞춰 프레임을 축소해 보여준다. 축소는 바깥 래퍼에만 걸어서
// 캡처 대상인 .frame 자체는 원래 크기를 유지한다.
function useFitScale() {
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / FRAME_W));
    });
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, []);

  return [viewportRef, scale];
}

function FramePreview({ photos, captions, frameRef }) {
  const [viewportRef, scale] = useFitScale();

  return (
    <div
      className="frame-viewport"
      ref={viewportRef}
      style={{ height: FRAME_H * scale }}
    >
      <div className="frame-scaler" style={{ transform: `scale(${scale})` }}>
        <div className="frame" ref={frameRef}>
          {photos.map((photo, i) => (
            <div className="frame__cut" key={i}>
              <img className="frame__photo" src={photo} alt="" />
              <p className="frame__caption">{captions[i]}</p>
            </div>
          ))}

          <div className="frame__side">
            <div>
              <p className="frame__title">{TITLE}</p>
              <p className="frame__subtitle">{SUBTITLE}</p>
            </div>
            <p className="frame__date">2026.11.15</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FramePreview;
