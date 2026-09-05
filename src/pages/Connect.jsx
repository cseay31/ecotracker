import React, { useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Check, Plug, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function Connect() {
  const serverUrl = useMemo(
    () => new URL('/api/mcp', window.location.origin).toString(),
    []
  );
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(serverUrl);
      setCopied(true);
      toast.success('Server URL copied');
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      toast.error('Copy failed — select and copy manually');
    }
  };

  const Step = ({ n, children }) => (
    <li className="flex gap-3">
      <span className="flex-none mt-0.5 h-5 w-5 rounded-full bg-emerald-500 text-[#022c22] text-xs font-bold grid place-items-center">{n}</span>
      <span className="text-sm leading-relaxed">{children}</span>
    </li>
  );

  return (
    <AppShell title="Connect">
      <div className="flex-1 p-4 space-y-5 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 text-teal-100">
          <Plug className="h-5 w-5" />
          <h1 className="bio-section-title text-xl m-0">Connect an AI assistant</h1>
        </div>
        <p className="text-sm text-teal-200/80">
          Point an AI client at EcoTracker's MCP server to let it read public biodiversity data —
          observations, invasive watchlist, and announcements. This server is public and read-only,
          so no sign-in is required.
        </p>

        <Card className="bio-overlay p-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-teal-200/70">MCP server URL</div>
          <div className="flex items-center gap-2">
            <code className="bio-input flex-1 rounded-md px-3 py-2 text-sm break-all">{serverUrl}</code>
            <Button size="icon" onClick={copyUrl} title="Copy URL">
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="claude">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="claude">Claude</TabsTrigger>
            <TabsTrigger value="chatgpt">ChatGPT</TabsTrigger>
            <TabsTrigger value="cursor">Cursor</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="claude" className="mt-3">
            <Card className="bio-overlay p-4">
              <ol className="space-y-3 list-none p-0 m-0">
                <Step n="1">Open the profile menu (top-right) → <b>Settings</b> → <b>Connectors</b>.</Step>
                <Step n="2">Click <b>Add custom connector</b>.</Step>
                <Step n="3">Give it a name (e.g. <i>EcoTracker</i>) and paste the server URL above.</Step>
                <Step n="4">Click <b>Add</b> — the connector loads EcoTracker's tools.</Step>
              </ol>
            </Card>
          </TabsContent>

          <TabsContent value="chatgpt" className="mt-3">
            <Card className="bio-overlay p-4">
              <ol className="space-y-3 list-none p-0 m-0">
                <Step n="1">Go to <b>Apps</b> and enable <b>Developer mode</b> (acknowledge the risk ChatGPT warns about).</Step>
                <Step n="2">Click <b>Create app</b> and name it (e.g. <i>EcoTracker</i>).</Step>
                <Step n="3">Paste the server URL above, then <b>Create</b>.</Step>
                <Step n="4">Enable the app from the chat composer before prompting it.</Step>
              </ol>
            </Card>
          </TabsContent>

          <TabsContent value="cursor" className="mt-3">
            <Card className="bio-overlay p-4">
              <ol className="space-y-3 list-none p-0 m-0">
                <Step n="1">Open <b>Settings</b> → <b>Tools &amp; Integrations</b> → <b>New MCP Server</b>. This opens <code>mcp.json</code>.</Step>
                <Step n="2">Add an entry whose <code>url</code> is the server URL above.</Step>
                <Step n="3">Save the file and toggle the server on.</Step>
              </ol>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="mt-3">
            <Card className="bio-overlay p-4">
              <ol className="space-y-3 list-none p-0 m-0">
                <Step n="1">Copy the server URL above.</Step>
                <Step n="2">Add it as a <b>streamable HTTP</b> MCP server in your client.</Step>
                <Step n="3">A name + the URL is all most clients need — then reload the client.</Step>
              </ol>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-start gap-2 text-xs text-teal-200/70 bio-overlay rounded-md p-3">
          <RefreshCw className="h-4 w-4 mt-0.5 flex-none" />
          <span>After EcoTracker ships changes, refresh the connector in your client — assistants cache the tool list and won't see new tools until you reload.</span>
        </div>
      </div>
    </AppShell>
  );
}