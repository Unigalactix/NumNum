export default function WorldAtmosphere() {
  return (
    <div className="world-atmosphere" aria-hidden="true">
      <div className="night-sky">
        <div className="sky-moon" />
        <div className="sky-galaxy sky-galaxy-one" />
        <div className="sky-galaxy sky-galaxy-two" />
        {Array.from({ length: 48 }, (_, index) => (
          <i
            className="sky-star"
            key={index}
            style={{
              left: `${(index * 37 + 7) % 100}%`,
              top: `${(index * 19 + 3) % 100}%`,
              animationDelay: `${index % 7}s`,
              width: index % 5 === 0 ? 3 : 2,
              height: index % 5 === 0 ? 3 : 2,
            }}
          />
        ))}
      </div>
      <div className="day-sky">
        <div className="sky-sun" />
        <div className="sky-cloud sky-cloud-one" />
        <div className="sky-cloud sky-cloud-two" />
        <div className="sky-rain">
          {Array.from({ length: 18 }, (_, index) => (
            <i key={index} style={{ left: `${index * 6}%`, animationDelay: `${index * -0.31}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
