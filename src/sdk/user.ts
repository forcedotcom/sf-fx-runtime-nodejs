/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { User } from "sf-fx-sdk-nodejs";

export class UserImpl implements User {
  readonly id: string;
  readonly username: string;
  readonly onBehalfOfUserId?: string;

  constructor(id: string, username: string, onBehalfOfUserId: string) {
    this.id = id;
    this.username = username;
    this.onBehalfOfUserId = onBehalfOfUserId;
  }
}
