/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/

import * as path from "path";
import { Config } from "@bentley/imodeljs-clients";
import { OidcAgentClientConfiguration } from "@bentley/imodeljs-clients-backend/lib/OidcAgentClient";

/**
 * Setup configuration for the application
 */
export class ChangesetGenerationConfig {

    public static setupConfig() {
        Config.App.merge({
            // -----------------------------------------------------------------------------------------------------------
            // Client registration details (REQUIRED)
            // Must set these variables before testing - cCreate a client registration using
            // the procedure here - https://git.io/fx8YP (Developer registration)
            // -----------------------------------------------------------------------------------------------------------
            imjs_agent_client_id: process.env.IMJS_AGENT_CLIENT_ID, // Set this to the client id
            imjs_agent_client_secret: process.env.IMJS_AGENT_CLIENT_SECRET, // Set this to the client secret
            imjs_agent_service_user_email: process.env.IMJS_AGENT_SERVICE_USER_EMAIL, // Set this to the name of the service user
            imjs_agent_service_user_password: process.env.IMJS_AGENT_SERVICE_USER_PASSWORD, // Set this to the path of the service user

            // -----------------------------------------------------------------------------------------------------------
            // Test project and iModel (REQUIRED)
            // Must set these variables before testing - create a new project and iModel with the
            // developer registration procedure here - https://git.io/fx8YP
            // -----------------------------------------------------------------------------------------------------------
            imjs_agent_project_name: process.env.IMJS_AGENT_PROJECT_NAME, // Set this to the name of the sample project
            imjs_agent_imodel_name: process.env.IMJS_AGENT_IMODEL_NAME, // Set this to the name of the sample iModel

            // -----------------------------------------------------------------------------------------------------------
            // Other application settings (NOT REQUIRED)
            // -----------------------------------------------------------------------------------------------------------
            imjs_agent_port: 3000,
            imjs_agent_listen_time: 40000,
            imjs_default_relying_party_uri: "https://connect-wsg20.bentley.com",
            imjs_buddi_resolve_url_using_region: process.env.IMJS_BUDDI_RESOLVE_URL_USING_REGION,
          });
    }

    public static get iModelName(): string {
        return Config.App.getString("imjs_agent_imodel_name");
    }

    public static get projectName(): string {
        return Config.App.getString("imjs_agent_project_name");
    }

    public static get oidcAgentClientConfiguration(): OidcAgentClientConfiguration {
        return {
            clientId: Config.App.getString("imjs_agent_client_id"),
            clientSecret: Config.App.getString("imjs_agent_client_secret"),
            serviceUserEmail: Config.App.getString("imjs_agent_service_user_email"),
            serviceUserPassword: Config.App.getString("imjs_agent_service_user_password"),
        };
    }

    public static get outputDir(): string {
        return path.join(__dirname, "output");
    }

    public static get port(): number {
        return Config.App.getNumber("imjs_agent_port");
    }

    public static get listenTime(): number {
        return Config.App.getNumber("imjs_agent_listen_time");
    }

    public static get loggingCategory(): string {
        return "imodel-query-agent";
    }

    public static get numChangesets(): number {
        return 10;
    }
    public static get numCreatedPerChangeset(): number {
        return 20;
    }
    public static get changesetPushDelay(): number {
        return 2000;
    }

}
