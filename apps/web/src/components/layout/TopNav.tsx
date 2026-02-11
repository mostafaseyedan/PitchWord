const appLinks = [
  { label: "TalentMax", href: "https://resume.cendien.com" },
  { label: "SalesIQ", href: "https://sales.cendien.com" },
  { label: "RFPHub", href: "https://recon.cendien.com" },
];

export const TopBar = () => {
  return (
    <div className="top-bar">
      {/* Brand */}
      <div className="flex items-center px-6 py-2 bg-white/40 border border-[#e8dfcf] rounded-pill shadow-sm">
        <span className="text-[12px] font-bold text-[#3b342b] tracking-[0.15em]">
          PitchWord
        </span>
      </div>

      {/* External app links — pill container like sidebar */}
      <nav className="top-bar-pill" aria-label="Apps">
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
  );
};
