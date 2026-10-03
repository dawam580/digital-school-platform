/// <reference types="vite/client" />

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module 'jsqr';


/** إصدار المنظومة من package.json (يُحقن وقت البناء) */
declare const __APP_VERSION__: string;
