export class FSBConstants {
  static dateFormat = 'en-US';
  static emptyGuid = '00000000-0000-0000-0000-000000000000';
  static uriGetFSBToken = 'loginInformation/LogIn'

  static NotificationWidgetsMessages = {
    EntityAdded: "Entity {0} is added.",
    EngagementAdded: "Engagement {0} is added.",
    UserAddedToEntity: "Entity {0} is assigned to the user {1}.",
    EntityDeleted: "Entity {0} is no longer active as it was deleted.",
    EngagementDeleted: "Engagement {0} under Entity {1} is no longer active as it was deleted.",
    ProjectAdded: "Project {0} under Entity {1} is added.",
    ProjectLocked: "Project {0} under Entity {1} is locked.",
    ProjectDeleted: "Project {0} under Entity {1} is no longer active as it is deleted."
  }
  static webApis = {
    Weatherforecast: {
      forecast: "WeatherForecast"
    },
    EngagementCOE: {
      getBalanceSheet: 'Libraries/Engagement/BalanceSheet/{0}',
      saveBalanceSheet: 'Libraries/Engagement/BalanceSheet',
      getIncomeStatement: 'Libraries/Engagement/IncomeStatement/{0}',
      saveIncomeStatement: 'Libraries/Engagement/IncomeStatement',
    },
    GlobalCOE: {
      getBalanceSheet: 'Libraries/Global/BalanceSheet/{0}',
      saveBalanceSheet: 'Libraries/Global/BalanceSheet',
      getIncomeStatement: 'Libraries/Global/IncomeStatement/{0}',
      saveIncomeStatement: 'Libraries/Global/IncomeStatement',
    },
    FsStructuring: {
      getProjectBalanceSheet: 'dashboard/ProjectBalanceSheet/{0}',
      saveProjectBalanceSheet: 'dashboard/ProjectBalanceSheet',
      getProjectIncomeStatement: 'dashboard/ProjectIncomeStatement/{0}',
      saveProjectIncomeStatement: 'dashboard/ProjectIncomeStatement',
      downloadProjectBalanceSheetTreeStructuring: 'dashboard/ProjectBalanceSheet/download/{0}',
      uploadProjectBalanceSheetTreeStructuring: 'dashboard/ProjectBalanceSheet/upload/{0}',
      downloadProjectIncomeStatementTreeStructuring: 'dashboard/ProjectIncomeStatement/download/{0}',
      uploadProjectIncomeStatementTreeStructuring: 'dashboard/ProjectIncomeStatement/upload/{0}'
    },
    Clients: {
      get: 'api/clients'

    }
  }

  static treeMenuItems = {
    EngagementCOA: {
      treeContextMenuOptions: [
        { level: 0, icon: "add", title: "Add Main-FSC", onClick: "addNewItem" },
        { level: 0, icon: "add", title: "Add Sub-FSC", onClick: "addNewSubItem" },
        { level: 0, icon: "delete", title: "Delete", onClick: "deleteHeader" },
        { level: 0, icon: "drive_file_rename_outline", title: "Rename", onClick: "renameItem" },

        { level: 1, icon: "add", title: "Add Sub-FSC", onClick: "addNewItem" },
        { level: 1, icon: "drive_file_rename_outline", title: "Rename", onClick: "renameItem" },
        { level: 1, icon: "delete", title: "Delete", onClick: "deleteItem" },
        { level: 1, icon: "functions", title: "Add Total", onClick: "addTotal" },

        { level: 2, total: false, icon: "add", title: "Add/Edit Accounts/GLs", onClick: "addEditAccounts" },
        // { level: 2, icon: "edit", text: "Account Number" },
        // { level: 2, icon: "edit", text: "Account Description" },
        // { level: 2, icon: "edit", text: "Plus(add)" },
        { level: 2, total: true, icon: "drive_file_rename_outline", title: "Rename", onClick: "renameItem" },
        { level: 2, total: true, icon: "delete", title: "Delete", onClick: "deleteItem" }

        // { level: 3, icon: "drive_file_rename_outline", text: "hello world" },
      ]
    },

    GlobalCOA: {
      treeContextMenuOptions: [
        { level: 0, icon: "add", title: "Add Main-FSC", onClick: "addNewItem" },
        { level: 0, icon: "add", title: "Add Sub-FSC", onClick: "addNewSubItem" },
        { level: 0, icon: "delete", title: "Delete", onClick: "deleteHeader" },
        { level: 0, icon: "drive_file_rename_outline", title: "Rename", onClick: "renameItem" },

        { level: 1, icon: "add", title: "Add Sub-FSC", onClick: "addNewItem" },
        { level: 1, icon: "drive_file_rename_outline", title: "Rename", onClick: "renameItem" },
        { level: 1, icon: "delete", title: "Delete", onClick: "deleteItem" },
        { level: 1, icon: "functions", title: "Add Total", onClick: "addTotal" },

        // { level: 2, icon: "add", title: "Add/Edit Accounts/GLs", onClick: "addEditAccounts" },
        { level: 2, icon: "drive_file_rename_outline", title: "Rename", onClick: "renameItem" },
        { level: 2, icon: "delete", title: "Delete", onClick: "deleteItem" }

        // { level: 3, icon: "drive_file_rename_outline", text: "hello world global" },
      ]
    }
  }

