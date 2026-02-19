// Type declarations for image imports
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

// Specific Leaflet image declarations
declare module 'leaflet/dist/images/marker-icon.png' {
  const value: string;
  export default value;
}

declare module 'leaflet/dist/images/marker-shadow.png' {
  const value: string;
  export default value;
}

declare module 'leaflet/dist/images/marker-icon-2x.png' {
  const value: string;
  export default value;
}
