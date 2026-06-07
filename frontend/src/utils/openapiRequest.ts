import type { AxiosRequestConfig } from 'axios';
import axios from './axios';

type OpenAPIRequestOptions = AxiosRequestConfig & {
	requestType?: string;
	[key: string]: any;
};

export default async function openapiRequest<T = any>(url: string, options: OpenAPIRequestOptions = {}): Promise<T> {
	const { requestType: _requestType, ...axiosOptions } = options;
	const res = await axios.request({
		url,
		...axiosOptions,
	});
	const body = res.data as any;
	if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
		return body.data as T;
	}
	return body as T;
}
