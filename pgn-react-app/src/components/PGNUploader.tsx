// PGNUploader.tsx
// This component provides a file input to allow users to upload a PGN file.

import React, { ChangeEvent } from 'react';

interface Props {
  onLoad: (content: string) => void; // Callback to notify when a file is loaded.
}

const PGNUploader: React.FC<Props> = ({ onLoad }) => {
  /**
   * Handles the file input change event.
   * @param e The change event.
   */
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      onLoad(text);
    };
    reader.readAsText(file);
  };

  return <input type="file" accept=".pgn" onChange={onFileChange} />;
};

export default PGNUploader;
