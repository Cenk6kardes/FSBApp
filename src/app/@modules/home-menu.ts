import { NbMenuItem } from '@nebular/theme';
//Used to validate role autherization 
export const MENU_ICONS = {
    dashboard: {icon: 'dashboard', pack: 'sidebar-icons'},
    entityScreen: { icon: 'engagement', pack: 'sidebar-icons'},
    libraryDetails: { icon: 'library', pack: 'sidebar-icons'},
    team: { icon: 'team', pack: 'sidebar-icons'},
    activty: { icon: 'activity', pack: 'sidebar-icons'},
}
//data is used as a module name for authorization porpuse
export const MENU_ITEMS: NbMenuItem[] = [
    {
        title: 'Dashboard',
        icon: {icon: 'dashboard', pack: 'sidebar-icons'},
        link: '/home/dashboard',
        home: true,
        data: 'dashboard'
    },
    {
        title: 'Engagement & Entity',
        icon: { icon: 'engagement', pack: 'sidebar-icons'},
        link: '/home/entityscreen',
        data: 'entityScreen'
    },
    {
        title: 'Library Details',
        icon: { icon: 'library', pack: 'sidebar-icons'},
        link: '/home/libraries',
        data: 'libraryDetails'
    },
    {
        title: 'Team',
        icon: { icon: 'team', pack: 'sidebar-icons'},
        link: '/home/team',
        data: 'user'
    },
    {
        title: 'Activity',
        icon: { icon: 'activity', pack: 'sidebar-icons'},
        link: '/home/activity',
        data: 'activity'
    },
]
