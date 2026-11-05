/** Hands a text file to the user: a download on the web, the share sheet on phones. */
import { Platform, Share } from 'react-native';

export async function shareTextFile(filename: string, content: string): Promise<void> {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }
  await Share.share({ message: content, title: filename });
}
