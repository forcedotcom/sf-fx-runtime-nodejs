import { expect } from "chai";
import { createCaseInsensitiveMap } from "../../src/utils/maps";
import { createCaseInsensitiveIdMap } from "../../src/utils/maps";

describe("createCaseInsensitiveIdMap", async () => {
  it("creates case insensitive id properties", async () => {
    expect(createCaseInsensitiveIdMap({ id: "Cinco" }).id).to.equal("Cinco");
    expect(createCaseInsensitiveIdMap({ Id: "Cinco" }).id).to.equal("Cinco");
    expect(createCaseInsensitiveIdMap({ ID: "Cinco" }).id).to.equal("Cinco");
    expect(createCaseInsensitiveIdMap({ iD: "Cinco" }).id).to.equal("Cinco");

    try {
      createCaseInsensitiveIdMap({ iD: "Cinco", id: "river" });
    } catch (e) {
      expect(e.message).equal("Duplicate id property");
    }

    expect(createCaseInsensitiveIdMap({ sPecIes: "dog" }).sPecIes).to.equal(
      "dog"
    );
    expect(createCaseInsensitiveIdMap({ sPecIes: "dog" }).species).to.equal(
      undefined
    );
  });
});

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
