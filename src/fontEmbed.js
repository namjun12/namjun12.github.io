// html-to-image 는 SVG foreignObject 로 그리는데, 그 안에서는 외부 폰트 파일을
// 못 불러온다. 그래서 폰트를 data URI 로 CSS 에 심어 넘겨야 한다.
// Pretendard 는 서브셋이 92개라 전부 심으면 3MB 가 넘으므로,
// 실제로 쓰인 글자가 속한 서브셋만 골라낸다.

const cache = new Map();

function parseRanges(spec) {
  return spec.split(",").map((part) => {
    const token = part.trim().replace(/^u\+/i, "");
    if (token.includes("-")) {
      const [from, to] = token.split("-");
      return [parseInt(from, 16), parseInt(to, 16)];
    }
    if (token.includes("?")) {
      return [
        parseInt(token.replace(/\?/g, "0"), 16),
        parseInt(token.replace(/\?/g, "F"), 16),
      ];
    }
    const codePoint = parseInt(token, 16);
    return [codePoint, codePoint];
  });
}

async function toDataUrl(url) {
  if (!cache.has(url)) {
    const blob = await (await fetch(url)).blob();
    cache.set(
      url,
      await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      }),
    );
  }
  return cache.get(url);
}

export async function buildFontEmbedCss(text) {
  const used = [...new Set([...text])].map((char) => char.codePointAt(0));
  const rules = [];

  for (const sheet of document.styleSheets) {
    let sheetRules;
    try {
      sheetRules = sheet.cssRules;
    } catch {
      continue; // 교차 출처 스타일시트는 읽을 수 없다
    }

    for (const rule of sheetRules) {
      if (!(rule instanceof CSSFontFaceRule)) continue;

      const range = rule.style.getPropertyValue("unicode-range");
      if (range) {
        const covers = parseRanges(range).some(([from, to]) =>
          used.some((codePoint) => codePoint >= from && codePoint <= to),
        );
        if (!covers) continue;
      }

      const url = rule.style
        .getPropertyValue("src")
        .match(/url\(["']?([^"')]+)["']?\)/)?.[1];
      if (!url) continue;

      const absolute = new URL(url, sheet.href ?? location.href).href;
      rules.push(
        rule.cssText.replace(
          /url\(["']?[^"')]+["']?\)/,
          `url(${await toDataUrl(absolute)})`,
        ),
      );
    }
  }

  return rules.join("\n");
}
