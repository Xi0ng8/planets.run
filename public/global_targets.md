---
targets:
  - id: "brucetrail"
    name: "Bruce Trail, Canada"
    lat: 43.6532
    lng: -80.0
    status: "in-progress"
    types:
      - "in-progress"
      - "completed"
    routeUrl: "/brucetrail"
  - id: "fuji"
    name: "Mt. Fuji, Japan"
    lat: 35.3606
    lng: 138.7274
    status: "upcoming"
    types:
      - "upcoming"
  - id: "montblanc"
    name: "Mont Blanc, France"
    lat: 45.8326
    lng: 6.8652
    status: "completed"
    types:
      - "completed"
---

# 全球挑战目标 (Global Targets)

这是 Planets.Run 的全球虚拟跑步路线和目标管理页面。
你可以通过修改这个 Markdown 文件的 frontmatter（`---` 之间的 YAML 部分）来添加、修改或删除地球上的目标点。

字段说明：
- `id`: 唯一标识符
- `name`: 目标名称，显示在地图上
- `lat` / `lng`: 目标的经纬度
- `status`: 当前主要状态 (completed / in-progress / upcoming)
- `types`: 状态数组（支持同时存在多个状态）
- `routeUrl`: (可选) 点击该目标后跳转的页面链接
