import { useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { STEP_MISSIONS } from "./frameContent";
import { prepareUpload } from "./prepareUpload";
import {
  RESULT_PATH,
  TOTAL_STEPS,
  firstIncompleteStep,
  parseStepIndex,
  stepPath,
} from "./steps";
import { usePhotos } from "./usePhotos";
import { useStepTheme } from "./useStepTheme";

// /step/:stepNumber 주소를 검사해서 올바른 StepPage 로 넘기는 입구.
// 잘못된 번호이거나 앞 스텝을 건너뛴 접근은 진행할 수 있는 스텝으로 돌려보낸다.
function StepRoute() {
  const { stepNumber } = useParams();
  const { photos } = usePhotos();

  const stepIndex = parseStepIndex(stepNumber);
  if (stepIndex === null) return <Navigate to={stepPath(0)} replace />;

  const reachableStep = Math.min(firstIncompleteStep(photos), TOTAL_STEPS - 1);
  if (stepIndex > reachableStep) {
    return <Navigate to={stepPath(reachableStep)} replace />;
  }

  return <StepPage stepIndex={stepIndex} />;
}

function StepPage({ stepIndex }) {
  const navigate = useNavigate();
  const { photos, setPhotoAt, storageError } = usePhotos();
  const [uploadError, setUploadError] = useState(null);
  const inputRef = useRef(null);

  // 스텝에 따라 전체 색조를 푸른 계열 -> 핑크로 옮긴다
  useStepTheme(stepIndex, TOTAL_STEPS);

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === TOTAL_STEPS - 1;
  const current = photos[stepIndex];
  const { icon: MissionIcon, text: missionText } = STEP_MISSIONS[stepIndex];
  const error = uploadError ?? storageError;

  function handleFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);
    prepareUpload(file)
      .then((dataUrl) => setPhotoAt(stepIndex, dataUrl))
      .catch((err) => setUploadError(err.message));
  }

  function goPrevious() {
    navigate(stepPath(stepIndex - 1));
  }

  function goNext() {
    navigate(isLastStep ? RESULT_PATH : stepPath(stepIndex + 1));
  }

  return (
    <main className="app">
      {/* step 표시 */}
      <ol className="steps">
        {photos.map((photo, i) => (
          <li
            key={i}
            className={`steps__item${i === stepIndex ? " is-current" : ""}${photo ? " is-done" : ""}`}
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
      <section className="mission" key={stepIndex}>
        <span className="mission__icon" aria-hidden="true">
          <MissionIcon size={28} strokeWidth={1.75} />
        </span>
        <p className="mission__badge">
          <span className="gradient-text">{stepIndex + 1}번째 미션</span>
        </p>
        <p className="mission__text">{missionText}</p>
      </section>

      {error && <p className="app__error">{error}</p>}

      <button
        className="slot"
        type="button"
        onClick={() => inputRef.current.click()}
      >
        {current ? (
          <img src={current} alt={`${stepIndex + 1}번째 사진 미리보기`} />
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
          disabled={isFirstStep}
          onClick={goPrevious}
        >
          이전
        </button>
        <button
          className="btn btn--primary"
          type="button"
          disabled={!current}
          onClick={goNext}
        >
          <span className="gradient-text">
            {isLastStep ? "미션완료 !!!" : "다음"}
          </span>
        </button>
      </div>
    </main>
  );
}

export default StepRoute;
