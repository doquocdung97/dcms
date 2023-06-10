import { GraphQLScalarType } from 'graphql';

function validate(uuid: unknown): string | never {
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof uuid !== 'string' || !regex.test(uuid)) {
    throw new Error('invalid uuid');
  }
  return uuid;
}

export const CustomUUID = new GraphQLScalarType({
  name: 'UUID',
  description: 'A simple UUID parser',
  serialize: (value) => validate(value),
  parseValue: (value) => validate(value),
  parseLiteral: (ast: any) => validate(ast.value),
});

/**
 * name for object
 */
export const CustomName = new GraphQLScalarType({
  name: 'Name',
  description: 'A simple Name parser',
  serialize: (value) => validate(value),
  parseValue: (value) => validate(value),
  parseLiteral: (ast: any) => validate(ast.value),
});

export const CustomObject = new GraphQLScalarType({
  name: 'Object',
  description: 'Arbitrary object',
  parseValue: (value) => {
    return value;
  },
  serialize: (value) => {
    return value;
  },
  parseLiteral: (ast: any) => {
    return ast.value;
  },
});
