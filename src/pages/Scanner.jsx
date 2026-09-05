import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Mic, Loader2, MapPin, WifiOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const OFFLINE_KEY = 'ecotracker_offline_queue';

export default function Scanner() {
  const [mode, setMode] = useState('image');
  const [privateProp, setPrivateProp] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [coords, setCoords] = useState(null);
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, long: pos.coords.longitude }),
      () => toast.error('Could not get GPS location.')
    );
  }, []);

  // Stop any active recording/stream if the user navigates away mid-capture
  useEffect(() => {
    return () => {
      const mr = mediaRef.current;
      if (mr && mr.state !== 'inactive') {
        try {
          mr.stream.getTracks().forEach((t) => t.stop());
          mr.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Flush offline queue when back online
  useEffect(() => {
    const flush = () => {
      const q = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]');
      if (q.length === 0) return;
      toast.info('Syncing offline observations...');
    };
    window.addEventListener('online', flush);
    return () => window.removeEventListener('online', flush);
  }, []);

  function queueOffline(item) {
    const q = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]');
    q.push({ ...item, sync_status: 'offline_pending' });
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(q));
  }

  async function processFile(file, type) {
    if (!coords) {
      toast.error('Waiting for GPS location...');
      return;
    }
    setProcessing(true);
    setResult(null);
    try {
      const isOnline = navigator.onLine;
      let file_url;
      if (isOnline) {
        const up = await base44.integrations.Core.UploadFile({ file });
        file_url = up.file_url;
      } else {
        queueOffline({ observation_type: type, timestamp: new Date().toISOString() });
        toast.success('Saved offline — will sync when reconnected.');
        setProcessing(false);
        return;
      }
      const fn = type === 'image' ? 'identifyImage' : 'identifyAudio';
      const res = await base44.functions.invoke(fn, {
        file_url,
        exact_lat: coords.lat,
        exact_long: coords.long,
        private_property: privateProp,
      });
      setResult(res.data);
      toast.success(`Identified: ${res.data.observation?.common_name || res.data.observation?.species_name || 'Unknown'} (+${res.data.points_awarded} pts)`);
    } catch (e) {
      toast.error('Identification failed: ' + e.message);
    } finally {
      setProcessing(false);
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
        await processFile(file, 'audio');
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch (e) {
      toast.error('Microphone access denied.');
    }
  }

  function stopRecording() {
    if (mediaRef.current) {
      setProcessing(true);
      mediaRef.current.stop();
      mediaRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    setRecording(false);
  }

  return (
    <AppShell title="Scanner">
      <div className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full">
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="image" className="flex items-center gap-2"><Camera className="h-4 w-4" /> Photo</TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2"><Mic className="h-4 w-4" /> Audio</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {coords ? `${coords.lat.toFixed(4)}, ${coords.long.toFixed(4)}` : 'Locating...'}
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="priv" className="text-sm">Private property (hide location)</Label>
            <Switch id="priv" checked={privateProp} onCheckedChange={setPrivateProp} />
          </div>
          {!navigator.onLine && (
            <div className="flex items-center gap-2 text-amber-700 text-sm bg-amber-50 p-2 rounded">
              <WifiOff className="h-4 w-4" /> Offline — observations will be queued.
            </div>
          )}
        </Card>

        {mode === 'image' ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files[0];
                e.target.value = '';
                if (f) processFile(f, 'image');
              }}
            />
            <Button
              className="w-full h-20 text-lg"
              disabled={processing || !coords}
              onClick={() => fileInputRef.current?.click()}
            >
              {processing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
              {processing ? 'Identifying...' : 'Capture photo'}
            </Button>
          </>
        ) : (
          <Button className="w-full h-20 text-lg" disabled={processing || !coords} onClick={recording ? stopRecording : startRecording}>
            {recording ? <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" /> Stop recording</span> : processing ? <span className="flex items-center gap-2"><Loader2 className="h-6 w-6 animate-spin" /> Identifying...</span> : <span className="flex items-center gap-2"><Mic className="h-6 w-6" /> Record audio</span>}
          </Button>
        )}

        {result?.observation && (
          <Card className="p-4 space-y-3 border-2 border-green-500">
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <CheckCircle2 className="h-5 w-5" /> Identification complete
            </div>
            <div className="text-lg font-bold">{result.observation.common_name || result.observation.species_name || 'Unknown'}</div>
            {result.observation.species_name && result.observation.species_name !== 'Unknown' && (
              <div className="text-sm italic text-muted-foreground">{result.observation.species_name}</div>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Confidence: <span className="font-medium">{result.observation.confidence_score ?? 0}%</span></div>
              <div>Status: <span className="font-medium capitalize">{result.observation.status?.replace(/_/g, ' ')}</span></div>
              <div>Establishment: <span className="font-medium capitalize">{result.observation.establishment_means}</span></div>
              <div>Points earned: <span className="font-medium">+{result.points_awarded}</span></div>
            </div>
            {result.observation.is_invasive && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded text-sm font-medium">
                <AlertTriangle className="h-4 w-4" /> Invasive species detected
              </div>
            )}
          </Card>
        )}
      </div>
    </AppShell>
  );
}