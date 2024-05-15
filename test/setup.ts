/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export const mochaHooks = {
  beforeAll(done) {
    // wait 2s for wiremock to start before starting tests
    setTimeout(done, 2000);
  },
};
