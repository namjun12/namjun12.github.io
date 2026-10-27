import { createContext, useContext } from "react";

export const PhotosContext = createContext(null);

// { photos, setPhotoAt, storageError }
export function usePhotos() {
  const value = useContext(PhotosContext);
  if (!value) throw new Error("usePhotos 는 PhotosProvider 안에서만 쓸 수 있어요.");
  return value;
}
