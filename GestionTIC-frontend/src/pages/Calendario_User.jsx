import { useEffect, useState } from "react";
import Header_User from "../components/Header_User/Header_User";
import Calendario from "../components/Calendario/Calendario";

function Calendario_Admin() {
    // Estado para almacenar los eventos del calendario
    const [eventos, setEventos] = useState([]);

    // Efecto para obtener los préstamos aprobados al cargar el componente
    useEffect(() => {
        const obtenerPrestamosAprobados = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch("/api/prestamos/user/calendario", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Error:", errorData.message);
                    return;
                }

                const data = await response.json();
                setEventos(data || []);
            } catch (error) {
                console.error("Error al obtener préstamos:", error);
            }
        };

        obtenerPrestamosAprobados();
    }, []);

    return (
        <>
            <Header_User />
            <div className="inicio-container">
                <h2 style={{ textAlign: "left", marginBottom: "16px" }}>
                    Calendario de Solicitudes
                </h2>
                <Calendario eventos={eventos} esAdmin={true} />
            </div>
        </>
    );
}

export default Calendario_Admin;