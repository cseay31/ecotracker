import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import {
  runAudioIdentification,
  buildObservationRecord,
  awardPoints,
} from '../../shared/identification.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { file_url, exact_lat, exact_long, private_property } = body;
    if (!file_url || exact_lat == null || exact_long == null) {
      return Response.json({ error: 'file_url, exact_lat and exact_long are required' }, { status: 400 });
    }

    let endpoint = '';
    try {
      const settings = await base44.asServiceRole.entities.SystemSetting.list(1);
      endpoint = (settings[0] && settings[0].bioacoustics_endpoint) || '';
    } catch (e) {}
    const identification = await runAudioIdentification(base44, file_url, exact_lat, exact_long, endpoint);
    const record = buildObservationRecord({
      observation_type: 'audio',
      media_url: file_url,
      exact_lat,
      exact_long,
      private_property: !!private_property,
      identification,
      user_id: user.id,
    });
    const observation = await base44.asServiceRole.entities.Observation.create(record);
    await awardPoints(base44, user.id, identification.points);

    return Response.json({ observation, points_awarded: identification.points });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}