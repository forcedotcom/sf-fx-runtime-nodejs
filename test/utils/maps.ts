/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from "chai";
import { createCaseInsensitiveMap } from "../../src/utils/maps.js";

describe("createCaseInsensitiveMap", async () => {
  const object = {
    nAme: "Dennis",
    Species: "cat",
  };

  it("creates a case insensitive map for getting values", async () => {
    const cat = createCaseInsensitiveMap(object);

    expect(cat["name"]).to.equal("Dennis");
    expect(cat["NAME"]).to.equal("Dennis");
    expect(cat["Name"]).to.equal("Dennis");
    expect(cat["naME"]).to.equal("Dennis");
    expect(cat.name).to.equal("Dennis");
    expect(cat.NAME).to.equal("Dennis");
    expect(cat.Name).to.equal("Dennis");
    expect(cat.namE).to.equal("Dennis");

    expect(cat["species"]).to.equal("cat");
    expect(cat["SPECIES"]).to.equal("cat");
    expect(cat["Species"]).to.equal("cat");
    expect(cat["specieS"]).to.equal("cat");
    expect(cat.species).to.equal("cat");
    expect(cat.SPECIES).to.equal("cat");
    expect(cat.Species).to.equal("cat");
    expect(cat.specieS).to.equal("cat");
  });

  it("creates a case insensitive map for setting values", () => {
    const cat = createCaseInsensitiveMap(object);

    cat["BREED"] = "grey";

    expect(cat.breed).to.equal("grey");
    expect(cat.BREED).to.equal("grey");
    expect(cat["breed"]).to.equal("grey");
    expect(cat["Breed"]).to.equal("grey");
  });
});
