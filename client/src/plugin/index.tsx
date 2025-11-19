import { createRoot } from 'react-dom/client';
import PluginApp from './PluginApp';

interface PluginConfig {
  siteToken: string;
  apiUrl?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

class GlamARPlugin {
  private container: HTMLDivElement | null = null;
  private root: any = null;
  private config: PluginConfig | null = null;

  init(config: PluginConfig) {
    this.config = {
      position: 'top-right',
      ...config,
    };

    // Create container
    this.container = document.createElement('div');
    this.container.id = 'glamar-plugin-root';
    document.body.appendChild(this.container);

    // Render plugin
    this.root = createRoot(this.container);
    this.render();
  }

  private render() {
    if (!this.root || !this.config) return;

    this.root.render(
      <PluginApp
        config={this.config}
        onClose={() => this.destroy()}
      />
    );
  }

  destroy() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}

// Global API
declare global {
  interface Window {
    GlamAR: GlamARPlugin;
  }
}

window.GlamAR = new GlamARPlugin();

export default GlamARPlugin;
