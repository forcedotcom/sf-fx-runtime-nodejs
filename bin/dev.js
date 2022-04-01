#!/usr/bin/env node

/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// this script is meant to be invoked like this:
// > node --loader ts-node/esm bin/dev.js
import cli from "../src/cli.js";
// eslint-disable-next-line no-undef
await cli(process.argv);
