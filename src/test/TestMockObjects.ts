/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/

import { HubUtility } from "../HubUtility";
import { ChangesetGenerationConfig } from "../Config";
import { ChangesetGenerationHarness } from "../ChangesetGenerationHarness";
import { IModelDbHandler } from "../IModelDbHandler";
import { Id64, ActivityLoggingContext } from "@bentley/bentleyjs-core/lib/bentleyjs-core";
import { AccessToken } from "@bentley/imodeljs-clients/lib";
import { IModelDb, GeometricElement3d } from "@bentley/imodeljs-backend/lib/backend";
import { Version } from "@bentley/imodeljs-clients/lib/imodelhub";
import * as TypeMoq from "typemoq";
import { CodeSpec } from "@bentley/imodeljs-common";
export class TestMockObjects {
    public static readonly fakeAccessToken: string = "FAKE_ACCESS_TOKEN";
    public static readonly fakeIModelName: string = "FAKE_IMODEL";
    public static getMockChangesetGenerationHarness(throwsError = false, returns = true): ChangesetGenerationHarness {
        const harness  = TypeMoq.Mock.ofType<ChangesetGenerationHarness>();
        harness.setup((_) => _.initialize()).returns(async () => {});
        if (throwsError)
            harness.setup((_) => _.generateChangesets(TypeMoq.It.isAny())).throws(new Error("Mock harness changeset generation error"));
        else
            harness.setup((_) => _.generateChangesets(TypeMoq.It.isAny())).returns(async () => returns);
        return harness.object;

    }
    public static getMockChangesetGenerationConfig(): ChangesetGenerationConfig {
        const config: ChangesetGenerationConfig = new ChangesetGenerationConfig();
        return config;
    }
    public static getMockProcess(): NodeJS.Process {
        const mockProcess = TypeMoq.Mock.ofType<NodeJS.Process>();
        mockProcess.setup((_) => _.exit(TypeMoq.It.isAny()));
        return mockProcess.object;
    }
    public static getMockHubUtility(): HubUtility {
        const mockHubUtility: TypeMoq.IMock<HubUtility> = TypeMoq.Mock.ofType2(HubUtility, [new ChangesetGenerationConfig()]);
        mockHubUtility.setup((_) => _.createNamedVersion(TypeMoq.It.isAny(), TypeMoq.It.isAny(),
        TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(async () => new Version());
        mockHubUtility.setup((_) => _.login()).returns(async () => this.getFakeAccessToken());
        mockHubUtility.setup((_) => _.queryProjectIdByName(TypeMoq.It.isAny(), TypeMoq.It.isAnyString())).returns(async () => {
            return this.getFakeProjectId();
        });

        return mockHubUtility.object;
    }
    public static getMockIModelDb(): IModelDb {
        const mockIModelDb = TypeMoq.Mock.ofType<IModelDb>();
        mockIModelDb.setup((_) => _.saveChanges(TypeMoq.It.isAny())).returns(() => {});
        mockIModelDb.setup((_) => _.pushChanges(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(async () => {});
        mockIModelDb.setup((_) => _.elements).returns(() => this.getMockIModelDbElements());
        // Below is a workaround to limitations of the typemoq framework. without it any mock DbOpener will never resolve promise
        // ref: https://stackoverflow.com/questions/44224528/promise-fails-to-resolve-with-typemoq-mock#
        mockIModelDb.setup((_: any) => _.then).returns(() => undefined);
        return mockIModelDb.object;
    }
    public static getMockIModelDbHandler(): IModelDbHandler {
        const mockIModelDbHandler = TypeMoq.Mock.ofType(IModelDbHandler);
        mockIModelDbHandler.setup((_) => _.openLatestIModelDb(TypeMoq.It.isAny(), TypeMoq.It.isAny(),
            TypeMoq.It.isAny())).returns(async () => this.getMockIModelDb());
        mockIModelDbHandler.setup((_) => _.getChangeSetUtilPhysModel(TypeMoq.It.isAny())).returns(() => new Id64("FakePhysModelId"));
        mockIModelDbHandler.setup((_) => _.getCodeSpecByName(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => this.getMockCodeSpec());
        mockIModelDbHandler.setup((_) => _.insertSpatialCategory(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => new Id64("FakeSpatialCategoryId"));
        return mockIModelDbHandler.object;
    }
    public static getMockCodeSpec(): CodeSpec {
        const mockCodeSpec = TypeMoq.Mock.ofType<CodeSpec>();
        return mockCodeSpec.object;
    }
    public static getFakeIModelDbPath(): string {
        const pathname: string = this.fakeIModelName + ".bim";
        return pathname;
    }
    public static getFakeActivityLoggingContext(): ActivityLoggingContext {
        return new ActivityLoggingContext("FAKE_ACTIVITY_ID");
    }
    public static getMockIModelDbElements(): IModelDb.Elements {
        const mockIModelDbElements: TypeMoq.IMock<IModelDb.Elements> = TypeMoq.Mock.ofType(IModelDb.Elements);
        mockIModelDbElements.setup((_) => _.insertElement(TypeMoq.It.isAny())).returns(() => this.getFakeElementId());
        mockIModelDbElements.setup((_) => _.getElement(TypeMoq.It.isAny())).returns(() => this.getMockIModelDbElement());
        mockIModelDbElements.setup((_) => _.queryElementIdByCode(TypeMoq.It.isAny())).returns(() => this.getFakeElementId());
        return mockIModelDbElements.object;
    }
    public static getMockIModelDbElement(): GeometricElement3d {
        const element = TypeMoq.Mock.ofType<GeometricElement3d>();
        return element.object;
    }
    public static getMockAccessToken(): AccessToken  {
        const mockAccessToken = TypeMoq.Mock.ofType<AccessToken>();
        mockAccessToken.setup((_) => _.toTokenString()).returns(() => this.fakeAccessToken);
        return mockAccessToken.object;
    }
    public static getFakeAccessToken(): AccessToken {
        const token = AccessToken.fromForeignProjectAccessTokenJson(this.fakeAccessToken);
        return token!;
    }
    public static getFakeIModelId(): string {
        return "FAKE_IMODEL_ID";
    }
    public static getFakeCategoryId(): Id64 {
        return new Id64("FakeCategoryId");
    }
    public static getFakeCodeSpecId(): Id64 {
        return new Id64("FakeCodeSpecId");
    }
    public static getFakePhysicalModelId(): Id64 {
        return new Id64("FakePhysicalModelId");
    }
    public static getFakeElementId(): Id64 {
        return new Id64("FakeElementId");
    }
    public static getFakeProjectId(): string {
        return "FakePhysicalModelId";
    }
}
