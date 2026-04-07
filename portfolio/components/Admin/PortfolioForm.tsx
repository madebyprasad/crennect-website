'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Portfolio, Tag, PortfolioMedia } from '@/lib/types';

interface PortfolioFormProps {
  portfolio?: Portfolio;
  tags: Tag[];
}

export default function PortfolioForm({ portfolio, tags }: PortfolioFormProps) {
  const router = useRouter();
  const isEditing = !!portfolio;

  const [formData, setFormData] = useState({
    title: portfolio?.title || '',
    description: portfolio?.description || '',
    client_name: portfolio?.client_name || '',
    project_date: portfolio?.project_date || '',
    challenge_content: portfolio?.challenge_content || '',
    strategy_content: portfolio?.strategy_content || '',
    closing_content: portfolio?.closing_content || '',
    featured_image_url: portfolio?.featured_image_url || '',
    gallery_layout: portfolio?.gallery_layout || 'stack',
  });

  const [selectedTags, setSelectedTags] = useState<string[]>(
    portfolio?.tags?.map((t: any) => t.tags?.id || t.id) || []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  // Exclude hero video from gallery media
  const [media, setMedia] = useState<PortfolioMedia[]>(
    (portfolio?.media || []).filter((m) => m.alt_text !== 'hero-video')
  );
  const [heroVideo, setHeroVideo] = useState<PortfolioMedia | null>(
    (portfolio?.media || []).find((m) => m.alt_text === 'hero-video') || null
  );
  const [heroVideoUrl, setHeroVideoUrl] = useState('');
  const [heroVideoUploading, setHeroVideoUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkAdding, setLinkAdding] = useState(false);
  const [textSectionTitle, setTextSectionTitle] = useState('');
  const [textSectionContent, setTextSectionContent] = useState('');
  const [textAdding, setTextAdding] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const heroVideoInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setThumbnailUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      const { url } = data;
      setFormData((prev) => ({ ...prev, featured_image_url: url }));
    } catch (err: any) {
      setError(err.message || 'Thumbnail upload failed');
    } finally {
      setThumbnailUploading(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !portfolio?.id) return;
    setMediaUploading(true);
    setError('');
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('portfolioId', portfolio.id);
        fd.append('title', file.name);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Upload failed for ${file.name}`);
        }
        const data = await res.json();
        setMedia((prev) => [
          ...prev,
          {
            id: data.mediaId,
            portfolio_id: portfolio.id,
            media_type: file.type.startsWith('video/') ? 'video' : 'image',
            content_url: data.url,
            content_text: null,
            title: file.name,
            caption: null,
            alt_text: null,
            embed_code: null,
            sort_order: prev.length,
            created_at: new Date().toISOString(),
          } as PortfolioMedia,
        ]);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Media upload failed');
    } finally {
      setMediaUploading(false);
      if (mediaInputRef.current) mediaInputRef.current.value = '';
    }
  };

  const isYouTube = (url: string) => /youtube\.com|youtu\.be/.test(url);

  const handleHeroVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !portfolio?.id) return;
    setHeroVideoUploading(true);
    setError('');
    try {
      if (heroVideo?.id) {
        await fetch(`/api/upload?mediaId=${heroVideo.id}`, { method: 'DELETE' });
      }
      const fd = new FormData();
      fd.append('file', file);
      fd.append('portfolioId', portfolio.id);
      fd.append('altText', 'hero-video');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Upload failed'); }
      const data = await res.json();
      setHeroVideo({
        id: data.mediaId,
        portfolio_id: portfolio.id,
        media_type: 'video',
        content_url: data.url,
        content_text: null,
        title: null,
        caption: null,
        alt_text: 'hero-video',
        embed_code: null,
        sort_order: -1,
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.message || 'Hero video upload failed');
    } finally {
      setHeroVideoUploading(false);
      if (heroVideoInputRef.current) heroVideoInputRef.current.value = '';
    }
  };

  const handleHeroVideoUrl = async () => {
    if (!heroVideoUrl.trim() || !portfolio?.id) return;
    setHeroVideoUploading(true);
    setError('');
    try {
      if (heroVideo?.id) {
        await fetch(`/api/upload?mediaId=${heroVideo.id}`, { method: 'DELETE' });
      }
      const fd = new FormData();
      fd.append('hero_video_url', heroVideoUrl.trim());
      fd.append('portfolioId', portfolio.id);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Failed to add video URL'); }
      const data = await res.json();
      setHeroVideo({
        id: data.mediaId,
        portfolio_id: portfolio.id,
        media_type: 'video',
        content_url: heroVideoUrl.trim(),
        content_text: null,
        title: null,
        caption: null,
        alt_text: 'hero-video',
        embed_code: null,
        sort_order: -1,
        created_at: new Date().toISOString(),
      });
      setHeroVideoUrl('');
    } catch (err: any) {
      setError(err.message || 'Failed to add hero video URL');
    } finally {
      setHeroVideoUploading(false);
    }
  };

  const removeHeroVideo = async () => {
    if (!heroVideo?.id) return;
    try {
      await fetch(`/api/upload?mediaId=${heroVideo.id}`, { method: 'DELETE' });
      setHeroVideo(null);
    } catch {
      setError('Failed to remove hero video');
    }
  };

  const handleAddLink = async () => {
    if (!linkUrl.trim() || !portfolio?.id) return;
    setLinkAdding(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('link_url', linkUrl.trim());
      fd.append('portfolioId', portfolio.id);
      if (linkTitle.trim()) fd.append('title', linkTitle.trim());
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add link');
      setMedia((prev) => [
        ...prev,
        {
          id: data.mediaId,
          portfolio_id: portfolio.id,
          media_type: 'link',
          content_url: linkUrl.trim(),
          content_text: null,
          title: linkTitle.trim() || null,
          caption: null,
          alt_text: null,
          embed_code: null,
          sort_order: prev.length,
          created_at: new Date().toISOString(),
        } as PortfolioMedia,
      ]);
      setLinkUrl('');
      setLinkTitle('');
    } catch (err: any) {
      setError(err.message || 'Failed to add link');
    } finally {
      setLinkAdding(false);
    }
  };

  const handleAddTextSection = async () => {
    if (!textSectionContent.trim() || !portfolio?.id) return;
    setTextAdding(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('text_content', textSectionContent.trim());
      fd.append('portfolioId', portfolio.id);
      if (textSectionTitle.trim()) fd.append('title', textSectionTitle.trim());
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add text section');
      setMedia((prev) => [
        ...prev,
        {
          id: data.mediaId,
          portfolio_id: portfolio.id,
          media_type: 'text',
          content_url: null,
          content_text: textSectionContent.trim(),
          title: textSectionTitle.trim() || null,
          caption: null,
          alt_text: null,
          embed_code: null,
          sort_order: prev.length,
          created_at: new Date().toISOString(),
        } as PortfolioMedia,
      ]);
      setTextSectionTitle('');
      setTextSectionContent('');
    } catch (err: any) {
      setError(err.message || 'Failed to add text section');
    } finally {
      setTextAdding(false);
    }
  };

  const removeMedia = async (item: PortfolioMedia) => {
    try {
      const res = await fetch(`/api/upload?mediaId=${item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setMedia((prev) => prev.filter((m) => m.id !== item.id));
      router.refresh();
    } catch {
      setError('Failed to remove media');
    }
  };

  const handleSubmit = async (e: React.FormEvent, action: 'save' | 'publish') => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tags: selectedTags,
        status: action === 'publish' ? 'published' : 'draft',
        gallery_layout: formData.gallery_layout,
      };

      const url = isEditing ? `/api/portfolios/${portfolio.id}` : '/api/portfolios';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save portfolio');
      }

      const data = await response.json();

      setSuccess(
        action === 'publish'
          ? 'Portfolio published successfully!'
          : 'Portfolio saved as draft!'
      );

      setTimeout(() => {
        if (action === 'publish') {
          router.push('/admin');
          router.refresh();
        } else if (isEditing) {
          router.refresh();
        } else {
          router.push(`/admin/${data.id}/edit`);
        }
      }, 800);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this portfolio?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/portfolios/${portfolio?.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete portfolio');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={(e) => handleSubmit(e, 'save')}>
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#16a34a',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
          }}
        >
          {success}
        </div>
      )}

      {/* Basic Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="admin-form-label" htmlFor="title">
            Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="admin-form-input"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Brand Refresh for TechCorp"
            required
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="client_name">
            Client Name
          </label>
          <input
            id="client_name"
            name="client_name"
            type="text"
            className="admin-form-input"
            value={formData.client_name}
            onChange={handleChange}
            placeholder="e.g., TechCorp Inc."
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="project_date">
            Project Date *
          </label>
          <input
            id="project_date"
            name="project_date"
            type="date"
            className="admin-form-input"
            value={formData.project_date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label" htmlFor="description">
          Short Description
        </label>
        <textarea
          id="description"
          name="description"
          className="admin-form-textarea"
          value={formData.description}
          onChange={handleChange}
          placeholder="A brief overview of the project (shown on portfolio cards)"
          style={{ minHeight: '80px' }}
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Thumbnail / Featured Image</label>
        <input
          id="featured_image_url"
          name="featured_image_url"
          type="url"
          className="admin-form-input"
          value={formData.featured_image_url}
          onChange={handleChange}
          placeholder="https://... or upload below"
          style={{ marginBottom: '12px' }}
        />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleThumbnailUpload}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => thumbnailInputRef.current?.click()}
            disabled={thumbnailUploading}
            className="portfolio-button portfolio-button-secondary"
          >
            {thumbnailUploading ? 'Uploading...' : 'Upload Thumbnail'}
          </button>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Or paste URL above • JPG, PNG, WebP, GIF
          </span>
        </div>
        {formData.featured_image_url && (
          <div style={{ marginTop: '12px' }}>
            <img
              src={formData.featured_image_url}
              alt="Thumbnail preview"
              style={{
                maxWidth: '300px',
                maxHeight: '180px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid var(--border)',
              }}
            />
          </div>
        )}
      </div>

      {/* Gallery Layout — always visible */}
      <div className="admin-form-group">
        <label className="admin-form-label" htmlFor="gallery_layout">Gallery Layout</label>
        <select
          id="gallery_layout"
          name="gallery_layout"
          className="admin-form-input"
          value={formData.gallery_layout}
          onChange={handleChange}
        >
          <option value="stack">Stack (natural aspect ratio)</option>
          <option value="uniform">Uniform Grid (same size)</option>
          <option value="full-width">Full Width (one per row)</option>
          <option value="2-column">2-Column Grid</option>
        </select>
      </div>

      {/* Hero Video — full width, before project gallery, no layout options */}
      <div className="admin-form-group">
        <label className="admin-form-label">Hero Video <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '13px' }}>(optional · full width · shown before gallery)</span></label>
        {!isEditing ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '12px', background: 'var(--bg-off-white)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            Save the portfolio as a draft first, then add a hero video.
          </p>
        ) : heroVideo ? (
          <div style={{ padding: '12px', background: 'var(--bg-off-white)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Current hero video:</div>
            <div style={{ background: '#000', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px', aspectRatio: '16/9' }}>
              {isYouTube(heroVideo.content_url || '') ? (
                <iframe
                  src={`https://www.youtube.com/embed/${heroVideo.content_url?.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1]}?rel=0&modestbranding=1`}
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                <video src={heroVideo.content_url || ''} controls style={{ width: '100%', height: '100%' }} />
              )}
            </div>
            <button
              type="button"
              onClick={removeHeroVideo}
              style={{ fontSize: '13px', color: '#dc2626', background: 'transparent', border: '1px solid #fecaca', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}
            >
              Remove Hero Video
            </button>
          </div>
        ) : (
          <div style={{ padding: '16px', background: 'var(--bg-off-white)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <input
              ref={heroVideoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleHeroVideoUpload}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => heroVideoInputRef.current?.click()}
              disabled={heroVideoUploading}
              className="portfolio-button portfolio-button-secondary"
              style={{ marginBottom: '12px' }}
            >
              {heroVideoUploading ? 'Uploading...' : 'Upload Video File'}
            </button>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>or paste a URL (YouTube, direct video link):</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="url"
                className="admin-form-input"
                placeholder="https://youtube.com/watch?v=... or direct video URL"
                value={heroVideoUrl}
                onChange={(e) => setHeroVideoUrl(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleHeroVideoUrl}
                disabled={heroVideoUploading || !heroVideoUrl.trim()}
                className="portfolio-button portfolio-button-secondary"
              >
                {heroVideoUploading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Media Gallery — edit only (needs a saved portfolio ID) */}
      <div className="admin-form-group">
        <label className="admin-form-label">Media Gallery</label>
        {!isEditing ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '12px', background: 'var(--bg-off-white)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            Save the portfolio as a draft first, then come back to add images, videos, links, and text sections.
          </p>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Upload images/videos, add external links, or create text sections.
            </p>

            {/* Image/Video Upload */}
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              multiple
              onChange={handleMediaUpload}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => mediaInputRef.current?.click()}
              disabled={mediaUploading}
              className="portfolio-button portfolio-button-secondary"
              style={{ marginBottom: '16px', marginRight: '8px' }}
            >
              {mediaUploading ? 'Uploading...' : '+ Add Images or Videos'}
            </button>

            {/* Add External Link */}
            <div style={{ marginBottom: '16px', padding: '16px', background: 'var(--bg-off-white)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>+ Add Link</div>
              <input
                type="url"
                className="admin-form-input"
                placeholder="https://youtube.com/watch?v=... or any URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                style={{ marginBottom: '8px' }}
              />
              <input
                type="text"
                className="admin-form-input"
                placeholder="Link title (optional)"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                style={{ marginBottom: '8px' }}
              />
              <button
                type="button"
                onClick={handleAddLink}
                disabled={linkAdding || !linkUrl.trim()}
                className="portfolio-button portfolio-button-secondary"
              >
                {linkAdding ? 'Adding...' : 'Add Link'}
              </button>
            </div>

            {/* Add Text Section */}
            <div style={{ marginBottom: '16px', padding: '16px', background: 'var(--bg-off-white)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>+ Add Text Section</div>
              <input
                type="text"
                className="admin-form-input"
                placeholder="Section title (optional)"
                value={textSectionTitle}
                onChange={(e) => setTextSectionTitle(e.target.value)}
                style={{ marginBottom: '8px' }}
              />
              <textarea
                className="admin-form-textarea"
                placeholder="Section content..."
                value={textSectionContent}
                onChange={(e) => setTextSectionContent(e.target.value)}
                style={{ minHeight: '80px', marginBottom: '8px' }}
              />
              <button
                type="button"
                onClick={handleAddTextSection}
                disabled={textAdding || !textSectionContent.trim()}
                className="portfolio-button portfolio-button-secondary"
              >
                {textAdding ? 'Adding...' : 'Add Text Section'}
              </button>
            </div>

            {/* Media list */}
            {media.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {media.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: 'var(--bg-off-white)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ width: '60px', height: '60px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                      {item.media_type === 'image' && item.content_url ? (
                        <img src={item.content_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : item.media_type === 'video' && item.content_url ? (
                        <video src={item.content_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                      ) : item.media_type === 'link' ? (
                        <span>🔗</span>
                      ) : item.media_type === 'text' ? (
                        <span>📝</span>
                      ) : null}
                    </div>
                    <span style={{ flex: 1, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.media_type === 'link'
                        ? item.title || item.content_url || 'Link'
                        : item.media_type === 'text'
                        ? item.title || 'Text section'
                        : item.title || (item.media_type === 'video' ? 'Video' : 'Image')}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMedia(item)}
                      title="Remove"
                      style={{
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '50%',
                        fontSize: '18px',
                        lineHeight: 1,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Tags */}
      <div className="admin-form-group">
        <label className="admin-form-label">Tags</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className={`portfolio-tag ${selectedTags.includes(tag.id) ? 'active' : ''}`}
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge */}
      <div className="admin-form-group">
        <label className="admin-form-label" htmlFor="challenge_content">
          The Challenge
        </label>
        <textarea
          id="challenge_content"
          name="challenge_content"
          className="admin-form-textarea"
          value={formData.challenge_content}
          onChange={handleChange}
          placeholder="Describe the problem or challenge the client faced... (leave empty to hide this section)"
        />
      </div>

      {/* Strategy */}
      <div className="admin-form-group">
        <label className="admin-form-label" htmlFor="strategy_content">
          Our Strategy
        </label>
        <textarea
          id="strategy_content"
          name="strategy_content"
          className="admin-form-textarea"
          value={formData.strategy_content}
          onChange={handleChange}
          placeholder="Explain your approach and solution... (leave empty to hide this section)"
        />
      </div>

      {/* Closing */}
      <div className="admin-form-group">
        <label className="admin-form-label" htmlFor="closing_content">
          Results & Impact
        </label>
        <textarea
          id="closing_content"
          name="closing_content"
          className="admin-form-textarea"
          value={formData.closing_content}
          onChange={handleChange}
          placeholder="Share the outcomes and impact of your work..."
        />
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border)',
          marginTop: '24px',
        }}
      >
        <button
          type="submit"
          className="portfolio-button portfolio-button-secondary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          type="button"
          className="portfolio-button portfolio-button-primary"
          disabled={loading}
          onClick={(e) => handleSubmit(e, 'publish')}
        >
          {loading ? 'Publishing...' : 'Publish'}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            style={{
              marginLeft: 'auto',
              padding: '14px 24px',
              background: 'transparent',
              border: '1px solid #dc2626',
              color: '#dc2626',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
