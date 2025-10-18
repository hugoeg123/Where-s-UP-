import React from 'react';

interface EmbedPreviewProps {
  url: string;
}

const getPlatform = (hostname: string) => {
    if (hostname.includes('instagram')) {
        return { name: 'Instagram', logo: '📷' };
    }
    if (hostname.includes('tiktok')) {
        return { name: 'TikTok', logo: '🎵' };
    }
    return { name: hostname, logo: '🔗' };
};

const EmbedPreview: React.FC<EmbedPreviewProps> = ({ url }) => {
  let hostname = 'link';
  try {
    hostname = new URL(url).hostname.replace('www.', '');
  } catch (e) { /* ignore invalid url */ }

  const platform = getPlatform(hostname);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 block bg-brand-primary/50 hover:bg-brand-primary/80 p-2 rounded-lg border border-brand-tertiary/50 transition-colors"
    >
        <div className="flex items-center gap-2">
            <span className="text-xl">{platform.logo}</span>
            <div>
                <p className="text-sm font-semibold truncate text-brand-text">{platform.name} Post</p>
                <p className="text-xs text-brand-text-secondary truncate">{url}</p>
            </div>
        </div>
    </a>
  );
};

export default EmbedPreview;