# gha-code-review

The purpose of this GitHub Action is to check code in mode complex ways than 

### Usage

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

### Optional Params

#### changelog

Whether to check the changelog for missing entries

Default: true

```yaml
with:
  changelog: 'false'
```

#### todo

Whether to check for TODOs in code that are resolved by the current PR (i.e., the PR is for story ABC-123, but
`// TODO: [ABC-123]` remains in the code base)

Default: true

```yaml
with:
  changelog: 'false'
```
