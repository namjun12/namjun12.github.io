import { useRef, useState } from "react";
import { STEP_MISSIONS } from "./frameContent";
import { prepareUpload } from "./prepareUpload";
import ResultView from "./ResultView";
import { useStepTheme } from "./useStepTheme";

const TOTAL_STEPS = 4;
const PHOTOS_KEY = "walk-a-thon-4cut:photos";
const EMPTY_PHOTOS = [null, null, null, null];

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
  const [photos, setPhotos] = useState(() =>
    loadStored(PHOTOS_KEY, EMPTY_PHOTOS),
  );
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // 스텝에 따라 전체 색조를 푸른 계열 -> 핑크로 옮긴다
  useStepTheme(step, TOTAL_STEPS);

  // 상태와 localStorage를 함께 갱신해 새로고침 후에도 남도록 한다
  function persist(key, value, setter) {
    setter(value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      setError(
        "저장 공간이 부족해 내용이 보관되지 않았어요. 새로고침하면 사라집니다.",
      );
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
      .then((dataUrl) =>
        persist(PHOTOS_KEY, replaceAt(photos, dataUrl), setPhotos),
      )
      .catch((e) => setError(e.message));
  }

  if (step === TOTAL_STEPS) {
    return <ResultView photos={photos} />;
  }

  const current = photos[step];
  const { icon: MissionIcon, text: missionText } = STEP_MISSIONS[step];

  return (
    <main className="app">
      {/* step 표시 */}
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

      <h1 className="app__title font-jaram">
        미션을 완료하면 <br />
        특별한 선물을 드려요~!
      </h1>

      {/* key 를 주면 스텝이 바뀔 때마다 다시 마운트돼서 등장 애니메이션이 재생된다 */}
      <section className="mission" key={step}>
        <span className="mission__icon" aria-hidden="true">
          <MissionIcon size={28} strokeWidth={1.75} />
        </span>
        <p className="mission__badge">{step + 1}번째 미션</p>
        <p className="mission__text">{missionText}</p>
      </section>

      {error && <p className="app__error">{error}</p>}

      <button
        className="slot"
        type="button"
        onClick={() => inputRef.current.click()}
      >
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
          {step === TOTAL_STEPS - 1 ? "미션완료 !!!" : "다음"}
        </button>
      </div>
    </main>
  );
}

export default App;
