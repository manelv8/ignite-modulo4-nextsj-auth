import axios, { AxiosError } from 'axios';
import {destroyCookie, parseCookies, setCookie} from 'nookies'
import Router from "next/router";
import { AuthTokenError } from './erros/AuthTokenError';

let isRefreshing = false;
let failedRequestsQueue = []

export function signOut() {
  destroyCookie(undefined, 'nextauth.token')
  destroyCookie(undefined, 'nextauth.refreshToken')
  Router.push('/')
}
export function setupAPIClient(ctx = undefined){
  let cookies = parseCookies(ctx)

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['nextauth.token']}`
    }
  })
  api.interceptors.response.use(response => {
    return response;
  }, (error: AxiosError) => {
    if (error.response.status === 401) {
      if (error.response.data?.code === 'token.expired') {
        //renovar o toekn
        cookies = parseCookies(ctx);

        const { 'nextauth.refreshToken': refreshToken } = cookies;
        const originalConfig = error.config;

        if (!isRefreshing) {
          console.log('refreshing...')
          isRefreshing = true;
          api.post('/refresh', {
            refreshToken,
          }).then(response => {
            const { token } = response.data;
            setCookie(ctx, 'nextauth.token', token, {
              maxAge: 60 * 60 * 24 * 30,
              path: '/'
            })
            setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30,
              path: '/'
            })
            api.defaults.headers['Authorization'] = `Bearer ${token}`

            failedRequestsQueue.forEach(request => request.onSuccess(token))
            failedRequestsQueue = [];
          }).catch(err => {
            failedRequestsQueue.forEach(request => request.onFailed(err))
            failedRequestsQueue = [];

            if (process.browser) {
              signOut()
            }else {
              return Promise.reject(new AuthTokenError())
            }
          }).finally(() => {
            isRefreshing = false;
          })
        }
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              originalConfig.headers['Authorization'] = `Bearer ${token}`
              resolve(api(originalConfig))
            },
            onFailed: (err: AxiosError) => {
              reject(err)
            }
          })
        })
      } else {
        //deslogar usuario

        if (process.browser) {
          signOut()
        } else {
          return Promise.reject(new AuthTokenError())
        }
      }
    }

    return Promise.reject(error)
  })

  return api;
}