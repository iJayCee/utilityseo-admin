// The admin's screens, grouped by the job you came to do. One list: the
// sidebar, the URL validation and the page titles all read from here. It was
// written out three times before and the copies had drifted.
export const NAV = [
  { name: null, items: [
    { id: 'overview', label: 'Overview', blurb: 'Today at a glance: who signed up, what broke, what it cost.' },
  ] },
  { name: 'People', items: [
    { id: 'users', label: 'Users', blurb: 'Every account. Search, filter, edit plans, impersonate.' },
    { id: 'upgrades', label: 'Upgrades', blurb: 'Who moved up a plan, and when.' },
  ] },
  { name: 'Revenue', items: [
    { id: 'promos', label: 'Promo codes', blurb: 'Trial codes you have issued and who used them.' },
    { id: 'prospects', label: 'Prospects', blurb: 'Sites researched for outreach.' },
    { id: 'prospectflow', label: 'Prospect flow', blurb: 'From outreach to signup to paying, by code.' },
    { id: 'costs', label: 'Cost forecast', blurb: 'What the platform costs to run as it grows.' },
    { id: 'marketing', label: 'Marketing', blurb: 'Campaigns, spend and the leads they brought.' },
  ] },
  { name: 'Operations', items: [
    { id: 'monitoring', label: 'Monitoring', blurb: 'Errors and what the platform is doing right now.' },
    { id: 'capacity', label: 'Capacity', blurb: 'Scan queue, throughput and headroom.' },
    { id: 'backups', label: 'Backups', blurb: 'Database backups, run one, restore one.' },
    { id: 'loadtest', label: 'Load test', blurb: 'Push the platform and watch it hold.' },
  ] },
  { name: 'Comms', items: [
    { id: 'announce', label: 'Announcements', blurb: 'Messages every customer sees in the bell.' },
  ] },
  { name: 'Legal', items: [
    { id: 'privacy', label: 'Privacy', blurb: 'Data requests, exports and retention.' },
    { id: 'audit', label: 'Audit log', blurb: 'Every admin action, who and when.' },
  ] },
  { name: 'External', items: [
    { id: 'externaldata', label: 'External data', blurb: 'The services we depend on and their balances.' },
    { id: 'collection', label: 'Collection toggle', blurb: 'Switch data collection on and off per source.' },
    { id: 'demoaccess', label: 'Demo access', blurb: 'Who can open the demo workspace.' },
  ] },
];

export const NAV_ITEMS = NAV.flatMap(g => g.items.map(i => ({ ...i, group: g.name })));
export const TAB_IDS = new Set(NAV_ITEMS.map(i => i.id));
export const navItem = (id) => NAV_ITEMS.find(i => i.id === id) || NAV_ITEMS[0];
