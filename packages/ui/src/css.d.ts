/// <reference types="vite/client" />

// Универсальное объявление для CSS импортов
// Покрывает и side-effect импорты, и CSS modules
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

// Изображения и ассеты
declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}