  static ActivityList = {
    //Entity Name & Engagement Name
    EntityMappedEng: { activity: 'Entity Mapped to an Engagement', description: '	{0} & {1}' },
    EntityTempDownload: { activity: 'Entity Template Downloaded', description: 'Entity Template downloaded.' },
    //Global COA Name
    DuplicateGlobalCoaAdd: { activity: 'Duplicate Global COA Added', description: '{0}' },
    //Global COA Name
    GlobalCoaRenamed: { activity: 'Global COA Renamed', description: '{0}' },
    //Engagement COA Name
    DuplicateEngCoaAdd: { activity: '	Duplicate Engagement COA Added', description: '{0}' },
    //Engagement COA Name
    EngCoaRenamed: { activity: 'Engagement COA Renamed', description: '{0}' },
    //Engagement COA and Mapped Engagement
    EngCoaMapped: { activity: 'Engagement COA Mapped', description: '{0} and {1}' },
    //Project Name
    ProjectLocked: { activity: 'Project Locked', description: 'Project Name ( {0} )' },
    ExportProjectList: { activity: 'Export Project List', description: 'Exported Project List' },
    //Project Name
    DownloadTbTempGl: { activity: 'Download TB Template GL Format', description: 'Project Name ( {0} )' },
    //Project Name
    UploadTbTempGl: { activity: 'Upload TB Template GL Format', description: 'Project Name ( {0} )' },
    //Project Name
    DownloadTbTempFs: { activity: 'Download TB Template FS Format', description: 'Project Name ( {0} )' },
    //Project Name
    UploadTbTempFs: { activity: 'Upload TB Template FS Format', description: 'Project Name ( {0} )' },
    //Project Name
    FsPrint: { activity: 'FS Print', description: 'Project Name ( {0} )' },
    ActivityReportDownload: { activity: 'Activity Report Downloaded', description: 'Activity Report Downloaded' },
    //Project Name
    FsStructuredUpdate: { activity: 'FS Structured Update', description: '( {0} ) FS Structured updated' },
    //Project Name
    TbDueDateChange: { activity: 'Project TB Due Date Changed', description: '( {0} ) TB Due Date has been changed' },
    //Project Name
    FsDueDateChange: { activity: 'The project FS Review Due Date Changed', description: '( {0} ) FS Review due date has been changed' },
    //Project Name & Period Break
    PeriodBreakChanged: { activity: 'Project Period Break Changed ', description: '( {0} ) Period Break has been changed to {1}}' },
    //Project Name & Period Break
    CoaChanged: { activity: 'The project COA Changed', description: '( {0} ) COA has been changed to {1}}' },
    //Project Name & Balance Source
    BalanceSourceChanged: { activity: 'Balance Source option changed', description: '( {0} ) The Balance Source option has been changed to {1}}' },
    //Download Engagement & Entity
    DownloadEngagementEntity: { activity: 'Download Engagements with Entities', description: 'Download Engagements with Entities xlsx format' },
  }
}

export enum NotificationType {
  Notification = "Notification",
  Warning = "Warning"
}

export enum CoaType {
  Global = 1,
  Engagement = 2,
  Project = 3
};

export enum TabType {
  BalanceSheet = 1,
  IncomeStatement = 2,
  ProjectBalanceSheet = 3,
  ProjectIncomeStatement = 4
}

export enum EntityType {
  Engagement = 1,
  Entity = 2
}

export enum OperationType {
  Add = 1,
  Update = 2,
  Delete = 3,
  Duplicate = 4,
  Upload = 5,
  Download = 6,
  Mapping = 7
}

export enum OperationTypeTree {
  Add = 1,
  Update = 2,
  Delete = 3,
  Upload = 4,
  Download = 5
}

export enum ProjectStatus {
  New = "New",
  ConfigureFS = "ConfigureFS",
  TBUpload = "TBUpload",
  FSReview = "FSReview",
  Completed = "Completed"
}

export enum FilterNames {
  Overall = "OverAllProjects",
  NewProjects = "NewProjects",
  ConfigureFS = "ConfigureFs",
  TBUpload = "TbUpload",
  FSReview = "FsReview",
  Completed = "Completed"
}

export enum TreeLevels {
  Header = "Header",
  Total = "Total",
  Main = "Main-FSC",
  Sub = "Sub-FSC"
}

export enum ActivityCodes {
  Add = 1,
  Edit = 2,
  Delete = 3,
  Download = 4,
  ReviewOpenProject = 5,
  StatusChange = 6,
  Activate = 7,
  Deactivate = 8,
  Mapping = 9,
  Upload = 10,
  Rename = 11,
  Lock = 12,
  Export = 13,
  Print = 14,
  PeriodChange = 15,
  TBDueDateChanged = 16,
  FSDueDateChange = 17,
  PeriodBreakChange = 18,
  COAChange = 19,
  LogIn = 20
}