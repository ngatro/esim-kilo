const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImages() {
    // Tự động tìm đường dẫn tuyệt đối
    const inputFolder = path.join(process.cwd(), 'public', 'images', 'countries');
    const outputFolder = path.join(process.cwd(), 'public', 'images', 'countries_new');

    console.log(`--- KIỂM TRA ĐƯỜNG DẪN ---`);
    console.log(`Thư mục gốc: ${inputFolder}`);

    if (!fs.existsSync(inputFolder)) {
        console.error(`❌ LỖI: Không tìm thấy thư mục: ${inputFolder}`);
        console.log(`👉 Nhắc Dev check lại xem folder 'public' nằm ở đâu!`);
        return;
    }

    const files = fs.readdirSync(inputFolder).filter(f => 
        f.toLowerCase().endsWith('.jpg') || 
        f.toLowerCase().endsWith('.jpeg') || 
        f.toLowerCase().endsWith('.png')
    );

    if (files.length === 0) {
        console.warn(`⚠️ CẢNH BÁO: Thư mục trống hoặc không có file ảnh (.jpg, .png)`);
        return;
    }

    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
    }

    console.log(`🚀 Tìm thấy ${files.length} ảnh. Bắt đầu nén...`);

    // Danh sách ISO của ông (đảm bảo đúng thứ tự với file trong folder)
    const isoList = ['asia', 'europe', 'global', 'vn', 'jp', 'kr', 'us', 'th', 'sg', 'cn', 'hk', 'tw', 'gb', 'fr', 'de', 'it', 'es', 'au', 'ca', 'my', 'id', 'ph', 'in', 'tr', 'ae', 'ch', 'nl', 'se', 'no', 'dk', 'fi', 'at', 'be', 'pt', 'gr', 'ru', 'br', 'mx', 'nz', 'kh', 'la', 'mm'];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const oldPath = path.join(inputFolder, file);
        
        // Ưu tiên lấy tên từ isoList, nếu hết list thì lấy tên cũ đổi đuôi .webp
        const nameWithoutExt = isoList[i] ? isoList[i] : path.parse(file).name;
        const newName = `${nameWithoutExt.toLowerCase()}.webp`;
        const newPath = path.join(outputFolder, newName);

        try {
            await sharp(oldPath)
                .resize(800, 600, { fit: 'cover' })
                .webp({ quality: 75 })
                .toFile(newPath);
            
            console.log(`✅ [${i+1}/${files.length}] Đã nén: ${file} -> ${newName}`);
        } catch (err) {
            console.error(`❌ Lỗi tại file ${file}:`, err.message);
        }
    }

    console.log(`\n--- HOÀN THÀNH ---`);
    console.log(`👉 Ảnh mới nằm tại: ${outputFolder}`);
}

optimizeImages();