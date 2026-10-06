import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import type { Project } from "../types";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!project) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) onClose();
          }}
          role="presentation"
        >
          <motion.article
            className="project-modal"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.88, y: 36 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 22 }}
            transition={{ type: "spring", stiffness: 290, damping: 28, mass: 0.84 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
          >
            <button
              className="project-modal__close"
              onClick={onClose}
              type="button"
              autoFocus
              aria-label="Close project"
            >
              <span />
              <span />
            </button>

            <div className="project-modal__media">
              <img src={project.image} alt="" draggable={false} />
              <div className="project-modal__play" aria-hidden="true">
                <span aria-hidden="true" />
              </div>
            </div>

            <div className="project-modal__content">
              <div className="project-modal__heading-row">
                <h2 id="project-modal-title">{project.title}</h2>
                <span className="project-modal__tag">{project.tag}</span>
              </div>
              <p>{project.description}</p>
              <p>{project.role}</p>
            </div>
          </motion.article>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
