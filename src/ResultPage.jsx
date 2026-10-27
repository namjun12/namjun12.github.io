import { Navigate } from "react-router-dom";
import ResultView from "./ResultView";
import { TOTAL_STEPS, firstIncompleteStep, stepPath } from "./steps";
import { usePhotos } from "./usePhotos";
import { useStepTheme } from "./useStepTheme";

// /result 주소. 사진이 다 채워지지 않았으면 비어 있는 스텝으로 돌려보낸다.
function ResultPage() {
  const { photos } = usePhotos();

  // 결과 화면은 마지막 업로드 스텝의 끝 색을 그대로 유지한다
  useStepTheme(TOTAL_STEPS, TOTAL_STEPS);

  const incompleteStep = firstIncompleteStep(photos);
  if (incompleteStep < TOTAL_STEPS) {
    return <Navigate to={stepPath(incompleteStep)} replace />;
  }

  return <ResultView photos={photos} />;
}

export default ResultPage;
