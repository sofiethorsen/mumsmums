import type { CodegenConfig } from '@graphql-codegen/cli'

// Use DOCKER_BACKEND_URL in Docker builds, otherwise localhost for local dev
const backendUrl = process.env.DOCKER_BACKEND_URL || 'http://localhost:8080'

const config: CodegenConfig = {
    // Introspect schema from running backend
    schema: `${backendUrl}/graphql`,

    // Look for GraphQL operations in these files
    documents: ['graphql/queries.ts', 'components/**/*.tsx', 'page-components/**/*.tsx'],

    generates: {
        // Generate all types in a single file
        './graphql/generated.ts': {
            plugins: [
                'typescript',
                'typescript-operations',
                'typed-document-node',
            ],
            config: {
                // Use the same scalar mappings as the backend
                scalars: {
                    Long: 'number',
                    Short: 'number',
                },
                // Generate more specific types
                strictScalars: true,
                // Use 'type' instead of 'interface' for better compatibility
                declarationKind: 'type',
                // Avoid duplicate types
                dedupeFragments: true,
            },
        },
    },
}

export default config
