import { useState, useRef, useEffect } from 'react';
import { X, Upload, ImagePlus, Trash2, Loader2 } from 'lucide-react';
import type { Artist } from '../../shared/types';
import { addArtistWork } from '../lib/api';

interface PendingWork {
  id: string;
  file: File;
  preview: string;
  title: string;
  description: string;
  style: string;
}

interface Props {
  open: boolean;
  artist: Artist;
  onClose: () => void;
  onUploaded: (updatedArtist: Artist) => void;
}

export function WorkUploadModal({ open, artist, onClose, onUploaded }: Props) {
  const [pendingWorks, setPendingWorks] = useState<PendingWork[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setPendingWorks([]);
      setError(null);
    }
  }, [open]);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    setError(null);

    const newWorks: PendingWork[] = [];
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      newWorks.push({
        id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        preview: URL.createObjectURL(file),
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        style: artist.styles[0] || '',
      });
    });

    setPendingWorks(prev => [...prev, ...newWorks]);
  };

  const removePendingWork = (id: string) => {
    setPendingWorks(prev => {
      const target = prev.find(w => w.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter(w => w.id !== id);
    });
  };

  const updatePendingWork = (id: string, field: keyof PendingWork, value: string) => {
    setPendingWorks(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (pendingWorks.length === 0) {
      setError('请先选择要上传的作品图片');
      return;
    }

    const invalid = pendingWorks.find(w => !w.title.trim() || !w.style.trim());
    if (invalid) {
      setError('所有作品的标题和风格都不能为空');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      let updatedArtist: Artist | undefined;
      for (const work of pendingWorks) {
        const imageBase64 = await fileToBase64(work.file);
        const result = await addArtistWork(artist.id, {
          title: work.title.trim(),
          description: work.description.trim(),
          style: work.style.trim(),
          image: imageBase64,
        });
        if (!result.success || !result.artist) {
          throw new Error(result.message || '上传失败');
        }
        updatedArtist = result.artist;
      }

      if (updatedArtist) {
        onUploaded(updatedArtist);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-ink border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-display text-xl text-white">上传作品</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div
            className="border-2 border-dashed border-white/15 hover:border-blood/50 transition-colors rounded-lg p-8 text-center cursor-pointer mb-6"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-300 mb-1">点击或拖拽图片到此处</p>
            <p className="text-gray-500 text-sm">支持 JPG、PNG、WebP 格式，可一次选择多张</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={e => handleFilesSelected(e.target.files)}
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-blood/10 border border-blood/30 text-blood text-sm">
              {error}
            </div>
          )}

          {pendingWorks.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg text-white">待上传作品 ({pendingWorks.length})</h3>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-outline text-sm px-4 py-2 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  继续添加
                </button>
              </div>

              <div className="space-y-4">
                {pendingWorks.map((work) => (
                  <div
                    key={work.id}
                    className="bg-graphite border border-white/5 p-4 flex flex-col md:flex-row gap-4"
                  >
                    <div className="relative w-full md:w-40 h-40 flex-shrink-0 overflow-hidden bg-ink-100">
                      <img
                        src={work.preview}
                        alt={work.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removePendingWork(work.id)}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white/80 hover:bg-blood hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-3 min-w-0">
                      <div>
                        <label className="block text-gray-400 text-sm mb-1.5">作品标题 *</label>
                        <input
                          type="text"
                          value={work.title}
                          onChange={e => updatePendingWork(work.id, 'title', e.target.value)}
                          placeholder="请输入作品标题"
                          className="w-full px-4 py-2.5 bg-ink border border-white/10 text-white placeholder-gray-600 focus:border-blood/50 focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-1.5">风格类型 *</label>
                        <select
                          value={work.style}
                          onChange={e => updatePendingWork(work.id, 'style', e.target.value)}
                          className="w-full px-4 py-2.5 bg-ink border border-white/10 text-white focus:border-blood/50 focus:outline-none transition-colors"
                        >
                          {artist.styles.length > 0 ? (
                            artist.styles.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))
                          ) : (
                            <option value="其他">其他</option>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-1.5">作品描述</label>
                        <textarea
                          value={work.description}
                          onChange={e => updatePendingWork(work.id, 'description', e.target.value)}
                          placeholder="简单描述这件作品的创作灵感或特点..."
                          rows={2}
                          className="w-full px-4 py-2.5 bg-ink border border-white/10 text-white placeholder-gray-600 focus:border-blood/50 focus:outline-none transition-colors resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={uploading}
            className="btn-outline px-5 py-2.5"
          >
            取消
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || pendingWorks.length === 0}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                上传中...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                上传 {pendingWorks.length > 0 ? `(${pendingWorks.length})` : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
