import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

export default [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: false,
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    /**
     * Vendored third-party source, kept as close to upstream as possible.
     *
     * `src/components/ui/map.tsx` is mapcn's registry component, copied in
     * rather than installed (that is how mapcn ships — see the file's own
     * header). It uses two patterns this config rejects, `react-hooks/refs`
     * and `react-hooks/set-state-in-effect`, thirteen times between them.
     *
     * Rewriting them would mean re-doing that work by hand on every re-pull,
     * and a divergence there is far more expensive than the warnings are
     * worth — the file is reviewed as a vendor drop, not as our own code. The
     * project's own map components on top of it (`ServiceAreasMap`,
     * `LocationMap`, `MapPin`) are linted normally.
     */
    files: ['src/components/ui/map.tsx'],
    rules: {
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    ignores: ['.next/', 'src/payload-types.ts', 'src/payload-generated-schema.ts'],
  },
]
