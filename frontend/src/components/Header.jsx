export default function Header({ online, lastPoll }) {
  return (
    <div className="header">
      <div>
        <div className="header__eyebrow">PREDICTIVE MAINTENANCE SYSTEM</div>
        <h1 className="header__title">
          DialySense<span>AI</span>
        </h1>
      </div>

      <div className="live-badge">
        <span className={`live-badge__dot ${online ? "live-badge__dot--online" : "live-badge__dot--offline"}`} />
        <span className={`live-badge__label ${online ? "live-badge__label--online" : "live-badge__label--offline"}`}>
          {online ? "LIVE" : "OFFLINE"}
        </span>
        {lastPoll && <span className="live-badge__time">· {lastPoll}</span>}
      </div>
    </div>
  );
}