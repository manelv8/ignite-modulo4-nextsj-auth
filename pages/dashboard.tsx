import { useContext, useEffect } from "react"
import { Can } from "../component/Can"
import { AuthContext, signOut } from "../contexts/AuthContext"
import { useCan } from "../hooks/useCan"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard(){
  const {user} = useContext(AuthContext)
 
  useEffect(()=>{
    api.get('/me')
    .then(response => {
      // console.log(response)
    })
  })

  return(
    <>
      <h1>Dashboard: { user?.email}</h1>
      <button onClick={signOut}>Sign out</button>

      <Can permissions={['metrics.list']}>
        <div>metricas</div>
      </Can>
      <Can roles={['administrator']}>
        <div>é admin</div>
      </Can>

    </>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) =>{
  const apiClient = setupAPIClient(ctx)
  const response = await apiClient.get('/me')
  return{
    props:{}
  }
})