declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '@env' {
  export const AI_API_KEY: string;
  export const SUPABASE_URL: string; 
  export const SUPABASE_REF: string; 
  export const SUPABASE_ANON_KEY: string;
  export const SUPABASE_EDGE_FUNCTION_PERPLEXITY: string; 
  export const SUPABASE_WEB_CLIENT_ID: string;
  export const SUPABASE_IOS_CLIENT_ID: string;
}
