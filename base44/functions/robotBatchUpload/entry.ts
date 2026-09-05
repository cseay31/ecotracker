import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import {
  runImageIdentification,
  runAudioIdentification,
  buildObservationRecord,
  awardPoints,
} from '../../shared/identification.ts';

const ROBOT_USER_ID = 'ROBOT_UNIT_01';

export default async function (req) {
  try {
    // Webhook-style endpoint secured by a shared ROBOT_TOKEN secret. Callers must
    // send `Authorization: Bearer <ROBOT_TOKEN>`; requests without a match are rejected.
    const expectedToken = process.env.ROBOT_TOKEN;
    const authHeader = req.headers.get('authorization') || '';
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return Response.json({ error: 'unauthorized' }, { status: 401 });
    }
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return Response.json({ error: 'items array required' }, { status: 400 });
    }

    const results = [];
    for (const item of items) {
      const { file_url, observation_type, exact_lat, exact_long, private_property } = item;
      if (!file_url || exact_lat == null || exact_long == null) {
        results.push({ error: 'missing fields', item });
        continue;
      }
      const type = observation_type === 'audio' ? 'audio' : 'image';
      const identification =
        type === 'audio'
          ? await runAudioIdentification(base44, file_url, exact_lat, exact_long)
          : await runImageIdentification(base44, file_url, exact_lat, exact_long);
      const record = buildObservationRecord({
        observation_type: type,
        media_url: file_url,
        exact_lat,
        exact_long,
        private_property: !!private_property,
        identification,
        user_id: ROBOT_USER_ID,
      });
      const observation = await base44.asServiceRole.entities.Observation.create(record);
      results.push({ observation_id: observation.id, status: identification.status, species: identification.species_name });
    }

    return Response.json({ ingested: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}