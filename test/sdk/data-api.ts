/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from "chai";
import { DataApiImpl } from "../../src/sdk/data-api.js";
import stub from "sinon/lib/sinon/stub.js";

const uri = "http://localhost:8080";
const apiVersion = "51.0";
const token =
  "00DB0000000UIn2!AQMAQKXBvR03lDdfMiD6Pdpo_wiMs6LGp6dVkrwOuqiiTEmwdPb8MvSZwdPLe009qHlwjxIVa4gY.JSAd0mfgRRz22vS";
const dataApi = new DataApiImpl(uri, apiVersion, token);
const dataApiInvalid = new DataApiImpl(
  "http://thisdoesnotexistalsdkfjalsdkfjasdlkfjasdlkfjalsdkfja.com",
  apiVersion,
  token
);

const dataApiInvalidToken = new DataApiImpl(uri, apiVersion, "badToken");
const dataApiInvalidVersion = new DataApiImpl(uri, "iAmABadVersion", token);

describe("DataApi Class", async () => {
  describe("public class attributes", async () => {
    it("exposes accessToken", async () => {
      expect(dataApi.accessToken).equal(token);
    });
  });

  describe("create()", async () => {
    describe("valid request", async () => {
      it("returns the reference id", async () => {
        const { id } = await dataApi.create({
          type: "Movie__c",
          fields: {
            Name: "Star Wars Episode V: The Empire Strikes Back",
            Rating__c: "Excellent",
          },
        });

        expect(id).equal("a00B000000FSkcvIAD");
      });
    });

    describe("invalid pick list value", async () => {
      it("throws invalid pick list error", async () => {
        // Chai doesn't yet support promises natively, so we can't use .rejectedWith-like syntax.
        try {
          await dataApi.create({
            type: "Movie__c",
            fields: {
              Name: "Star Wars Episode VIII: The Last Jedi",
              Rating__c: "Terrible",
            },
          });
          expect.fail("Promise should have been rejected!");
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
        // Chai doesn't yet support promises natively, so we can't use .rejectedWith-like syntax.
        try {
          await dataApi.create({
            type: "PlayingCard__c",
            fields: {
              Name: "Ace of Spades",
            },
          });
          expect.fail("Promise should have been rejected!");
        } catch (e) {
          expect(e.message).equal("The requested resource does not exist");
          expect(e.errorCode).equal("NOT_FOUND");
        }
      });
    });

    describe("invalid token", async () => {
      it("throws an invalid session error", async () => {
        try {
          await dataApiInvalidToken.create({
            type: "Account",
            fields: {
              name: "Global Media",
            },
          });
          expect.fail("Promise should have been rejected!");
        } catch (e) {
          expect(e.message).equal("Session expired or invalid");
          expect(e.errorCode).equal("INVALID_SESSION_ID");
        }
      });
    });

    describe("invalid version", async () => {
      it("throws a not found error", async () => {
        try {
          await dataApiInvalidVersion.create({
            type: "Account",
            fields: {
              name: "Global Media",
            },
          });
          expect.fail("Promise should have been rejected!");
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
            fields: {
              FavoritePet__c: "Dog",
            },
          });
          expect.fail("Promise should have been rejected!");
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
        // Chai doesn't yet support promises natively, so we can't use .rejectedWith-like syntax.
        try {
          await dataApi.create({
            type: "Spaceship__c",
            fields: {
              Name: "Falcon 9",
            },
          });
          expect.fail("Promise should have been rejected!");
        } catch (e) {
          expect(e.message).equal("Required fields are missing: [Website__c]");
          expect(e.errorCode).equal("REQUIRED_FIELD_MISSING");
        }
      });
    });

    describe("record type missing", async () => {
      it("throws no SObject Type defined error", async () => {
        // Chai doesn't yet support promises natively, so we can't use .rejectedWith-like syntax.
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          await dataApi.create({
            fields: {
              Name: "Ace of Spades",
            },
          });
          expect.fail("Promise should have been rejected!");
        } catch (e) {
          expect(e.message).equal("No SObject Type defined in record");
          expect(e.errorCode).undefined;
        }
      });
    });
  });

  describe("query()", async () => {
    describe("valid query", async () => {
      it("returns a simple query from DataApi", async () => {
        const { done, totalSize, records, nextRecordsUrl } =
          await dataApi.query("SELECT Name FROM Account");

        expect(done).equal(true);
        expect(totalSize).equal(5);
        expect(records.length).equal(5);
        expect(nextRecordsUrl).undefined;

        expect(records[0]).to.deep.equal({
          type: "Account",
          fields: {
            name: "An awesome test account",
          },
        });

        expect(records[0].fields["Name"]).to.equal("An awesome test account");

        expect(records[1]).to.deep.equal({
          type: "Account",
          fields: {
            name: "Global Media",
          },
        });

        expect(records[1].fields.NAME).to.equal("Global Media");

        expect(records[2]).to.deep.equal({
          type: "Account",
          fields: {
            name: "Acme",
          },
        });

        expect(records[2].fields["namE"]).to.equal("Acme");

        expect(records[3]).to.deep.equal({
          type: "Account",
          fields: {
            name: "salesforce.com",
          },
        });

        expect(records[4]).to.deep.equal({
          type: "Account",
          fields: {
            name: "Sample Account for Entitlements",
          },
        });
      });
    });

    describe("when there are additional pages of results", async () => {
      it("returns nextRecordsUrl", async () => {
        const { done, totalSize, records, nextRecordsUrl } =
          await dataApi.query("SELECT RANDOM_1__c, RANDOM_2__c FROM Random__c");

        expect(done).equal(false);
        expect(totalSize).equal(10000);
        expect(records.length).equal(2000);
        expect(nextRecordsUrl).equal(
          "/services/data/v51.0/query/01gB000003OCxSPIA1-2000"
        );
      });
    });

    describe("with unknown column", async () => {
      it("returns invalid field error", async () => {
        // Chai doesn't yet support promises natively, so we can't use .rejectedWith-like syntax.
        try {
          await dataApi.query("SELECT Bacon__c FROM Account LIMIT 2");
          expect.fail("Promise should have been rejected!");
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
        // Chai doesn't yet support promises natively, so we can't use .rejectedWith-like syntax.
        try {
          await dataApi.query("SELEKT Name FROM Account");
          expect.fail("Promise should have been rejected!");
        } catch (e) {
          expect(e.message).equal("unexpected token: SELEKT");
          expect(e.errorCode).equal("MALFORMED_QUERY");
        }
      });
    });

    describe("with an unexpected response", async () => {
      it("returns a malformed query error", async () => {
        try {
          await dataApi.query("SELECT Name FROM FruitVendor__c");
          expect.fail("Promise should have been rejected!");
        } catch (e) {
          expect(e.message).equal(
            "Unexpected response with status: ERROR_HTTP_404"
          );
        }
      });
    });

    describe("with a unparseable json as body", async () => {
      it("returns a malformed query error", async () => {
        try {
          await dataApi.query("SELECT Name FROM VeggieVendor__c");
          expect.fail("Promise should have been rejected!");
        } catch (e) {
          expect(e.message).equal("Could not parse API response as JSON!");
        }
      });
    });
  });

  describe("queryMore()", async () => {
    describe("valid query with next results", async () => {
      it("returns the next query from DataApi", async () => {
        const result = await dataApi.query(
          "SELECT RANDOM_1__c, RANDOM_2__c FROM Random__c"
        );
        expect(result.done).equal(false);
        expect(result.totalSize).equal(10000);
        expect(result.records.length).equal(2000);
        expect(result.nextRecordsUrl).equal(
          "/services/data/v51.0/query/01gB000003OCxSPIA1-2000"
        );

        const result2 = await dataApi.queryMore(result);
        expect(result2.done).equal(false);
        expect(result2.totalSize).equal(result.totalSize);
        expect(result2.records.length).equal(2000);
        expect(result2.nextRecordsUrl).equal(
          "/services/data/v51.0/query/01gB000003OCxSPIA1-4000"
        );
      });
    });

    describe("with done results", async () => {
      it("returns zero records", async () => {
        const result = await dataApi.query("SELECT Name FROM Account");
        expect(result.done).equal(true);
        expect(result.totalSize).equal(5);
        expect(result.records.length).equal(5);
        expect(result.nextRecordsUrl).undefined;

        const result2 = await dataApi.queryMore(result);
        expect(result2.done).equal(true);
        expect(result2.totalSize).equal(result.totalSize);
        expect(result2.records.length).equal(0);
        expect(result2.nextRecordsUrl).undefined;
      });
    });
  });

  describe("update()", async () => {
    describe("valid update", async () => {
      it("returns the updated record id", async () => {
        const { id } = await dataApi.update({
          type: "Movie__c",
          fields: {
            id: "a00B000000FSjVUIA1",
            ReleaseDate__c: "1980-05-21",
          },
        });

        expect(id).equal("a00B000000FSjVUIA1");
      });

      it("accepts any casing of id", () => {
        return Promise.all(
          ["id", "Id", "iD", "ID"].map(async (idProp) => {
            const { id } = await dataApi.update({
              type: "Movie__c",
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              fields: {
                [idProp]: "a00B000000FSjVUIA1",
                ReleaseDate__c: "1980-05-21",
              },
            });

            expect(id).equal("a00B000000FSjVUIA1");
          })
        );
      });
    });

    describe("malformed id", async () => {
      it("throws malformed id error", async () => {
        // Chai doesn't yet support promises natively, so we can't use .rejectedWith-like syntax.
        try {
          await dataApi.update({
            type: "Movie__c",
            fields: {
              id: "a00B000000FSjVUIB1",
              ReleaseDate__c: "1980-05-21",
            },
          });
          expect.fail("Promise should have been rejected!");
        } catch (e) {
          expect(e.message).equal(
            "Record ID: id value of incorrect type: a00B000000FSjVUIB1"
          );
          expect(e.errorCode).equal("MALFORMED_ID");
        }
      });
    });

    describe("invalid field", async () => {
      it("throws invalid field error", async () => {
        // Chai doesn't yet support promises natively, so we can't use .rejectedWith-like syntax.
        try {
          await dataApi.update({
            type: "Movie__c",
            fields: {
              id: "a00B000000FSjVUIB1",
              Color__c: "Red",
            },
          });
          expect.fail("Promise should have been rejected!");
        } catch (e) {
          expect(e.message).equal(
            "No such column 'Color__c' on sobject of type Movie__c"
          );
          expect(e.errorCode).equal("INVALID_FIELD");
        }
      });
    });

    describe("id field missing", async () => {
      it("throws id not found in record error", async () => {
        // Chai doesn't yet support promises natively, so we can't use .rejectedWith-like syntax.
        try {
          await dataApi.update({
            type: "Movie__c",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            fields: {
              ReleaseDate__c: "1980-05-21",
            },
          });
          expect.fail("Promise should have been rejected!");
        } catch (e) {
          expect(e.message).equal("Record id is not found in record.");
          expect(e.errorCode).undefined;
        }
      });
    });

    describe("record type missing", async () => {
      it("throws no SObject Type defined error", async () => {
        // Chai doesn't yet support promises natively, so we can't use .rejectedWith-like syntax.
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          await dataApi.update({
            fields: {
              id: "a00B000000FSjVUIA1",
              ReleaseDate__c: "1980-05-21",
            },
          });
          expect.fail("Promise should have been rejected!");
        } catch (e) {
          expect(e.message).equal("No SObject Type defined in record");
          expect(e.errorCode).undefined;
        }
      });
    });
  });

  describe("delete()", async () => {
    describe("valid delete", async () => {
      it("returns the deleted record id", async () => {
        const { id } = await dataApi.delete("Account", "001B000001Lp1FxIAJ");
        expect(id).equal("001B000001Lp1FxIAJ");
      });
    });

    describe("already deleted record", async () => {
      it("throws entity is deleted error", async () => {
        // Chai doesn't yet support promises natively, so we can't use .rejectedWith-like syntax.
        try {
          await dataApi.delete("Account", "001B000001Lp1G2IAJ");
          expect.fail("Promise should have been rejected!");
        } catch (e) {
          expect(e.message).equal("entity is deleted");
          expect(e.errorCode).equal("ENTITY_IS_DELETED");
        }
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
            fields: {
              Name: "Star Wars Episode IV - A New Hope",
              Rating__c: "Excellent",
            },
          });

          const result = await dataApi.commitUnitOfWork(uow);
          expect(result.size).equal(1);
          expect(result.get(rId).id).equal("a01B0000009gSoxIAE");
        });

        it("errors with bad value for picklist", async () => {
          uow.registerCreate({
            type: "Movie__c",
            fields: {
              Name: "Star Wars Episode IV - A New Hope",
              Rating__c: "Amazing",
            },
          });
          // Chai doesn't yet support promises natively, so we can't use .rejectedWith-like syntax.
          try {
            await dataApi.commitUnitOfWork(uow);
            expect.fail("Promise should have been rejected!");
          } catch (e) {
            expect(e.message).equal(
              "INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST: Rating: bad value for restricted picklist field: Amazing"
            );
          }
        });
      });

      describe("single update", async () => {
        it("success with valid payload", async () => {
          const rId = uow.registerUpdate({
            type: "Movie__c",
            fields: {
              id: "a01B0000009gSrFIAU",
              ReleaseDate__c: "1980-05-21",
            },
          });
          const result = await dataApi.commitUnitOfWork(uow);

          expect(result.size).equal(1);
          expect(result.get(rId).id).equal("a01B0000009gSrFIAU");
        });
      });

      describe("single delete", async () => {
        it("successfully deletes record", async () => {
          const rId = uow.registerDelete("Movie__c", "a01B0000009gSr9IAE");

          const result = await dataApi.commitUnitOfWork(uow);
          expect(result.size).equal(1);
          expect(result.get(rId).id).equal("a01B0000009gSr9IAE");
        });
      });

      describe("composite create tree", async () => {
        it("creates a composite request", async () => {
          const rId0 = uow.registerCreate({
            type: "Franchise__c",
            fields: {
              Name: "Star Wars",
            },
          });

          const rId1 = uow.registerCreate({
            type: "Movie__c",
            fields: {
              Name: "Star Wars Episode I - A Phantom Menace",
              Franchise__c: rId0,
            },
          });

          const rId2 = uow.registerCreate({
            type: "Movie__c",
            fields: {
              Name: "Star Wars Episode II - Attack Of The Clones",
              Franchise__c: rId0,
            },
          });

          const rId3 = uow.registerCreate({
            type: "Movie__c",
            fields: {
              Name: "Star Wars Episode III - Revenge Of The Sith",
              Franchise__c: rId0.toApiString(),
            },
          });

          const result = await dataApi.commitUnitOfWork(uow);
          expect(result.size).equal(4);
          expect(result.get(rId0).id).equal("a03B0000007BhQQIA0");
          expect(result.get(rId1).id).equal("a00B000000FSkioIAD");
          expect(result.get(rId2).id).equal("a00B000000FSkipIAD");
          expect(result.get(rId3).id).equal("a00B000000FSkiqIAD");
        });
      });

      describe("commitUnitOfWork with no registered operations", async () => {
        it("should not make a composite graph API request and return an empty result", async () => {
          // This will fail with a rejected promise if a request is being made since there won't be a wiremock mapping
          // for an empty composite graph API request.
          const result = await dataApi.commitUnitOfWork(uow);
          expect(result.size).to.equal(0);
        });
      });
    });
  });

  describe("error handling", async () => {
    describe("invalid instance URL", async () => {
      it("logs an exception", async () => {
        try {
          await dataApiInvalid.query("SELECT Name FROM Account");
          expect.fail("Promise should have been rejected!");
        } catch (e) {
          expect(e.message).contains("failed, reason: getaddrinfo ENOTFOUND");
        }
      });
    });
  });
});
