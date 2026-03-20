export interface Runner {
  id: number;
  name: string;
  class: string;
  dist: number; // distance out of 900
  status: string;
  avatar?: string;
}

export interface ProjectData {
  project: string;
  totalDistance: number;
  totalProgress: number; // For the team, or the leading runner. Let's make it the sum for team, but capped display? The user said "如果是所有参与人的总里程数那需要单独再增加一个累积显示".
  cumulativeTeamDistance: number;
  runners: Runner[];
}

export const bruceTrailData: ProjectData = {
  project: "Bruce Trail 900km",
  totalDistance: 900.0,
  totalProgress: 850.0, // Represents the leading runner's progress for the main bar
  cumulativeTeamDistance: 2256.5,
  runners: [
    { id: 1, name: "熊大", class: "E20BJ4", dist: 330.0, status: "Fighting!", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=XiongDa" },
    { id: 2, name: "小莉", class: "E21BJ4", dist: 330.0, status: "Almost there!", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=XiaoLi" },
    { id: 3, name: "杰克", class: "E19BJ4", dist: 120.0, status: "Just started!", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack" },
    { id: 4, name: "爱丽丝", class: "E22BJ4", dist: 850.0, status: "Sprint to finish", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice" },
    { id: 5, name: "路飞", class: "E20PK1", dist: 450.0, status: "我要成为跑步王！", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luffy" },
    { id: 6, name: "索隆", class: "E20PK1", dist: 450.0, status: "迷路中...", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoro" },
  ]
};

// Waypoints on the Bruce Trail map (Geographic Coordinates)
export const bruceTrailWaypoints = [
  { id: 1, name: "Niagara (Start)", km: 0, lat: 43.15, lng: -79.05 },
  { id: 2, name: "Hamilton", km: 120, lat: 43.25, lng: -79.87 },
  { id: 3, name: "Milton", km: 250, lat: 43.51, lng: -79.88 },
  { id: 4, name: "Caledon", km: 330, lat: 43.86, lng: -80.00 },
  { id: 5, name: "Mono Cliffs", km: 450, lat: 44.02, lng: -80.05 },
  { id: 6, name: "Blue Mountains", km: 600, lat: 44.50, lng: -80.31 },
  { id: 7, name: "Sydenham (Owen Sound)", km: 750, lat: 44.56, lng: -80.94 },
  { id: 8, name: "Wiarton", km: 850, lat: 44.74, lng: -81.13 },
  { id: 9, name: "Tobermory (End)", km: 900, lat: 45.25, lng: -81.66 },
];

export interface TargetLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: "completed" | "in-progress" | "upcoming" | "multiple";
  types: ("completed" | "in-progress" | "upcoming")[];
  routeUrl?: string;
}

// Planets.Run Targets on Earth
export const globalTargets: TargetLocation[] = [
  {
    id: "brucetrail",
    name: "Bruce Trail, Canada",
    lat: 43.6532, 
    lng: -80.0, // Roughly positioning near Toronto/Niagara
    status: "in-progress",
    types: ["in-progress", "completed"], // Can have multiple states
    routeUrl: "/brucetrail"
  },
  {
    id: "fuji",
    name: "Mt. Fuji, Japan",
    lat: 35.3606,
    lng: 138.7274,
    status: "upcoming",
    types: ["upcoming"]
  },
  {
    id: "montblanc",
    name: "Mont Blanc, France",
    lat: 45.8326,
    lng: 6.8652,
    status: "completed",
    types: ["completed"]
  }
];
