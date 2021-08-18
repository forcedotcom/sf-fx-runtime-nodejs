export default function getRebasedStack(
  filename: string,
  error: Error
): string {
  const lines = error.stack.split("\n");

  let lastRelevantIndex = lines.length;
  for (let i = lines.length; i > 0; i--) {
    const regexResult = lines[i - 1].match(/^\s+at .*? \((.*?):\d+:\d+\)$/);
    if (regexResult) {
      console.log("##");
      console.log(lines[i - 1], filename, regexResult[1]);
    }
    if (regexResult && regexResult[1] === filename) {
      lastRelevantIndex = i - 1;
      break;
    }
  }

  return lines.splice(0, lastRelevantIndex).join("\n");
}
