import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "../types";
import { ProjectCard } from "./ProjectCard";

interface PerspectiveCarouselProps {
  projects: Project[];
  onOpen: (project: Project) => void;
}

function getPosition(index: number, length: number) {
  if (index <= Math.floor(length / 2)) return index;
  return index - length;
}

export function PerspectiveCarousel({
  projects,
  onOpen,
}: PerspectiveCarouselProps) {
  const [order, setOrder] = useState(projects);
  const [isMobile, setIsMobile] = useState(false);
  const dragX = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const isTransitioning = useRef(false);
  const didDrag = useRef(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 720px)");
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const shift = useCallback(
    (direction: -1 | 1) => {
      if (isTransitioning.current || order.length < 2) return;
      isTransitioning.current = true;

      setOrder((current) =>
        direction === 1
          ? [...current.slice(1), current[0]]
          : [current.at(-1)!, ...current.slice(0, -1)],
      );

      window.setTimeout(
        () => {
          isTransitioning.current = false;
        },
        reduceMotion ? 10 : 420,
      );
    },
    [order.length, reduceMotion],
  );

  return (
    <div
      className="perspective-carousel"
      tabIndex={0}
      role="region"
      aria-label="Infinite perspective project carousel"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          shift(1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          shift(-1);
        }
      }}
    >
      <motion.div
        className="perspective-carousel__stage"
        style={{ x: dragX }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.42}
        dragMomentum={false}
        onDragStart={() => {
          didDrag.current = false;
        }}
        onDrag={(_, info) => {
          if (Math.abs(info.offset.x) > 6) didDrag.current = true;
        }}
        onDragEnd={(_, info) => {
          const force = info.offset.x + info.velocity.x * 0.14;
          const duration = reduceMotion ? 0.01 : 0.22;

          void animate(dragX, 0, { duration, ease: "easeOut" });

          if (force < -64) shift(1);
          if (force > 64) shift(-1);

          window.setTimeout(() => {
            didDrag.current = false;
          }, 80);
        }}
      >
        {order.map((project, index) => {
          const position = getPosition(index, order.length);
          const distance = Math.abs(position);
          const isCenter = position === 0;
          const isVisible = distance <= 2;

          return (
            <motion.div
              className="perspective-carousel__card"
              key={project.id}
              initial={false}
              animate={{
                x: `${position * (isMobile ? 88 : 103)}%`,
                z: isCenter ? 0 : -Math.min(distance, 2) * 150,
                rotateY: isCenter
                  ? 0
                  : position < 0
                    ? isMobile
                      ? 25
                      : 32
                    : isMobile
                      ? -25
                      : -32,
                scale: isCenter ? 1 : distance === 1 ? 0.94 : 0.84,
                opacity: isVisible ? (distance === 2 ? 0.34 : 1) : 0,
              }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
              }
              style={{
                zIndex: order.length - distance,
                pointerEvents: distance <= 1 ? "auto" : "none",
              }}
              aria-hidden={!isCenter}
            >
              <ProjectCard
                project={project}
                tone="light"
                onOpen={() => {
                  if (!didDrag.current) onOpen(project);
                }}
                tabIndex={isCenter ? 0 : -1}
              />
            </motion.div>
          );
        })}
      </motion.div>

      <button
        className="carousel-arrow carousel-arrow--previous perspective-carousel__arrow"
        onClick={() => shift(-1)}
        type="button"
        aria-label="Previous project"
      >
        <span aria-hidden="true">←</span>
      </button>
      <button
        className="carousel-arrow carousel-arrow--next perspective-carousel__arrow"
        onClick={() => shift(1)}
        type="button"
        aria-label="Next project"
      >
        <span aria-hidden="true">→</span>
      </button>

      <p className="perspective-carousel__hint" aria-hidden="true">
        drag left or right
      </p>
    </div>
  );
}
