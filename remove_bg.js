import { Jimp } from 'jimp';
import path from 'path';
import fs from 'fs';

async function processImage(filename) {
    try {
        const fullPath = path.resolve(filename);
        console.log(`Processing: ${fullPath}`);

        const image = await Jimp.read(fullPath);

        // Get the top-left pixel color to use as key
        const bgColor = image.getPixelColor(0, 0);
        const rBg = (bgColor >> 24) & 0xFF;
        const gBg = (bgColor >> 16) & 0xFF;
        const bBg = (bgColor >> 8) & 0xFF;

        // Scan and replace that color with transparent
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const thisColor = this.getPixelColor(x, y);
            const r = (thisColor >> 24) & 0xFF;
            const g = (thisColor >> 16) & 0xFF;
            const b = (thisColor >> 8) & 0xFF;

            // Simple distance check
            const dist = Math.sqrt(Math.pow(r - rBg, 2) + Math.pow(g - gBg, 2) + Math.pow(b - bBg, 2));

            if (dist < 30) { // Tolerance for JPG artifacts
                this.bitmap.data[idx + 0] = 0;
                this.bitmap.data[idx + 1] = 0;
                this.bitmap.data[idx + 2] = 0;
                this.bitmap.data[idx + 3] = 0; // Alpha 0
            }
        });

        // Determine output path (force .png)
        let outPath = fullPath;
        if (fullPath.toLowerCase().endsWith('.jpg') || fullPath.toLowerCase().endsWith('.jpeg')) {
            const ext = path.extname(fullPath);
            const base = path.basename(fullPath, ext);
            outPath = path.join(path.dirname(fullPath), `${base}_pixel.png`);
        }

        await image.write(outPath);
        console.log(`Saved transparent: ${outPath}`);
    } catch (err) {
        console.error(`Error processing ${filename}:`, err);
    }
}

const files = process.argv.slice(2);
files.forEach(f => processImage(f));
