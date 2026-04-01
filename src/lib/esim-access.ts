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
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "RT-AccessCode": getAccessCode(),
      "RT-SecretKey": getSecretKey(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`eSIM Access API: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<EsimAccessResponse>;
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
}): Promise<OrderObj> {
  const res = await esimAccessPost("/order/create", {
    packageCode: params.packageCode,
    count: params.count || 1,
  });
  if (!res.success || !res.obj) throw new Error(res.message || "Failed");
  return res.obj as OrderObj;
}

export async function queryOrder(orderNo: string): Promise<OrderObj> {
  const res = await esimAccessPost("/order/query", { orderNo });
  if (!res.success || !res.obj) throw new Error(res.message || "Failed");
  return res.obj as OrderObj;
}

export async function refundOrder(orderNo: string): Promise<boolean> {
  const res = await esimAccessPost("/order/refund", { orderNo });
  return res.success;
}

export type { EsimPackage, OrderObj, BalanceObj, LocationNetwork, PackageListObj };