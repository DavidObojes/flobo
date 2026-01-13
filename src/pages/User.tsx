import {useParams} from "react-router-dom";

export default function User() {
  const { userId } = useParams();
  return <p>User ID: { userId }</p>;
}