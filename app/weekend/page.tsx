export default function WeekendPage() {
  return (
    <>
      <div className="hero">
        <div className="eyebrow">SÁBADO + DOMINGO</div>
        <h1 className="title">
          Tu plan
          <br />
          para el
          <br />
          weekend.
        </h1>
        <p className="intro">
          Una selección rápida para comer, tomar café y descubrir lugares nuevos este fin
          de semana en Los Mochis.
        </p>
      </div>
      <section className="section">
        <div className="number">03</div>
        <div className="meta">lugares que valen la salida.</div>
      </section>
      <section className="section">
        <div className="head">
          <h2>Empieza con brunch</h2>
        </div>
        <article className="feature">
          <img
            src="https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=85"
            alt="Domingo lento"
          />
          <div className="feature-body">
            <h3>DOMINGO LENTO</h3>
            <div className="meta">Brunch · 9:00–14:00 · ★ 4.9</div>
            <div className="rating">Huevos, café, pan dulce y cero prisa.</div>
          </div>
        </article>
      </section>
      <section className="section">
        <div className="head">
          <h2>Después: algo dulce</h2>
        </div>
        <div className="row">
          <article className="card">
            <img
              src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=85"
              alt="Dulce Pecado"
            />
            <div className="cardbody">
              <h3>Dulce Pecado</h3>
              <div className="small">Postres · ★ 4.9</div>
            </div>
          </article>
          <article className="card">
            <img
              src="https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=700&q=85"
              alt="Matcha Bae"
            />
            <div className="cardbody">
              <h3>Matcha Bae</h3>
              <div className="small">Café · ★ 4.8</div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
