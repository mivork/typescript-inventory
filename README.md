# typescript-inventory

コマンドラインで動くシンプルな在庫管理ツールです。商品の追加・一覧・入庫・出庫・削除と、在庫金額合計の表示ができます。データは `inventory.json` に保存されます。

## 必要環境

- Node.js 16 以上
- TypeScript 5.0 以上（devDependencies に含まれます）

## セットアップ

```bash
npm install
npm run build
```

## 使い方

```bash
# 商品を追加
npm start -- add モニター 35000 10
npm start -- add キーボード 8500 25

# 商品一覧と在庫金額を表示
npm start -- list

# 入庫（在庫を増やす）
npm start -- stock 1 5

# 出庫（在庫を減らす）
npm start -- stock 1 -3

# 商品を削除
npm start -- delete 1

# ヘルプを表示
npm start -- help
```

## 出力例

```
  ID    商品名                単価     在庫数          小計
  -------------------------------------------------------
  1     モニター          35000円      10個      350000円
  2     キーボード         8500円      25個      212500円
  -------------------------------------------------------
  商品数: 2  在庫金額合計: 562,500円
```

## 補足

`typescript` のみ devDependencies に含まれます。外部ランタイムライブラリは使用していません。
