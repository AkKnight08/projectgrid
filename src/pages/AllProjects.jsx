import Layout from '../components/layout/Layout'

const AllProjects = () => {
  return (
    <Layout>
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">All Projects</h1>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <p className="text-gray-500">Coming soon...</p>
          </div>
        </main>
      </div>
    </Layout>
  )
}

export default AllProjects 