import { NbAccessControl } from "@nebular/security";

export class RoleConstants {
    static rolePermission: NbAccessControl =
        {
            "globalAdmin": {
                "create": [
                    "user",
                    "note",
                    "globalNote",
                    "project",
                    "notification",
                    "warning",
                    "engagementAndEntity",
                ],
                "read": [
                    "dashboard",// used for menu navigation
                    "entityScreen",// used for menu navigation
                    "libraryDetails",// used for menu navigation
                    "user",// team - used for menu navigation
                    "activity",// used for menu navigation
                    "note",
                    "globalNote",
                    "project",
                    "notification",
                ],
                "update": [
                    "user",
                    "userFields",
                    "preparer",
                    "reviewer",
                    "note",
                    "globalNote",
                    "project",
                    "projectDueDate",
                    "notification",
                ],
                "delete": [
                    "user",
                    "note",
                    "globalNote",
                    "project",
                    "notification",
                ],
                "search": [
                    "user",
                    "project",
                ],
                "manage": [
                    "notification"
                ],
            },
            "sysAdmin": {
                "create": [
                    "user",
                    "note",
                    "globalNote",
                    "project",
                    "notification",
                    "warning",
                    "engagementAndEntity",
                ],
                "read": [
                    "dashboard",// used for menu navigation
                    "entityScreen",// used for menu navigation
                    "libraryDetails",// used for menu navigation
                    "user",// team - used for menu navigation
                    "activity",// used for menu navigation
                    "note",
                    "globalNote",
                    "project",
                    "notification",
                ],
                "update": [
                    "user",
                    "userFields",
                    "preparer",
                    "reviewer",
                    "note",
                    "globalNote",
                    "project",
                    "projectDueDate",
                    "notification",
                ],
                "delete": [
                    "user",
                    "note",
                    "globalNote",
                    "project",
                    "notification",
                ],
                "search": [
                    "user",
                    "project",
                ],
                "manage": [
                    "notification"
                ],
            },
            "preparer": {
                "create": [
                    "note",
                    "notification"
                ],
                "read": [
                    "dashboard",// used for menu navigation
                    "libraryDetails",// used for menu navigation
                    "activity",// used for menu navigation
                    "note",
                    "project",
                    "notification",
                ],
                "update": [
                    "preparer",
                    "reviewer",
                    "note",
                    "notification",
                ],
                "delete": [
                    "note",
                    "notification",
                ],
                "search": [
                    "user",
                    "project",
                ],
                "manage": [
                ],
            },
            "reviewer": {
                "create": [
                    "note",
                    "notification",
                    "project"
                ],
                "read": [
                    "dashboard",// used for menu navigation
                    "libraryDetails",// used for menu navigation
                    "user",//team - used for menu navigation
                    "activity",// used for menu navigation
                    "note",
                    "project",
                    "notification",
                ],
                "update": [
                    "user",
                    "userEntities",
                    "preparer",
                    "note",
                    "notification",
                ],
                "delete": [
                    "note",
                    "notification",
                ],
                "search": [
                    "user",
                    "project",
                ],
                "manage": [
                ],
            }
        };

    static roleNames = {
        "noAuth": "noAuth",
        "Global Admin": "globalAdmin",
        "System Admin": "sysAdmin",
        "Preparer": "preparer",
        "Reviewer": "reviewer"
    };
}
