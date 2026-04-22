# 決済実装メモ

オンライン授与所のフロント側は、授与品の選択内容と申込情報を `POST /api/create-checkout-session` に送信するところまで実装済みです。

## つなぎ込み方

1. 決済事業者の管理画面で商品または価格を作成する。
2. サーバー側で商品マスタの `id` を正式な価格IDに対応させる。
3. `POST /api/create-checkout-session` を実装し、決済セッションURLを返す。
4. フロント側は返ってきた `url` または `checkoutUrl` に自動遷移する。

## フロントから送るJSON

```json
{
  "items": [
    {
      "id": "gosyuin-tsujo",
      "sku": "ODY-GOS-001",
      "quantity": 1
    }
  ],
  "customer": {
    "name": "山田 太郎",
    "email": "taro@example.com",
    "phone": "09000000000",
    "postalCode": "8080012",
    "address": "福岡県北九州市若松区..."
  },
  "note": "備考",
  "successUrl": "https://example.com/checkout-success.html?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "https://example.com/checkout-cancel.html"
}
```

## APIから返すJSON

```json
{
  "url": "https://checkout.stripe.com/..."
}
```

## 実装上の注意

- 金額、送料、授与可否は必ずサーバー側で決める。
- ブラウザから送られる `id` や `quantity` をそのまま信用しない。
- 商品名、画像、初穂料、説明は `js/products-data.js` と同じスキーマでadmin/API化できる。
- 決済の秘密鍵はHTMLやJavaScriptに置かない。
- 氏名、住所、電話番号などの個人情報を決済サービスのmetadataへ不用意に入れない。必要なら自前の注文DBに保存し、注文IDだけを決済metadataへ入れる。
- 決済完了後はWebhookで支払い完了を確認してから発送処理に進む。

## 参考

- Stripe Checkout Sessions API: https://docs.stripe.com/payments/checkout-sessions
- Stripe Checkout Session作成API: https://docs.stripe.com/api/checkout/sessions/create
