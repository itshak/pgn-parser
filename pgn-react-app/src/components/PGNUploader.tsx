import React, { ChangeEvent } from 'react';

interface Props {
  onLoad: (content: string) => void;
}

const PGNUploader: React.FC<Props> = ({ onLoad }) => {
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
