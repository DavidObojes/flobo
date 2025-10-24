import {Link, NavLink, Outlet, useNavigate} from "react-router-dom";

export default function Menu() {
  const navigate = useNavigate();
  return (
    <>
      <div>
        <Link to={"/"}>Home </Link>
        <NavLink to={"/user/1234"}>User A </NavLink>
        <NavLink to={"/user/5678"}>User B </NavLink>
        <NavLink to={"/login"}>Login </NavLink>
        <NavLink to={"/register"}>Registrieren </NavLink>
        <button
          onClick={() => {
            navigate('/b');
          }}
        >B</button>
      </div>
      <Outlet />
    </>
  );
}