# Listmap — Application Specification

## Project Description

Listmap is a single-user geo-story platform that serves two purposes: a **personal knowledge base** and a **public sharing tool**. The owner curates stories — YouTube videos, blog articles, books, podcasts, and images — each linked to one or more GPS landmarks on an interactive map. Stories can be grouped into **Collections** (ordered storybooks with a theme or narrative). Visitors can browse the owner's stories, filter by keyword, tag, or author, and explore content geographically — discovering what stories are attached to places near them.

The core idea: most content platforms organize by topic or author, but ignore *where* content is set. Listmap fills that gap by making place a first-class dimension for organizing and discovering knowledge.

---

## Scope Decision

**Single-user for now.** There is one owner who creates and edits content. The public can browse and explore but cannot add or edit stories. No authentication is required for visitors. This keeps the architecture simple and avoids the complexity of multi-user accounts, permissions, and moderation.

---

## Data Model

### Collections
A named, ordered group of stories — like a playlist on a map. Used to build thematic or narrative storybooks (e.g. "My Kyushu Trip", "Books set in Taiwan").

| Field | Description |
|-------|-------------|
| collection_id | Unique identifier |
| title | Name of the collection |
| description | Short description or narrative intro |
| cover_image | Cover image path |
| visibility | `public`（對外公開）、`internal`（僅 localhost）、`private`（僅 localhost，同 internal） |
| created_at | Creation date |

### Stories
A single piece of content tied to one or more locations.

| Field | Description |
|-------|-------------|
| story_id | Unique identifier |
| collection_id | References the parent collection (optional) |
| title | Title of the story |
| type | Content type: `youtube`, `blog`, `book`, `podcast`, `image` |
| link | URL to the content |
| author | Author / creator name |
| what | Short label for the content type (e.g. "Video", "Article") |
| where | Human-readable location name (e.g. "Taipei", "Kyushu") |
| avatar | Author avatar image path |
| tags | Comma-separated tags |
| thumbnail | Thumbnail image path |
| visibility | `public`（對外公開，預設）、`internal`（僅 localhost 可見） |

### Landmarks
GPS points that belong to a story.

| Field | Description |
|-------|-------------|
| landmark_id | Unique identifier |
| story_id | References the parent story |
| name | Name of the location |
| lat | Latitude |
| lng | Longitude |
| content | Description of the landmark |
| link | Optional URL for more info |

### Hierarchy
```
Collection (storybook)
  └── Stories (ordered, themed)
        └── Landmarks (GPS points on the map)
```

---

## User Stories

### Browsing (public)
- As a visitor, I want to see a list of recent stories on the map so I can browse what content is available
- As a visitor, I want to click a story and see its landmarks appear on the map so I know where it takes place
- As a visitor, I want to click a landmark on the map and see its name and description
- As a visitor, I want to explore stories near a location on the map so I can discover content relevant to where I am or plan to go

### Collections / Storybooks (public)
- As a visitor, I want to browse collections so I can read stories grouped by theme or narrative
- As a visitor, I want to follow a collection's stories in sequence on the map so I can experience a geographic narrative

### Searching & Filtering (public)
- As a visitor, I want to search stories by keyword so I can find content about a topic
- As a visitor, I want to filter stories by tag so I can find stories in the same category
- As a visitor, I want to filter stories by author so I can find content from a specific creator

### Content Types (public)
- As a visitor, I want to watch a YouTube story alongside its map so I can follow along geographically
- As a visitor, I want to read a blog or webpage story while seeing its locations on the map
- As a visitor, I want to see where a book or podcast is set on the map

### Authoring (owner only)
- As the owner, I want to quickly add a new story by pasting a URL and have the title and thumbnail auto-filled
- As the owner, I want to add landmarks to a story by clicking on the map or entering coordinates
- As the owner, I want to edit an existing story's title, type, link, tags, and landmarks
- As the owner, I want to drag landmarks on the map to adjust their position
- As the owner, I want to create a collection and add stories to it in a chosen order
- As the owner, I want to mark a collection as private so it is only visible to me

### Fullscreen Map View (public)
- As a visitor, I want to view all stories in a fullscreen map so I can explore geographically without distractions

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express |
| Templating | EJS |
| Database | CSV files (`data/stories.csv`, `data/landmarks.csv`) → migrate to SQLite when ready |
| Map | Leaflet.js + Mapbox tiles |
| Frontend | jQuery, Bootstrap 5, Vue 2 |
| Marker clustering | Leaflet.markercluster |

---

## API Endpoints

| Command | Method | Description |
|---------|--------|-------------|
| `getRecentStories` | GET `/api` | Returns all stories |
| `get_landmarks_by_story_id` | GET `/api` | Returns landmarks for a given `story_id` |
| `sql_get_stories_by_keyword` | GET `/api` | Filters stories by keyword (title, what, where) |
| `sql_get_stories_by_author` | GET `/api` | Filters stories by author name |
| `sql_get_stories_by_tag` | GET `/api` | Filters stories by tag |

