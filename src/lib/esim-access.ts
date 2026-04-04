import HmacSHA256 from "crypto-js/hmac-sha256";
import Hex from "crypto-js/enc-hex";
import { v4 as uuidv4 } from "uuid";

const BASE_URL = "https://api.esimaccess.com/api/v1/open";

interface LocationNetwork {
  locationCode: string;
  locationLogo: string;
  locationName: string;
  operatorList: {
    networkType: string;
    operatorName: string;
  }[];
}

interface EsimPackage {
  name: string;
  slug: string;
  price: number;
  speed: string;
  volume: number;
  dataType: number;
  duration: number;
  favorite: boolean;
  ipExport: string;
  location: string;
  fupPolicy: string;
  smsStatus: number;
  activeType: number;
  description: string;
  packageCode: string;
  retailPrice: number;
  currencyCode: string;
  durationUnit: string;
  locationCode: string;
  unusedValidTime: number;
  supportTopUpType: number;
  locationNetworkList: LocationNetwork[];
}

interface EsimAccessResponse {
  success: boolean;
  message?: string;
  obj?: unknown;
}

interface PackageListObj {
  packageList: EsimPackage[];
  total: number;
}

interface BalanceObj {
  balance: number;
  currency: string;
}

interface OrderObj {
  orderNo: string;
  orderStatus: string;
  iccid: string;
  eid?: string;
  tranNo?: string;
  qrcode: string;
  qrCode?: string;
  qrcodeUrl?: string;
  qrCodeUrl?: string;
  lpaString?: string;
  ac?: string;
  activationCode: string;
  packageName: string;
  price: number;
  esimStatus?: string;
  orderUsage?: number;
  totalVolume?: number;
  smdpStatus?: string;
}

interface EsimListItem {
  orderNo?: string;
  orderStatus?: string;
  iccid?: string;
  eid?: string;
  esimTranNo?: string;
  tranNo?: string;
  qrCode?: string;
  qrCodeUrl?: string;
  qrcodeUrl?: string;
  lpaString?: string;
  ac?: string;
  activationCode?: string;
  smdpAddress?: string;
  smdpStatus?: string;
  totalVolume?: number;
  orderUsage?: number;
  esimStatus?: string;
}

function getAccessCode(): string {
  const code = process.env.ESIM_ACCESS_ACCESS_CODE;
  if (!code) throw new Error("ESIM_ACCESS_ACCESS_CODE not set");
  return code;
}

function getSecretKey(): string {
  const key = process.env.ESIM_ACCESS_SECRET_KEY;
  if (!key) throw new Error("ESIM_ACCESS_SECRET_KEY not set");
  return key;
}

// Generate HMAC-SHA256 signature
// signData = Timestamp + RequestID + AccessCode + JSON.stringify(RequestBody)
// signature = HMAC-SHA256(signData, SecretKey) as HexString
function generateSignature(timestamp: string, requestId: string, accessCode: string, body: string): string {
  const secretKey = getSecretKey();
  const signData = timestamp + requestId + accessCode + body;
  return HmacSHA256(signData, secretKey).toString(Hex);
}

async function esimAccessPost(endpoint: string, body: Record<string, unknown> = {}): Promise<EsimAccessResponse> {
  const url = `${BASE_URL}${endpoint}`;
  const accessCode = getAccessCode();
  const timestamp = Date.now().toString();
  const requestId = uuidv4();
  const bodyStr = JSON.stringify(body).replace(/\s+/g, "");

  // Generate HMAC-SHA256 signature
  const signature = generateSignature(timestamp, requestId, accessCode, bodyStr);

  console.log(`[eSIM API] POST ${url}`);
  console.log(`[eSIM API] Headers: RT-AccessCode=${accessCode.slice(0, 8)}..., RT-Timestamp=${timestamp}, RT-RequestID=${requestId}`);
  console.log(`[eSIM API] Body: ${bodyStr.slice(0, 200)}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "RT-AccessCode": accessCode,
      "RT-Timestamp": timestamp,
      "RT-RequestID": requestId,
      "RT-Signature": signature,
    },
    body: bodyStr,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[eSIM API] Error ${res.status}: ${text}`);
    throw new Error(`eSIM Access API: ${res.status} ${text}`);
  }

  const data = await res.json();
  console.log(`[eSIM API] Response: success=${data.success}`);
  return data as EsimAccessResponse;
}

export async function getBalance(): Promise<BalanceObj> {
  const res = await esimAccessPost("/balance/query");
  if (!res.success || !res.obj) throw new Error(res.message || "Failed");
  return res.obj as BalanceObj;
}

