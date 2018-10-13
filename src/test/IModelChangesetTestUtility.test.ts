/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { ChangesetGenerationHarness } from "../ChangesetGenerationHarness";
import { TestChangesetSequence } from "../TestChangesetSequence";
import { TestMockObjects } from "./TestMockObjects";
import { ChangesetGenerator } from "../ChangesetGenerator";
import { main } from "../IModelChangesetCLUtility";
import { expect } from "chai";
function ensureEmailAndPassword() {
    if (!(process.env.npm_package_config_email && process.env.npm_package_config_password)) {
        process.env.npm_package_config_email = "fake@email.com";
        process.env.npm_package_config_password = "fake_password";
    }
}
describe("TestChangesetSequence", () => {
    const changesetCount = 10;
    const numCreatedPerChangeset = 10;
    beforeEach(() => {
        ensureEmailAndPassword();
    });
    it("Has elements deleted and updated per changeset as each half of the elements inserted", async () => {
        const sequence: TestChangesetSequence = new TestChangesetSequence(changesetCount, numCreatedPerChangeset);
        expect(sequence.elementsUpdatedPerChangeset).equals(numCreatedPerChangeset / 2, "updated = inserted / 2");
        expect(sequence.elementsDeletedPerChangeset).equals(numCreatedPerChangeset / 2, "deleted = inserted / 2");
    });
    it("Has a changeset push delay", async () => {
        const changesetPushDelay = 100;
        const sequence: TestChangesetSequence = new TestChangesetSequence(changesetCount, numCreatedPerChangeset, changesetPushDelay);
        expect(sequence.changesetPushDelay).equals(changesetPushDelay, "Has changeset push delay");
    });
});

describe("ChangesetGenerator", () => {
    beforeEach(() => {
        ensureEmailAndPassword();
    });
    it("Pushed test changesets and pauses", async () => {
        const changesetGenerator: ChangesetGenerator = new ChangesetGenerator(TestMockObjects.getMockAccessToken(), TestMockObjects.getMockHubUtility(), TestMockObjects.getFakePhysicalModelId(),
            TestMockObjects.getFakeCategoryId(), TestMockObjects.getFakeCodeSpecId(), TestMockObjects.getFakeActivityLoggingContext(), TestMockObjects.getMockIModelDbHandler());
        const projectId = TestMockObjects.getFakeProjectId();
        const changesetSequence = new TestChangesetSequence(10, 10, 1);
        const iModelId = TestMockObjects.getFakeIModelId();
        expect(await changesetGenerator.pushTestChangeSetsAndVersions(projectId, iModelId, changesetSequence)).equals(true);
    });
});

describe("ChangesetGenerationHarness", () => {
    beforeEach(() => {
        ensureEmailAndPassword();
    });
    it("Is Configured with project and harness Config objects", async () => {
        const harness: ChangesetGenerationHarness = new ChangesetGenerationHarness();
        expect(harness);
    });
    it("Generates Changeset Sequences", async () => {
        const harness: ChangesetGenerationHarness = new ChangesetGenerationHarness(TestMockObjects.getMockHubUtility(), TestMockObjects.getMockIModelDbHandler());
        expect(harness);
        const changesetSequence = new TestChangesetSequence(10, 10, 1);
        expect(await harness.generateChangesets(changesetSequence)).equals(true);
    });
});
describe("IModelChangesetCLUtility", () => {
    const mockProcess: NodeJS.Process = TestMockObjects.getMockProcess();
    it("runs the Query Agent Web Server and handles process when invoked", async () => {
        await main(mockProcess, TestMockObjects.getMockChangesetGenerationHarness());
    });
    it("Catches error thrown when running Query Agent Web Server", async () => {
        const throwsError = true;
        await main(mockProcess, TestMockObjects.getMockChangesetGenerationHarness(throwsError));
    });
});
/** Basic Integration test for change set creation and pushing into IModelHub. */
describe("ChangesetGenerationHarnessIntegration (#integration)", () => {
    it("Generates configured changeset sequence", async () => {
        const harness: ChangesetGenerationHarness = new ChangesetGenerationHarness();
        const changesetSequence: TestChangesetSequence = new TestChangesetSequence(10, 20, 10);
        expect(await harness.generateChangesets(changesetSequence)).equals(true);
    });
});
