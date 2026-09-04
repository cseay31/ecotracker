import { base44 } from '@/api/base44Client';

export async function logAudit(action, target) {
  try {
    const u = await base44.auth.me();
    await base44.entities.AuditLog.create({
      admin_id: u?.id || '',
      action_taken: action,
      target_entity: target,
      ip_address: '',
    });
  } catch (e) {
    // best effort
  }
}