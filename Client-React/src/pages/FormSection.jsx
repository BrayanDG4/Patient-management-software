import { useState } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export const FormSection = () => {
  const { register, handleSubmit, getValues, reset } = useForm();

  const [selectedExams, setSelectedExams] = useState([]);

  const URL = "http://localhost:3000";

  const handleExamSelection = (e) => {
    const { value } = e.target;
    // Verificar si el examen ya está seleccionado o no
    const alreadySelected = selectedExams.includes(value);

    if (alreadySelected) {
      // Si ya está seleccionado, quitarlo de la lista de exámenes seleccionados
      setSelectedExams(selectedExams.filter((exam) => exam !== value));
    } else {
      // Si no está seleccionado, agregarlo a la lista de exámenes seleccionados
      setSelectedExams([...selectedExams, value]);
    }
  };

  const getFormattedTime = () => {
    const currentTime = new Date();
    const hour = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();

    return `${hour}:${minutes}:${seconds}`;
  };

  const onSubmit = async (data) => {
    const formattedTime = getFormattedTime();

    const userData = {
      documento: data.numeroDocumento,
      tipo_documento: data.tipoDocumento,
      nombre: data.nombre,
      fecha_ultima_menstruacion: data.fum,
      edad: data.edad,
      hora_llegada: formattedTime,
    };

    const citationData = {
      fecha_citacion: data.fechaCitacion,
      hora_citacion: data.horaLlegada,
      pacienteDocumento: data.numeroDocumento,
    };

    const examData = {
      idsExamenes: selectedExams.map((examId) => parseInt(examId, 10)),
    };

    console.log("Exámenes seleccionados:", examData);

    try {
      const userResponse = await axios.post(
        `${URL}/users`,
        userData
      );

      if (userResponse.status === 200 || userResponse.status === 201) {
        toast.success("Usuario creado correctamente", {
          position: "top-right",
          autoClose: 3000, // Duración en milisegundos
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        const citationResponse = await axios.post(
          `${URL}/users/create-citation`,
          citationData
        );

        if (
          citationResponse.status === 200 ||
          citationResponse.status === 201
        ) {
          console.log("Citacion creado correctamente");

          // Aquí se redefine examData
          const examData = {
            idsExamenes: selectedExams.map((examId) => parseInt(examId, 10)),
          };

          console.log("Exámenes seleccionados:", JSON.stringify(examData));

          try {
            const examResponse = await axios.post(
              `${URL}/users/${data.numeroDocumento}/examenes/asociar`,
              examData
            );

            if (examResponse.status === 200 || examResponse.status === 201) {
              console.log("Exámenes asociados correctamente");
            }
          } catch (error) {
            console.error("Error al enviar la solicitud de exámenes:", error);
          }
        }
        reset();
        setSelectedExams([]);
      }
    } catch (error) {
      if (error.response.status === 409) {
        toast.info("Usuario existente, actualiza los datos necesarios.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error("Error al crear el usuario", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        console.log(error)
      }
    }
  };

  const updateUserInfo = async () => {
    const data = getValues();

    // Validación de los datos
    if (
      !data.nombre ||
      !data.tipoDocumento ||
      !data.edad ||
      !data.fum ||
      !data.numeroDocumento ||
      selectedExams.length === 0
    ) {
      toast.info("Por favor, completa todos los campos", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    const userData = {
      nombre: data.nombre,
      tipo_documento: data.tipoDocumento,
      edad: data.edad,
      fecha_ultima_menstruacion: data.fum,
    };

    const citationData = {
      fecha_citacion: data.fechaCitacion,
      hora_citacion: data.horaLlegada,
      pacienteDocumento: data.numeroDocumento,
    };

    const examData = {
      Pacientes_documento: data.numeroDocumento,
      Examenes_idExamenes: selectedExams.map((examId) => parseInt(examId, 10)),
    };

    try {
      const userResponse = await axios.patch(
        `${URL}/users/${data.numeroDocumento}`,
        userData
      );

      if (userResponse.status === 200 || userResponse.status === 201) {
        toast.success("Usuario actualizado correctamente", { ...toastConfig });
      } else if (userResponse.status === 404) {
        toast.info("Usuario no encontrado", { ...toastConfig });
      }

      const citationResponse = await axios.post(
        `${URL}/users/create-citation`,
        citationData
      );

      if (citationResponse.status === 200 || citationResponse.status === 201) {
        console.log("Citación creada correctamente");
      } else if (citationResponse.status === 404) {
        toast.info("Citación no encontrada", { ...toastConfig });
      }

      const examResponse = await axios.patch(
        `${URL}/users/${data.numeroDocumento}/examenes`,
        examData
      );

      if (examResponse.status === 200 || examResponse.status === 201) {
        toast.success("Exámenes actualizados correctamente", {
          ...toastConfig,
        });
      } else if (examResponse.status === 500) {
        toast.error("Error al actualizar los exámenes del paciente", {
          ...toastConfig,
        });
      }
    } catch (error) {
      toast.error("Hubo un problema al procesar la solicitud", {
        ...toastConfig,
      });
      console.error("Error en la solicitud:", error);
    }
  };

  const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  const exams = [
    { id: 1, name: "TV" },
    { id: 2, name: "OBS-TV" },
    { id: 3, name: "PELV" },
    { id: 4, name: "DFP" },
    { id: 5, name: "DAU" },
    { id: 6, name: "DET-ANAT" },
    { id: 7, name: "C" },
    { id: 8, name: "PBF" },
    { id: 9, name: "INS-PLAC" },
  ];

  return (
    <div className="w-full h-screen flex justify-center items-center md:w-[50%] overflow-hidden">
      <div className="w-10/12 mt-4">
        <div className="mb-4 tracking-wide">
          <h1 className="my-title-color text-3xl font-semibold mb-2">
            INGRESO DE PACIENTES:
          </h1>
        </div>

        <hr />

        <div className="mt-2 my-title-color text-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-1">
              <label
                className="block text-xl font-semibold mb-2"
                htmlFor="name"
              >
                Nombre:
              </label>

              <input
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                type="text"
                id="name"
                name="name"
                placeholder="Ingresar nombre"
                {...register("nombre", { required: true })}
              />
            </div>

            <div className="mb-1">
              <label
                className="block my-gray-text text-xl font-semibold mb-2"
                htmlFor="document"
              >
                Documento de identidad:
              </label>
              <div className="md:flex gap-2">
                <input
                  className="w-[80%] px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  type="text"
                  id="document"
                  name="document"
                  placeholder="Ingresar número de documento"
                  {...register("numeroDocumento", { required: true })}
                  required
                />

                <select
                  className="w-[20%] px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  id="typeDocument"
                  name="typeDocument"
                  defaultValue={"CC"}
                  {...register("tipoDocumento", { required: true })}
                  required
                >
                  <option value="CC">CC</option>
                  <option value="TI">TI</option>
                </select>
              </div>
            </div>

            <div className="mb-1">
              <div className="md:flex gap-2">
                <div className="w-[20%]">
                  <label
                    className="block my-gray-text text-xl font-semibold mb-2"
                    htmlFor="age"
                  >
                    Edad:
                  </label>

                  <input
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    type="text"
                    id="age"
                    name="age"
                    placeholder="Edad"
                    {...register("edad", { required: true })}
                    required
                  />
                </div>

                <div className="w-[80%]">
                  <label
                    className="block my-gray-text text-xl font-semibold mb-2"
                    htmlFor="fum"
                  >
                    FUM:
                  </label>

                  <input
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    type="date"
                    id="fum"
                    name="fum"
                    {...register("fum", { required: true })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mb-1">
              <div className="md:flex gap-2">
                <div className="w-[30%]">
                  <label
                    className="block my-gray-text text-xl font-semibold mb-2"
                    htmlFor="time"
                  >
                    Hora citación:
                  </label>
                  <input
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    type="time"
                    id="time"
                    name="time"
                    placeholder="Hora"
                    pattern="(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)"
                    {...register("horaLlegada", { required: true })}
                  />
                </div>

                <div className="w-[70%]">
                  <label
                    className="block my-gray-text text-xl font-semibold mb-2"
                    htmlFor="citacionDate"
                  >
                    Fecha citación:
                  </label>
                  <input
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    type="date"
                    id="citacionDate"
                    name="citacionDate"
                    {...register("fechaCitacion", { required: true })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 my-4">
              {exams.map((exam) => (
                <div key={exam.id} className="">
                  <div className="mr-2 flex items-center">
                    <input
                      type="checkbox"
                      id={`exam-${exam.id}`}
                      name={`exam-${exam.id}`}
                      value={exam.id}
                      onChange={handleExamSelection}
                      checked={selectedExams.includes(String(exam.id))}
                      className="mr-2 appearance-none h-6 w-6 border border-gray-300 rounded-md checked:bg-pink-600 checked:border-transparent focus:outline-none"
                    />
                    <label
                      htmlFor={`exam-${exam.id}`}
                      className="block my-gray-text text-xl font-semibold"
                    >
                      {exam.name}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <input
              className="w-full mt-1 p-2 cursor-pointer shadow-md bg-pink-500 hover:bg-pink-600 transition duration-300 rounded-md font-bold text-white text-xl"
              type="submit"
              value="Agregar usuario"
            />
          </form>
          <button
            className="w-full mt-1 p-2 cursor-pointer shadow-md bg-blue-500 hover:bg-blue-600 transition duration-300 rounded-md font-bold text-white text-xl"
            onClick={updateUserInfo}
          >
            Actualizar usuario
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
