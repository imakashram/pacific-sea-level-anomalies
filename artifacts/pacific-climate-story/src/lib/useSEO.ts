import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonicalPath?: string;
  keywords?: string;
  noindex?: boolean;
  schema?: Record<string, any>;
  image?: string;
}

const DEFAULT_DESCRIPTION =
  "Explore and analyze sea level anomalies across the Pacific Ocean. Visualize historic data, climate trend patterns, El Niño impacts, and sea-level rise metrics.";

const DEFAULT_KEYWORDS =
  "climate change, sea level rise, Pacific Ocean, El Nino, climate anomalies, global warming, environment data, interactive climate visualization";

const BASE_URL = "https://pacific-sea-level-story.onrender.com";

/**
 * Custom React hook to dynamically manage document head metadata for SEO optimization.
 */
export function useSEO({ title, description, canonicalPath, keywords, noindex, schema, image }: SEOProps) {
  useEffect(() => {
    // 1. Update document title
    document.title = title;

    // 2. Update meta description tags
    const activeDescription = description || DEFAULT_DESCRIPTION;

    // Standard meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", activeDescription);

    // Open Graph description
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement("meta");
      ogDescription.setAttribute("property", "og:description");
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute("content", activeDescription);

    // Twitter description
    let twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (!twitterDescription) {
      twitterDescription = document.createElement("meta");
      twitterDescription.setAttribute("name", "twitter:description");
      document.head.appendChild(twitterDescription);
    }
    twitterDescription.setAttribute("content", activeDescription);

    // 3. Update canonical URL and Open Graph URL
    const activePath = canonicalPath !== undefined 
      ? canonicalPath 
      : (typeof window !== "undefined" ? window.location.pathname : "/");
    const cleanPath = activePath.startsWith("/") ? activePath : `/${activePath}`;
    const fullUrl = `${BASE_URL}${cleanPath === "/" ? "" : cleanPath}`;

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", fullUrl);

    // Open Graph URL
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement("meta");
      ogUrl.setAttribute("property", "og:url");
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute("content", fullUrl);

    // 4. Update meta keywords
    const activeKeywords = keywords || DEFAULT_KEYWORDS;
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement("meta");
      metaKeywords.setAttribute("name", "keywords");
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute("content", activeKeywords);

    // 5. Update Open Graph and Twitter titles & preview images
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", title);

    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (!twitterTitle) {
      twitterTitle = document.createElement("meta");
      twitterTitle.setAttribute("name", "twitter:title");
      document.head.appendChild(twitterTitle);
    }
    twitterTitle.setAttribute("content", title);

    const defaultImage = `${BASE_URL}/og-image.png`;
    const fullImageUrl = image
      ? (image.startsWith("http") ? image : `${BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`)
      : defaultImage;

    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement("meta");
      ogImage.setAttribute("property", "og:image");
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute("content", fullImageUrl);

    let twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (!twitterImage) {
      twitterImage = document.createElement("meta");
      twitterImage.setAttribute("name", "twitter:image");
      document.head.appendChild(twitterImage);
    }
    twitterImage.setAttribute("content", fullImageUrl);

    // 6. Update Robots directive
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.setAttribute("name", "robots");
      document.head.appendChild(metaRobots);
    }
    if (noindex) {
      metaRobots.setAttribute("content", "noindex, nofollow");
    } else {
      metaRobots.setAttribute("content", "index, follow");
    }

    // 7. Update/insert JSON-LD Structured Data
    if (schema) {
      let scriptSchema = document.querySelector('script[type="application/ld+json"]#page-schema');
      if (!scriptSchema) {
        scriptSchema = document.createElement("script");
        scriptSchema.setAttribute("type", "application/ld+json");
        scriptSchema.setAttribute("id", "page-schema");
        document.head.appendChild(scriptSchema);
      }
      scriptSchema.textContent = JSON.stringify(schema, null, 2);
    }

    return () => {
      // Cleanup page-specific schema on unmount
      const scriptSchema = document.querySelector('script[type="application/ld+json"]#page-schema');
      if (scriptSchema) {
        scriptSchema.remove();
      }
    };
  }, [title, description, canonicalPath, keywords, noindex, schema, image]);
}

