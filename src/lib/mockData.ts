export interface Runner {
  id: number;
  name: string;
  class: string;
  locationKm: number; // Current point exactly on the trail map (0 - 900)
  progressDist: number | string; // Unique distance progressed on the trail
  totalDist: number | string; // Total physical distance run (including repeats/out-and-backs)
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


export interface TargetLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: "completed" | "in-progress" | "upcoming" | "multiple";
  types: ("completed" | "in-progress" | "upcoming")[];
  routeUrl?: string;
}

