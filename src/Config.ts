/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import * as path from "path";
import * as minimist from "minimist";
import { Config } from "@bentley/imodeljs-clients";
import { IModelJsConfig } from "@bentley/config-loader/lib/IModelJsConfig";
import { OidcAgentClientConfiguration } from "@bentley/imodeljs-clients-backend/lib/OidcAgentClient";
/** Credentials for test users */
export interface UserCredentials {
    email: string;
    password: string;
}
// Fetch CLI args
const argv = minimist(process.argv);

// Use IModelJS config to initialize if it is present
IModelJsConfig.init(true, false, Config.App);

export class ChangesetGenerationConfig {
    // IModelJS and Environment Variable Keys
    private static _appIModelName = "agent_app_imodel_name";
    private static _appProjectName = "agent_app_project_name";
    private static _appLoggingCategory = "agent_app_logging_category";
    private static _appOutputDir = "agent_app_output_dir";
    private static _appOidcClientId = "agent_test_oidc_client_id";
    private static _appOidcClientSecret = "agent_test_oidc_client_secret";
    private static _appServiceUserEmail = "agent_test_oidc_service_user_name";
    private static _appServiceUserPassword = "agent_test_oidc_service_password";
    private static _imjsBuddiRegion = "imjs_buddi_resolve_url_using_region";
    private static _imjsBuddiUrl = "imjs_buddi_url";
    private static _numChangeSets = "num_changesets";
    private static _numCreatedPerChangeSet = "num_created_per_changeset";
    private static _changeSetPushDelay = "changeset_push_delay";
    private static _connectAppName = "imjs_connect_app_name";
    private static _connectAppVersion = "imjs_connect_app_version";
    private static _connectAppGuid = "imjs_connect_app_guid";
    private static _connectDeviceId  = "imjs_connect_device_id";
    private static _defaultRelyingPartyUri = "imjs_default_relying_party_uri";
    /*------------------------------------------------------ FILL THESE OUT -------------------------------------------------------------------------------------------*/
    public static get oidcClientId(): string {
        return Config.App.getString(ChangesetGenerationConfig._appOidcClientId, process.env.oidc_client_id || "YOUR_CLIENT_ID_HERE");
    }
    public static get oidcClientSecret(): string {
        return Config.App.getString(ChangesetGenerationConfig._appOidcClientSecret, process.env.oidc_client_secret || "YOUR_CLIENT_SECRET HERE");
    }
    public static get serviceUserEmail(): string {
        return Config.App.getString(ChangesetGenerationConfig._appServiceUserEmail, argv.email || process.env.service_user_email || "YOUR_SERVICE_USER_EMAIL");
    }
    public static get serviceUserPassword(): string {
        return Config.App.getString(ChangesetGenerationConfig._appServiceUserPassword, argv.password || process.env.service_user_password || "YOUR_SERVICE_USER_PASSWORD");
    }
    public static get connectAppName(): string {
        return Config.App.getString(ChangesetGenerationConfig._connectAppName, process.env.connect_app_name || "YOUR_CONNECT_APP_NAME");
    }
    public static get connectAppVersion(): string {
        return Config.App.getString(ChangesetGenerationConfig._connectAppVersion, process.env.connect_app_version || "YOUR_CONNECT_APP_VERSION");
    }
    public static get connectAppGuid(): string {
        return Config.App.getString(ChangesetGenerationConfig._connectAppGuid, process.env.connect_app_guid || "YOUR_CONNECT_APP_GUID");
    }
    public static get connectDeviceId(): string {
        return Config.App.getString(ChangesetGenerationConfig._connectDeviceId, process.env.connect_device_id || "YOUR_CONNECT_DEVICE_ID");
    }
    public static get defaultRelyingPartyUri(): string {
        return Config.App.getString(ChangesetGenerationConfig._defaultRelyingPartyUri, process.env.default_relying_party_uri || "YOUR_DEFAULT_RELYING_PARTY_URI");
    }
    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    public static get iModelJsAppConfig(): any {
        // Necessary config for using iModelJs
        const appConfig = {
            // OIDC related
            imjs_connect_app_name: ChangesetGenerationConfig.connectAppName,
            imjs_connect_app_version: ChangesetGenerationConfig.connectAppVersion,
            imjs_connect_app_guid: ChangesetGenerationConfig.connectAppGuid,
            imjs_connect_device_id: ChangesetGenerationConfig.connectDeviceId,
            imjs_default_relying_party_uri: ChangesetGenerationConfig.defaultRelyingPartyUri,
            // Buddi Url Resolution Config
            imjs_buddi_url: ChangesetGenerationConfig.buddiUrl,
            imjs_buddi_resolve_url_using_region: ChangesetGenerationConfig.buddiRegion,
        };
        return appConfig;
    }
    public static iModelJsAppConfigHasAllRequiredVars(): boolean {
        return Config.App.has(this._connectAppName) && Config.App.has(this._connectAppVersion) && Config.App.has(this._connectAppGuid) && Config.App.has(this._connectDeviceId)
            && Config.App.has(this._defaultRelyingPartyUri) && Config.App.has(this._imjsBuddiUrl) && Config.App.has(this._imjsBuddiRegion);
    }
    public static get oidcUserCredentials(): UserCredentials {
        const user: UserCredentials = {
            email: ChangesetGenerationConfig.serviceUserEmail,
            password: ChangesetGenerationConfig.serviceUserPassword,
        };
        return user;
    }
    public static get oidcAgentClientConfiguration(): OidcAgentClientConfiguration {
        return {
            clientId: ChangesetGenerationConfig.oidcClientId,
            /** Client application's secret key as registered with the Bentley IMS OIDC/OAuth2 provider. */
            clientSecret: ChangesetGenerationConfig.oidcClientSecret,
            serviceUserEmail: ChangesetGenerationConfig.serviceUserEmail,
            serviceUserPassword: ChangesetGenerationConfig.serviceUserPassword,
        };
    }
    public static get iModelName(): string {
        return Config.App.getString(ChangesetGenerationConfig._appIModelName, process.env.sample_imodel_name || "QueryAgentTestIModel"); // NodeJsTestProject
    }
    public static get projectName(): string {
        return Config.App.getString(ChangesetGenerationConfig._appProjectName, process.env.sample_project_name || "NodeJsTestProject");
    }
    public static get loggingCategory(): string {
        return Config.App.getString(ChangesetGenerationConfig._appLoggingCategory, process.env.config_logging_category || "imodel-changeset_test_utility");
    }
    public static get outputDir(): string {
        return Config.App.getString(ChangesetGenerationConfig._appOutputDir, path.join(__dirname, "output"));
    }
    //  Dev:103, QA:102, Prod: 0, Perf:294
    public static get buddiRegion(): string {
        return Config.App.getString(ChangesetGenerationConfig._imjsBuddiRegion, process.env.imjs_buddi_resolve_url_using_region || "102");
    }
    public static get buddiUrl(): string {
        return Config.App.getString(ChangesetGenerationConfig._imjsBuddiUrl, process.env.imjs_buddi_url || "https://buddi.bentley.com/WebService");
    }
    public static get numChangesets(): number {
        return Config.App.getNumber(ChangesetGenerationConfig._numChangeSets, parseInt(argv.numChangesets || process.env.num_changesets!, 10) || 10);
    }
    public static get numCreatedPerChangeset(): number {
        return Config.App.getNumber(ChangesetGenerationConfig._numCreatedPerChangeSet, parseInt(argv.numCreatedPerChangeset || process.env.num_created_per_changeset!, 10) || 20);
    }
    public static get changesetPushDelay(): number {
        return Config.App.getNumber(ChangesetGenerationConfig._changeSetPushDelay, parseInt(argv.changesetPushDelay || process.env.changeset_push_delay, 10) || 2000);
    }
}
