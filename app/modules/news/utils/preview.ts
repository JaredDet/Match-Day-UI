export const NEWS_PREVIEW_MAX_LENGTH = 200;
export function plainNewsText(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, code: string) => {
      const named: Record<string, string> = {
        amp: "&",
        lt: "<",
        gt: ">",
        quot: '"',
        apos: "'",
        nbsp: " ",
      };
      if (code[0] !== "#") return named[code.toLowerCase()] ?? entity;
      const number =
        code[1]?.toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1));
      return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : entity;
    })
    .replace(/\s+/g, " ")
    .trim();
}
export function newsPreview(children: string[]) {
  const text = children.map(plainNewsText).find(Boolean) ?? "";
  const characters = Array.from(text);
  return characters.length <= NEWS_PREVIEW_MAX_LENGTH
    ? text
    : `${characters
        .slice(0, NEWS_PREVIEW_MAX_LENGTH - 1)
        .join("")
        .trimEnd()}…`;
}
