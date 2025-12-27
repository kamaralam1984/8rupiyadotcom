'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageComponent, PageComponentType, CustomPage } from '@/types/CustomPage';
import Link from 'next/link';

function HeroComponent({ component }: { component: PageComponent }) {
  const animationVariants = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    slide: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
    },
    zoom: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
    },
    bounce: {
      initial: { opacity: 0, y: -50 },
      animate: { opacity: 1, y: 0 },
    },
    rotate: {
      initial: { opacity: 0, rotate: -10 },
      animate: { opacity: 1, rotate: 0 },
    },
    none: { initial: {}, animate: {} },
  };

  const anim = component.animation?.type || 'none';
  const variants = animationVariants[anim] || animationVariants.none;
  const duration = (component.animation?.duration || 500) / 1000;
  const delay = (component.animation?.delay || 0) / 1000;

  return (
    <motion.section
      initial={variants.initial}
      animate={variants.animate}
      transition={{ duration, delay }}
      className="relative w-full min-h-[400px] flex items-center justify-center"
      style={{
        backgroundImage: component.content.backgroundImage
          ? `url(${component.content.backgroundImage})`
          : 'none',
        backgroundColor: component.content.backgroundImage ? 'transparent' : '#f3f4f6',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {component.content.title && (
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {component.content.title}
          </h1>
        )}
        {component.content.subtitle && (
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            {component.content.subtitle}
          </p>
        )}
        {component.content.ctaText && component.content.ctaLink && (
          <Link
            href={component.content.ctaLink}
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            {component.content.ctaText}
          </Link>
        )}
      </div>
    </motion.section>
  );
}

function ButtonComponent({ component }: { component: PageComponent }) {
  const styleClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-blue-600 hover:bg-blue-50',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const style = component.content.style || 'primary';
  const size = component.content.size || 'md';
  const className = `inline-block rounded-lg font-semibold transition-colors ${styleClasses[style]} ${sizeClasses[size]}`;
  const buttonText = component.content.buttonText || 'Button';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center my-4"
    >
      {component.content.buttonLink ? (
        <Link href={component.content.buttonLink} className={className}>
          {buttonText}
        </Link>
      ) : (
        <button type="button" className={className}>
          {buttonText}
        </button>
      )}
    </motion.div>
  );
}

