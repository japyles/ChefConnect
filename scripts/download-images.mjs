import { writeFile } from 'fs/promises';
import { join } from 'path';

const images = [
  {
    name: 'soba.jpg',
    url: 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=800',
  },
  {
    name: 'salad.jpg',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
  },
  {
    name: 'dijonaise.jpg',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  },
  {
    name: 'pasta.jpg',
    url: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800',
  },
  {
    name: 'seafood.jpg',
    url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800',
  },
];

async function downloadImage(url, path) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  await writeFile(path, Buffer.from(buffer));
  console.log(`Downloaded ${path}`);
}

async function main() {
  for (const image of images) {
    const path = join(process.cwd(), 'public', 'images', 'recipes', image.name);
    await downloadImage(image.url, path);
  }
}

main().catch(console.error);
