/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export default function getRebasedStack(
  filename: string,
  error: Error
): string {
  const lines = error.stack.split("\n");

  let lastRelevantIndex = lines.length;
  for (let i = lines.length; i > 0; i--) {
    const regexResult = lines[i - 1].match(/^\s+at .*? \((.*?):\d+:\d+\)$/);
    if (regexResult && regexResult[1] === filename) {
      lastRelevantIndex = i - 1;
      break;
    }
  }

  return lines.splice(0, lastRelevantIndex).join("\n");
}
