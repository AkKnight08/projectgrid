import Layout from '../components/layout/Layout'
import { useUserStore } from '../store/userStore'

const Profile = () => {
  const { user } = useUserStore()

  return (
    <Layout>
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">User Information</h3>
                <div className="mt-5">
                  <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                      <dt className="truncate text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{user?.email || 'Not set'}</dd>
                    </div>
                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                      <dt className="truncate text-sm font-medium text-gray-500">Display Name</dt>
                      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{user?.displayName || 'Not set'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  )
}

export default Profile 