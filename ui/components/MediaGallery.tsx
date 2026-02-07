import { TweetMedia } from "@/lib/types";

interface MediaGalleryProps {
  media: TweetMedia[];
}

/**
 * Get the display URL for a media item.
 * Prefers preview_image_url for videos, falls back to url.
 */
function getMediaUrl(item: TweetMedia): string | null {
  // For videos, prefer the preview image
  if (item.type === "video" || item.type === "animated_gif") {
    return item.preview_image_url || item.url;
  }
  // For photos, use the main URL
  return item.url || item.preview_image_url;
}

/**
 * Get appropriate alt text for a media item.
 */
function getMediaAlt(item: TweetMedia, index: number): string {
  switch (item.type) {
    case "video":
      return `Video thumbnail ${index + 1}`;
    case "animated_gif":
      return `GIF thumbnail ${index + 1}`;
    case "photo":
    default:
      return `Image ${index + 1}`;
  }
}

export function MediaGallery({ media }: MediaGalleryProps) {
  // Filter out items without a displayable URL
  const displayableMedia = media.filter((item) => getMediaUrl(item) !== null);

  if (displayableMedia.length === 0) {
    return null;
  }

  // Determine grid layout based on number of items
  const gridClass =
    displayableMedia.length === 1
      ? "grid-cols-1"
      : "grid-cols-2";

  return (
    <div className={`grid gap-1 sm:gap-2 ${gridClass}`}>
      {displayableMedia.map((item, index) => {
        const url = getMediaUrl(item);
        if (!url) return null;

        const isVideo = item.type === "video" || item.type === "animated_gif";

        return (
          <div
            key={index}
            className={`relative aspect-video overflow-hidden rounded-md sm:rounded-lg ${
              displayableMedia.length === 3 && index === 0
                ? "row-span-2 aspect-auto"
                : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={getMediaAlt(item, index)}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {/* Video indicator overlay */}
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="rounded-full bg-black/60 p-1.5 sm:p-2">
                  <svg
                    className="h-5 w-5 text-white sm:h-6 sm:w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
