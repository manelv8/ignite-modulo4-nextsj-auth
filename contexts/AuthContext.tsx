import { createContext, ReactNode, useEffect, useState } from "react";
import { destroyCookie, parseCookies, setCookie } from 'nookies';
import  Router  from "next/router";
import { api  } from "../services/apiClient";

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
  singIn: (credentials: SignInCredetials)=> Promise<void>;
  signOut:() => void;
  user: User;
  isAuthenticated: boolean;
}

type AuthProviderProps ={
  //react node é quando o componnete recebe qualquer coisa(text, outros componnetes etc)
  children: ReactNode
}
export const AuthContext = createContext({} as AuthContextData)

let authChannel: BroadcastChannel;

export function signOut() {
  destroyCookie(undefined, 'nextauth.token')
  destroyCookie(undefined, 'nextauth.refreshToken')
  authChannel.postMessage('signOut')
  Router.push('/')
}


export function AuthProvider({children}: AuthProviderProps){
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(()=>{
    authChannel = new BroadcastChannel('auth');

    authChannel.onmessage = (message) => {
      switch(message.data){
        case "signOut":
          signOut();
          authChannel.close();
          break;
        case "signIn": window.location.replace("http://localhost:3000/dashboard");
          break;
        default:
          break;
      }
    }
  },[])

  useEffect(() =>{
    const {'nextauth.token': token} = parseCookies()
    if(token) {
      api.get('/me').then(response => {
        const { email, permissions, roles} = response.data
        setUser({email, permissions,roles})
      }).catch(error => {
        signOut()
      })
    }
  },[])
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
      
      api.defaults.headers['Authorization'] = `Bearer ${token}`
      authChannel.postMessage("signIn");
      Router.push('/dashboard')
    } catch (error) {
      console.log(error)
    }
  }
  return(
    <AuthContext.Provider value={{singIn,signOut,isAuthenticated, user}}>
      {children}
    </AuthContext.Provider>
  )
}