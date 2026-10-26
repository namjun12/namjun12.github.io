import { useEffect, useRef, useState } from 'react';
import { CELL_RATIO, TITLE, composeFrame, prepareUpload } from './composeFrame';

const TOTAL_STEPS = 4;
const STORAGE_KEY = 'walk-a-thon-4cut:photos';
const EMPTY_PHOTOS = [null, null, null, null];

function loadPhotos() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length === TOTAL_STEPS) return saved;
  } catch {
    // 손상된 값은 무시하고 빈 상태로 시작한다
  }
  return EMPTY_PHOTOS;
}

function App() {
  const [step, setStep] = useState(0); // 0~3: 업로드, 4: 결과
  const [photos, setPhotos] = useState(loadPhotos);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const isResult = step === TOTAL_STEPS;

  useEffect(() => {
    if (!isResult) return;
    let cancelled = false;
    composeFrame(photos)
      .then((url) => !cancelled && setResult(url))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [isResult, photos]);

  // 상태와 localStorage를 함께 갱신해 새로고침 후에도 사진이 남도록 한다
  function updatePhotos(next) {
    setPhotos(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setError('저장 공간이 부족해 사진이 보관되지 않았어요. 새로고침하면 사라집니다.');
    }
  }

  function handleFile(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    prepareUpload(file)
      .then((dataUrl) => {
        updatePhotos(photos.map((p, i) => (i === step ? dataUrl : p)));
      })
      .catch((e) => setError(e.message));
  }

  function reset() {
    updatePhotos(EMPTY_PHOTOS);
    setResult(null);
    setError(null);
    setStep(0);
  }

  if (isResult) {
    return (
      <main className="app">
        <h1 className="app__title">{TITLE} 4CUT</h1>
        <p className="app__caption">완성됐어요! 이미지를 저장해 보세요.</p>
        {error && <p className="app__error">{error}</p>}
        {result ? (
          <>
            <img className="result" src={result} alt="완성된 네컷 사진" />
            <div className="actions">
              <a className="btn btn--primary" href={result} download="walk-a-thon-4cut.png">
                다운로드
              </a>
              <button className="btn" type="button" onClick={reset}>
                다시 만들기
              </button>
            </div>
          </>
        ) : (
          !error && <p className="app__caption">합성 중…</p>
        )}
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
            className={`steps__item${i === step ? ' is-current' : ''}${photo ? ' is-done' : ''}`}
          >
            {i + 1}
          </li>
        ))}
      </ol>

      <p className="app__caption">
        {step + 1}번째 사진을 올려주세요 ({step + 1}/{TOTAL_STEPS})
      </p>

      {error && <p className="app__error">{error}</p>}

      <button
        className="slot"
        type="button"
        style={{ aspectRatio: CELL_RATIO }}
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
          {step === TOTAL_STEPS - 1 ? '완성하기' : '다음'}
        </button>
      </div>
    </main>
  );
}

export default App;
