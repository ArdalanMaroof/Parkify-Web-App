import { Link } from 'react-router-dom';


export default function Home() {
  return (
    <div className="home-container">
      <img
        src="/Parkify-logo.jpg"
        alt="Parkify Logo"
        className="logo fade-in-up"
        style={{ animationDelay: '0.2s' }}
      />

      <div className="intro-text fade-in-up" style={{ animationDelay: '0.4s' }}>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome to <span className="text-purple-600">Parkify</span> 🚗
        </h1>
        <p className="text-muted-foreground mt-2">
          Skip the stress and <strong className="text-black dark:text-white">park smarter</strong>!{' '}
          <br />
          Instantly find open spots near you — <span>✨</span> quick, easy, and reliable.
        </p>
      </div>

      <div className="car-lane-group fade-in-up" style={{ animationDelay: '0.6s' }}>
        <img src="/Lines.png" alt="Left Lane Divider" className="lane-img" />
        <img src="/Car2.png" alt="Car Illustration" className="home-img" />
        <img src="/Lines.png" alt="Right Lane Divider" className="lane-img" />
      </div>

      <div className="home-buttons fade-in-up" style={{ animationDelay: '0.8s' }}>
        <Link to="/signup">
          <button className="glow-btn">🚀 Get Started</button>
        </Link>
        <Link to="/login">
          <button className="outline">🔐 Login</button>
        </Link>
      </div>
    </div>
  );
}
