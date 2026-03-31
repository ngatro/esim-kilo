const BASE_URL = "https://api.esimaccess.com/api/v1/open";

interface EsimAccessResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

interface EsimPackage {
  packageCode: string;
  packageName: string;
  price: number;
  currency: string;
  dataVolume: number;
  unlimitedData: boolean;
  durationDay: number;
  dayUnit: string;
  smsStatus: number;
  voiceStatus: number;
  networkType: string;
  speedDesc: string;
  locationName: string;
  locationFlag: string;
  coverageCountryList: {
    countryName: string;
    countryCode: string;
    countryFlag: string;
  }[];
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

interface EsimOrderQuery {
  orderNo: string;
  orderStatus: string;
  packageName: string;
  price: number;
  iccid: string;
  qrcode: string;
  qrcodeUrl: string;
  activationCode: string;
  createTime: string;
}

interface EsimBalanceResponse {
  balance: number;
  currency: string;
}

function getAccessCode(): string {
  const code = process.env.ESIM_ACCESS_ACCESS_CODE;
  if (!code) {
    throw new Error("ESIM_ACCESS_ACCESS_CODE not set");
  }
  return code;
}

function getSecretKey(): string {
  const key = process.env.ESIM_ACCESS_SECRET_KEY;
  if (!key) {
    throw new Error("ESIM_ACCESS_SECRET_KEY not set");
  }
  return key;
}

async function esimAccessRequest<T>(
  endpoint: string,
  body: Record<string, unknown> = {}
): Promise<EsimAccessResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "RT-AccessCode": getAccessCode(),
      "RT-SecretKey": getSecretKey(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`eSIM Access API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data as EsimAccessResponse<T>;
}

export async function getBalance(): Promise<EsimBalanceResponse> {
  const res = await esimAccessRequest<EsimBalanceResponse>("/balance/query");
  if (!res.success || !res.data) {
    throw new Error(res.message || "Failed to get balance");
  }
  return res.data;
}

export async function getPackageList(params: {
  locationCode?: string;
  packageName?: string;
  page?: number;
  size?: number;
}): Promise<{ packages: EsimPackage[]; total: number }> {
  const res = await esimAccessRequest<{
    packageList: EsimPackage[];
    total: number;
  }>("/package/list", {
    locationCode: params.locationCode || "",
    packageName: params.packageName || "",
    page: params.page || 1,
    size: params.size || 50,
  });

  if (!res.success || !res.data) {
    throw new Error(res.message || "Failed to get packages");
  }

  return {
    packages: res.data.packageList || [],
    total: res.data.total || 0,
  };
}

export async function getPackageByCode(packageCode: string): Promise<EsimPackage> {
  const res = await esimAccessRequest<{ package: EsimPackage }>("/package/query", {
    packageCode,
  });

  if (!res.success || !res.data) {
    throw new Error(res.message || "Failed to get package");
  }

  return res.data.package;
}

export async function createOrder(params: {
  packageCode: string;
  count?: number;
}): Promise<EsimOrderResponse> {
  const res = await esimAccessRequest<EsimOrderResponse>("/order/create", {
    packageCode: params.packageCode,
    count: params.count || 1,
  });

  if (!res.success || !res.data) {
    throw new Error(res.message || "Failed to create order");
  }

  return res.data;
}

export async function queryOrder(orderNo: string): Promise<EsimOrderQuery> {
  const res = await esimAccessRequest<EsimOrderQuery>("/order/query", {
    orderNo,
  });

  if (!res.success || !res.data) {
    throw new Error(res.message || "Failed to query order");
  }

  return res.data;
}

export async function refundOrder(orderNo: string): Promise<{ success: boolean }> {
  const res = await esimAccessRequest("/order/refund", {
    orderNo,
  });

  return { success: res.success };
}

export async function topUpOrder(params: {
  iccid: string;
  packageCode: string;
}): Promise<{ success: boolean; orderNo: string }> {
  const res = await esimAccessRequest<{ orderNo: string }>("/order/topup", {
    iccid: params.iccid,
    packageCode: params.packageCode,
  });

  if (!res.success || !res.data) {
    throw new Error(res.message || "Failed to top up");
  }

  return { success: res.success, orderNo: res.data.orderNo };
}

export async function getOrderByIccid(iccid: string): Promise<EsimOrderQuery> {
  const res = await esimAccessRequest<EsimOrderQuery>("/order/query", {
    iccid,
  });

  if (!res.success || !res.data) {
    throw new Error(res.message || "Failed to query order");
  }

  return res.data;
}

export type { EsimPackage, EsimOrderResponse, EsimOrderQuery, EsimBalanceResponse };