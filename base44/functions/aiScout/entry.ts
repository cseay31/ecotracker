import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

async function buildContext(base44) {
  const [users, obs, inquiries, flags] = await Promise.all([
    base44.asServiceRole.entities.User.list(500),
    base44.asServiceRole.entities.Observation.list('-created_date', 200),
    base44.asServiceRole.entities.AdminInquiry.filter({ status: 'pending' }),
    base44.asServiceRole.entities.ModerationFlag.filter({ status: 'pending' }),
  ]);
  return {
    totalMembers: users.length,
    activeMembers: users.filter((u) => u.status !== 'suspended').length,
    totalObservations: obs.length,
    verified: obs.filter((o) => o.status === 'verified').length,
    pendingInquiries: inquiries.length,
    pendingFlags: flags.length,
    recentSpecies: obs.slice(0, 10).map((o) => o.species_name),
  };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const prompt = body.prompt;
    if (!prompt) return Response.json({ error: 'prompt required' }, { status: 400 });

    const ctx = await buildContext(base44);

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        'You are the EcoTracker AI Scout assistant for admins. Using ONLY the following live context, answer the admin\'s question concisely. ' +
        'If the admin seems to request a state-changing action (suspend a user, send an announcement, change a setting), do NOT execute it — instead return a proposed_action object describing it. ' +
        'Context: ' + JSON.stringify(ctx) +
        '\n\nAdmin question: ' + prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          answer: { type: 'string' },
          proposed_action: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              label: { type: 'string' },
              details: { type: 'string' },
            },
          },
        },
        required: ['answer'],
      },
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}