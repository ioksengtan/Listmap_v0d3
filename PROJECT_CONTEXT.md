# PROJECT_CONTEXT.md

## 1. 專案名稱與用途

**Listmap** — 以地圖為核心的個人知識整理與分享平台，讓使用者將 YouTube 影片、部落格文章、書籍、Podcast 等內容與真實 GPS 地標綁定，透過互動地圖瀏覽與探索。

---

## 2. 技術棧

| 層級 | 技術 |
|------|------|
| 後端 | Node.js + Express (`app.js`) |
| 前端框架 | jQuery 3.6、Bootstrap 5、Vue 2 + vue-i18n |
| 地圖 | Leaflet.js 1.7.1 + Mapbox tiles + leaflet.markercluster |
| 資料儲存 | CSV 檔案（`csv-parse` 解析），無資料庫 |
| 樣板引擎 | EJS（已安裝但目前少用） |
| 其他 JS | leaflet-arrowheads、leaflet.geometryutil、Leaflet.LinearMeasurement、markdown 解析器（mdpp）|

---

## 3. 主要功能模組

### blog.html ⭐ 目前重點開發頁面
- 左側 Leaflet 互動地圖 + 右側文章內容的雙欄佈局
- **索引標記層**：頁面載入時從 `getStoriesIndex` API 取得各故事的第一個地標 GPS，打上索引圓點，點擊跳轉到該故事
- **地標層**：點擊索引標記後載入該故事的真實地標，顯示 popup
- **文字超連結連動**：文章內地名可用 `javascript:zoomto({lat,lng}, zoom)` 連動地圖
- **圖片熱區**：`<div class="img-hotspot">` 覆蓋在圖片上，hover 反白 + 標籤，點擊連動地圖
- **回索引**：地圖左下角「← 回索引」按鈕（Leaflet Control），清除地標並縮回索引視角
- 文章內容以 `<section data-story-id="XXX">` 分段，`loadStory()` 依 story_id 顯示對應 section

### stories.html
- 顯示所有故事列表
- 支援 YouTube 嵌入播放（YT.Player API，`StoriesDict` 管理 media_key）
- 故事列表由 `js/storieslist.js` 的 `append_stories_list()` 渲染

### find_stories.html
- 地圖 + 故事列表搜尋探索頁
- 支援 keyword / tag / author 篩選
- `get_landmarks_by_story_id`、`getGPSbyStoryID` 等函式控制地圖標記
- 已從 Google Apps Script 遷移完畢

### collections.html / collection.html
- 故事集（Collection）瀏覽頁
- collection.html：側欄有序故事列表 + 地圖，點擊故事顯示其地標

### story*.html（編輯頁）
- `story_edit.html`、`story_youtube_new.html`、`story_youtube_edit.html`、`story_webpage_edit.html`、`story_image_edit.html`
- 這些頁面保留舊架構（部分仍有 Google Apps Script 遺留程式碼），目前主要功能是唯讀瀏覽

---

## 4. 資料庫結構摘要

### 資料來源（雙層合併）
- **主資料**：`listmap - stories.csv`、`listmap - landmarks.csv`（Google Sheets 匯出，258 筆故事、1050+ 地標）
- **Blog 自訂資料**：`data/stories.csv`、`data/landmarks.csv`（手動新增的 blog 文章與地標）
- `app.js` 的 `readStories()` / `readLandmarks()` 在主檔存在時兩者合併，否則只讀 `data/`

### Stories（故事）
| 欄位 | 說明 |
|------|------|
| story_id | 唯一識別碼（主檔用數字，blog 自訂用 1001+ ） |
| storyBook_id / collection_id | 所屬故事集 |
| title | 標題 |
| type | youtube / blog / book / podcast / image |
| link | 內容 URL |
| author | 作者 / 頻道名稱 |
| tags | 逗號分隔標籤 |
| language | 語言 |
| is_delete | `1` 表示已刪除（soft delete） |

