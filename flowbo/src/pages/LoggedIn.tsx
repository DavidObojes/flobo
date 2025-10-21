import {Navigate} from "react-router-dom";


export default function LoggedIn(props: any) {
  // add check if user is logged in
  const isLoggedIn = false;
  if (!isLoggedIn) {
    return <Navigate to="/login" />
  }
  return <>{ props.children }</>;
}
