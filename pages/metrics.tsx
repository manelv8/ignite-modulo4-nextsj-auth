import { setupAPIClient } from "../services/api"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard() {
  return (
    <>
      <h1>metrics page</h1>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)
  const response = await apiClient.get('/me')

  
  return {
    props: {}
  }
},{
  permissions:['metrics.list1'],
  roles:['administrator']
})