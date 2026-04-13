export interface Pixel {
  id: string;
  user_id: string;
  name: string;
  pixel_id: string;
  capi_token: string;
  webhook_token: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePixelInput {
  name: string;
  pixel_id: string;
  capi_token: string;
}

export interface UpdatePixelInput {
  name?: string;
  capi_token?: string;
}
