/// Объявление модулей для CSS импортов
declare module "*.css" {
  const content: string;
  export default content;
}

// Объявление для side-effect импортов (импорт без использования экспорта)
declare module "*.css" {
  const content: any;
  export default content;
}

// Объявление для изображений и других ассетов (на будущее)
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
