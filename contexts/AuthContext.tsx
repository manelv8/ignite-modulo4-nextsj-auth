import { createContext, ReactNode } from "react";
import { api } from "../services/api";

type SignInCredetials = {
  email:string;
  password:string;
}

//tipagem pra informações que quero salvar do usuario
//informação dentro do contexto
type AuthContextData = {
  //o metodo de autenticação vai dentro do contexto, pois mais de uma pagina pode precisar acessar esse metodo para autenticar o usuario
  singIn(credentials: SignInCredetials): Promise<void>;
  isAuthenticated: boolean;
}

type AuthProviderProps ={
  //react node é quando o componnete recebe qualquer coisa(text, outros componnetes etc)
  children: ReactNode
}
export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({children}: AuthProviderProps){
  const isAuthenticated = false;
  //tem que ser ASYNC pois o retorno é uma promise
  async function singIn({email,password}: SignInCredetials){
    try {
      const response = await api.post('sessions',{
        email,
        password
      })
      console.log(response.data)
    } catch (error) {
      console.log(error)
    }
  }
  return(
    <AuthContext.Provider value={{singIn,isAuthenticated}}>
      {children}
    </AuthContext.Provider>
  )
}