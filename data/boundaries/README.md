# 邊界資料說明

本資料夾的檔案不適用本 repository 其他部分的授權，各自依下列原始授權條款提供，轉用時請保留以下出處。

## 台灣直轄市、縣市界線（檔名：taiwan-counties.geojson）
- 原始資料：內政部國土測繪中心109年「直轄市、縣市界線（TWD97經緯度）」COUNTY_MOI_1090820
- 資料頁：https://data.gov.tw/dataset/7442
- 授權：此開放資料依政府資料開放授權條款（Open Government Data License）進行公眾釋出，使用者於遵守本條款各項規定之前提下，得利用之。政府資料開放授權條款：https://data.gov.tw/license
- 下載日期：2026-10-05
- 實際下載：國土測繪圖資服務雲下載專區 https://maps.nlsc.gov.tw/pro/download.jsp （檔案 https://maps.nlsc.gov.tw/download/縣市界線(TWD97經緯度).zip ，座標 EPSG:3824）。壓縮檔內檔名 COUNTY_MOI_1090820，詮釋資料 `TW-01-301000100G-000017.xml` 的日期為 2020-08-20，DBF 最後更新 2020-08-18。政府資料開放平臺資料集 7442 目前另列出 1140318 版，下載網址在 tgos.tw；本次對該網址（含 tgos.tw 首頁）得到 HTTP 403，所以沒有取得 1140318 版，也沒有改用測繪中心以外的來源。

## 日本都道府縣界線（檔名：japan-prefectures.geojson）
- 原始資料：「国土数値情報（行政区域データ）」（国土交通省）2026年（令和8年）版，檔案 N03-20260101_GML.zip（資料基準日 2026年1月1日；伺服器 Last-Modified 為 2026-05-20）
- 資料頁：https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-2026.html
- 授權：創用 CC 姓名標示 4.0 國際授權條款 https://creativecommons.org/licenses/by/4.0/
- 原始資料頁的註記：「測量法に基づく国土地理院長承認（複製）R 7JHf 351」。這是国土交通省製作原始資料時取得的承認，不是本站取得的承認。同一句也寫在所下載壓縮檔內 `KS-META-N03-20260101.xml`（Shift_JIS）。下載該頁時，使用許諾條件欄位為「オープンデータ（CC_BY_4.0）」。
- 下載日期：2026-10-05

## 本站做過的加工
- 轉換座標與格式（GeoJSON）。台灣用 GDAL 3.8.4 `ogr2ogr -t_srs EPSG:4326`（來源 EPSG:3824）。日本用 mapshaper 0.6.113 `-proj wgs84`（來源 JGD2011，EPSG:6668）。
- 降低點數簡化（工具與參數：mapshaper 0.6.113。台灣：`-filter-islands min-area=5km2 -simplify visvalingam weighted 4% keep-shapes`，輸出座標精度 0.0001 度。日本：先 `-filter-fields N03_001 -dissolve N03_001 -filter-islands min-area=5km2 -simplify visvalingam weighted 1% keep-shapes`，再以 EPSG:3857 `-simplify visvalingam interval=1000 keep-shapes` 後轉回 WGS84，輸出座標精度 0.0001 度。）
- 合併成縣市、都道府縣層級，刪除 COUNTYID、COUNTYCODE、COUNTYENG、N03_002、N03_003、N03_004、N03_005、N03_007，只保留名稱欄位 name。另外以 mapshaper `-filter-islands min-area=5km2` 刪除面積小於 5 平方公里的多邊形部分（極小離島）。兩份資料套用同一門檻，沒有針對個別島嶼另外處理，因此原始資料中面積小於 5 平方公里的離島都不會顯示，也不能塗色。地圖上沒有畫出的島嶼，不代表其歸屬或行政區劃有任何改變。
- 加工後的檔案由 Listmap 製作，不是內政部或国土交通省發布的版本，僅供網頁示意，不適用於測量或界線認定。
