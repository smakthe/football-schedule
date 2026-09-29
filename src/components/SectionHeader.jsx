import CompBadge from './CompBadge.jsx';

export default function SectionHeader({ comp, subtitle, headingId }) {
  return (
    <div className="league-header">
      <CompBadge comp={comp} />
      <div className="league-title">
        <h2 id={headingId}>{comp.name}</h2>
        <span className="league-sub">{subtitle}</span>
      </div>
    </div>
  );
}