### Landmarks（地標）
| 欄位 | 說明 |
|------|------|
| landmark_id | 唯一識別碼 |
| story_id | 所屬故事 |
| name | 地標名稱 |
| lat / lng | GPS 座標 |
| notes / content | 地標描述 |
| link | 補充連結 |
| is_delete | soft delete |

### Collections（故事集）
| 欄位 | 說明 |
|------|------|
| collection_id | 唯一識別碼 |
| title | 故事集名稱 |
| description | 簡介 |
| cover_image | 封面圖路徑 |
| visibility | public / private |
| created_at | 建立日期 |

### API 指令一覽（`GET /api?command=...`）
| 指令 | 說明 |
|------|------|
| `getRecentStories` | 取得所有故事 |
| `get_landmarks_by_story_id` | 取得某故事的地標 |
| `getStoriesIndex` | 取得故事 + 第一個地標 GPS（blog 索引標記用）|
| `sql_get_stories_by_keyword` | 關鍵字搜尋 |
| `sql_get_stories_by_author` | 依作者篩選 |
| `sql_get_stories_by_tag` | 依標籤篩選 |
| `getCollections` | 取得所有故事集 |
| `getStoriesByCollection` | 取得某故事集的故事 |
| `getCollectionWithStories` | 取得故事集含故事及地標 |
| `get_landmarks_by_zone` | 依地圖邊界取地標 |

---

## 5. 目前開發階段

**主動開發中，核心功能已完成遷移，blog 模組正在建立。**

- ✅ 後端從 Google Sheets + Apps Script 遷移到本地 CSV + Express API
- ✅ 移除 polyfill.io（曾導致登入彈窗）
- ✅ stories.html、find_stories.html 正常運作
- ✅ Collection 功能基本完成
- ✅ blog.html 雙欄佈局 + 索引標記 + 地標連動 + 文字/圖片熱區
- ✅ blog 自訂文章系統（`data/` CSV + `<section data-story-id>`）
- 🔄 海德堡示範文章已建立，GPS 座標需人工校正（老橋偏移已知）

---

## 6. 待解決問題與待決定事項

### 已知 Bug
- **海德堡地標 GPS 偏移**：老橋（Alte Brücke）等座標來自訓練資料記憶，需用 OpenStreetMap / Google Maps 人工校正後更新 `data/landmarks.csv`

### 待決定
- **Blog 文章圖片熱區定位**：目前用估算百分比，需在瀏覽器中目測調整 `left`/`top`/`width`/`height`
- **Blog 文章的 story_id 對應方式**：自訂 blog 文章（`data/stories.csv`）的 story_id 目前手動指定從 1001 開始，日後需約定命名規則
- **GPS 座標來源**：建議統一用 OpenStreetMap 右鍵取得精確座標，避免依賴記憶估算

### 技術負債
- `js/map.js` 仍含 Google Maps（`initGMap`、`refreshGMap`）相關程式碼，只有 blog.html 在用 Leaflet 版的 `initMap`，其他頁面的地圖初始化方式不一致
- `story_edit.html` 等編輯頁面仍有舊 Google Apps Script 遺留程式碼，尚未清理
- `find_stories.html` 的 `get_landmarks_by_zone` 雖已在 API 實作，但前端的回傳格式整合尚未完整測試
- `package.json` 列有 `mongoose`（未使用）

### 功能缺口
- 新增 / 編輯故事的 UI 仍依賴舊系統，本地 CSV 無寫入機制
- 無行動裝置優化版面
- 故事集頁面（`collections.html`）尚未與 blog 索引標記整合

---

## 7. 團隊回饋與優先順序

### 最值得優先修正的四個項目
1. **修正資料品質：GPS 與 story/landmark 對應**
   - 這是整個地圖體驗的基礎，因為內容與地標綁定的準確性直接影響使用者信任。
   - 建議先建立一份地標校正清單，逐步更新 `data/landmarks.csv`，尤其是已知偏移的海德堡景點。

