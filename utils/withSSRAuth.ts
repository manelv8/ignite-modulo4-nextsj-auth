import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/erros/AuthTokenError";

export function withSSRAuth<P>(fn: GetServerSideProps<P>){
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);
    if (!cookies['nextauth.token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        }
      }
    }
    try{
      return await fn(ctx)
    }catch(err){
      console.log( 'is auth error', err instanceof AuthTokenError)
      console.log(err)
      if (err instanceof AuthTokenError){
        destroyCookie(ctx,'nextauth.token')
        destroyCookie(ctx,'nextauth.refreshToken')
        return{
          redirect:{
            destination:'/',
            permanent:false,
          }
        }
      }
    }
  }
}