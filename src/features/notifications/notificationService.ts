import { dataLayer } from '@/data'
import type { Notification } from '@/types/domain/records'
import { err, ok, type RepositoryResult } from '@/types/result'

export async function listNotificationsForUser(userId: string): Promise<RepositoryResult<Notification[]>> {
  const all = await dataLayer.repos.notifications.listNotifications()
  if (!all.ok) return all
  return ok(all.data.filter((row) => row.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
}

export async function markNotificationRead(notificationId: string): Promise<RepositoryResult<Notification>> {
  const all = await dataLayer.repos.notifications.listNotifications()
  if (!all.ok) return all
  const row = all.data.find((n) => n.id === notificationId)
  if (!row) return err({ code: 'NOT_FOUND', message: 'Notification not found.' })
  return dataLayer.repos.notifications.saveNotification({ ...row, read: true })
}
