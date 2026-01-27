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

        // Scan and replace that color with transparent
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const thisColor = this.getPixelColor(x, y);
            // Simple distance check could be added, but exacting matching is safer for pixel art
            // if we prompted for solid background.
            // Let's allow a tiny bit of variance for jpeg artifacts if any, though PNG is lossless.

            if (thisColor === bgColor) {
                this.bitmap.data[idx + 0] = 0;
                this.bitmap.data[idx + 1] = 0;
                this.bitmap.data[idx + 2] = 0;
                this.bitmap.data[idx + 3] = 0; // Alpha 0
            }
        });

        await image.write(fullPath);
        console.log(`Saved transparent: ${filename}`);
    } catch (err) {
        console.error(`Error processing ${filename}:`, err);
    }
}

const files = process.argv.slice(2);
files.forEach(f => processImage(f));
