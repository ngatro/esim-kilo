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

interface PackageListResponse {
  success: boolean;
  message?: string;
  packageList: EsimPackage[];
  total: number;
}

interface BalanceResponse {
  success: boolean;
  message?: string;
  balance: number;
  currency: string;
}

interface OrderResponse {
  success: boolean;
  message?: string;
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

async function esimAccessPost<T>(endpoint: string, body: Record<string, unknown> = {}): Promise<T> {
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

  const data = await res.json();
  return data as T;
}

export async function getBalance(): Promise<BalanceResponse> {
  return esimAccessPost<BalanceResponse>("/balance/query");
}

export async function getPackageList(params: {
  locationCode?: string;
  type?: "BASE" | "TOPUP";
  slug?: string;
  packageCode?: string;
  iccid?: string;
}): Promise<PackageListResponse> {
  const body: Record<string, unknown> = {};
  if (params.locationCode) body.locationCode = params.locationCode;
  if (params.type) body.type = params.type;
  if (params.slug) body.slug = params.slug;
  if (params.packageCode) body.packageCode = params.packageCode;
  if (params.iccid) body.iccid = params.iccid;

  return esimAccessPost<PackageListResponse>("/package/list", body);
}

export async function createOrder(params: {
  packageCode: string;
  count?: number;
}): Promise<OrderResponse> {
  return esimAccessPost<OrderResponse>("/order/create", {
    packageCode: params.packageCode,
    count: params.count || 1,
  });
}

export async function queryOrder(orderNo: string): Promise<OrderResponse> {
  return esimAccessPost<OrderResponse>("/order/query", { orderNo });
}

export async function refundOrder(orderNo: string): Promise<{ success: boolean; message?: string }> {
  return esimAccessPost("/order/refund", { orderNo });
}

export type { EsimPackage, OrderResponse, BalanceResponse, LocationNetwork, PackageListResponse };