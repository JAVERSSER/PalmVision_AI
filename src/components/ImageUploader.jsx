import { useRef, useState } from 'react';
import { ImageUp, CircleAlert } from 'lucide-react';
import { useT } from '../i18n/index.js';
import { validateFile } from '../utils/imageValidation.js';
import { useSettings } from '../context/SettingsContext.jsx';

/** Drag-and-drop / click uploader for JPG, JPEG, PNG and WEBP palm photos. */
export default function ImageUploader({ onFile, disabled }) {
  const { t } = useT();
  const { settings } = useSettings();
  const maxMb = settings.admin.maxUploadMB;
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState(null);

  const handle = (file) => {
    const res = validateFile(file, maxMb);
    if (!res.ok) {
      setError(t(res.error, res.vars));
      return;
    }
    setError(null);
    onFile(file);
  };

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={`group flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition ${
          drag ? 'border-gold bg-gold/5' : 'border-line hover:border-primary/60 hover:bg-primary/5'
        }`}
      >
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:scale-105">
          <ImageUp className="h-8 w-8" aria-hidden="true" />
        </span>
        <span className="text-base font-semibold text-ink">{t('upload.title')}</span>
        <span className="text-sm text-muted">{t('upload.hint', { max: maxMb })}</span>
        <span className="chip text-muted">JPG · JPEG · PNG · WEBP</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="sr-only"
        onChange={(e) => {
          handle(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {error && (
        <p className="mt-3 flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300" role="alert">
          <CircleAlert className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
