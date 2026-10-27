import { useState } from "react";
import { PhotosContext } from "./usePhotos";
import { TOTAL_STEPS } from "./steps";

const PHOTOS_KEY = "walk-a-thon-4cut:photos";
const EMPTY_PHOTOS = Array.from({ length: TOTAL_STEPS }, () => null);

function loadStoredPhotos() {
  try {
    const saved = JSON.parse(localStorage.getItem(PHOTOS_KEY));
    if (Array.isArray(saved) && saved.length === TOTAL_STEPS) return saved;
  } catch {
    // 손상된 값은 무시하고 빈 상태로 시작한다
  }
  return EMPTY_PHOTOS;
}

// 페이지(주소)가 바뀌어도 사진이 유지되도록 라우터 바깥에서 들고 있는다.
function PhotosProvider({ children }) {
  const [photos, setPhotos] = useState(loadStoredPhotos);
  const [storageError, setStorageError] = useState(null);

  // 상태와 localStorage 를 함께 갱신해 새로고침 후에도 남도록 한다
  function setPhotoAt(stepIndex, dataUrl) {
    const next = photos.map((photo, i) => (i === stepIndex ? dataUrl : photo));
    setPhotos(next);
    try {
      localStorage.setItem(PHOTOS_KEY, JSON.stringify(next));
      setStorageError(null);
    } catch {
      setStorageError(
        "저장 공간이 부족해 내용이 보관되지 않았어요. 새로고침하면 사라집니다.",
      );
    }
  }

  return (
    <PhotosContext.Provider value={{ photos, setPhotoAt, storageError }}>
      {children}
    </PhotosContext.Provider>
  );
}

export default PhotosProvider;
