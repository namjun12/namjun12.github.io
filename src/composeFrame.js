// 네컷 프레임 합성: 흰 배경 + 상단 타이틀 + 2x2 사진 배치
const PAD = 56;
const GAP = 40;
const CELL_W = 480;
const CELL_H = 760;
const TITLE_H = 150;

const WIDTH = PAD * 2 + CELL_W * 2 + GAP;
const HEIGHT = TITLE_H + CELL_H * 2 + GAP + PAD;

export const CELL_RATIO = `${CELL_W} / ${CELL_H}`;
export const TITLE = 'Walk-a-thon';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'));
    img.src = src;
  });
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('파일을 읽지 못했습니다.'));
    reader.readAsDataURL(file);
  });
}

// localStorage 용량(약 5MB) 안에 네 장이 들어가도록 줄여서 저장한다
const MAX_EDGE = 1200;

export async function prepareUpload(file) {
  const img = await loadImage(await readFile(file));
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', 0.82);
}

// object-fit: cover 와 동일하게 가운데 기준으로 잘라 채운다
function drawCover(ctx, img, x, y, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}

export async function composeFrame(sources) {
  const images = await Promise.all(sources.map(loadImage));

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = '#111111';
  ctx.font = '600 76px "Times New Roman", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '8px';
  ctx.fillText(TITLE, WIDTH / 2, TITLE_H / 2 + 8);

  images.forEach((img, i) => {
    const x = PAD + (i % 2) * (CELL_W + GAP);
    const y = TITLE_H + Math.floor(i / 2) * (CELL_H + GAP);
    drawCover(ctx, img, x, y, CELL_W, CELL_H);
  });

  return canvas.toDataURL('image/png');
}
