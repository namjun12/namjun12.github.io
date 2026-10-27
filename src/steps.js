// 스텝 수와 각 화면의 주소를 한곳에서 관리한다.
export const TOTAL_STEPS = 4;

// 주소에는 사람이 읽는 번호(1~4)를 쓰고, 코드 안에서는 0부터 센다.
export const STEP_PATH_PATTERN = "/step/:stepNumber";
export const RESULT_PATH = "/result";

export function stepPath(stepIndex) {
  return `/step/${stepIndex + 1}`;
}

// 주소의 번호를 스텝 인덱스로 바꾼다. 범위를 벗어나거나 숫자가 아니면 null.
export function parseStepIndex(stepNumber) {
  const index = Number(stepNumber) - 1;
  const isValid = Number.isInteger(index) && index >= 0 && index < TOTAL_STEPS;
  return isValid ? index : null;
}

// 사진이 아직 비어 있는 첫 스텝. 모두 채웠으면 TOTAL_STEPS.
// 이 스텝보다 뒤 주소로 직접 들어오지 못하게 막는 데 쓴다.
export function firstIncompleteStep(photos) {
  const index = photos.findIndex((photo) => !photo);
  return index === -1 ? TOTAL_STEPS : index;
}
