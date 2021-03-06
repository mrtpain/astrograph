import { makeExecutableSchema, mergeSchemas } from "apollo-server";

import resolvers from "./resolvers";
import typeDefs from "./type_defs";

const schema = makeExecutableSchema({ typeDefs });
const schemas = [schema];

export default mergeSchemas({ schemas, resolvers });
