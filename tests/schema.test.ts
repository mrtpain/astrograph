import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
  mockServer
} from "apollo-server";

import { graphql } from "graphql";

import typeDefs from "../src/schema/type_defs";

const testCaseA = {
  id: 'Test case A',
  query: `
    query {
      account(id: "GD6NTNPBE7EGG6KZ3UIFFYGPAZH2IE6E7DQJ5KDNMKAJG6PMHEJIZUEQ") {
         id
         sequenceNumber
      }
    }
  `,
  variables: { },
  context: { },
  expected: {
    data: {
      account: {
        sequenceNumber: "46646810873167874",
        id: "GD6NTNPBE7EGG6KZ3UIFFYGPAZH2IE6E7DQJ5KDNMKAJG6PMHEJIZUEQ",
      },
    },
  }
};

// Array of case types
const cases = [testCaseA];

const mockSchema = makeExecutableSchema({ typeDefs });
const mocks = {
  String: () => '46646810873167874',
  AccountID: () => "GD6NTNPBE7EGG6KZ3UIFFYGPAZH2IE6E7DQJ5KDNMKAJG6PMHEJIZUEQ",
};

// Here we specify the return payloads of mocked types
addMockFunctionsToSchema({schema: mockSchema, mocks});

test("has valid type definitions", () => {
  expect(async () => {
    const MockServer = mockServer(typeDefs, mocks);

    await MockServer.query(`{ __schema { types { name } } }`);
  }).not.toThrow();
});

cases.forEach(obj => {
  const { id, query, variables, context: ctx, expected } = obj;

  test(`query: ${id}`, async () => {
    return await expect(
      graphql(mockSchema, query, null, { ctx }, variables)
    ).resolves.toEqual(expected);
  });
});
