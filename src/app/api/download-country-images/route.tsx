import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const maxDuration = 300; // Cho phép chạy tối đa 5 phút (Chỉ có tác dụng trên Vercel/Server)

export async function POST() {
  try {
    // DANH SÁCH MÃ ISO (Dán toàn bộ cái list 200 mã vào đây)
    const isos = ['asia', 'europe', 'global', 'vn', 'jp', 'kr', 'us', 'th', 'sg', 'cn', 'hk', 'tw', 'gb', 'fr', 'de', 'it', 'es', 'au', 'ca', 'my', 'id', 'ph', 'in', 'tr', 'ae', 'ch', 'nl', 'se', 'no', 'dk', 'fi', 'at', 'be', 'pt', 'gr', 'ru', 'br', 'mx', 'nz', 'kh', 'la', 'mm', 'af', 'al', 'dz', 'as', 'ad', 'ao', 'ai', 'aq', 'ag', 'ar', 'am', 'aw', 'az', 'bs', 'bh', 'bd', 'bb', 'by', 'bz', 'bj', 'bm', 'bt', 'bo', 'ba', 'bw', 'bv', 'io', 'bn', 'bg', 'bf', 'bi', 'cv', 'ky', 'cf', 'td', 'cl', 'cx', 'cc', 'co', 'km', 'cg', 'cd', 'ck', 'cr', 'ci', 'hr', 'cu', 'cw', 'cy', 'cz', 'dj', 'dm', 'do', 'ec', 'eg', 'sv', 'gq', 'er', 'ee', 'sz', 'et', 'fk', 'fo', 'fj', 'gf', 'pf', 'tf', 'ga', 'gm', 'ge', 'gh', 'gi', 'gl', 'gd', 'gp', 'gu', 'gt', 'gg', 'gn', 'gw', 'gy', 'ht', 'hm', 'va', 'hn', 'hu', 'is', 'ir', 'iq', 'ie', 'im', 'il', 'jm', 'je', 'jo', 'kz', 'ke', 'ki', 'kp', 'kw', 'kg', 'lv', 'lb', 'ls', 'lr', 'ly', 'li', 'lt', 'lu', 'mo', 'mg', 'mw', 'mv', 'ml', 'mt', 'mh', 'mq', 'mr', 'mu', 'yt', 'fm', 'md', 'mc', 'mn', 'me', 'ms', 'ma', 'mz', 'na', 'nr', 'np', 'nc', 'ni', 'ne', 'ng', 'nu', 'nf', 'mk', 'mp', 'om', 'pk', 'pw', 'ps', 'pa', 'pg', 'py', 'pe', 'pn', 'pl', 'pr', 'qa', 're', 'ro', 'rw', 'bl', 'sh', 'kn', 'lc', 'mf', 'pm', 'vc', 'ws', 'sm', 'st', 'sa', 'sn', 'rs', 'sc', 'sl', 'sk', 'si', 'sb', 'so', 'za', 'gs', 'ss', 'lk', 'sd', 'sr', 'sj', 'sy', 'tj', 'tz', 'tg', 'tk', 'to', 'tt', 'tn', 'tm', 'tc', 'tv', 'ug', 'ua', 'uy', 'uz', 'vu', 've', 'vg', 'vi', 'wf', 'eh', 'ye', 'zm', 'zw'];

    const folderPath = path.join(process.cwd(), 'public', 'images', 'countries');
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    let success = 0;

    for (const iso of isos) {
      const filePath = path.join(folderPath, `${iso}.jpg`);
      if (fs.existsSync(filePath)) continue;

      try {
        // Dùng LoremFlickr cho lành
        const response = await fetch(`https://loremflickr.com/800/600/${iso},landscape/all`, {
           signal: AbortSignal.timeout(10000) // Timeout 10s mỗi ảnh cho chắc
        });
        
        if (response.ok) {
          const buffer = Buffer.from(await response.arrayBuffer());
          fs.writeFileSync(filePath, buffer);
          success++;
        }
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : 'Unknown error';
        console.error(`Lỗi tải ${iso}:`, errMsg);
      }
    }

    return NextResponse.json({ status: "Xong", downloaded: success });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}