---

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Landing page with map and story list |
| Stories | `stories.html` | Full list of all stories |
| Find Stories | `find_stories.html` | Search and filter stories |
| Find Stories (fullscreen) | `find_stories_fullscreen_map.html` | Fullscreen map view with story list |
| Story view | `story.html` | Individual story with map |
| Story edit | `story_edit.html` | Edit an existing story and its landmarks |
| New YouTube story | `story_youtube_new.html` | Add a new YouTube story |
| Edit YouTube story | `story_youtube_edit.html` | Edit a YouTube story |
| Edit webpage story | `story_webpage_edit.html` | Edit a blog/webpage story |
| Edit image story | `story_image_edit.html` | Edit an image story |
| Landmarks | `landmarks.html` | Browse landmarks |
| Blog | `blog.html` | Blog view |
| About | `about.html` | About page |

---

## Article HTML Authoring Syntax

Blog articles are written as `<section data-story-id="XXXX">` blocks inside `blog.html`. The following HTML patterns have special meaning and affect the interactive map.

### IDs

| Type | Format | Example |
|------|--------|---------|
| Story | `S` + story_id | `S1003` |
| Collection | `C` + collection_id | `C101` |
| Landmark | landmark_id (integer) | `211` |

All IDs are defined in `data/stories.csv`, `data/collections.csv`, and `data/landmarks.csv`.

---

### Landmark zoom link

Clicking zooms the map to that landmark's coordinates.

```html
<a href="javascript:zoomto({'lat': LAT, 'lng': LNG}, ZOOM_LEVEL)">地名</a>
```

**Example:**
```html
<a href="javascript:zoomto({'lat':35.2519,'lng':139.0217},16)">強羅公園</a>
```

---

### Map edge link (`map-vector-link`)

Draws a line or arrow between two landmarks on the map. The edge is **rendered automatically when the story loads**. Clicking the link zooms the map to that edge.

```html
<a class="map-vector-link"
   data-from="LANDMARK_ID"
   data-to="LANDMARK_ID"
   data-type="vector|line"
   data-color="#rrggbb"
   data-label="顯示文字"
   href="#">連結文字</a>
```

| Attribute | Required | Default | Description |
|-----------|----------|---------|-------------|
| `data-from` | ✓ | — | Starting landmark ID |
| `data-to` | ✓ | — | Ending landmark ID |
| `data-type` | | `vector` | `vector` = arrow at end; `line` = no arrow |
| `data-color` | | vector=`#e74c3c`, line=`#3498db` | Line color (hex) |
| `data-label` | | _(none)_ | Text shown at midpoint of line |

**Vector example** (with arrow, default red):
```html
<a class="map-vector-link" data-from="211" data-to="212" data-label="約5公里" href="#">強羅公園移動到箱根神社</a>
```

**Line example** (no arrow, custom color — e.g. metro line):
```html
<a class="map-vector-link" data-from="271" data-to="270" data-type="line" data-color="#e30012" data-label="京急線 約35分" href="#">京急線至新宿</a>
```

**When Claude adds an edge:** always add the `map-vector-link` as hypertext on a natural phrase in the article body (not as a standalone button). The landmark IDs in `data-from` and `data-to` must exist in `data/landmarks.csv` for the current story.

---

### Map region link (`map-region-link`)

Renders a shaded GeoJSON polygon on the map when the story loads. Clicking zooms to the region bounds.

```html
<a class="map-region-link"
   data-region="REGION_ID"
   data-color="#rrggbb"
   data-opacity="0.25"
   data-label="顯示文字"
   href="#">地區名稱</a>
```

| Attribute | Required | Default | Description |
|-----------|----------|---------|-------------|
| `data-region` | ✓ | — | GeoJSON filename (without `.geojson`) in `data/regions/` |
| `data-color` | | `#3498db` | Fill and border color |
| `data-opacity` | | `0.25` | Fill opacity (0–1) |
| `data-label` | | _(none)_ | Text label at region centroid |

**GeoJSON files** are stored in `data/regions/REGION_ID.geojson`. Use [geojson.io](https://geojson.io) to draw custom shapes and export.

**Example:**
```html
<a class="map-region-link" data-region="tokyo_metro" data-color="#e74c3c" data-opacity="0.15" data-label="東京都" href="#">東京都</a>
```

**When Claude adds a region:** place the link on the natural geographic name in the article text. The `data-region` file must exist in `data/regions/`. If the GeoJSON doesn't exist yet, note it needs to be created.

---

## Future Considerations
- Migrate CSV storage to SQLite for better querying and write support
- Auto-fill story metadata (title, thumbnail, author) from a pasted URL
- "Nearby" discovery — show stories within X km of a map position
- Mobile-friendly layout for on-the-go exploration
- Export a collection as a shareable map link

### Region overlay (`map-region-link`) — planned

Allow articles to reference and highlight geographic regions (modern administrative boundaries or historical territories) on the interactive map. Similar to `map-vector-link`, clicking or loading the story renders the region as a shaded polygon.

**Intended syntax:**
```html
<a class="map-region-link" data-region="REGION_ID" data-color="#rrggbb" data-opacity="0.3" data-label="唐朝版圖" href="#">唐朝版圖</a>
```

**Implementation plan:**
- Region shapes stored as GeoJSON in `data/regions/REGION_ID.geojson`
- Rendered via `L.geoJSON()` with configurable fill color and opacity
- Same load-on-story-open behavior as `map-vector-link`
- Click zooms to region bounds

**Data sources:**
- Modern admin boundaries: Natural Earth, OpenStreetMap (via geoBoundaries)
- Historical territories: World Historical Gazetteer, custom-drawn GeoJSON
- Custom areas: draw with geojson.io, export as `.geojson` and place in `data/regions/`
