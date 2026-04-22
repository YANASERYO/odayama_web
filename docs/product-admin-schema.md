# 商品管理スキーマ

オンライン授与所の商品一覧は `js/products-data.js` の `window.ODAYAMA_PRODUCTS` を元に描画します。後でadmin管理にする場合は、同じ形のJSONを返すAPIを用意し、`product.html` の `data-products-source` にAPIパスを入れるだけで差し替えられます。

```html
<div class="juyo-grid" data-product-grid data-products-source="/api/products"></div>
```

## 商品データ

```json
{
  "id": "gosyuin-tsujo",
  "sku": "ODY-GOS-001",
  "name": "通常御朱印",
  "category": "御朱印",
  "initialOffering": 500,
  "initialOfferingLabel": "",
  "description": "商品説明",
  "fulfillment": "郵送対応",
  "status": "available",
  "statusLabel": "授与可",
  "image": "images/products/gosyuin-tsujo.jpg",
  "imageAlt": "通常御朱印の画像",
  "sortOrder": 10,
  "visible": true
}
```

## フィールド

- `id`: 決済APIにも送る安定ID。変更すると注文・決済連携に影響する。
- `sku`: 管理用の商品番号。発送や在庫管理に使う。
- `name`: 商品名。
- `category`: 一覧のカテゴリ絞り込みに使う。
- `initialOffering`: 数値の初穂料。未設定なら `null`。
- `initialOfferingLabel`: `後で入力` や `お問い合わせ` など、数値以外で表示したい文言。
- `description`: 商品説明。
- `fulfillment`: `郵送対応` などの授与方法。
- `status`: `available`、`sold_out`、`paused`、`draft` を想定。`draft` は一覧に出さない。
- `statusLabel`: 画面表示用の状態ラベル。
- `image`: 画像パス。空なら「画像準備中」の枠を表示する。
- `imageAlt`: 画像の代替テキスト。
- `sortOrder`: 表示順。
- `visible`: `false` なら一覧に出さない。

## APIレスポンス例

配列を直接返すか、`products` キーで返せます。

```json
{
  "products": [
    {
      "id": "gosyuin-tsujo",
      "sku": "ODY-GOS-001",
      "name": "通常御朱印",
      "category": "御朱印",
      "initialOffering": 500,
      "description": "商品説明",
      "fulfillment": "郵送対応",
      "status": "available",
      "statusLabel": "授与可",
      "image": "images/products/gosyuin-tsujo.jpg",
      "imageAlt": "通常御朱印の画像",
      "sortOrder": 10,
      "visible": true
    }
  ]
}
```
