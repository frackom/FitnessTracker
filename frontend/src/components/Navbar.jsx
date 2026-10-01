import { NavLink } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink className="navbar-brand" to="/">
          Fitness Tracker
        </NavLink>

        <div className="navbar-links">
          <NavLink to="/exercises">Exercises</NavLink>
          <NavLink to="/routines">My Routines</NavLink>
          <NavLink to="/routines/create">Create Routine</NavLink>
          <NavLink to="/workouts">Workout History</NavLink>
          <NavLink to="/progress">Progress</NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;