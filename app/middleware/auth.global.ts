export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, assignedStationId } = useAuth()

  // Allow access to login page
  if (to.path === '/login') {
    if (isAuthenticated.value) {
      if (assignedStationId.value) {
        return navigateTo(`/s/${assignedStationId.value}`)
      }
      return navigateTo('/')
    }
    return
  }

  // Protect all other routes
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }

  // Protect station access for station-restricted users
  if (assignedStationId.value && to.path.startsWith('/s/')) {
    const targetStation = to.params.station as string
    if (targetStation && targetStation.toUpperCase() !== assignedStationId.value.toUpperCase()) {
      return navigateTo(`/s/${assignedStationId.value}`)
    }
  }
})
