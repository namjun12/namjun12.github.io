import { useEffect, useState } from "react";

// 프레임에서 쓰는 글꼴. 다 받아오기 전에 미리보기를 보여주면
// 대체 글꼴로 한 번 그려졌다가 바뀌는 게 보인다.
const FAMILIES = ['"iceJaram"', '"S-Core Dream"', '"Pretendard Variable"'];

// 글꼴이 이미 캐시돼 있어도 안내 모달이 깜빡 지나가 버리지 않도록 최소한 기다리는 시간.
const MIN_WAIT_MS = 3000;

export function useFontsReady(text) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer;

    // 하나가 실패해도 멈추지 않는다. 그 글꼴만 대체되고 미리보기는 열린다.
    const loaded = Promise.allSettled(
      FAMILIES.map((family) => document.fonts.load(`80px ${family}`, text)),
    );
    const waited = new Promise((resolve) => {
      timer = setTimeout(resolve, MIN_WAIT_MS);
    });

    // 둘 다 끝나야 하므로, 글꼴 로딩과 3초 중 더 오래 걸리는 쪽을 기다린다
    Promise.all([loaded, waited]).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text]);

  return ready;
}
