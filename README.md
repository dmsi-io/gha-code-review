# GHA Code Review

[![release][release-badge]][release]

The purpose of this GitHub Action is to check code in more complex ways than is allowed by linters or unit tests

## Inputs

| NAME        | DESCRIPTION                                                            | TYPE      | REQUIRED | DEFAULT |
| ----------- | ---------------------------------------------------------------------- | --------- | -------- | ------- |
| `changelog` | Whether to check the changelog for missing entries                     | `boolean` | `false`  | `true`  |
| `todos`     | Whether to check for TODOs in code that are resolved by the current PR | `boolean` | `false`  | `true`  |
| `token`     | GitHub access token with repo permissions                              | `string`  | `true`   |         |

## Example

```yaml
name: Code Review

on:
  pull_request:
    branches:
      - main
      - develop

jobs:
  publish:
    name: Update Doc
    runs-on: ubuntu-latest
    steps:
      - name: Update Doc
        uses: dmsi-io/gha-code-review@main
        with:
          token: ${{ secrets.MY_TOKEN }}
```
