// 화면과 프레임에 들어가는 문구. 내용을 바꾸려면 여기만 고치면 된다.
import { Footprints, Handshake, PartyPopper, Trees } from "lucide-react";

// 업로드 화면에서 스텝마다 보여줄 미션 안내.
// "N번째 미션" 배지는 자동으로 붙으니 아이콘과 내용만 적으면 된다.
// icon 은 lucide-react 아이콘. 바꾸려면 https://lucide.dev 에서 고른 뒤
// 위 import 에 이름을 추가하면 된다.
export const STEP_MISSIONS = [
  { icon: Footprints, text: "모든 인원이 다 나오게 사진을 찍어주세요!" },
  {
    icon: Handshake,
    text: "가장 친하지 않은 두사람이 가운데에 서서 악수하고 사진을 찍어주세요!",
  },
  {
    icon: Trees,
    text: "가장 마음에 드는 풍경을 배경으로 사진을 찍어서 올려주세요!",
  },
  {
    icon: PartyPopper,
    text: "완주하고 환하게 웃으며 사진을 찍어서 올려주세요!",
  },
];

export const TITLE = "사랑네컷";
export const SUBTITLE = "God is love";

// 오른쪽 아래 성경 구절. 항목 하나가 한 줄이다.
export const BIBLE = ["[히 10:24]", "서로 돌아보아", "사랑과 선행을 격려하며"];

// 스텝별로 사진 밑에 들어갈 고정 문구. 순서는 업로드 순서와 같다.
export const STEP_CAPTIONS = [
  "낯설 수도 있는 첫 단체사진",
  "우리 더 친해지자!",
  "다함께 낭만있는 한컷",
  "",
];
