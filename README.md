# imodel-changeset-test-utility

Copyright © 2018 Bentley Systems, Incorporated. All rights reserved.

Test Utility for generating and pushing changesets to an iModel in the iModelHub. (MUST BE CONFIGURED TO RUN: see Configuration section below)

- Can be use accessed using 'ChangesetGenerationHarness.ts' or run through the command line using 'IModelChangesetCLUtility.ts'.

## Overview

- Periodically creates changesets over GeometricElement3d's.
  - Each Changeset consists of:
    - Creates N blocks in a horizontal level
    - Deletes And Updates N/2 blocks if a past level exists.
      - Updates change the label and geometry for the blocks
- Changesets creation sequences can be configured using the parameters

## Build

All of these commands are run from the root directory of imodel-query-agent.

1. Clone repository (first time) with `git clone` or pull updates to the repository (subsequent times) with `git pull`
2. Install dependencies: `npm install`
3. Clean output: `npm run clean`
4. Build source: `npm run build -s`

The `-s` option is short for `--silent` which results in a less verbose command.

Note that it is a good idea to `npm install` after each `git pull` as dependencies may have changed.

## Test

- Unit tests: `npm test`
- Integration tests: `npm run test:integration`

## Start

- After building, use `npm start` in the root directory to run the command line utility. This will run "node ./lib/IModelChangesetTestUtility.js" to use the default configuration.

## Configuration

To use a custom configuration use any combination command line arguments, environments variables, or using iModelJs configuration (see Config.ts).
For a quick configuration, replace the strings in the `Fill These Out` section of Config.ts with ones obtained from OIDC registration.
Other options include: providing environment variables with names of the keys in Config.ts and proper values, and setting up a JSON5 file named `default.json5`
in a directory named `imodeljs-config` that is parallel with the root of this repo (I.E /imodel-changeset-test-utility) with the proper variable setup.
This will automatically be absorbed by the configuration framework.

- For a custom configuration in the CLI use some or all of the following parameters preceded by "--":

```json
  "--email=Fake@email.com", "--password=yourPass", "--projectName=YourTestProject",
  "--iModelName=ChangesetUtility"
```

- For example `npm start -- --email=Fake@email.com --password=yourPass`
- (Note: all times are in ms)

## Contributing

[Contributing to iModel.js](https://github.com/imodeljs/imodeljs/blob/master/CONTRIBUTING.md)
