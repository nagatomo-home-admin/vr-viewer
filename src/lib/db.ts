import fs from 'fs';
import path from 'path';

// Vercel KVを動的にインポートするための変数定義
let kv: any = null;
try {
  // 環境変数を確認し、値が存在する場合のみVercel KVを読み込みます
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    // 実行時エラーを防ぐため、requireで動的読み込みを行います
    const vercelKv = require('@vercel/kv');
    kv = vercelKv.kv;
    console.log("Vercel KV 接続を初期化しました（クラウドモード）");
  } else {
    console.log("Vercel KV の環境変数が見つかりません（ローカルモード）");
  }
} catch (e) {
  console.warn("Vercel KVの初期化に失敗しました。ローカルファイルストレージを使用します。エラー詳細:", e);
}

// データ保存用ファイルパスの設定
const LOCAL_PROPERTIES_PATH = path.join(process.cwd(), 'src', 'data', 'finance', 'input_properties.json');
const LOCAL_BANK_CONFIG_PATH = path.join(process.cwd(), 'src', 'data', 'finance', 'bank_config.json');

/**
 * 物件計画データの一覧を取得します
 * Vercel KVが利用可能であればKVから取得し、なければローカルJSONファイルから取得します
 */
export async function getProperties(): Promise<any[]> {
  if (kv) {
    try {
      const data = await kv.get('input_properties');
      if (data) {
        // Vercel KVのデータ型に合わせてパースします
        return typeof data === 'string' ? JSON.parse(data) : (Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Vercel KVからのデータ取得に失敗しました。ローカルファイルにフォールバックします:", e);
    }
  }

  // ローカルJSONファイルからの読み込み
  try {
    if (fs.existsSync(LOCAL_PROPERTIES_PATH)) {
      const content = fs.readFileSync(LOCAL_PROPERTIES_PATH, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("ローカル物件データの読み込みエラー:", e);
  }
  return [];
}

/**
 * 物件計画データの一覧を保存します
 * Vercel KVが利用可能であればKVへ保存し、なければローカルJSONファイルに書き込みます
 */
export async function saveProperties(properties: any[]): Promise<boolean> {
  if (kv) {
    try {
      await kv.set('input_properties', properties);
      console.log("Vercel KVへ物件データを保存しました");
      return true;
    } catch (e) {
      console.error("Vercel KVへのデータ保存に失敗しました。ローカルファイルへの書き込みを行います:", e);
    }
  }

  // ローカルJSONファイルへの保存
  try {
    const dir = path.dirname(LOCAL_PROPERTIES_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_PROPERTIES_PATH, JSON.stringify(properties, null, 4), 'utf8');
    console.log("ローカルJSONファイルへ物件データを保存しました");
    return true;
  } catch (e) {
    console.error("ローカル物件データの保存エラー:", e);
    return false;
  }
}

/**
 * 銀行設定（金利、審査金利など）を取得します
 * Vercel KVが利用可能であればKVから取得し、なければローカルJSONファイルから取得します
 */
export async function getBankConfig(): Promise<any> {
  if (kv) {
    try {
      const data = await kv.get('bank_config');
      if (data) {
        return typeof data === 'string' ? JSON.parse(data) : data;
      }
    } catch (e) {
      console.error("Vercel KVからの銀行設定取得に失敗しました。ローカルファイルにフォールバックします:", e);
    }
  }

  // ローカルJSONファイルからの読み込み
  try {
    if (fs.existsSync(LOCAL_BANK_CONFIG_PATH)) {
      const content = fs.readFileSync(LOCAL_BANK_CONFIG_PATH, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("ローカル銀行設定の読み込みエラー:", e);
  }
  return {};
}
