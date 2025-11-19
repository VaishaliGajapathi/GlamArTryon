import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuery, useMutation } from '@tanstack/react-query';
import { X, Upload, Image as ImageIcon, Loader2, Download, Sparkles } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface PluginConfig {
  siteToken: string;
  apiUrl?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface PluginAppProps {
  config: PluginConfig;
  onClose: () => void;
}

function PluginContent({ config, onClose }: PluginAppProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [humanImage, setHumanImage] = useState<File | null>(null);
  const [humanPreview, setHumanPreview] = useState<string | null>(null);
  const [garmentUrl, setGarmentUrl] = useState('');

  const apiUrl = config.apiUrl || '';

  // Fetch recent try-ons
  const { data: tryonsData, isLoading } = useQuery({
    queryKey: ['plugin-tryons', config.siteToken],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/tryon?limit=5`, {
        headers: {
          'X-Site-Token': config.siteToken,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch try-ons');
      return response.json();
    },
  });

  // Create try-on mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!humanImage) throw new Error('No image selected');
      
      const formData = new FormData();
      formData.append('humanImage', humanImage);
      if (garmentUrl) {
        formData.append('garmentUrl', garmentUrl);
      }

      const response = await fetch(`${apiUrl}/api/tryon`, {
        method: 'POST',
        headers: {
          'X-Site-Token': config.siteToken,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugin-tryons'] });
      setHumanImage(null);
      setHumanPreview(null);
      setGarmentUrl('');
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHumanImage(file);
      const reader = new FileReader();
      reader.onload = () => setHumanPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="glamar-badge"
        style={{
          position: 'fixed',
          [config.position?.includes('top') ? 'top' : 'bottom']: '20px',
          [config.position?.includes('right') ? 'right' : 'left']: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
        }}
      >
        <Sparkles color="white" size={24} />
      </button>
    );
  }

  return (
    <div
      className="glamar-panel"
      style={{
        position: 'fixed',
        [config.position?.includes('top') ? 'top' : 'bottom']: '0',
        [config.position?.includes('right') ? 'right' : 'left']: '0',
        width: '420px',
        maxWidth: '100vw',
        height: '100vh',
        background: 'white',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles color="#667eea" size={24} />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            Virtual Try-On
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              padding: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            _
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {/* Upload Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              Your Photo
            </label>
            <div
              style={{
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: humanPreview ? 'transparent' : '#f9fafb',
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
                id="glamar-human-input"
              />
              <label htmlFor="glamar-human-input" style={{ cursor: 'pointer' }}>
                {humanPreview ? (
                  <img
                    src={humanPreview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                  />
                ) : (
                  <div>
                    <Upload size={32} color="#9ca3af" style={{ margin: '0 auto 8px' }} />
                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                      Click to upload your photo
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              Garment URL (optional)
            </label>
            <input
              type="url"
              value={garmentUrl}
              onChange={(e) => setGarmentUrl(e.target.value)}
              placeholder="https://example.com/garment.jpg"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!humanImage || createMutation.isPending}
            style={{
              width: '100%',
              padding: '12px',
              background: humanImage && !createMutation.isPending
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: humanImage && !createMutation.isPending ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              'Create Try-On'
            )}
          </button>
        </form>

        {/* Recent Try-Ons */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
            Recent Try-Ons
          </h3>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
              Loading...
            </div>
          ) : tryonsData?.tryons?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <ImageIcon size={48} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                No try-ons yet
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {tryonsData?.tryons?.map((tryon: any) => (
                <div
                  key={tryon.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  {tryon.status === 'done' && tryon.output_url ? (
                    <>
                      <img
                        src={tryon.output_url}
                        alt="Try-on result"
                        style={{ width: '100%', display: 'block' }}
                      />
                      <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {new Date(tryon.created_at).toLocaleDateString()}
                        </span>
                        <a
                          href={tryon.output_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '6px 12px',
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            textDecoration: 'none',
                            color: '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Download size={14} />
                          Download
                        </a>
                      </div>
                    </>
                  ) : tryon.status === 'processing' ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                      <Loader2 size={32} color="#667eea" className="animate-spin" style={{ margin: '0 auto' }} />
                      <p style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
                        Processing...
                      </p>
                    </div>
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#ef4444' }}>
                        Processing failed
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PluginApp(props: PluginAppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <PluginContent {...props} />
    </QueryClientProvider>
  );
}
