/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/

import { ChangesetGenerationConfig } from "./ChangesetGenerationConfig";
import { AccessToken, ConnectClient, HubIModel, IModelHubClient, Project, IModelQuery, Version } from "@bentley/imodeljs-clients";
import { AzureFileHandler } from "@bentley/imodeljs-clients/lib/imodelhub/AzureFileHandler";
import { Logger, Guid } from "@bentley/bentleyjs-core";
import { IModelVersion } from "@bentley/imodeljs-common";
import { OidcAgentClient } from "@bentley/imodeljs-clients-backend/lib/OidcAgentClient";
import { ActivityLoggingContext } from "@bentley/bentleyjs-core";

const actx = new ActivityLoggingContext("");

/** Class Containing utility functions for interactions with the iModelHub */
export class HubUtility {
    public connectClient: ConnectClient;
    private _hubClient: IModelHubClient;
    public constructor() {
        this.connectClient = new ConnectClient();
        this._hubClient = new IModelHubClient(new AzureFileHandler());

    }
    public getHubClient(): IModelHubClient {
        return this._hubClient;
    }
    public async login(): Promise<AccessToken> {
        // TODO: remove openid-client.d.ts once imodeljs changes don't require it
        const oidcConfig = ChangesetGenerationConfig.oidcAgentClientConfiguration;
        Logger.logTrace(ChangesetGenerationConfig.loggingCategory, `Attempting to login to OIDC for ${oidcConfig.serviceUserEmail}`);
        const client = new OidcAgentClient(oidcConfig);
        const jwt: AccessToken = await client.getToken(actx);
        Logger.logTrace(ChangesetGenerationConfig.loggingCategory, `Successful login for ${oidcConfig.serviceUserEmail}`);
        return jwt;
    }
    public async createNamedVersion(accessToken: AccessToken, iModelId: string, name: string, description: string): Promise<Version> {
        const changeSetId: string = await IModelVersion.latest().evaluateChangeSet(actx, accessToken, iModelId, this._hubClient);
        Logger.logTrace(ChangesetGenerationConfig.loggingCategory, `Creating named version "${name}" on the Hub`);
        return await this._hubClient.Versions().create(actx, accessToken, new Guid(iModelId), changeSetId, name, description);
    }
    /**
     * Queries the project id by its name
     * @param accessToken AccessToken
     * @param projectName Name of project
     * @throws If the project is not found, or there is more than one project with the supplied name
     */
    public async queryProjectIdByName(accessToken: AccessToken, projectName: string): Promise<string> {
        const project: Project | undefined = await this._queryProjectByName(accessToken, projectName);
        if (!project)
            return Promise.reject(`Project ${projectName} not found`);
        return project.wsgId;
    }

    /**
     * Queries the iModel id by its name
     * @param accessToken AccessToken
     * @param projectId Id of the project
     * @param iModelName Name of the iModel
     * @throws If the iModel is not found, or if there is more than one iModel with the supplied name
     */
    public async queryIModelIdByName(accessToken: AccessToken, projectId: string, iModelName: string): Promise<string> {
        const iModel: HubIModel | undefined = await this._queryIModelByName(accessToken, projectId, iModelName);
        if (!iModel)
            return Promise.reject(`IModel ${iModelName} not found`);
        return iModel.wsgId;
    }
    public async iModelExistsInHub(accessToken: AccessToken, projectId: string, iModelName: string): Promise<boolean> {
        const iModel: HubIModel | undefined = await this._queryIModelByName(accessToken, projectId, iModelName);
        if (iModel)
            return true;
        return false;
    }
    private async _queryProjectByName(accessToken: AccessToken, projectName: string): Promise<Project | undefined> {
        const project: Project = await this.connectClient.getProject(actx, accessToken, {
            $select: "*",
            $filter: "Name+eq+'" + projectName + "'",
        });
        return project;
    }

    private async _queryIModelByName(accessToken: AccessToken, projectId: string, iModelName: string): Promise<HubIModel | undefined> {
        const iModels = await this._hubClient.IModels().get(actx, accessToken, projectId, new IModelQuery().byName(iModelName));
        if (iModels.length === 0)
            return undefined;
        if (iModels.length > 1)
            return Promise.reject(`Too many iModels with name ${iModelName} found`);
        return iModels[0];
    }

}