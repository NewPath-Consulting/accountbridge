import {useAuth} from "../../hooks/useAuth.tsx";
import {Navigate} from "react-router-dom";

export const ProtectedRoute = ({children}) => {
  const { currentUser, loading } = useAuth();

  if(loading){
    return <div>loading ...</div>
  }

  // if(!currentUser){
  //   return <Navigate to={'/login'}/>
  // }

  return <>{children}</>
}