import { NalaLogo } from "./nala-logo";

interface ModelLoaderProps {
  progress: number;
  error: string | null;
}

export function ModelLoader({ progress, error }: ModelLoaderProps) {
  return (
    <div className="model-loader">
      <NalaLogo size="lg" />

      {error ? (
        <div className="model-loader__error">
          <p>{error}</p>
          <p>Nala requires a modern browser with WebGPU support.</p>
        </div>
      ) : (
        <>
          <p className="model-loader__status">Preparing your voice assistant...</p>
          <div
            className="model-loader__progress"
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="model-loader__progress-bar"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="model-loader__percent">{Math.round(progress * 100)}%</p>
        </>
      )}
    </div>
  );
}
