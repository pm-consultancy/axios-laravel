import { type AxiosResponse, AxiosStatic, HttpStatusCode, type InternalAxiosRequestConfig } from 'axios'
import { camelizeKeys, decamelizeKeys } from "humps";
import retry from "axios-retry-after"
import { useRouter } from "vue-router";
import { ValidationError } from "./validationError";


interface LaravelOptionsInterface {
  baseURL: string;
  withRetry?: boolean;
  loginUrlName?: string;
  logErrors?: boolean;
}



export const laravelApi = (axios: AxiosStatic, options: LaravelOptionsInterface) => {
  const client = axios.create({
    baseURL: options.baseURL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json"
    }
  })


  const authInterceptor = (config: InternalAxiosRequestConfig) => {
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      return config
    }
    if (config.params !== undefined && config.params !== null) {
      config.params = decamelizeKeys(config.params)
    }

    if (config.data !== undefined && config.data !== null) {
      config.data = decamelizeKeys(config.data)
    }

    return config
  }

  client.interceptors.request.use(authInterceptor)
  if( options.withRetry ?? false ){
    client.interceptors.response.use(null, retry(client, {
      wait (error) {
        return new Promise(
          // Use X-Retry-After rather than Retry-After
          resolve => setTimeout(resolve, error.response.headers['retry-after'] * 1000),
        )
      },
    }))
  }



  function basicErrorHandling (error: any) {
    const router = useRouter();

    if (options.logErrors ?? false) {
       console.log(error)
    }
    const { status, data } = error.response

    if (status === HttpStatusCode.TooManyRequests) {
      return
    }

    if (status >= HttpStatusCode.InternalServerError) { /* empty */ }

    if (status === HttpStatusCode.UnprocessableEntity) {
      if (data.errors !== undefined) {
        return Promise.reject(new ValidationError(data.errors))
      }
      return Promise.reject(data)
    }
    if (status === HttpStatusCode.Unauthorized && options.loginUrlName !== undefined) {
      return Promise.resolve(router.push({ name: options.loginUrlName }))
    }
    return Promise.reject(error)
  }

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      if (response.data !== undefined && response.headers['content-type'] === 'application/json') {
        response.data = camelizeKeys(response.data)
      }

      return response
    },
    basicErrorHandling)

  return client
}
