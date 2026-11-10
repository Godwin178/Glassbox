import type { MetadataRoute } from "next";

const siteUrl = "https://glassbox-opensource.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/demo`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
