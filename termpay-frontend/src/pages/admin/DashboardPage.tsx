import { AdminLayout } from '../../layouts'
import { useAuth } from '../../context/AuthContext'
import BursarDashboard from './dashboards/BursarDashboard'
import ProprietorDashboard from './dashboards/ProprietorDashboard'

const DashboardPage = () => {
  const { user } = useAuth()

  return (
    <AdminLayout>
      {user?.role === 'proprietor' ? (
        <ProprietorDashboard />
      ) : (
        <BursarDashboard />
      )}
    </AdminLayout>
  )
}

export default DashboardPage