export async function getPackageList(params: {
  locationCode?: string;
  type?: "BASE" | "TOPUP";
  slug?: string;
  packageCode?: string;
  iccid?: string;
}): Promise<PackageListObj> {
  const body: Record<string, unknown> = {};
  if (params.locationCode) body.locationCode = params.locationCode;
  if (params.type) body.type = params.type;
  if (params.slug) body.slug = params.slug;
  if (params.packageCode) body.packageCode = params.packageCode;
  if (params.iccid) body.iccid = params.iccid;

  const res = await esimAccessPost("/package/list", body);
  if (!res.success || !res.obj) throw new Error(res.message || "Failed");

  const obj = res.obj as PackageListObj;
  return { packageList: obj.packageList || [], total: obj.total || 0 };
}

export async function createOrder(params: {
  packageCode: string;
  count?: number;
  orderId?: string;
  iccid?: string;
}): Promise<EsimListItem> {
  const transactionId = `OW-${params.orderId || Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const body: Record<string, unknown> = {
    transactionId,
    packageInfoList: [
      { packageCode: params.packageCode, count: params.count || 1 }
    ],
  };

  if (params.iccid) {
    body.iccid = params.iccid;
  }

  const res = await esimAccessPost("/esim/order", body);

  if (!res.success || !res.obj) {
    throw new Error(res.message || "eSIM order creation failed");
  }

  const obj = res.obj as { esimList?: EsimListItem[]; orderNo?: string };
  const orderNo = obj.orderNo;
  
  if (obj.esimList && obj.esimList.length > 0) {
    const firstItem = obj.esimList[0];
    return {
      ...firstItem,
      esimTranNo: firstItem.esimTranNo || firstItem.tranNo || orderNo || undefined,
    };
  }

  const directObj = res.obj as EsimListItem;
  if (directObj.iccid && (directObj.qrCodeUrl || directObj.qrCode)) {
    return {
      ...directObj,
      esimTranNo: directObj.esimTranNo || directObj.tranNo || orderNo || undefined,
    };
  }

  if (!orderNo) {
    throw new Error("No eSIM data in response");
  }

  await new Promise(r => setTimeout(r, 2000));
  
  console.log("[createOrder] No QR in initial response, querying for orderNo:", orderNo);
  return await queryOrder(orderNo);
}

export async function queryOrder(orderNo: string): Promise<EsimListItem> {
  console.log("[queryOrder] Calling with orderNo:", orderNo);
  const res = await esimAccessPost("/esim/query", { 
    orderNo,
    pager: { page: 1, pageSize: 10 }
  });
  console.log("[queryOrder] Response success:", res.success, "obj keys:", Object.keys(res.obj || {}));
  
  if (!res.success || !res.obj) throw new Error(res.message || "Failed");
  
  const obj = res.obj as { esimList?: EsimListItem[] };
  console.log("[queryOrder] esimList:", obj.esimList ? "present (" + obj.esimList.length + " items)" : "missing");
  
  if (obj.esimList && obj.esimList.length > 0) {
    const first = obj.esimList[0];
    console.log("[queryOrder] First item - iccid:", first.iccid, "qrCodeUrl:", first.qrCodeUrl ? "present" : "missing", "ac:", first.ac ? "present" : "missing");
    return {
      ...first,
      esimTranNo: first.esimTranNo || first.tranNo || orderNo || undefined,
    };
  }
  
  return res.obj as EsimListItem;
}

export async function queryEsimUsage(iccid: string): Promise<{ esimStatus: string; orderUsage: number; totalVolume?: number; smdpStatus?: string }> {
  const res = await esimAccessPost("/esim/query", { 
    iccid,
    pager: { page: 1, pageSize: 10 }
  });
  if (!res.success || !res.obj) throw new Error(res.message || "Failed");
  const obj = res.obj as { esimStatus?: string; orderUsage?: number; totalVolume?: number; smdpStatus?: string };
  return {
    esimStatus: obj.esimStatus || "UNKNOWN",
    orderUsage: obj.orderUsage || 0,
    totalVolume: obj.totalVolume,
    smdpStatus: obj.smdpStatus,
  };
}

export async function cancelOrder(tranNo: string): Promise<boolean> {
  const res = await esimAccessPost("/esim/cancel", { esimTranNo: tranNo });
  return res.success;
}

export async function refundOrder(orderNo: string): Promise<boolean> {
  const res = await esimAccessPost("/esim/order/refund", { orderNo });
  return res.success;
}

export type { EsimPackage, OrderObj, BalanceObj, LocationNetwork, PackageListObj, EsimListItem };