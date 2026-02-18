const appLinks = [
  { label: "TalentMax", href: "https://resume.cendien.com" },
  { label: "SalesIQ", href: "https://sales.cendien.com" },
  { label: "RFPHub", href: "https://recon.cendien.com" },
];

export const TopBar = () => {
  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        <div className="top-bar-brand">
          <span className="top-bar-brand-text">PitchWord</span>
        </div>
        <nav className="top-bar-links" aria-label="Apps">
          {appLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="top-bar-link"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};