2. **補齊本地 CRUD：新增 / 編輯 / 刪除故事與地標**
   - 目前新增與編輯功能仍依賴舊系統，這是最明顯的功能缺口。
   - 最小可行版本應先支援 CSV 寫入 API，讓內容管理不再依賴舊架構。

3. **統一前端地圖邏輯，移除 Google Maps 遺留程式碼**
   - `js/map.js` 還混雜舊的 Google Maps 寫法，造成開發維護成本上升。
   - 建議會整合成一套 `MapManager` / `storyMap` 風格的統一流程，讓所有頁面共用相同資料格式與地圖層處理邏輯。

4. **強化 `blog.html` 的穩定性與內容編輯體驗**
   - 目前 blog 模組是最重要的體驗入口，但索引點、熱區、story_id 對應仍相當手動。
   - 建議建立命名規則、熱區模板與自動綁定流程，降低內容更新門檻。

### 建議的開發順序
- 第一階段：修正 GPS 資料、統一 API 格式、補齊 story/landmark CRUD
- 第二階段：優化 `blog.html` 的索引、地標和熱區流程
- 第三階段：整合 `collections.html` 與 blog 索引，以及完善 `find_stories.html` 篩選
- 第四階段：行動裝置優化、資料匯出匯入與長期維護工具

### 綜合判斷
- 從專案價值與維護成本來看，最值得投資的不是單一頁面，而是「資料正確性」和「內容管理能力」。
- 只要這兩者穩定，後續的地圖探索、搜尋和 blog 體驗就能快速擴張。

這份整理可作為後續討論與 PR/issue 起草的基礎文本，方便與其他成員一起確認優先順序與下一步任務。

---

## 8. 第一階段已完成的基礎穩定工作

### 統一 API 格式

新增 `/api/v1` REST API。成功回應統一為 `{ "data": ... }`，錯誤回應統一為 `{ "error": { "code": "...", "message": "..." } }`。既有 `/api?command=...` 保留，以避免舊頁面立即失效。

### 故事與地標 CRUD

- `GET /api/v1/stories`
- `GET /api/v1/stories/:storyId`
- `POST/PATCH/DELETE /api/v1/stories`
- `GET /api/v1/stories/:storyId/landmarks`
- `POST/PATCH/DELETE /api/v1/landmarks`

寫入操作目前限定 localhost，並寫入 `data/stories.csv` 與 `data/landmarks.csv`。刪除採用既有的 soft delete（`is_delete=1`）策略。

### 共用地圖邏輯

新增 `js/map-core.js`，集中 Leaflet tile layer、地圖建立、marker cluster、marker 加入與座標範圍縮放邏輯。首頁、blog、故事列表與探索頁已接入此共用模組。

## 9. 新故事發佈 Checklist

每篇新故事在 `blog.html` 寫完後，需完成以下兩個步驟才算發佈完整：

### A. 加上 Scrollytelling story-step（地圖跟著捲動）

在 `<section data-story-id="...">` 裡，把各段落包進 `<div class="story-step">`：

- **地點段落**（有意義的地理移動）：
  ```html
  <div class="story-step" data-step-landmark="地標ID" data-step-zoom="縮放層級">
    <h4>...</h4>
    <p>...</p>
  </div>
  ```
  zoom 建議值：城市單點 14-16，地區 11-13，跨國/全覽 9-10

- **總覽/收尾段落**（無特定地點，或想顯示全部標記）：
  ```html
  <div class="story-step" data-step-view="all">
    <p>...</p>
  </div>
  ```

### B. 加入 INDEX_MARKERS（地圖首頁顯示釘）

在 `js/blog.js` 的 `INDEX_MARKERS` 陣列加一行：

```js
{ label: '故事標題（可縮短）', type: 'story', story_id: '100XXX' },
```

**若不加，故事地標不會出現在 blog.html 左側地圖。**

### C. 重新 compile 並推上 GitHub

```bash
npm run compile-data
git add blog.html js/blog.js stories/
git commit -m "Add S100XXX: 故事標題"
git push
```
