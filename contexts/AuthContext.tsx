import { createContext, ReactNode, useState } from "react";
import { setCookie } from 'nookies';
import  Router  from "next/router";
import { api } from "../services/api";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

type SignInCredetials = {
  email:string;
  password:string;
}

//tipagem pra informações que quero salvar do usuario
//informação dentro do contexto
type AuthContextData = {
  //o metodo de autenticação vai dentro do contexto, pois mais de uma pagina pode precisar acessar esse metodo para autenticar o usuario
  singIn(credentials: SignInCredetials): Promise<void>;
  user: User;
  isAuthenticated: boolean;
}

type AuthProviderProps ={
  //react node é quando o componnete recebe qualquer coisa(text, outros componnetes etc)
  children: ReactNode
}
export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({children}: AuthProviderProps){
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;
  //tem que ser ASYNC pois o retorno é uma promise
  async function singIn({email,password}: SignInCredetials){
    try {
      const response = await api.post('sessions',{
        email,
        password
      })
      const {token, refreshToken, permissions, roles } = response.data

      setCookie(undefined,'nextauth.token', token,{
        maxAge: 60*60*24*30,
        path:'/'
      })
      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/'
      })

      setUser({
        email,
        permissions,
        roles
      })
      Router.push('/dashboard')
    } catch (error) {
      console.log(error)
    }
  }
  return(
    <AuthContext.Provider value={{singIn,isAuthenticated, user}}>
      {children}
    </AuthContext.Provider>
  )
}