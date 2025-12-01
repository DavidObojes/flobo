import {Link, NavLink, Outlet} from "react-router-dom";

export default function Menu() {
  return (
    <>
      <div>
        <Link to={"/"}>Home </Link>
        <NavLink to={"/user/1234"}>User A </NavLink>
        <NavLink to={"/user/5678"}>User B </NavLink>
        <NavLink to={"/logout"}>Logout (gibt's noch nicht) </NavLink>
      </div>
      <Outlet />
    </>
  );
}