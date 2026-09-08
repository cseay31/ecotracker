import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { logAudit } from '@/lib/adminAudit';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Image as Img } from '@/components/ui/image';
import {
  Loader2, ShieldCheck, ShieldAlert, Trash2, MapPin, AlertTriangle,
  Check, Search, Leaf, ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = ['all', 'verified', 'unverified', 'flagged_for_review'];
const TYPES = ['all', 'image', 'audio'];

export default function Observations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [acting, setActing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [query, setQuery] = useState('');

  const buildFilter = useCallback(() => {
    const f = {};
    if (statusFilter !== 'all') f.status = statusFilter;
    if (typeFilter !== 'all') f.observation_type = typeFilter;
    return f;
  }, [statusFilter, typeFilter]);

  async function load() {
    setLoading(true);
    try {
      const page = await base44.entities.Observation.filter(buildFilter(), '-created_date', 24);
      setItems(page);
      setHasMore(page.length === 24);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [buildFilter]);

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const cursor = items[items.length - 1]?.created_date;
      const f = { ...buildFilter(), created_date: { $lt: cursor } };
      const page = await base44.entities.Observation.filter(f, '-created_date', 24);
      setItems((prev) => [...prev, ...page]);
      setHasMore(page.length === 24);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoadingMore(false);
    }
  }

  // Client-side text search across the loaded batch.
  const visible = query.trim()
    ? items.filter((o) => {
        const q = query.toLowerCase();
        return (
          (o.species_name || '').toLowerCase().includes(q) ||
          (o.common_name || '').toLowerCase().includes(q)
        );
      })
    : items;

  async function setStatus(obs, status) {
    setActing(obs.id);
    try {
      await base44.entities.Observation.update(obs.id, { status, flag_reason: null });
      await logAudit(`${status === 'verified' ? 'Verified' : 'Marked unverified'} observation ${obs.id}`, 'Observation');
      toast.success(`Observation ${status}.`);
      setItems((prev) => prev.map((o) => (o.id === obs.id ? { ...o, status } : o)));
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
      await logAudit(`Deleted observation ${obs.id}`, 'Observation');
      toast.success('Observation deleted.');
      setItems((prev) => prev.filter((o) => o.id !== obs.id));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActing(null);
      setConfirmDelete(null);
    }
  }

  return (
    <div className="bio-admin min-h-screen">
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2 sticky top-0 z-30">
        <Leaf className="h-5 w-5" />
        <span className="font-bold text-lg">All Observations</span>
        <Link to="/admin" className="ml-auto text-sm underline opacity-90 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Admin
        </Link>
      </header>

      <main className="p-4 max-w-6xl mx-auto">
        <Card className="p-4 mb-4">
          <p className="text-sm text-muted-foreground mb-3">
            System-wide observation registry. Search, filter, verify, demote, or remove any record.
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search species or common name…"
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border bg-card px-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.replace('_', ' ')}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 rounded-md border bg-card px-2 text-sm"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t === 'all' ? 'All types' : t}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {visible.length === 0 && (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                No observations match your filters.
              </Card>
            )}

            {visible.map((obs) => (
              <Card key={obs.id} className="p-3">
                <div className="flex flex-col md:flex-row gap-4">
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
                      <span className="font-semibold truncate">{obs.species_name || 'Unknown'}</span>
                      {obs.common_name && (
                        <span className="text-sm text-muted-foreground italic">({obs.common_name})</span>
                      )}
                      {obs.status === 'verified' && (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 shrink-0" title="Verified">
                          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                        </span>
                      )}
                      {obs.status === 'flagged_for_review' && (
                        <Badge variant="outline" className="gap-1 text-amber-500 border-amber-500/50">
                          <AlertTriangle className="h-3 w-3" /> Flagged
                        </Badge>
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

                    <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {obs.exact_lat != null && obs.exact_long != null
                          ? `${obs.exact_lat.toFixed(4)}, ${obs.exact_long.toFixed(4)}`
                          : 'No coordinates'}
                      </span>
                    </div>

                    {obs.flag_reason && (
                      <div className="text-xs text-destructive flex items-start gap-1.5 pt-1">
                        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>{obs.flag_reason}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button size="sm" onClick={() => setStatus(obs, 'verified')} disabled={acting === obs.id || obs.status === 'verified'}>
                        <ShieldCheck className="h-4 w-4" /> Verify
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setStatus(obs, 'unverified')} disabled={acting === obs.id || obs.status === 'unverified'}>
                        Demote
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(obs)} disabled={acting === obs.id}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {hasMore && !query && (
              <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="w-full">
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            )}
          </div>
        )}
      </main>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setConfirmDelete(null)}>
          <Card className="p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-semibold mb-2">Delete observation?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              This permanently removes the observation for{' '}
              <span className="font-medium text-foreground">{confirmDelete.species_name || 'Unknown'}</span>. This cannot be undone.
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