// @BACKEND: Replace this entire file with a real fetch/axios-based API client.
// Expected contract:
//   - BASE_URL will come from env (NEXT_PUBLIC_API_URL)
//   - All methods should return parsed JSON, throw on non-2xx
//   - POST/PUT should accept body as JSON and set Content-Type: application/json
//   - For file uploads, a separate `upload` method may be needed (FormData, no JSON header)

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiClient = {
  // @BACKEND: Replace mock with real fetch — return `response.json()`, handle errors
  async get<T>(url: string, init?: RequestInit): Promise<T> {
    await new Promise(res => setTimeout(res, 500));
    console.log(`[GET] ${BASE_URL}${url}`);
    return {} as T;
  },

  // @BACKEND: Replace mock with real fetch — POST with JSON body
  async post<T>(url: string, body: any, init?: RequestInit): Promise<T> {
    await new Promise(res => setTimeout(res, 500));
    console.log(`[POST] ${BASE_URL}${url}`, body);
    return body as T;
  },

  // @BACKEND: Replace mock with real fetch — PUT with JSON body
  async put<T>(url: string, body: any, init?: RequestInit): Promise<T> {
    await new Promise(res => setTimeout(res, 500));
    console.log(`[PUT] ${BASE_URL}${url}`, body);
    return body as T;
  },

  // @BACKEND: Replace mock with real fetch — DELETE with optional body
  async delete<T>(url: string, init?: RequestInit): Promise<T> {
    await new Promise(res => setTimeout(res, 500));
    console.log(`[DELETE] ${BASE_URL}${url}`);
    return {} as T;
  }
};
