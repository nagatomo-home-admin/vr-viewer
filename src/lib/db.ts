import fs from 'fs';
import path from 'path';

// Vercel KVを動的にインポートするための変数定義
let kv: any = null;
try {
  // 環境変数を確認し、値が存在する場合のみVercel KVを読み込みます (STORAGE_ プレフィックス付きもサポート)
  const kvUrl = process.env.KV_REST_API_URL || process.env.STORAGE_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.STORAGE_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    // 連携ライブラリが内部で参照する標準環境変数名に値をコピーしてセットします
    if (!process.env.KV_REST_API_URL) process.env.KV_REST_API_URL = kvUrl;
    if (!process.env.KV_REST_API_TOKEN) process.env.KV_REST_API_TOKEN = kvToken;

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

/**
 * 顧客のヒアリングデータ（お住まい探し計画書）を取得します (Vercel KV または ローカル)
 */
export async function getHearingData(customerId: string): Promise<any | null> {
  if (kv) {
    try {
      const data = await kv.get(`hearing:${customerId}`);
      if (data) {
        return typeof data === 'string' ? JSON.parse(data) : data;
      }
    } catch (e) {
      console.error(`Vercel KVからのヒアリングデータ(${customerId})取得に失敗しました。ローカルファイルにフォールバックします:`, e);
    }
  }

  // ローカルJSONファイルからの読み込み
  try {
    const LOCAL_HEARING_PATH = path.join(process.cwd(), 'src', 'data', 'hearing', `${customerId}.json`);
    if (fs.existsSync(LOCAL_HEARING_PATH)) {
      const content = fs.readFileSync(LOCAL_HEARING_PATH, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("ローカルヒアリングデータの読み込みエラー:", e);
  }
  return null;
}

/**
 * 顧客のヒアリングデータ（お住まい探し計画書）を保存します (Vercel KV または ローカル)
 */
export async function saveHearingData(customerId: string, customerName: string, data: any): Promise<boolean> {
  if (kv) {
    try {
      // 1. 各個別顧客データを保存
      await kv.set(`hearing:${customerId}`, data);
      
      // 2. 顧客IDリストの更新
      const list = await getHearingList();
      const updatedList = list.filter((c: any) => c.id !== customerId);
      updatedList.unshift({ id: customerId, name: customerName ? `${customerName}様` : `${customerId}様` });
      await kv.set('hearing_list', updatedList);
      
      console.log(`Vercel KVへヒアリングデータ(${customerId})を保存しました`);
      return true;
    } catch (e) {
      console.error(`Vercel KVへのヒアリングデータ(${customerId})保存に失敗しました。ローカルファイルへの書き込みを行います:`, e);
    }
  }

  // ローカルJSONファイルへの保存
  try {
    const dir = path.join(process.cwd(), 'src', 'data', 'hearing');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, `${customerId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`ローカルJSONファイルへヒアリングデータ(${customerId})を保存しました`);
    return true;
  } catch (e) {
    console.error("ローカルヒアリングデータの保存エラー:", e);
    return false;
  }
}

/**
 * 顧客のヒアリングデータ一覧を取得します
 */
export async function getHearingList(): Promise<any[]> {
  if (kv) {
    try {
      const data = await kv.get('hearing_list');
      if (data) {
        return typeof data === 'string' ? JSON.parse(data) : (Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Vercel KVからの顧客IDリスト取得に失敗しました。ローカルディレクトリ走査にフォールバックします:", e);
    }
  }

  // ローカルディレクトリの走査
  try {
    const dir = path.join(process.cwd(), 'src', 'data', 'hearing');
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      const list = [];
      for (const file of files) {
        if (file.endsWith('.json')) {
          const id = file.replace('.json', '');
          try {
            const content = fs.readFileSync(path.join(dir, file), 'utf8');
            const parsed = JSON.parse(content);
            const clientName = parsed.customerName ? `${parsed.customerName}様` : `${id}様`;
            list.push({ id, name: clientName });
          } catch (e) {
            list.push({ id, name: `${id}様` });
          }
        }
      }
      return list;
    }
  } catch (e) {
    console.error("ローカルヒアリングリストの走査エラー:", e);
  }
  return [];
}

/**
 * 顧客のヒアリングデータ（お住まい探し計画書）を削除します
 */
export async function deleteHearingData(customerId: string): Promise<boolean> {
  if (kv) {
    try {
      // 1. 各個別顧客データを削除
      await kv.del(`hearing:${customerId}`);
      
      // 2. 顧客IDリストから削除
      const list = await getHearingList();
      const updatedList = list.filter((c: any) => c.id !== customerId);
      await kv.set('hearing_list', updatedList);
      
      console.log(`Vercel KVからヒアリングデータ(${customerId})を削除しました`);
      return true;
    } catch (e) {
      console.error(`Vercel KVからのヒアリングデータ(${customerId})削除に失敗しました。ローカルファイルの削除を行います:`, e);
    }
  }

  // ローカルJSONファイルの削除
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'hearing', `${customerId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`ローカルJSONファイルからヒアリングデータ(${customerId})を削除しました`);
      return true;
    }
  } catch (e) {
    console.error("ローカルヒアリングデータの削除エラー:", e);
  }
  return false;
}

// プレゼンデータ用フォルダのパスを設定
const LOCAL_PRESENTATION_DIR = path.join(process.cwd(), 'src', 'data', 'presentation');

/**
 * 顧客のプレゼンデータ（提案ボード）を取得します (Vercel KV または ローカル)
 */
export async function getPresentationData(customerId: string): Promise<any | null> {
  if (kv) {
    try {
      const data = await kv.get(`presentation:${customerId}`);
      if (data) {
        return typeof data === 'string' ? JSON.parse(data) : data;
      }
    } catch (e) {
      console.error(`Vercel KVからのプレゼンデータ(${customerId})取得に失敗しました。ローカルファイルにフォールバックします:`, e);
    }
  }

  try {
    const filePath = path.join(LOCAL_PRESENTATION_DIR, `${customerId}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("ローカルプレゼンデータの読み込みエラー:", e);
  }
  return null;
}

/**
 * 顧客のプレゼンデータ（提案ボード）を保存します (Vercel KV または ローカル)
 */
export async function savePresentationData(customerId: string, clientName: string, data: any): Promise<boolean> {
  if (kv) {
    try {
      // 1. 各個別顧客データを保存
      await kv.set(`presentation:${customerId}`, data);
      
      // 2. 顧客IDリストの更新
      const list = await getPresentationList();
      const updatedList = list.filter((c: string) => c !== customerId);
      updatedList.unshift(customerId);
      await kv.set('presentation_list', updatedList);
      
      console.log(`Vercel KVへプレゼンデータ(${customerId})を保存しました`);
      return true;
    } catch (e) {
      console.error(`Vercel KVへのプレゼンデータ(${customerId})保存に失敗しました。ローカルファイルへの書き込みを行います:`, e);
    }
  }

  try {
    if (!fs.existsSync(LOCAL_PRESENTATION_DIR)) {
      fs.mkdirSync(LOCAL_PRESENTATION_DIR, { recursive: true });
    }
    const filePath = path.join(LOCAL_PRESENTATION_DIR, `${customerId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`ローカルJSONファイルへプレゼンデータ(${customerId})を保存しました`);
    return true;
  } catch (e) {
    console.error("ローカルプレゼンデータの保存エラー:", e);
    return false;
  }
}

/**
 * 顧客のプレゼンデータ一覧を取得します
 */
export async function getPresentationList(): Promise<string[]> {
  if (kv) {
    try {
      const data = await kv.get('presentation_list');
      if (data) {
        return typeof data === 'string' ? JSON.parse(data) : (Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Vercel KVからのプレゼン顧客IDリスト取得に失敗しました。ローカルディレクトリ走査にフォールバックします:", e);
    }
  }

  try {
    if (fs.existsSync(LOCAL_PRESENTATION_DIR)) {
      const files = fs.readdirSync(LOCAL_PRESENTATION_DIR);
      return files
        .filter(file => file.endsWith('.json') && file !== 'default.json')
        .map(file => file.replace('.json', ''));
    }
  } catch (e) {
    console.error("ローカルプレゼンリストの走査エラー:", e);
  }
  return [];
}

/**
 * 顧客のプレゼンデータ（提案ボード）を削除します
 */
export async function deletePresentationData(customerId: string): Promise<boolean> {
  if (kv) {
    try {
      // 1. 各個別顧客データを削除
      await kv.del(`presentation:${customerId}`);
      
      // 2. 顧客IDリストから削除
      const list = await getPresentationList();
      const updatedList = list.filter((c: string) => c !== customerId);
      await kv.set('presentation_list', updatedList);
      
      console.log(`Vercel KVからプレゼンデータ(${customerId})を削除しました`);
      return true;
    } catch (e) {
      console.error(`Vercel KVからのプレゼンデータ(${customerId})削除に失敗しました。ローカルファイルの削除を行います:`, e);
    }
  }

  try {
    const filePath = path.join(LOCAL_PRESENTATION_DIR, `${customerId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`ローカルJSONファイルからプレゼンデータ(${customerId})を削除しました`);
      return true;
    }
  } catch (e) {
    console.error("ローカルプレゼンデータの削除エラー:", e);
  }
  return false;
}

