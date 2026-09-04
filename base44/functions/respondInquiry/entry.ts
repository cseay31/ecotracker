import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { inquiry_id, response } = body;
    if (!inquiry_id || !response) {
      return Response.json({ error: 'inquiry_id and response are required' }, { status: 400 });
    }

    const inquiry = await base44.asServiceRole.entities.AdminInquiry.get(inquiry_id);
    if (!inquiry) return Response.json({ error: 'Inquiry not found' }, { status: 404 });

    await base44.asServiceRole.entities.AdminInquiry.update(inquiry_id, {
      admin_response: response,
      status: 'resolved',
      resolved_at: new Date().toISOString(),
    });

    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      admin_id: user.id,
      action_taken: 'Responded to inquiry ' + inquiry_id,
      target_entity: 'AdminInquiry',
      ip_address: req.headers.get('x-forwarded-for') || '',
    });

    // Email the user
    let email = inquiry.created_by || '';
    if (inquiry.user_id) {
      try {
        const u = await base44.asServiceRole.entities.User.get(inquiry.user_id);
        if (u && u.email) email = u.email;
      } catch (e) {}
    }
    if (email) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: 'EcoTracker — Response to your inquiry',
          body: `Hi,\n\nAn EcoTracker admin has responded to your inquiry:\n\n"${response}"\n\n— EcoTracker Team`,
        });
      } catch (e) {}
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}