import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  createdAt: string;
}

const DATA_FILE = path.join(__dirname, "..", "inventory.json");

function loadProducts(): Product[] {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveProducts(products: Product[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), "utf-8");
}

function nextId(products: Product[]): number {
  if (products.length === 0) return 1;
  return Math.max(...products.map((p) => p.id)) + 1;
}

function cmdAdd(args: string[]): void {
  if (args.length < 3) {
    console.log("使い方: npm start -- add <商品名> <単価> <初期在庫数>");
    console.log("  例:   npm start -- add モニター 35000 10");
    return;
  }

  const name = args[0];
  const price = parseInt(args[1], 10);
  const quantity = parseInt(args[2], 10);

  if (isNaN(price) || price < 0) {
    console.log("エラー: 単価は0以上の整数で指定してください");
    return;
  }
  if (isNaN(quantity) || quantity < 0) {
    console.log("エラー: 在庫数は0以上の整数で指定してください");
    return;
  }

  const products = loadProducts();
  const product: Product = {
    id: nextId(products),
    name,
    price,
    quantity,
    createdAt: new Date().toISOString(),
  };
  products.push(product);

  saveProducts(products);
  console.log(
    `追加しました: [${product.id}] ${product.name} @${product.price}円 x${product.quantity}`
  );
}

function cmdList(): void {
  const products = loadProducts();
  if (products.length === 0) {
    console.log("商品が登録されていません");
    return;
  }

  console.log();
  console.log(
    `  ${"ID".padEnd(5)} ${"商品名".padEnd(16)} ${"単価".padStart(10)} ${"在庫数".padStart(8)} ${"小計".padStart(12)}`
  );
  console.log(`  ${"-".repeat(55)}`);

  let totalValue = 0;
  for (const p of products) {
    const subtotal = p.price * p.quantity;
    totalValue += subtotal;
    console.log(
      `  ${String(p.id).padEnd(5)} ${p.name.padEnd(16)} ${(p.price + "円").padStart(10)} ${(p.quantity + "個").padStart(8)} ${(subtotal + "円").padStart(12)}`
    );
  }

  console.log(`  ${"-".repeat(55)}`);
  console.log(
    `  商品数: ${products.length}  在庫金額合計: ${totalValue.toLocaleString()}円`
  );
  console.log();
}

function cmdStock(args: string[]): void {
  if (args.length < 2) {
    console.log("使い方: npm start -- stock <商品ID> <数量>");
    console.log("  正の数で入庫、負の数で出庫");
    console.log("  例:   npm start -- stock 1 5    (5個入庫)");
    console.log("  例:   npm start -- stock 1 -3   (3個出庫)");
    return;
  }

  const id = parseInt(args[0], 10);
  const delta = parseInt(args[1], 10);

  if (isNaN(id)) {
    console.log("エラー: 商品IDを数値で指定してください");
    return;
  }
  if (isNaN(delta) || delta === 0) {
    console.log("エラー: 数量を0以外の整数で指定してください");
    return;
  }

  const products = loadProducts();
  const product = products.find((p) => p.id === id);
  if (!product) {
    console.log(`エラー: ID ${id} の商品が見つかりません`);
    return;
  }

  const newQty = product.quantity + delta;

  if (newQty < 0) {
    console.log(
      `エラー: 在庫不足です（現在 ${product.quantity}個、出庫 ${Math.abs(delta)}個）`
    );
    return;
  }

  product.quantity = newQty;
  saveProducts(products);

  const action = delta > 0 ? "入庫" : "出庫";
  console.log(
    `${action}しました: [${product.id}] ${product.name} ${delta > 0 ? "+" : ""}${delta}個 -> 在庫 ${product.quantity}個`
  );
}

function cmdDelete(args: string[]): void {
  if (args.length < 1) {
    console.log("使い方: npm start -- delete <商品ID>");
    return;
  }

  const id = parseInt(args[0], 10);
  if (isNaN(id)) {
    console.log("エラー: 商品IDを数値で指定してください");
    return;
  }

  const products = loadProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) {
    console.log(`エラー: ID ${id} の商品が見つかりません`);
    return;
  }

  const removed = products.splice(idx, 1)[0];
  saveProducts(products);
  console.log(`削除しました: [${removed.id}] ${removed.name}`);
}

function showHelp(): void {
  console.log(`
  在庫管理CLI

  使い方:
    npm start -- <コマンド> [引数]

  コマンド:
    add <商品名> <単価> <初期在庫数>   商品を追加
    list                               商品一覧と在庫金額を表示
    stock <ID> <数量>                  入庫(正)・出庫(負)
    delete <ID>                        商品を削除
    help                               このヘルプを表示
  `);
}

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();
  const rest = args.slice(1);

  switch (command) {
    case "add":
      cmdAdd(rest);
      break;
    case "list":
      cmdList();
      break;
    case "stock":
      cmdStock(rest);
      break;
    case "delete":
      cmdDelete(rest);
      break;
    case "help":
    case undefined:
      showHelp();
      break;
    default:
      console.log(`不明なコマンド: ${command}`);
      showHelp();
  }
}

main();
