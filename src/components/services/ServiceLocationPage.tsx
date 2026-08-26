import { ServiceDetailPage } from './ServiceDetailPage'
import { getServiceLocationDetail, type ServiceLocation } from '@/lib/serviceLocations'

export function ServiceLocationPage({ entry }: { entry: ServiceLocation & { service: Parameters<typeof getServiceLocationDetail>[0] } }) {
  return <ServiceDetailPage service={getServiceLocationDetail(entry.service, entry.location.name)} />
}
