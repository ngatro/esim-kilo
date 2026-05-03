import { Metadata } from "next";
import EsimCountryClient from "./EsimCountryClient";
import fs from "fs";
import path from "path";

type Props = {
  params: Promise<{ country: string; lang: string }>; // Lưu ý: Nếu URL của bạn là [lang]
};

// Hàm đọc file JSON thủ công ở Server
async function getTranslationServer(locale: string, key: string, variables: Record<string, string>) {
  try {
    // Tìm đường dẫn đến thư mục messages
    const filePath = path.join(process.cwd(), "src/messages", `${locale}.json`);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const messages = JSON.parse(fileContent);

    // Lấy giá trị từ key (ví dụ: "metadata.title")
    const keys = key.split(".");
    let value = messages;
    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value !== "string") return key;

    // Thay thế biến {country}
    let finalString = value;
    Object.entries(variables).forEach(([k, v]) => {
      finalString = finalString.replace(`{${k}}`, v);
    });

    return finalString;
  } catch (error) {
    console.error("Translation Error:", error);
    return key;
  }
}

const formatCountryName = (slug: string) => {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, lang } = await params;
  const locale = lang || "en"; // Default về en nếu không tìm thấy
  
  const countryName = formatCountryName(country);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://owsim.com";

  // Gọi hàm dịch thủ công
  const title = await getTranslationServer(locale, "metadata.title", { country: countryName });
  const description = await getTranslationServer(locale, "metadata.description", { country: countryName });

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `${baseUrl}/${locale}/esim/${country}`,
      images: [`${baseUrl}/api/og?country=${country}`],
    },
  };
}



// // Hàm hỗ trợ format tên quốc gia từ slug (ví dụ: united-kingdom -> United Kingdom)
// const formatCountryName = (slug: string) => {
//   return slug
//     .split("-")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(" ");
// };

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const { country, locale } = await params;
  
//   // Gọi bản dịch từ namespace "metadata" trong file JSON của bạn
//   const t = await getTranslations({ locale, namespace: "metadata" });
  
//   const countryName = formatCountryName(country);
//   const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://owsim.com";
//   const pageUrl = `${baseUrl}/${locale}/esim/${country}`;

//   // Sử dụng biến {country} trong file JSON để truyền tên quốc gia vào
//   const title = t("title", { country: countryName });
//   const description = t("description", { country: countryName });

//   return {
//     title: title,
//     description: description,
//     alternates: {
//       canonical: pageUrl,
//       languages: {
//         en: `${baseUrl}/en/esim/${country}`,
//         vi: `${baseUrl}/vi/esim/${country}`,
//         fr: `${baseUrl}/fr/esim/${country}`,
//         de: `${baseUrl}/de/esim/${country}`,
//       },
//     },
//     openGraph: {
//       title: title,
//       description: description,
//       url: pageUrl,
//       siteName: "OpenWorld eSIM",
//       type: "website",
//       images: [
//         {
//           url: `${baseUrl}/api/og?country=${country}`, // Route tạo ảnh preview tự động
//           width: 1200,
//           height: 630,
//           alt: `eSIM ${countryName}`,
//         },
//       ],
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: title,
//       description: description,
//       images: [`${baseUrl}/api/og?country=${country}`],
//     },
//     robots: {
//       index: true,
//       follow: true,
//     },
//   };
// }

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const { country, lang } = resolvedParams;
  const countryName = formatCountryName(country);

  // Structured Data (JSON-LD) giúp Google hiện Rich Snippets (Giá, Sản phẩm)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `eSIM ${countryName} - OpenWorld`,
    "description": `Digital eSIM card for travelers in ${countryName}. High-speed 4G/5G data.`,
    "brand": {
      "@type": "Brand",
      "name": "OpenWorld eSIM"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "4.50",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Truyền params vào Client Component để xử lý logic filter và hiển thị */}
      <EsimCountryClient params={Promise.resolve(resolvedParams)} />
    </>
  );
}