import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { integrationAPI } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Plus, Code, Check } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [domains, setDomains] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const { data: integrationsData, isLoading } = useQuery({
    queryKey: ['/api/integrations'],
    queryFn: integrationAPI.list,
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const allowedDomains = domains.split(',').map(d => d.trim()).filter(Boolean);
      return integrationAPI.create(allowedDomains);
    },
    onSuccess: () => {
      toast({
        title: 'Integration created!',
        description: 'Your site token has been generated',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setDomains('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Creation failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const copyToClipboard = (text: string, tokenId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(tokenId);
    toast({
      title: 'Copied!',
      description: 'Token copied to clipboard',
    });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getEmbedCode = (siteToken: string) => {
    const domain = window.location.origin;
    return `<!-- GlamAR Virtual Try-On Plugin - Just one line! -->
<script src="${domain}/plugin.js" data-glamar-token="${siteToken}"></script>`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Site Integrations</h1>
          <p className="text-muted-foreground">
            Manage your site tokens and embed the virtual try-on plugin
          </p>
        </div>

        {/* Create Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Integration</CardTitle>
            <CardDescription>
              Generate a site token to embed the virtual try-on plugin on your website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domains">Allowed Domains</Label>
              <Input
                id="domains"
                placeholder="example.com, shop.example.com"
                value={domains}
                onChange={(e) => setDomains(e.target.value)}
                data-testid="input-domains"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of domains allowed to use this token
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !domains.trim()}
              data-testid="button-create-integration"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Integration
            </Button>
          </CardFooter>
        </Card>

        {/* Existing Integrations */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Integrations</h2>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-sm mb-2">✨ How it works</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Copy the one-line embed code below</li>
              <li>Paste it in your website's HTML (before closing &lt;/body&gt; tag)</li>
              <li>The plugin will automatically detect product images on your pages</li>
              <li>A "Try On" button will appear for customers to use</li>
            </ol>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : integrationsData?.integrations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No integrations yet. Create one above to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {integrationsData?.integrations.map((integration: any) => (
                <Card key={integration.site_id} data-testid={`card-integration-${integration.site_id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {integration.allowed_domains.length > 0
                        ? integration.allowed_domains.join(', ')
                        : 'All domains'}
                    </CardTitle>
                    <CardDescription>
                      Created {new Date(integration.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Site Token */}
                    <div className="space-y-2">
                      <Label>Site Token</Label>
                      <div className="flex gap-2">
                        <Input
                          value={integration.site_token}
                          readOnly
                          className="font-mono text-sm"
                          data-testid={`input-token-${integration.site_id}`}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(integration.site_token, `token-${integration.site_id}`)}
                          data-testid={`button-copy-token-${integration.site_id}`}
                        >
                          {copiedToken === `token-${integration.site_id}` ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Embed Code */}
                    <div className="space-y-2">
                      <Label>Embed Code</Label>
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                          <code>{getEmbedCode(integration.site_token)}</code>
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(getEmbedCode(integration.site_token), `code-${integration.site_id}`)}
                          data-testid={`button-copy-code-${integration.site_id}`}
                        >
                          {copiedToken === `code-${integration.site_id}` ? (
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2" />
                          )}
                          Copy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
