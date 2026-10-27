// 완성 화면에서 고를 수 있는 사진 레이아웃.
// width / height 는 frame.css 의 .frame--landscape / .frame--portrait 크기와 같아야 한다.
// pixelRatio 는 PNG 를 몇 배로 저장할지. 세로형을 2배로 하면 높이가 4800px 이 되어
// 모바일 브라우저의 canvas 한계에 걸릴 수 있다. 업로드 사진이 최대 1200px 이라
// 1.5배로도 화질은 그대로다.
export const LAYOUTS = {
  portrait: { label: "세로형", width: 700, height: 2400, pixelRatio: 1.5 },
  landscape: { label: "가로형", width: 1500, height: 1000, pixelRatio: 2 },
};
