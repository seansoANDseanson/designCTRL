import { useEffect } from 'react';
import { useCanvasStore } from '../stores/useCanvasStore';
import { useDesignStore } from '../stores/useDesignStore';

/**
 * Keeps Fabric.js canvas objects in sync with the layer state.
 * When a layer is hidden, objects on that layer become invisible.
 * When a layer is locked, objects on that layer become non-selectable.
 */
export function useLayerSync() {
  const canvas = useCanvasStore(s => s.canvas);
  const layers = useDesignStore(s => s.layers);

  useEffect(() => {
    if (!canvas) return;

    // Build lookup for quick access
    const layerMap = new Map(layers.map(l => [l.id, l]));

    canvas.getObjects().forEach(obj => {
      // Skip grid lines and other internal objects
      if ((obj as any).excludeFromExport) return;

      const layerId: string = (obj as any).layerId;
      if (!layerId) return;

      const layer = layerMap.get(layerId);
      if (!layer) return;

      obj.visible = layer.visible;
      // Locked = non-selectable, but only matters in select mode
      obj.selectable = !layer.locked;
      obj.evented = !layer.locked;
    });

    canvas.requestRenderAll();
  }, [canvas, layers]);
}
