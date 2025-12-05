import { useAuthContext } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";
import { HomeScreen } from "../screens/Home.screen";
import { DashboardScreen } from "../screens/Dashboard.screen";

export const HomePage = () => {
  const { user } = useAuthContext();

  return (
    <>
      <Navbar />
      {user ? <DashboardScreen /> : <HomeScreen />}
    </>
  );
};