function SliderComponent({ component }: { component: PageComponent }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = component.content.slides || [];

  useEffect(() => {
    if (component.content.autoplay && slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, component.content.interval || 5000);
      return () => clearInterval(interval);
    }
  }, [component.content.autoplay, component.content.interval, slides.length]);

  if (slides.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-[400px] overflow-hidden rounded-lg"
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title || `Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {(slide.title || slide.description) && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white px-4">
                {slide.title && (
                  <h3 className="text-3xl font-bold mb-2">{slide.title}</h3>
                )}
                {slide.description && (
                  <p className="text-lg">{slide.description}</p>
                )}
                {slide.link && (
                  <Link
                    href={slide.link}
                    className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    Learn More
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      {slides.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
          >
            →
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

function AdSpaceComponent({ component }: { component: PageComponent }) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!adContainerRef.current || initializedRef.current || !component.content.adCode) {
      return;
    }

    const container = adContainerRef.current;
    
    // For Google AdSense, we need to handle initialization carefully
    if (component.content.adType === 'google_adsense') {
      // Wait a bit for the HTML to be inserted
      setTimeout(() => {
        // Find all ins.adsbygoogle elements in this container that haven't been initialized
        const adElements = container.querySelectorAll('ins.adsbygoogle:not([data-ads-initialized])');
        
        adElements.forEach((element) => {
          // Mark as initialized before pushing
          (element as HTMLElement).setAttribute('data-ads-initialized', 'true');
          
          try {
            (window as any).adsbygoogle = (window as any).adsbygoogle || [];
            if (Array.isArray((window as any).adsbygoogle)) {
              (window as any).adsbygoogle.push({});
            }
          } catch (err) {
            console.error('AdSense initialization error:', err);
          }
        });
        
        initializedRef.current = true;
      }, 100);
    } else {
      initializedRef.current = true;
    }
  }, [component.content.adCode, component.content.adType]);

  if (component.content.adType === 'google_adsense' && component.content.adCode) {
    // Remove the push script from the HTML to avoid duplicate initialization
    let adCode = component.content.adCode;
    // Remove any existing push scripts to prevent duplicates
    adCode = adCode.replace(/<script[^>]*>[\s\S]*?adsbygoogle[\s\S]*?push[\s\S]*?<\/script>/gi, '');
    
    return (
      <div
        ref={adContainerRef}
        className="my-4"
        dangerouslySetInnerHTML={{ __html: adCode }}
      />
    );
  }
  if (component.content.adCode) {
    return (
      <div
        ref={adContainerRef}
        className="my-4"
        dangerouslySetInnerHTML={{ __html: component.content.adCode }}
      />
    );
  }
  return (
    <div className="my-4 p-8 bg-gray-100 rounded-lg text-center text-gray-500">
      Ad Space
    </div>
  );
}

function ContentComponent({ component }: { component: PageComponent }) {
  if (component.content.html) {
    return (
      <div
        className="my-4 prose max-w-none"
        dangerouslySetInnerHTML={{ __html: component.content.html }}
      />
    );
  }
  return (
    <div className="my-4">
      <p className="text-gray-700">{component.content.text}</p>
    </div>
  );
}

function RailComponent({
  component,
  side,
}: {
  component: PageComponent;
  side: 'left' | 'right';
}) {
  const positionClasses = {
    fixed: 'fixed',
    sticky: 'sticky',
    relative: 'relative',
  };

  return (
    <div
      className={`${positionClasses[component.content.position as keyof typeof positionClasses] || 'sticky'} top-4`}
      style={{
        width: component.content.width || '300px',
        backgroundColor: component.content.backgroundColor || 'transparent',
      }}
    >
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="font-semibold mb-2">{side === 'left' ? 'Left' : 'Right'} Rail</h3>
        <p className="text-sm text-gray-600">Rail content goes here</p>
      </div>
    </div>
  );
}

export default function CustomPageDisplay() {
  const params = useParams();
  const slug = params?.slug as string;
  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/pages/${slug}`);
        if (!response.ok) {
          throw new Error('Page not found');
        }
        const data = await response.json();
        setPage(data.page);
      } catch (err: any) {
        setError(err.message || 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The page you are looking for does not exist.'}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const activeComponents = page.components
    .filter((c) => c.isActive)
    .sort((a, b) => a.order - b.order);

  const leftRail = activeComponents.find((c) => c.type === PageComponentType.LEFT_RAIL);
  const rightRail = activeComponents.find((c) => c.type === PageComponentType.RIGHT_RAIL);
  const mainComponents = activeComponents.filter(
    (c) =>
      c.type !== PageComponentType.LEFT_RAIL && c.type !== PageComponentType.RIGHT_RAIL
  );

  // Update document title
  useEffect(() => {
    if (page) {
      document.title = page.seoTitle || page.title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && page.seoDescription) {
        metaDescription.setAttribute('content', page.seoDescription);
      }
    }
  }, [page]);

  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Page Header */}
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{page.title}</h1>
            {page.description && (
              <p className="text-xl text-gray-600">{page.description}</p>
            )}
          </header>

          {/* Page Content */}
          <div className="flex gap-6">
            {/* Left Rail */}
            {leftRail && (
              <aside className="hidden lg:block flex-shrink-0" aria-label="Left sidebar">
                <RailComponent component={leftRail} side="left" />
              </aside>
            )}

            {/* Main Content */}
            <main id="main-content" role="main" className="flex-1 min-w-0">
            {mainComponents.map((component, index) => {
              switch (component.type) {
                case PageComponentType.HERO:
                  return <HeroComponent key={index} component={component} />;
                case PageComponentType.BUTTON:
                  return <ButtonComponent key={index} component={component} />;
                case PageComponentType.SLIDER:
                  return <SliderComponent key={index} component={component} />;
                case PageComponentType.AD_SPACE:
                  return <AdSpaceComponent key={index} component={component} />;
                case PageComponentType.CONTENT:
                  return <ContentComponent key={index} component={component} />;
                default:
                  return null;
              }
            })}
          </main>

            {/* Right Rail */}
            {rightRail && (
              <aside className="hidden lg:block flex-shrink-0" aria-label="Right sidebar">
                <RailComponent component={rightRail} side="right" />
              </aside>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

