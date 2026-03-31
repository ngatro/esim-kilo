const BASE_URL = "https://api.esimaccess.com/api/v1/open";

interface EsimAccessResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

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

interface EsimOrderResponse {
  orderNo: string;
  orderStatus: string;
  iccid: string;
  qrcode: string;
  qrcodeUrl: string;
  activationCode: string;
  packageName: string;
  price: number;
}

interface EsimBalanceResponse {
  balance: number;
  currency: string;
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

async function esimAccessRequest<T>(
  endpoint: string,
  body: Record<string, unknown> = {}
): Promise<EsimAccessResponse<T>> {
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

  return res.json() as Promise<EsimAccessResponse<T>>;
}

export async function getBalance(): Promise<EsimBalanceResponse> {
  const res = await esimAccessRequest<EsimBalanceResponse>("/balance/query");
  if (!res.success || !res.data) throw new Error(res.message || "Failed");
  return res.data;
}

export async function getPackageList(params: {
  locationCode?: string;
  type?: "BASE" | "TOPUP";
  dataType?: string;
  slug?: string;
  iccid?: string;
  page?: number;
  size?: number;
}): Promise<{ packages: EsimPackage[]; total: number }> {
  const body: Record<string, unknown> = {
    type: params.type || "BASE",
    page: params.page || 1,
    size: params.size || 100,
  };
  if (params.locationCode) body.locationCode = params.locationCode;
  if (params.dataType) body.dataType = params.dataType;
  if (params.slug) body.slug = params.slug;
  if (params.iccid) body.iccid = params.iccid;

  const res = await esimAccessRequest<{
    packageList: EsimPackage[];
    total: number;
  }>("/package/list", body);

  if (!res.success || !res.data) throw new Error(res.message || "Failed");

  return {
    packages: res.data.packageList || [],
    total: res.data.total || 0,
  };
}

export async function createOrder(params: {
  packageCode: string;
  count?: number;
}): Promise<EsimOrderResponse> {
  const res = await esimAccessRequest<EsimOrderResponse>("/order/create", {
    packageCode: params.packageCode,
    count: params.count || 1,
  });
  if (!res.success || !res.data) throw new Error(res.message || "Failed");
  return res.data;
}

export async function queryOrder(orderNo: string): Promise<EsimOrderResponse> {
  const res = await esimAccessRequest<EsimOrderResponse>("/order/query", {
    orderNo,
  });
  if (!res.success || !res.data) throw new Error(res.message || "Failed");
  return res.data;
}

export async function refundOrder(orderNo: string): Promise<boolean> {
  const res = await esimAccessRequest("/order/refund", { orderNo });
  return res.success;
}

export type { EsimPackage, EsimOrderResponse, EsimBalanceResponse, LocationNetwork };