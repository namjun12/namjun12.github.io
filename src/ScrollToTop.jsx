import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// 주소가 바뀔 때마다 스크롤을 맨 위로 올린다.
// 새 페이지가 그려지기 전에 올려야 이전 위치가 잠깐 비치지 않는다.
function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
