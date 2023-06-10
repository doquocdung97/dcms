import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';

export function Upper(schema: GraphQLSchema, directiveName: string) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const upperDirective = getDirective(
        schema,
        fieldConfig,
        directiveName,
      )?.[0];

      if (upperDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;

        // Replace the original resolver with a function that *first* calls
        // the original resolver, then converts its result to upper case
        fieldConfig.resolve = async function (source, args, context, info) {
          const result = await resolve(source, args, context, info);
          console.log(result);
          if (typeof result === 'string') {
            return result.toUpperCase();
          }
          return result;
        };
        return fieldConfig;
      }
    },
  });
}

export function upperDirective(
  directiveName: string,
): (schema: GraphQLSchema) => GraphQLSchema {
  return (schema) =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
        const upperDirective = getDirective(
          schema,
          fieldConfig,
          directiveName,
        )?.[0];
        if (upperDirective) {
          const { resolve = defaultFieldResolver } = fieldConfig;
          return {
            ...fieldConfig,
            resolve: async function (source, args, context, info) {
              const result = await resolve(source, args, context, info);
              if (typeof result === 'string') {
                return result.toUpperCase();
              }
              return result;
            },
          };
        }
      },
    });
}
