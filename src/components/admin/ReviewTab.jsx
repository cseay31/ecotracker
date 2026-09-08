import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { logAudit } from '@/lib/adminAudit';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Image as Img } from '@/components/ui/image';
import { Loader2, ShieldCheck, ShieldAlert, Trash2, MapPin, AlertTriangle, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [acting, setActing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const page = await base44.entities.Observation.filter({}, '-created_date', 20);
      setItems(page);
      setHasMore(page.length === 20);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const cursor = items[items.length - 1]?.created_date;
      const page = await base44.entities.Observation.filter(
        { created_date: { $lt: cursor } },
        '-created_date',
        20
      );
      setItems((prev) => [...prev, ...page]);
      setHasMore(page.length === 20);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoadingMore(false);
    }
  }

  async function setStatus(obs, status) {
    setActing(obs.id);
    try {
      await base44.entities.Observation.update(obs.id, { status, flag_reason: null });
      await logAudit(`${status === 'verified' ? 'Verified' : 'Marked unverified'} flagged observation ${obs.id}`, 'Observation');
      toast.success(`Observation ${status}.`);
      setItems((prev) => prev.filter((o) => o.id !== obs.id));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActing(null);
    }
  }

  async function doDelete() {
    const obs = confirmDelete;
    if (!obs) return;
    setActing(obs.id);
    try {
      await base44.entities.Observation.delete(obs.id);
      await logAudit(`Deleted flagged observation ${obs.id}`, 'Observation');
      toast.success('Observation deleted.');
      setItems((prev) => prev.filter((o) => o.id !== obs.id));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActing(null);
      setConfirmDelete(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">All discoveries</h3>
          <Badge variant="secondary" className="ml-1">{items.length}{hasMore ? '+' : ''}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Every observation submitted to the community. Verify, demote, or remove records as needed.
        </p>

        <div className="space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">No flagged discoveries. 🎉</p>
          )}

          {items.map((obs) => (
            <div key={obs.id} className="border rounded-lg p-3 flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-40 shrink-0 rounded-lg overflow-hidden border bg-muted/30">
                {obs.observation_type === 'image' ? (
                  <Img src={obs.media_url} fittingType="fill" className="w-full h-40 md:h-32" />
                ) : (
                  <div className="w-full h-40 md:h-32 grid place-items-center p-3">
                    <audio src={obs.media_url} controls className="w-full" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold truncate">
                    {obs.species_name || 'Unknown'}
                  </span>
                  {obs.common_name && (
                    <span className="text-sm text-muted-foreground italic">({obs.common_name})</span>
                  )}
                  {obs.status === 'verified' && (
                    <span
                      className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 shrink-0"
                      title="Verified"
                    >
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    </span>
                  )}
                  {obs.is_invasive && (
                    <Badge variant="destructive" className="gap-1">
                      <ShieldAlert className="h-3 w-3" /> Invasive
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>Confidence: <span className="text-foreground font-medium">{obs.confidence_score ?? 0}%</span></span>
                  <span className="capitalize">Means: {obs.establishment_means || 'unknown'}</span>
                  <span className="capitalize">{obs.observation_type}</span>
                  <span>{obs.created_date ? new Date(obs.created_date).toLocaleString() : ''}</span>
                </div>

                {obs.flag_reason && (
                  <div className="text-xs text-destructive flex items-start gap-1.5 pt-1">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{obs.flag_reason}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {obs.exact_lat != null && obs.exact_long != null
                      ? `${obs.exact_lat.toFixed(4)}, ${obs.exact_long.toFixed(4)}`
                      : 'No coordinates'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" onClick={() => setStatus(obs, 'verified')} disabled={acting === obs.id || obs.status === 'verified'}>
                    <ShieldCheck className="h-4 w-4" /> Verify
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(obs, 'unverified')} disabled={acting === obs.id}>
                    Demote
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(obs)} disabled={acting === obs.id}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="w-full">
              {loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          )}
        </div>
      </Card>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setConfirmDelete(null)}>
          <Card className="p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-semibold mb-2">Delete observation?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              This permanently removes the flagged discovery for <span className="font-medium text-foreground">{confirmDelete.species_name || 'Unknown'}</span>. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={doDelete}>Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}