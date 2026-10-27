import { useEffect } from "react";

// 스텝이 진행될수록 푸른 계열에서 핑크로 색조가 넘어간다.
// 205 -> 340 사이는 보라를 지나가서 중간 단계도 자연스럽다.
const HUE_START = 205; // 첫 스텝
const HUE_END = 340; // 마지막 스텝과 결과 화면

// 색조(hue) 하나만 바꾸면 나머지 색이 전부 따라오도록 묶어 둔다.
function paletteFor(hue) {
  return {
    "--accent": `hsl(${hue} 72% 68%)`,
    "--accent-strong": `hsl(${hue} 62% 55%)`,
    "--accent-text": `hsl(${hue} 58% 37%)`,
    "--accent-pale": `hsl(${hue} 72% 95%)`,
    "--line": `hsl(${hue} 45% 89%)`,
    "--bg-base": `hsl(${hue} 50% 98%)`,
    "--bg-tint": `hsl(${hue} 72% 94%)`,
    "--shadow-sm": `0 2px 10px hsl(${hue} 30% 50% / 12%)`,
    "--shadow-md": `0 12px 32px hsl(${hue} 30% 50% / 18%)`,
    "--shadow-accent": `0 6px 18px hsl(${hue} 62% 55% / 32%)`,
  };
}

export function useStepTheme(step, totalSteps) {
  useEffect(() => {
    // 마지막 업로드 스텝에서 이미 끝 색에 도달하고, 결과 화면도 그 색을 유지한다
    const progress = Math.min(1, step / (totalSteps - 1));
    const hue = Math.round(HUE_START + (HUE_END - HUE_START) * progress);

    const root = document.documentElement;
    for (const [name, value] of Object.entries(paletteFor(hue))) {
      root.style.setProperty(name, value);
    }
  }, [step, totalSteps]);
}
