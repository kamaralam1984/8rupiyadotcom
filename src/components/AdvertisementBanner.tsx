'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink } from 'react-icons/fi';

interface Advertisement {
  _id: string;
  title: string;
  description?: string;
  image: string;
  link: string;
  slot: string;
  position: number;
}

interface AdvertisementBannerProps {
  slot: 'homepage' | 'category' | 'search' | 'shop' | 'sidebar' | 'sidebar-left' | 'sidebar-right' | 'header' | 'footer';
  className?: string;
  style?: React.CSSProperties;
  limit?: number; // Limit number of ads to show
  uniqueId?: string; // Unique identifier for rotation (ensures different positions get different ads)
}

export default function AdvertisementBanner({ slot, className = '', style, limit = 1, uniqueId }: AdvertisementBannerProps) {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvertisements();
  }, [slot, uniqueId, limit]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/advertisements?slot=${slot}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.advertisements && Array.isArray(data.advertisements) && data.advertisements.length > 0) {
          // Sort by position first, then by creation date
          const sortedAds = [...data.advertisements].sort((a, b) => {
            const posDiff = (a.position || 0) - (b.position || 0);
            if (posDiff !== 0) return posDiff;
            return 0;
          });
          
          // Use uniqueId to rotate through ads
          let adsToShow: Advertisement[] = [];
          
          if (uniqueId && sortedAds.length > 0) {
            const uniqueIdNum = parseInt(uniqueId.replace(/\D/g, '')) || 0;
            const startIndex = uniqueIdNum % sortedAds.length;
            
            for (let i = 0; i < limit && i < sortedAds.length; i++) {
              const adIndex = (startIndex + i) % sortedAds.length;
              adsToShow.push(sortedAds[adIndex]);
            }
          } else {
            adsToShow = sortedAds.slice(0, limit);
          }
          
          setAdvertisements(adsToShow);
        } else {
          setAdvertisements([]);
        }
      } else {
        // Only log actual errors
        if (response.status >= 500) {
          console.error(`[AdvertisementBanner] Server error:`, response.status);
        }
        setAdvertisements([]);
      }
    } catch (error) {
      console.error('[AdvertisementBanner] Error:', error);
      setAdvertisements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (adId: string, link: string) => {
    // Track click
    try {
      await fetch(`/api/advertisements/${adId}/click`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }

    // Open link in new tab
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  // Show loading state only briefly, then show ads or nothing
  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!advertisements || advertisements.length === 0) {
    return null;
  }

  return (
    <div className={`advertisement-banner advertisement-${slot} ${className}`} style={style}>
      {advertisements.map((ad, index) => (
        <motion.div
          key={`${ad._id}-${uniqueId || index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="mb-4 last:mb-0 w-full"
        >
          <a
            href={ad.link}
            onClick={(e) => {
              e.preventDefault();
              handleClick(ad._id, ad.link);
            }}
            target="_blank"
            rel="noopener noreferrer"
            className="block group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-full"
          >
            {ad.image && (
              <div className={`relative w-full ${
                slot === 'sidebar-left' || slot === 'sidebar-right' 
                  ? 'min-h-[100px] max-h-[1500px]' 
                  : 'min-h-[150px]'
              } overflow-hidden rounded-lg`}>
                <img
                  src={ad.image}
                  alt={ad.title}
                  className={`w-full rounded-lg ${
                    slot === 'sidebar-left' || slot === 'sidebar-right'
                      ? 'h-full object-cover object-top'
                      : 'h-auto object-cover'
                  }`}
                  style={{
                    width: '100%',
                    ...(slot === 'sidebar-left' || slot === 'sidebar-right' 
                      ? { 
                          height: '100%', 
                          minHeight: '200px',
                          maxHeight: '400px',
                          objectFit: 'cover',
                          objectPosition: 'top center'
                        }
                      : { height: 'auto' }
                    ),
                  }}
                  loading="lazy"
                  decoding="async"
                  sizes={slot === 'sidebar-left' || slot === 'sidebar-right' ? '264px' : '(max-width: 768px) 100vw, 1200px'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {ad.description && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-semibold text-sm mb-1">{ad.title}</h3>
                    <p className="text-white/90 text-xs line-clamp-2">{ad.description}</p>
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1 shadow-lg" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                    <FiExternalLink className="text-xs" />
                    Visit
                  </div>
                </div>
              </div>
            )}
            {!ad.image && (
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-700 dark:to-purple-800 p-6 text-white text-center rounded-lg shadow-lg">
                <h3 className="font-semibold mb-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{ad.title}</h3>
                {ad.description && (
                  <p className="text-sm opacity-95 mb-3" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{ad.description}</p>
                )}
                <div className="flex items-center justify-center gap-2 text-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                  <span>Visit Website</span>
                  <FiExternalLink />
                </div>
              </div>
            )}
          </a>
        </motion.div>
      ))}
    </div>
  );
}

