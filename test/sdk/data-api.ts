import { expect } from "chai";
import { DataApiImpl } from "../../src/sdk/data-api";
import { stub } from "sinon";

const uri = "http://localhost:8080";
const apiVersion = "51.0";
const token =
  "00DB0000000UIn2!AQMAQKXBvR03lDdfMiD6Pdpo_wiMs6LGp6dVkrwOuqiiTEmwdPb8MvSZwdPLe009qHlwjxIVa4gY.JSAd0mfgRRz22vS";
const dataApi = new DataApiImpl(uri, apiVersion, token);

describe("DataApi Class", async () => {
  describe("create()", async () => {
    describe("valid request", async () => {
      it("returns the reference id", async () => {
        const { id } = await dataApi.create({
          type: "Movie__c",
          Name: "Star Wars Episode V: The Empire Strikes Back",
          Rating__c: "Excellent",
        });

        expect(id).equal("a00B000000FSkcvIAD");
      });
    });

    describe("invalid pick list value", async () => {
      it("throws invalid pick list error", async () => {
        try {
          await dataApi.create({
            type: "Movie__c",
            Name: "Star Wars Episode VIII: The Last Jedi",
            Rating__c: "Terrible",
          });
        } catch (e) {
          expect(e.message).equal(
            "Rating: bad value for restricted picklist field: Terrible"
          );
          expect(e.errorCode).equal("INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST");
        }
      });
    });

    describe("unknown object type", async () => {
      it("throws a not found error", async () => {
        try {
          await dataApi.create({
            type: "PlayingCard__c",
            Name: "Ace of Spades",
          });
        } catch (e) {
          expect(e.message).equal("The requested resource does not exist");
          expect(e.errorCode).equal("NOT_FOUND");
        }
      });
    });

    describe("invalid field", async () => {
      it("throws an invalid field error", async () => {
        try {
          await dataApi.create({
            type: "Account",
            FavoritePet__c: "Dog",
          });
        } catch (e) {
          expect(e.message).equal(
            "No such column 'FavoritePet__c' on sobject of type Account"
          );
          expect(e.errorCode).equal("INVALID_FIELD");
        }
      });
    });

    describe("required field missing", async () => {
      it("throws missing field error", async () => {
        try {
          await dataApi.create({
            type: "Spaceship__c",
            Name: "Falcon 9",
          });
        } catch (e) {
          expect(e.message).equal("Required fields are missing: [Website__c]");
          expect(e.errorCode).equal("REQUIRED_FIELD_MISSING");
        }
      });
    });
  });

  describe("query()", async () => {
    describe("valid query", async () => {
      it("returns a simple query from DataApi", async () => {
        const { done, totalSize, records } = await dataApi.query(
          "SELECT Name FROM Account"
        );

        expect(done).equal(true);
        expect(totalSize).equal(5);
        expect(records.length).equal(5);

        expect(records[0]).to.deep.equal({
          Name: "An awesome test account",
          attributes: {
            type: "Account",
            url: "/services/data/v51.0/sobjects/Account/001B000001LntWlIAJ",
          },
        });

        expect(records[1]).to.deep.equal({
          Name: "Global Media",
          attributes: {
            type: "Account",
            url: "/services/data/v51.0/sobjects/Account/001B000001LwihtIAB",
          },
        });

        expect(records[2]).to.deep.equal({
          Name: "Acme",
          attributes: {
            type: "Account",
            url: "/services/data/v51.0/sobjects/Account/001B000001LwihuIAB",
          },
        });

        expect(records[3]).to.deep.equal({
          Name: "salesforce.com",
          attributes: {
            type: "Account",
            url: "/services/data/v51.0/sobjects/Account/001B000001LwihvIAB",
          },
        });

        expect(records[4]).to.deep.equal({
          Name: "Sample Account for Entitlements",
          attributes: {
            type: "Account",
            url: "/services/data/v51.0/sobjects/Account/001B000001LnobCIAR",
          },
        });
      });
    });

    describe("with unknown column", async () => {
      it("returns invalid field error", async () => {
        try {
          await dataApi.query("SELECT Bacon__c FROM Account LIMIT 2");
        } catch (e) {
          expect(e.message).equal(
            "\nSELECT Bacon__c FROM Account LIMIT 2\n       ^\nERROR at Row:1:Column:8\nNo such column 'Bacon__c' on entity 'Account'. If you are attempting to use a custom field, be sure to append the '__c' after the custom field name. Please reference your WSDL or the describe call for the appropriate names."
          );
          expect(e.errorCode).equal("INVALID_FIELD");
        }
      });
    });

    describe("with malformed query", async () => {
      it("returns a malformed query error", async () => {
        try {
          await dataApi.query("SELEKT Name FROM Account");
        } catch (e) {
          expect(e.errorCode).equal("MALFORMED_QUERY");
        }
      });
    });
  });

  describe("queryMore()", async () => {
    describe("valid query with next results", async () => {
      it("returns the next query from DataApi", async () => {
        let result = await dataApi.query(
          "SELECT RANDOM_1__c, RANDOM_2__c FROM Random__c"
        );

        expect(result.done).equal(false);
        expect(result.totalSize).equal(10000);
        expect(result.records.length).equal(2000);

        result = await dataApi.queryMore(result);

        expect(result.done).equal(false);
      });
    });
  });

  describe("Unit of Work", async () => {
    describe("commit()", async () => {
      let uow;

      beforeEach(() => {
        uow = dataApi.newUnitOfWork();
      });

      describe("single create", async () => {
        beforeEach(() => {
          stub(uow, "generateReferenceId").callsFake(() => {
            return "insert-anh";
          });
        });

        it("success with valid payload", async () => {
          const rId = uow.registerCreate({
            type: "Movie__c",
            Name: "Star Wars Episode IV - A New Hope",
            Rating__c: "Excellent",
          });

          const result = await dataApi.commitUnitOfWork(uow);

          expect(result.get(rId).id).equal("a00B000000FSkgxIAD");
        });
      });

      describe("single update", async () => {
        it("success with valid payload", async () => {
          const rId = uow.registerUpdate({
            type: "Movie__c",
            id: "a00B000000FSjVUIA1",
            ReleaseDate__c: "1980-05-21",
          });
          const result = await dataApi.commitUnitOfWork(uow);

          expect(result.get(rId).id).equal("a00B000000FSjVUIA1");
        });
      });

      describe("single delete", async () => {
        it("successfully deletes record", async () => {
          const rId = uow.registerDelete("Movie__c", "a00B000000FeYyKIAV");

          const result = await dataApi.commitUnitOfWork(uow);
          expect(result.get(rId).id).equal("a00B000000FeYyKIAV");
        });
      });

      describe("composite create tree", async () => {
        it("creates a composite request", async () => {
          const rId0 = uow.registerCreate({
            type: "Franchise__c",
            Name: "Star Wars",
          });

          const rId1 = uow.registerCreate({
            type: "Movie__c",
            Name: "Star Wars Episode I - A Phantom Menace",
            Franchise__c: "@{referenceId0.id}",
          });

          const rId2 = uow.registerCreate({
            type: "Movie__c",
            Name: "Star Wars Episode II - Attack Of The Clones",
            Franchise__c: "@{referenceId0.id}",
          });

          const rId3 = uow.registerCreate({
            type: "Movie__c",
            Name: "Star Wars Episode III - Revenge Of The Sith",
            Franchise__c: "@{referenceId0.id}",
          });

          const result = await dataApi.commitUnitOfWork(uow);
          expect(result.get(rId0).id).equal("a03B0000007BhQQIA0");
          expect(result.get(rId1).id).equal("a00B000000FSkioIAD");
          expect(result.get(rId2).id).equal("a00B000000FSkipIAD");
          expect(result.get(rId3).id).equal("a00B000000FSkiqIAD");
        });
      });
    });
  });
});
