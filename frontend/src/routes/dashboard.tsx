import DashboardPage from "../components/Page/Dashboard";
import Unauthorized from "../components/Page/Unauthorized";

export default function Dashboard() {
        const token = localStorage.getItem("token");

        // Si l'utilisateur n'est pas connecté, on lui affiche la page Unauthorized
        if (!token) {
                return <Unauthorized />;
        }

        return (
                <section>
                        <DashboardPage />
                </section>
        );
}
