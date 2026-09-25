# Shell Icon Map

M2.2 shell icons use `lucide-react@1.48.0` through the shared `Icon` registry. Every icon renders at prototype stroke width `1.6`.

| Prototype icon | Production implementation | Mapping | Known visual difference |
| --- | --- | --- | --- |
| `dashboard` | `LayoutDashboard` | Lucide | Lucide uses 1px corner radii and matches the prototype four-panel silhouette closely. |
| `coins` | `Coins` | Lucide | Lucide shows stacked coin ellipses; the prototype glyph has slightly different overlap spacing. |
| `users` | `Users` | Lucide | Lucide's secondary user contour is marginally wider. |
| `star` | `Star` | Lucide | None material. |
| `shield` | `Shield` | Lucide | The prototype shield has a flatter top shoulder. |
| `settings` | `Settings` | Lucide | Lucide has eight teeth instead of the prototype's compact gear path. |
| `clock` | `Clock3` | Lucide | Lucide's hands use a slightly different angle. |
| `activity` | `Activity` | Lucide | None material. |
| `layers` | `Layers3` | Lucide | Lucide uses curved layer contours instead of prototype polygons. |
| `grid` | `Grid2X2` | Lucide | Lucide uses a single grid path rather than four individually rounded cells. |
| `menu` | `Menu` | Lucide | Prototype rows begin and end one unit farther inward on the 24px grid. |
| `close` | `X` | Lucide | None material. |
| `chevronRight` | `ChevronRight` | Lucide | None material; mirrored in RTL where directional. |
| `chevronDown` | `ChevronDown` | Lucide | None material. |

No custom SVG was required for the M2.2 shell. Differences listed above are small path-shape differences, not substitutions of a different icon concept. Human icon-map approval is required before M2.2 can be marked complete.
