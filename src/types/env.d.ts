/// <reference types="next" />
/// <reference types="next/image-types/global" />

// Material-UI augmentation
import '@mui/material/styles';
import { Theme as MuiTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme extends MuiTheme {
    status: {
      danger: string;
    };
  }
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

// Tailwind CSS augmentation
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Image declarations
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

// Additional environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_MQTT_URL: string;
    [key: string]: string | undefined;
  }
}