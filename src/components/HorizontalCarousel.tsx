import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import type { Project } from "../types";
import { ProjectCard } from "./ProjectCard";

interface HorizontalCarouselProps {
  projects: Project[];
  onOpen: (project: Project) => void;
}

export function HorizontalCarousel({ projects, onOpen }: HorizontalCarouselProps) {
  const [order, setOrder] = useState(projects);
  const [baseX, setBaseX] = useState(0);
  const [step, setStep] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const centerCardRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);
  const didDrag = useRef(false);
  const trackX = useMotionValue(0);
  const reduceMotion = useReducedMotion();

  const visibleProjects = useMemo(
    () => [...order.slice(-2), ...order, ...order.slice(0, 2)],
    [order],
  );

  useEffect(() => {
    const measure = () => {
      const viewport = viewportRef.current;
      const card = centerCardRef.current;
      if (!viewport || !card) return;

      const track = card.parentElement;
      const gap = track
        ? Number.parseFloat(window.getComputedStyle(track).columnGap) || 0
        : 0;
      const nextStep = card.offsetWidth + gap;
      setStep(nextStep);
      setBaseX(viewport.clientWidth / 2 - card.offsetWidth / 2 - nextStep * 2);
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (centerCardRef.current) observer.observe(centerCardRef.current);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    trackX.set(baseX);
  }, [baseX, order, trackX]);

  const shift = useCallback(
    async (direction: -1 | 1) => {
      if (isTransitioning.current || step === 0) return;
      isTransitioning.current = true;

      await animate(trackX, baseX - direction * step, {
        duration: reduceMotion ? 0.01 : 0.34,
        ease: [0.22, 1, 0.36, 1],
      });

      const nextOrder =
        direction === 1
          ? [...order.slice(1), order[0]]
          : [order.at(-1)!, ...order.slice(0, -1)];

      flushSync(() => setOrder(nextOrder));
      trackX.set(baseX);
      isTransitioning.current = false;
    },
    [baseX, order, reduceMotion, step, trackX],
  );

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const onWheel = (event: WheelEvent) => {
      if (
        Math.abs(event.deltaX) <= Math.abs(event.deltaY) ||
        Math.abs(event.deltaX) < 20
      ) {
        return;
      }
      event.preventDefault();
      void shift(event.deltaX > 0 ? 1 : -1);
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [shift]);

  return (
    <div
      className="horizontal-carousel"
      ref={viewportRef}
      tabIndex={0}
      role="region"
      aria-label="Infinite horizontal project carousel"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          void shift(1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          void shift(-1);
        }
      }}
    >
      <motion.div
        className="horizontal-carousel__track"
        style={{ x: trackX }}
        drag="x"
        dragConstraints={{ left: baseX - step, right: baseX + step }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => {
          didDrag.current = false;
        }}
        onDrag={(_, info) => {
          if (Math.abs(info.offset.x) > 6) didDrag.current = true;
        }}
        onDragEnd={(_, info) => {
          const force = info.offset.x + info.velocity.x * 0.14;

          if (force < -64) {
            void shift(1);
          } else if (force > 64) {
            void shift(-1);
          } else {
            void animate(trackX, baseX, {
              duration: reduceMotion ? 0.01 : 0.24,
              ease: "easeOut",
            });
          }

          window.setTimeout(() => {
            didDrag.current = false;
          }, 60);
        }}
      >
        {visibleProjects.map((project, index) => {
          const isCenter = index === 2;
          const isDuplicate = index < 2 || index >= order.length + 2;

          return (
            <div
              className="horizontal-carousel__card"
              key={`${index}-${project.id}`}
              ref={isCenter ? centerCardRef : undefined}
              aria-hidden={!isCenter}
            >
              <ProjectCard
                project={project}
                tone="light"
                onOpen={() => {
                  if (!didDrag.current) onOpen(project);
                }}
                tabIndex={isCenter && !isDuplicate ? 0 : -1}
              />
            </div>
          );
        })}
      </motion.div>

      <button
        className="carousel-arrow carousel-arrow--previous"
        onClick={() => void shift(-1)}
        type="button"
        aria-label="Previous project"
      >
        <span aria-hidden="true">←</span>
      </button>
      <button
        className="carousel-arrow carousel-arrow--next"
        onClick={() => void shift(1)}
        type="button"
        aria-label="Next project"
      >
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
