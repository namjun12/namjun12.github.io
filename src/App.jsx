import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import FramePreview, { SUBTITLE, TITLE } from "./FramePreview";
import { buildFontEmbedCss } from "./fontEmbed";
import { prepareUpload } from "./prepareUpload";

const TOTAL_STEPS = 4;
const PHOTOS_KEY = "walk-a-thon-4cut:photos";
const CAPTIONS_KEY = "walk-a-thon-4cut:captions";
const EMPTY_PHOTOS = [null, null, null, null];
const EMPTY_CAPTIONS = ["", "", "", ""];

function loadStored(key, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(saved) && saved.length === TOTAL_STEPS) return saved;
  } catch {
    // 손상된 값은 무시하고 빈 상태로 시작한다
  }
  return fallback;
}

function App() {
  const [step, setStep] = useState(0); // 0~3: 업로드, 4: 결과
  const [photos, setPhotos] = useState(() => loadStored(PHOTOS_KEY, EMPTY_PHOTOS));
  const [captions, setCaptions] = useState(() =>
    loadStored(CAPTIONS_KEY, EMPTY_CAPTIONS),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const frameRef = useRef(null);

  const isResult = step === TOTAL_STEPS;

  // 상태와 localStorage를 함께 갱신해 새로고침 후에도 남도록 한다
  function persist(key, value, setter) {
    setter(value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      setError("저장 공간이 부족해 내용이 보관되지 않았어요. 새로고침하면 사라집니다.");
    }
  }

  function replaceAt(list, value) {
    return list.map((item, i) => (i === step ? value : item));
  }

  function handleFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    prepareUpload(file)
      .then((dataUrl) => persist(PHOTOS_KEY, replaceAt(photos, dataUrl), setPhotos))
      .catch((e) => setError(e.message));
  }

  async function download() {
    setSaving(true);
    setError(null);
    try {
      const fontEmbedCSS = await buildFontEmbedCss(
        captions.join("") + TITLE + SUBTITLE,
      );
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

  function reset() {
    persist(PHOTOS_KEY, EMPTY_PHOTOS, setPhotos);
    persist(CAPTIONS_KEY, EMPTY_CAPTIONS, setCaptions);
    setError(null);
    setStep(0);
  }

  if (isResult) {
    return (
      <main className="app app--wide">
        <h1 className="app__title">{TITLE} 4CUT</h1>
        <p className="app__caption">완성됐어요! 이미지를 저장해 보세요.</p>
        {error && <p className="app__error">{error}</p>}

        <FramePreview photos={photos} captions={captions} frameRef={frameRef} />

        <div className="actions">
          <button
            className="btn btn--primary"
            type="button"
            disabled={saving}
            onClick={download}
          >
            {saving ? "저장 중…" : "다운로드"}
          </button>
          <button className="btn" type="button" onClick={() => setStep(0)}>
            수정하기
          </button>
          <button className="btn" type="button" onClick={reset}>
            다시 만들기
          </button>
        </div>
      </main>
    );
  }

  const current = photos[step];

  return (
    <main className="app">
      <h1 className="app__title">{TITLE} 4CUT</h1>

      <ol className="steps">
        {photos.map((photo, i) => (
          <li
            key={i}
            className={`steps__item${i === step ? " is-current" : ""}${photo ? " is-done" : ""}`}
          >
            {i + 1}
          </li>
        ))}
      </ol>

      <p className="app__caption">
        {step + 1}번째 사진을 올려주세요 ({step + 1}/{TOTAL_STEPS})
      </p>

      {error && <p className="app__error">{error}</p>}

      <button className="slot" type="button" onClick={() => inputRef.current.click()}>
        {current ? (
          <img src={current} alt={`${step + 1}번째 사진 미리보기`} />
        ) : (
          <span className="slot__placeholder">+ 이미지 업로드</span>
        )}
      </button>

      <input
        ref={inputRef}
        className="hidden-input"
        type="file"
        accept="image/*"
        onChange={handleFile}
      />

      <input
        className="caption-input"
        type="text"
        maxLength={24}
        placeholder="사진 밑에 들어갈 문구 (선택)"
        value={captions[step]}
        onChange={(e) =>
          persist(CAPTIONS_KEY, replaceAt(captions, e.target.value), setCaptions)
        }
      />

      <div className="actions">
        <button
          className="btn"
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          이전
        </button>
        <button
          className="btn btn--primary"
          type="button"
          disabled={!current}
          onClick={() => setStep((s) => s + 1)}
        >
          {step === TOTAL_STEPS - 1 ? "완성하기" : "다음"}
        </button>
      </div>
    </main>
  );
}

export default App;
