import { useEffect, useState } from "react";
import waves from "../assets/wave.png";
import drObregon from "../assets/dr_obregon.svg";

import refresh from "../assets/icons/refresh-cw.svg";

import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";

import axios from "axios";

export const PatientList = () => {
  const [newUsers, setNewUsers] = useState([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [openModal, setOpenModal] = useState(false); // Estado para controlar la visibilidad de la ventana modal
  const [selectedUserIndex, setSelectedUserIndex] = useState();

  const URL = "http://localhost:3000";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${URL}/users/list`);
      console.log(JSON.stringify(response.data));

      if (Array.isArray(response.data)) {
        setNewUsers(response.data);
        setIsWaiting(false);
      } else {
        console.error("Fetched data is not an array:", response.data);
        setIsWaiting(true);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsWaiting(true);
    }
  };

  const handleUserClick = (documento) => {
    const index = newUsers.findIndex((user) => user.documento === documento);
    setSelectedUserIndex(index);
    setOpenModal(true);
  };

  const updateTurns = async (users) => {
    try {
      const updatedTurns = users.map((user, index) => ({
        ...user,
        turno: index + 1,
      }));

      await axios.delete(`${URL}/users/list/`);
      await axios.post(`${URL}/users/list/`, updatedTurns);

      // Una vez que la solicitud se completa, actualizamos la lista local
      const response = await axios.get(`${URL}/users/list`);
      setNewUsers(response.data);
    } catch (error) {
      console.error("Error updating turns:", error);
    }
  };

  const handleAccept = async (documento) => {
    try {
      const updatedUsers = newUsers.filter(
        (user) => user.documento !== documento
      );

      if (updatedUsers.length > 0) {
        await updateTurns(updatedUsers);
      } else {
        await axios.delete(`${URL}/users/list/`);
        setNewUsers([]);
      }
    } catch (error) {
      console.error("Error accepting user:", error);
    } finally {
      setOpenModal(false);
    }
  };

  return (
    <section
      style={{
        backgroundImage: `url(${waves})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "bottom",
      }}
    >
      <div className="flex justify-center m-2">
        <img className="w-[30%]" src={drObregon} alt="logotipo" />
      </div>

      <div className="flex overflow-y-auto h-[100vh]">
        <div className="w-[95%] overflow-hidden">
          {isWaiting ? (
            <p className="text-gray-600 text-4xl font-semibold ml-2">
              Se están asignando turnos, por favor espere...
            </p>
          ) : (
            <>
              <div className="flex justify-between">
                <div className="flex gap-4">
                  <h1 className="text-gray-600 ml-2 text-4xl font-semibold">
                    Lista de pacientes
                  </h1>
                  <button onClick={fetchUsers}>
                    <img src={refresh} alt="Actualizar" />
                  </button>
                </div>

                <h3 className="text-3xl font-bold text-pink-600">
                  N° {newUsers.length || 0}
                </h3>
              </div>

              <div className="p-2 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hidden">
                <ul className="pt-2 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {newUsers?.map((user, index) => (
                    <li
                      key={index}
                      className="flex px-1 py-1 bg-white/50 border-solid border border-gray-200 rounded-md shadow-md hover:cursor-pointer hover:bg-blue-200"
                      style={{
                        maxWidth: "20rem",
                        flex: "0 0 calc(33.33% - 1rem)",
                      }}
                      onClick={() => handleUserClick(user.documento)} // Manejar el clic en un usuario
                    >
                      <div className="flex gap-2 items-center">
                        <h3 className="text-5xl font-semibold mx-2">
                          {user.turno}
                        </h3>
                        <div className="flex flex-col">
                          <span
                            className="text-lg font-light overflow-hidden"
                            style={{
                              maxWidth: "14rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {user.nombre}
                          </span>
                          <span className="text-lg font-light">
                            {user.tipoDocumento}-{user.documento}
                          </span>
                          {user.pacienteExamenes &&
                            user.pacienteExamenes.length > 0 && (
                              <div className="flex flex-col">
                                <p className="font-semibold mb-2">Exámenes:</p>
                                <div
                                  className="max-h-28 overflow-y-auto scrollbar-hidden"
                                  style={{ maxWidth: "14rem" }}
                                >
                                  <div className="flex flex-wrap gap-1">
                                    {user.pacienteExamenes.map(
                                      (exam, examIndex) => (
                                        <span
                                          key={`${exam.Pacientes_documento}-${exam.Examenes_idExamenes}-${examIndex}`}
                                          className="text-pink-600 font-semibold"
                                          style={{ width: "max-content" }}
                                        >
                                          {exam.examen.nombre_examen}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Ventana modal */}
              <Modal
                center
                closeOnEsc
                open={openModal}
                onClose={() => setOpenModal(false)}
              >
                <div className="text-xl m-5">
                  <h2 className="mb-2">
                    ¿Desea finalizar el turno del usuario?
                  </h2>
                  <div className="flex justify-center gap-6">
                    <button
                      className="mt-1 p-2 cursor-pointer shadow-md bg-red-500 hover:bg-red-700 transition duration-300 rounded-md font-bold text-white"
                      onClick={() => setOpenModal(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      className="mt-1 p-2 cursor-pointer shadow-md bg-blue-500 hover:bg-blue-600 transition duration-300 rounded-md font-bold text-white text-xl"
                      onClick={() =>
                        handleAccept(newUsers[selectedUserIndex].documento)
                      }
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              </Modal>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
