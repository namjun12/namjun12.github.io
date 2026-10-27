import { Navigate, Route, Routes } from "react-router-dom";
import PhotosProvider from "./PhotosProvider";
import ResultPage from "./ResultPage";
import ScrollToTop from "./ScrollToTop";
import StepRoute from "./StepPage";
import { RESULT_PATH, STEP_PATH_PATTERN, stepPath } from "./steps";

// 스텝마다 주소가 다르다: /step/1 ~ /step/4 (업로드), /result (결과)
function App() {
  return (
    <PhotosProvider>
      <ScrollToTop />
      <Routes>
        <Route path={STEP_PATH_PATTERN} element={<StepRoute />} />
        <Route path={RESULT_PATH} element={<ResultPage />} />
        <Route path="*" element={<Navigate to={stepPath(0)} replace />} />
      </Routes>
    </PhotosProvider>
  );
}

export default App;
