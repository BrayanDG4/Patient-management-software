import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useUserStore } from "../store/useUserStore";

import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
registerLocale("es", es);

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const CalendarSection = () => {
  const [, setCurrentDate] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [users, setUsers] = useState([]);

  const setGlobalUsers = useUserStore((state) => state.setUsers);
  const globalUsers = useUserStore((state) => state.users);
  const logUsers = useUserStore((state) => state.logUsers);

  const [isLoading, setIsLoading] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState([]);

  const URL = "http://localhost:3000";

  useEffect(() => {
    // console.log("Estado global actual:", globalUsers);
    logUsers();
    const date = selectedDate;
    const year = date.getFullYear();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    // const dayOfWeek = days[date.getDay()];
    // const dayOfMonth = date.getDate();
    // const nameOfMonth = months[date.getMonth()];

    const formattedDate = `${year}-${month}-${day}`;

    setCurrentDate(formattedDate);

    const getUsersByDate = async () => {
      try {
        const response = await axios.get(
          `${URL}/users/get-patients-by-date/${formattedDate}`
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error al obtener los pacientes:", error);
      }
    };

    getUsersByDate();
  }, [selectedDate, globalUsers, logUsers]);

  const toggleUserSelection = (documento) => {
    const isSelected = selectedUsers.includes(documento);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter((user) => user !== documento));
    } else {
      setSelectedUsers([...selectedUsers, documento]);
    }
  };

  const assignOrRemoveTurn = async (user) => {
    const isSelected = selectedUsers.includes(user.documento);
    toggleUserSelection(user.documento);

    if (!isSelected) {
      const userExists = globalUsers.find(
        (u) => u.documento === user.documento
      );

      if (!userExists) {
        const newUserObject = {
          nombre: user.nombre,
          tipoDocumento: user.tipo_documento,
          edad: user.edad,
          documento: user.documento,
          pacienteExamenes: user.pacienteExamenes,
          turno: globalUsers.length + 1,
        };

        const updatedUsers = [...globalUsers, newUserObject];
        setGlobalUsers(updatedUsers);
      } else {
        console.log("El usuario ya está en la lista");
      }
    } else {
      const updatedUsers = globalUsers.filter(
        (u) => u.documento !== user.documento
      );

      const updatedUsersWithTurns = updatedUsers.map((u, index) => ({
        ...u,
        turno: index + 1,
      }));

      setGlobalUsers(updatedUsersWithTurns);
    }
  };

  const sendUsers = async () => {
    try {
      await axios.delete(`${URL}/users/list/`);
      const response = await axios.post(`${URL}/users/list`, globalUsers);

      if (response.status === 200 || response.status === 201) {
        toast.success("Usuarios enviados a la pantalla de turnos", {
          position: "top-right",
          autoClose: 1000, // Duración en milisegundos
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      toast.error("Error al enviar los usuarios", {
        position: "top-right",
        autoClose: 3000, // Duración en milisegundos
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const resetUserList = async () => {
    setIsLoading(true);

    try {
      // Limpiar en el servidor
      const response = await axios.delete(`${URL}/users/list/`);

      // Esperar 1 segundo antes de limpiar localmente
      setTimeout(() => {
        setGlobalUsers([]);
        setSelectedUsers([]);
        setIsLoading(false);
      }, 1000);

      if (response.status === 200 || response.status === 201) {
        toast.success("Se ha limpiado la pantalla de turnos", {
          position: "top-right",
          autoClose: 1000, // Duración en milisegundos
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      toast.error("Error al limpiar los turnos", {
        position: "top-right",
        autoClose: 3000, // Duración en milisegundos
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex justify-center md:w-[50%] overflow-hidden">
      <div className="w-10/12 mt-4">
        <div className="sticky top-0">
          <div className="mb-4 tracking-wide flex justify-between items-center">
            <h1 className="my-title-color text-3xl font-semibold mb-2">
              CALENDARIO:
            </h1>
            <div className="md:flex gap-2">
              <button
                onClick={resetUserList}
                className="bg-pink-500 text-white font-semibold px-4 py-2 rounded hover:bg-pink-600 transition-all"
                disabled={isLoading} // Deshabilitar el botón mientras se está limpiando
              >
                {isLoading ? "Limpiando turnos..." : "Limpiar turnos"}
              </button>
              <button
                onClick={sendUsers}
                className="bg-pink-500 text-white font-semibold px-4 py-2 rounded hover:bg-pink-600 transition-all"
              >
                Enviar turnos
              </button>
            </div>
          </div>

          <hr />

          <div className="md:flex justify-between items-center m-1">
            <div className="flex gap-2 text-xl">
              <h3 className="font-bold">Fecha: </h3>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="yyyy-MM-dd"
                locale="es"
              />
            </div>

            <div>
              <h3 className="text-3xl font-bold text-pink-600">
                N° {users.length || 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="mt-4 p-2 overflow-y-auto max-h-[calc(100vh-200px)] rounded-sm text-lg">
          {Array.isArray(users) && users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.documento}
                className={`flex p-2 mb-2 items-center bg-white/90 border-solid border border-gray-200 rounded-md shadow-lg ${
                  selectedUsers.includes(user.documento)
                    ? "border-pink-600"
                    : ""
                }`}
              >
                <div>
                  <p>{`${user.nombre} - ${user.edad} años`}</p>
                  <span className="flex flex-grow gap-2">
                    <p>
                      <span className="font-semibold">{`${user.tipo_documento}:`}</span>{" "}
                      <span>{`${user.documento}`}</span>{" "}
                    </p>
                    {/* Renderizar la hora de citación si está disponible */}
                    {user.citaciones && user.citaciones.length > 0 && (
                      <p>
                        {" "}
                        <span className="font-semibold">Hora: </span>
                        {`${user.citaciones[0].hora_citacion}`}
                      </p>
                    )}
                    <p>
                      {" "}
                      <span className="font-semibold">FUM: </span>{" "}
                      {`${user.fecha_ultima_menstruacion}`}
                    </p>
                  </span>

                  {/* Renderizar exámenes */}
                  {user.pacienteExamenes &&
                    user.pacienteExamenes.length > 0 && (
                      <div>
                        <p className="font-semibold">Exámenes:</p>
                        <ul className="flex flex-grow gap-2">
                          {user.pacienteExamenes.map((exam) => (
                            <li
                              key={`${exam.Pacientes_documento}-${exam.Examenes_idExamenes}`}
                            >
                              <span className="text-pink-600">
                                {exam.examen.nombre_examen}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  <div className="flex gap-2">
                    <button
                      className="bg-pink-600 text-white px-2 py-1 rounded text-sm hover:bg-pink-500 transition-all"
                      onClick={() => assignOrRemoveTurn(user)}
                    >
                      {selectedUsers.includes(user.documento)
                        ? "Remover turno"
                        : "Agregar turno"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-lg">
              No se encontraron usuarios para esta fecha.
            </p>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
