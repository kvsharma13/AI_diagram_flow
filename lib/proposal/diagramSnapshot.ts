import { toPng } from 'html-to-image';

export async function captureDiagramSnapshot(elementId: string): Promise<string | null> {
  const element = document.getElementById(elementId);
  if (!element) return null;

  try {
    const dataUrl = await toPng(element, {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      filter: (node: HTMLElement) => {
        const className = node.className || '';
        if (typeof className === 'string') {
          return !(
            className.includes('react-flow__controls') ||
            className.includes('react-flow__minimap') ||
            className.includes('react-flow__attribution')
          );
        }
        return true;
      },
    });
    return dataUrl;
  } catch (error) {
    console.error('Failed to capture diagram snapshot:', error);
    return null;
  }
}
