function HeroSection({ onGoToEntry }) {
  return (
    <div className="card hero-card">
      <h2>About AquaFlow AI</h2>
      <p>
        AquaFlow AI is an AI-powered fish pond monitoring and decision support
        platform designed to support smart aquaculture management for the STEM
        for Girls initiative. The system helps users record daily pond data,
        generate AI recommendations, detect risk conditions, trigger alerts, and
        visualize performance trends through an interactive dashboard.
      </p>

      <button className="hero-btn" onClick={onGoToEntry}>
        Add Daily Pond Record
      </button>
    </div>
  );
}

export default HeroSection;