import { useState } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { useProjectStore } from '../store/projectStore'
import ProjectCard from '../components/projects/ProjectCard'
import Layout from '../components/layout/Layout'

const ResponsiveGridLayout = WidthProvider(Responsive)

const Dashboard = () => {
  const { projects, updateProject } = useProjectStore()
  const [layouts, setLayouts] = useState({})

  const onLayoutChange = (layout, layouts) => {
    setLayouts(layouts)
    
    // Update project positions in store
    layout.forEach((item) => {
      const project = projects.find((p) => p.id === item.i)
      if (project) {
        updateProject(project.id, {
          layout: {
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
          },
        })
      }
    })
  }

  return (
    <Layout>
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={100}
              onLayoutChange={onLayoutChange}
            >
              {projects.map((project) => (
                <div
                  key={project.id}
                  data-grid={
                    project.layout || {
                      x: 0,
                      y: 0,
                      w: 3,
                      h: 2,
                      minW: 2,
                      minH: 2,
                    }
                  }
                >
                  <ProjectCard project={project} />
                </div>
              ))}
            </ResponsiveGridLayout>
          </div>
        </main>
      </div>
    </Layout>
  )
}

export default Dashboard 