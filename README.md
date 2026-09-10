# Listmap

以地圖為核心的個人地理故事平台，同時是一份**個人知識庫**與一個**公開分享工具**。網站主人把 YouTube 影片、部落格文章、書籍、Podcast 等內容，各自綁定到一個或多個真實 GPS 地標上；訪客可以瀏覽這些故事、依關鍵字／標籤／作者篩選，也能直接在地圖上探索——看看某個地點附近藏著哪些故事。多數內容平台只用主題或作者分類，卻忽略了內容發生的「地點」本身，Listmap 把地點當成跟主題同等重要的整理維度。

## Live demo

[https://ioksengtan.github.io/Listmap_v0d3/](https://ioksengtan.github.io/Listmap_v0d3/)

（GitHub Pages 從 `master` 分支自動部署，是純靜態版本；本機啟動的版本還多了作者用的內容管理 API，見下方。）

## 技術棧

- **後端**：Node.js + Express（`app.js`）
- **前端**：jQuery、Bootstrap 5、Leaflet.js（地圖）
- **資料儲存**：CSV 檔案（`data/stories.csv`、`data/landmarks.csv` 等，用 `csv-parse` 解析），目前沒有資料庫——之後規劃遷移到 SQLite
- **靜態產出**：`scripts/compile-static-data.js` 把 CSV 編譯成 `data/static.json`，並為每篇公開故事產生一支獨立的 `stories/<id>.html` 分享頁（含 Open Graph／JSON-LD）

## 本機開發

```bash
npm install
npm start
```

啟動後開啟 [http://localhost:3000](http://localhost:3000)。從 `localhost` 存取時會額外開放內容管理 API（新增／編輯故事與地標），其他來源只能瀏覽 `visibility` 為 `public` 的內容。

修改過 `data/*.csv` 之後，記得重新編譯靜態資料：

```bash
npm run compile-data
```

跑測試（含 CSV 唯一性檢查）：

```bash
npm test
```

更完整的資料模型、ID 命名規則等說明，請見 [SPEC.md](SPEC.md)。
