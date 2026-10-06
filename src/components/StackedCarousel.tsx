import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { Project } from "../types";
import { ProjectCard } from "./ProjectCard";

interface StackedCarouselProps {
  projects: Project[];
  onOpen: (project: Project) => void;
}

export function StackedCarousel({ projects, onOpen }: StackedCarouselProps) {
  const [order, setOrder] = useState(projects);
  const [isMobile, setIsMobile] = useState(false);
  const [concealedIds, setConcealedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const activeX = useMotionValue(0);
  const activeOpacity = useMotionValue(1);
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

  const exitTo = useCallback(
    async (nextOrder: Project[], direction: -1 | 0 | 1) => {
      if (isTransitioning.current || nextOrder[0]?.id === order[0]?.id) return;
      isTransitioning.current = true;

      const duration = reduceMotion ? 0.01 : 0.28;
      const exitDistance = direction * Math.max(window.innerWidth * 0.72, 420);
      const outgoingId = order[0].id;

      await Promise.all([
        animate(activeOpacity, 0, { duration, ease: "easeOut" }),
        animate(activeX, exitDistance, {
          duration,
          ease: [0.4, 0, 0.2, 1],
        }),
      ]);

      flushSync(() => {
        setConcealedIds((current) => new Set(current).add(outgoingId));
        setOrder(nextOrder);
      });
      activeX.set(0);
      activeOpacity.set(1);
      isTransitioning.current = false;

      window.setTimeout(
        () => {
          setConcealedIds((current) => {
            const next = new Set(current);
            next.delete(outgoingId);
            return next;
          });
        },
        reduceMotion ? 0 : 650,
      );
    },
    [activeOpacity, activeX, order, reduceMotion],
  );

  const moveCurrentToEnd = useCallback(
    (direction: -1 | 1) => {
      if (order.length < 2) return;
      void exitTo([...order.slice(1), order[0]], direction);
    },
    [exitTo, order],
  );

  const selectProject = useCallback(
    (project: Project) => {
      if (project.id === order[0]?.id || isTransitioning.current) return;

      const middle = order
        .slice(1)
        .filter((candidate) => candidate.id !== project.id);
      void exitTo([project, ...middle, order[0]], 0);
    },
    [exitTo, order],
  );

  return (
    <div
      className="stacked-carousel"
      role="region"
      aria-label="Stacked project carousel"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          moveCurrentToEnd(-1);
        }
        if (event.key === "ArrowLeft" && order.length > 1) {
          event.preventDefault();
          const previous = order.at(-1)!;
          const middle = order.slice(1, -1);
          void exitTo([previous, ...middle, order[0]], 1);
        }
      }}
    >
      <div className="stacked-carousel__stage">
        {order.map((project, index) => {
          const isActive = index === 0;
          const hidden = index >= 4;
          const scale = Math.max(0.7, 1 - index * 0.065);
          const y = -index * 42;

          return (
            <motion.div
              className="stacked-carousel__card"
              key={project.id}
              initial={false}
              animate={{
                y,
                scale,
                opacity: hidden ? 0 : 1,
                filter: "blur(0px)",
              }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 270, damping: 27, mass: 0.8 }
              }
              style={{
                zIndex: order.length - index,
                pointerEvents: isActive ? "auto" : "none",
              }}
              aria-hidden={!isActive}
            >
              <motion.div
                className="stacked-carousel__swipe-card"
                key={`${project.id}-${isActive ? "active" : "inactive"}-${
                  concealedIds.has(project.id) ? "concealed" : "visible"
                }`}
                drag={isActive && isMobile ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.72}
                dragMomentum={false}
                style={
                  isActive
                    ? { x: activeX, opacity: activeOpacity }
                    : {
                        x: 0,
                        opacity: concealedIds.has(project.id) ? 0 : 1,
                      }
                }
                onDragStart={() => {
                  didDrag.current = false;
                }}
                onDrag={(_, info) => {
                  if (Math.abs(info.offset.x) > 6) didDrag.current = true;
                  activeOpacity.set(
                    Math.max(0.18, 1 - Math.abs(info.offset.x) / 230),
                  );
                }}
                onDragEnd={(_, info) => {
                  const shouldDismiss =
                    Math.abs(info.offset.x) > 72 || Math.abs(info.velocity.x) > 480;

                  if (shouldDismiss) {
                    moveCurrentToEnd(info.offset.x >= 0 ? 1 : -1);
                  } else {
                    const duration = reduceMotion ? 0.01 : 0.22;
                    void animate(activeX, 0, { duration, ease: "easeOut" });
                    void animate(activeOpacity, 1, { duration, ease: "easeOut" });
                  }

                  window.setTimeout(() => {
                    didDrag.current = false;
                  }, 60);
                }}
              >
                <ProjectCard
                  project={project}
                  onOpen={() => {
                    if (!didDrag.current) onOpen(project);
                  }}
                  tabIndex={isActive ? 0 : -1}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <div
        className="carousel-dots carousel-dots--stack"
        role="tablist"
        aria-label="Choose project"
      >
        {projects.map((project) => (
          <button
            className={project.id === order[0]?.id ? "is-active" : ""}
            key={project.id}
            onClick={() => selectProject(project)}
            type="button"
            role="tab"
            aria-selected={project.id === order[0]?.id}
            aria-label={`Show ${project.title}`}
          />
        ))}
      </div>

      <p className="interaction-hint interaction-hint--desktop" aria-hidden="true">
        choose a project
      </p>
      <p className="interaction-hint interaction-hint--mobile" aria-hidden="true">
        swipe left or right
      </p>
    </div>
  );
}
