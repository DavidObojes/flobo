import {Link, NavLink, Outlet} from "react-router-dom";
import {logout} from "../utils/apiClient.ts";

export default function Menu() {
  return (
    <>
      <div>
        <Link to={"/"}>Home </Link>
        <NavLink to={"/user/1234"}>User A </NavLink>
        <NavLink to={"/user/5678"}>User B </NavLink>
        {/* Logout als Action */}
        <span
          onClick={logout}
          style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
        >
          Logout
        </span>
      </div>
      <Outlet />
    </>
  );
}