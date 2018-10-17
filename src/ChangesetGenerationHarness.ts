/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/

import { ChangesetGenerationConfig } from "./ChangesetGenerationConfig";
import { HubUtility } from "./HubUtility";
import { IModelDbHandler } from "./IModelDbHandler";
import { ChangesetGenerator } from "./ChangesetGenerator";
import { TestChangesetSequence } from "./TestChangesetSequence";
import { Id64, Logger, LogLevel, ActivityLoggingContext } from "@bentley/bentleyjs-core";
import { IModelDb, IModelHost, IModelHostConfiguration, KeepBriefcase } from "@bentley/imodeljs-backend";
import { IModel } from "@bentley/imodeljs-common";
import { AccessToken } from "@bentley/imodeljs-clients";
import * as fs from "fs";
import { Config } from "@bentley/imodeljs-clients";
import { ColorDef, CodeScopeSpec } from "@bentley/imodeljs-common";

const actx = new ActivityLoggingContext("");
/** Harness used to facilitate changeset generation */
export class ChangesetGenerationHarness {
    private _iModelDbHandler: IModelDbHandler;
    private _localIModelDbPath: string;
    private _isInitialized: boolean = false;
    private _iModelId?: string;
    private _iModelDb?: IModelDb;
    private _hubUtility?: HubUtility;
    private _accessToken?: AccessToken;
    private _projectId?: string;
    private _physicalModelId?: Id64;
    private _codeSpecId?: Id64;
    private _categoryId?: Id64;
    private _codeSpecName = "TestCodeSpec";
    private _categoryName = "TestCategory";
    public constructor(hubUtility?: HubUtility, iModelDbHandler?: IModelDbHandler, localIModelDbPath?: string) {
        ChangesetGenerationConfig.setupConfig();

        this._iModelDbHandler = iModelDbHandler ? iModelDbHandler : new IModelDbHandler(actx);
        this._hubUtility = hubUtility;
        this._localIModelDbPath = localIModelDbPath ? localIModelDbPath : ChangesetGenerationConfig.outputDir;

        if (!IModelHost.configuration)
            this._initializeIModelHost();
    }
    // Async Initialization
    public async initialize(): Promise<void> {
        if (!this._isInitialized) {
            try {
                this._initializeOutputDirectory();
                this._initializeLogger();
                if (!this._hubUtility)
                    this._hubUtility = new HubUtility();
                this._accessToken = await this._hubUtility.login();
                Logger.logTrace(ChangesetGenerationConfig.loggingCategory, `Attempting to file projectId for ${ChangesetGenerationConfig.projectName}`);
                this._projectId = await this._hubUtility.queryProjectIdByName(this._accessToken, ChangesetGenerationConfig.projectName);
                this._iModelId = await this._hubUtility.queryIModelIdByName(this._accessToken, this._projectId, ChangesetGenerationConfig.iModelName);
                Logger.logTrace(ChangesetGenerationConfig.loggingCategory, `Opening latest iModel`);
                this._iModelDb = await this._iModelDbHandler.openLatestIModelDb(this._accessToken!, this._projectId!, this._iModelId!);
                const definitionModelId: Id64 = IModel.dictionaryId;
                const physModelId = this._iModelDbHandler.getChangeSetUtilPhysModel(this._iModelDb);
                if (!physModelId)
                    this._physicalModelId = this._iModelDbHandler.insertChangeSetUtilPhysicalModel(this._iModelDb);
                else
                    this._physicalModelId = physModelId;
                const codeSpec = this._iModelDbHandler.getCodeSpecByName(this._iModelDb, this._codeSpecName);
                if (codeSpec)
                    this._codeSpecId = codeSpec.id;
                else
                    this._codeSpecId = this._iModelDbHandler.insertCodeSpec(this._iModelDb, this._codeSpecName, CodeScopeSpec.Type.Model);

                const spatialCategory = this._iModelDbHandler.getSpatialCategory(this._iModelDb);
                if (!spatialCategory)
                    this._categoryId = this._iModelDbHandler.insertSpatialCategory(this._iModelDb, definitionModelId, this._categoryName, new ColorDef("blanchedAlmond"));
                else
                    this._categoryId = spatialCategory.id;
                this._iModelDbHandler.initPhysModelElements(this._iModelDb, this._physicalModelId);
                await this._iModelDb.pushChanges(actx, this._accessToken);
                Logger.logTrace(ChangesetGenerationConfig.loggingCategory, `Successful Async Initialization`);
                this._isInitialized = true;
            } catch (error) {
                Logger.logTrace(ChangesetGenerationConfig.loggingCategory, `Error with async initialization: ${error}`);
            }
        }
    }
    public async generateChangesets(changesetSequence: TestChangesetSequence): Promise<boolean> {
        await this.initialize();
        const changesetGenerator: ChangesetGenerator = new ChangesetGenerator(this._accessToken!, this._hubUtility!,
            this._physicalModelId!, this._categoryId!, this._codeSpecId!, actx, this._iModelDbHandler);
        const retVal = await changesetGenerator.pushTestChangeSetsAndVersions(this._projectId!, this._iModelId!, changesetSequence);
        await this._iModelDb!.close(actx, this._accessToken!, KeepBriefcase.No);
        return retVal;
    }

    private _initializeLogger(): void {
        Logger.initializeToConsole();
        Logger.setLevelDefault(LogLevel.Error);
        Logger.setLevel(ChangesetGenerationConfig.loggingCategory, LogLevel.Trace);
        Logger.logTrace(ChangesetGenerationConfig.loggingCategory, "Logger initialized...");
        Logger.logTrace(ChangesetGenerationConfig.loggingCategory, `${Config.App}`);
    }
    private _initializeIModelHost(): void {
        const configuration = new IModelHostConfiguration();
        IModelHost.startup(configuration);
    }
    /** Clean up the test output directory to prepare for fresh output */
    private _initializeOutputDirectory(): void {
        if (!fs.existsSync(this._localIModelDbPath))
            fs.mkdirSync(this._localIModelDbPath);
    }
}
