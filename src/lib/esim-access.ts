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
  qrcode: string;
  qrcodeUrl: string;
  activationCode: string;
  packageName: string;
  price: number;
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

async function esimAccessPost(endpoint: string, body: Record<string, unknown> = {}): Promise<EsimAccessResponse> {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`[eSIM API] POST ${url}`, JSON.stringify(body));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "RT-AccessKey": getAccessCode(),
      "RT-SecretKey": getSecretKey(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[eSIM API] Error ${res.status}: ${text}`);
    throw new Error(`eSIM Access API: ${res.status} ${text}`);
  }

  const data = await res.json();
  console.log(`[eSIM API] Response:`, JSON.stringify(data).slice(0, 500));
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
  return {
    packageList: obj.packageList || [],
    total: obj.total || 0,
  };
}

export async function createOrder(params: {
  packageCode: string;
  count?: number;
  orderId?: string;
}): Promise<OrderObj> {
  const transactionId = `OW-${params.orderId || Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const res = await esimAccessPost("/esim/order", {
    transactionId,
    packageCode: params.packageCode,
    count: params.count || 1,
  });

  if (!res.success || !res.obj) {
    throw new Error(res.message || "eSIM order creation failed");
  }

  return res.obj as OrderObj;
}

export async function queryOrder(orderNo: string): Promise<OrderObj> {
  const res = await esimAccessPost("/esim/order/query", { orderNo });
  if (!res.success || !res.obj) throw new Error(res.message || "Failed");
  return res.obj as OrderObj;
}

export async function refundOrder(orderNo: string): Promise<boolean> {
  const res = await esimAccessPost("/esim/order/refund", { orderNo });
  return res.success;
}

export type { EsimPackage, OrderObj, BalanceObj, LocationNetwork, PackageListObj };