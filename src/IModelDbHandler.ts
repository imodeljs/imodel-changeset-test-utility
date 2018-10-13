/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/

import { Id64, ActivityLoggingContext, Id64Set } from "@bentley/bentleyjs-core";
import { SubCategoryAppearance, CategoryProps, CodeScopeSpec, CodeSpec, ColorDef, IModel, InformationPartitionElementProps, DbResult } from "@bentley/imodeljs-common";
import { IModelDb, PhysicalModel, PhysicalElement, PhysicalPartition, SpatialCategory, OpenParams, Element, ECSqlStatement } from "@bentley/imodeljs-backend";
import { AccessToken } from "@bentley/imodeljs-clients";
import {  IModelVersion } from "@bentley/imodeljs-common";
/** Injectable handles for opening IModels andStatic functions to create Models, CodeSecs, Categories, Category Selector, Styles, and View Definitions */
export class IModelDbHandler {
    public constructor(private _activityLoggingContext: ActivityLoggingContext) {}
    private static _physicalModelName = "Physical Model-1-1";
    private static _spatialCategoryName = "TestCategory";
    public async openLatestIModelDb(accessToken: AccessToken, projectId: string, iModelId: string,
        openParams: OpenParams = OpenParams.pullAndPush(), iModelVersion: IModelVersion = IModelVersion.latest()): Promise<IModelDb> {
        return await IModelDb.open(this._activityLoggingContext, accessToken, projectId!, iModelId!, openParams, iModelVersion);
    }
    public initPhysModelElements(iModelDb: IModelDb, modelId: Id64): void {
        const elements = this.getChangeSetUtilPhysElements(iModelDb, modelId);
        for (const element of elements) {
            iModelDb.elements.deleteElement(element.id);
        }
        iModelDb.saveChanges("Cleaned out elements from physical model");
    }

    public getChangeSetUtilPhysModel(iModelDb: IModelDb): Id64 | undefined {
        try {
            const idSet = iModelDb.withPreparedStatement(`SELECT ECInstanceId AS id FROM BisCore:PhysicalModel LIMIT 1`,
                (stmt: ECSqlStatement) => {
                    const ids: Id64Set = new Set<string>();
                    while (stmt.step() === DbResult.BE_SQLITE_ROW)
                        ids.add(stmt.getValue(0).getId());
                    return ids;
                });
            for (const value of idSet.values()) {
                return new Id64(value);
            }
        } catch (error) {
        }
        return undefined;
    }
    public getChangeSetUtilPhysElements(iModelDb: IModelDb, modelId: Id64): Element[] {
        const elements: Element[] = [];
        try {
            for (const eidStr of iModelDb.queryEntityIds({from: PhysicalElement.classFullName, where: `Model.Id=${modelId}`})) {
                const element = iModelDb.elements.getElement(eidStr);
                elements.push(element);
            }
        } catch (error) {
        }
        return elements;
    }
    public getSpatialCategory(iModelDb: IModelDb): Element | undefined {
        try {
            for (const eidStr of iModelDb.queryEntityIds({from: SpatialCategory.classFullName, where: `CodeValue='${IModelDbHandler._spatialCategoryName}'`})) {
                const element = iModelDb.elements.getElement(eidStr);
                return element;
            }
        } catch { }
        return undefined;
    }
    /** Insert a PhysicalModel */
    public insertChangeSetUtilPhysicalModel(iModelDb: IModelDb): Id64 {
        const partitionProps: InformationPartitionElementProps = {
            classFullName: PhysicalPartition.classFullName,
            model: IModel.repositoryModelId,
            parent: {
                id: IModel.rootSubjectId,
                relClassName: "BisCore:SubjectOwnsPartitionElements",
            },
            code: PhysicalPartition.createCode(iModelDb, IModel.rootSubjectId, IModelDbHandler._physicalModelName),
        };
        const partitionId: Id64 = iModelDb.elements.insertElement(partitionProps);
        const model: PhysicalModel = iModelDb.models.createModel({
            classFullName: PhysicalModel.classFullName,
            modeledElement: { id: partitionId },
        }) as PhysicalModel;
        return iModelDb.models.insertModel(model);
    }
    /** Insert a SpatialCategory */
    public insertSpatialCategory(iModelDb: IModelDb, modelId: Id64, name: string, color: ColorDef): Id64 {
        const categoryProps: CategoryProps = {
            classFullName: SpatialCategory.classFullName,
            model: modelId,
            code: SpatialCategory.createCode(iModelDb, modelId, name),
            isPrivate: false,
        };
        const categoryId: Id64 = iModelDb.elements.insertElement(categoryProps);
        const category: SpatialCategory = iModelDb.elements.getElement(categoryId) as SpatialCategory;
        category.setDefaultAppearance(new SubCategoryAppearance({ color }));
        iModelDb.elements.updateElement(category);
        return categoryId;
    }
    public insertCodeSpec(iModelDb: IModelDb, name: string, scopeType: CodeScopeSpec.Type): Id64 {
        const codeSpec = new CodeSpec(iModelDb, new Id64(), name, scopeType);
        iModelDb.codeSpecs.insert(codeSpec);
        return codeSpec.id;
    }
    public getCodeSpecByName(iModelDb: IModelDb, codeSpecName: string): CodeSpec | undefined {
        try {
            const codeSpec = iModelDb.codeSpecs.getByName(codeSpecName);
            return codeSpec;
        } catch  { }
        return undefined;
    }
}
