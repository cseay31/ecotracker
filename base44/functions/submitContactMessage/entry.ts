import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const name = (body.name || '').toString().slice(0, 120).trim();
    const email = (body.email || '').toString().slice(0, 200).trim();
    const message = (body.message || '').toString().slice(0, 4000).trim();
    if (!message) return Response.json({ error: 'Message is required' }, { status: 400 });

    const prefix = name || email ? `${name || 'Anonymous'} <${email || 'no-email'}>` : 'Anonymous';
    await base44.asServiceRole.entities.AdminInquiry.create({
      user_message: `[Contact form] ${prefix}: ${message}`,
      status: 'pending',
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}