import { useCallback, useState } from "react";
import { HorizontalCarousel } from "./components/HorizontalCarousel";
import { ProjectModal } from "./components/ProjectModal";
import { StackedCarousel } from "./components/StackedCarousel";
import { projects } from "./data/projects";
import type { Project } from "./types";

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const closeProject = useCallback(() => setSelectedProject(null), []);

  return (
    <main>
      <section className="showcase-section showcase-section--stack">
        <header className="section-label">
          <span>Selected works</span>
          <span>01 / stacked</span>
        </header>
        <StackedCarousel projects={projects} onOpen={setSelectedProject} />
      </section>

      <section className="showcase-section showcase-section--rail">
        <header className="section-label">
          <span>All projects</span>
          <span>02 / carousel</span>
        </header>
        <HorizontalCarousel projects={projects} onOpen={setSelectedProject} />
      </section>

      <ProjectModal project={selectedProject} onClose={closeProject} />
    </main>
  );
}

export default App;
