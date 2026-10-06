import type { Project } from "../types";

interface ProjectCardProps {
  project: Project;
  tone?: "dark" | "light";
  onOpen: () => void;
  tabIndex?: number;
}

export function ProjectCard({
  project,
  tone = "dark",
  onOpen,
  tabIndex = 0,
}: ProjectCardProps) {
  return (
    <button
      className={`project-card project-card--${tone}`}
      onClick={onOpen}
      type="button"
      tabIndex={tabIndex}
      aria-label={`Open project: ${project.title}`}
    >
      <span className="project-card__media">
        <img src={project.image} alt="" draggable={false} />
      </span>
      <span className="project-card__footer">
        <span className="project-card__title">{project.title}</span>
        <span className="project-card__tag">{project.tag}</span>
      </span>
    </button>
  );
}
