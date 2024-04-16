import { useEffect, useState, useRef } from "react";
import waves from "../assets/wave.png";
import drObregon from "../assets/dr_obregon.svg";

import refresh from "../assets/icons/refresh-cw.svg";

import video1 from "../assets/videos/video1.mp4";
import video2 from "../assets/videos/video2.mp4";

import axios from "axios";

const videos = [
  {
    src: video1,
  },
  {
    src: video2,
  },
];

export const WaitingRoom = () => {
  const [newUsers, setNewUsers] = useState([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef(null);

  const URL = "http://localhost:3000";

  useEffect(() => {
    fetchUsersWithTimeout();
    playVideos();
  }, [currentVideoIndex]);

  const fetchUsersWithTimeout = async () => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${URL}/users/list`);
        setNewUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchWithTimeout = () => {
      fetchData();
      setTimeout(fetchWithTimeout, 4 * 60 * 1000); // 5 minutos en milisegundos
    };

    fetchWithTimeout();
  };

  const playVideos = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => {})
        .catch((error) => {
          console.error("Error al reproducir el video:", error);
        });
    }
  };

  const handleVideoEnd = () => {
    setCurrentVideoIndex((currentIndex) =>
      currentIndex === videos.length - 1 ? 0 : currentIndex + 1
    );
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
        <div className="w-[70%] overflow-hidden">
          {isWaiting ? (
            <p className="text-gray-600 text-4xl font-semibold ml-2">
              Se están asignando turnos, por favor espere...
            </p>
          ) : (
            <>
              <div className="flex justify-between">
                <div className="flex gap-4">
                  <h1 className="text-gray-600 ml-2 text-4xl font-semibold">
                    Sala de espera...
                  </h1>
                  <button onClick={fetchUsersWithTimeout}>
                    <img src={refresh} alt="Actualizar" />
                  </button>
                </div>

                <h3 className="text-3xl font-bold text-pink-600">
                  N° {newUsers.length || 0}
                </h3>
              </div>

              <div className="p-2 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hidden">
                <ul className="pt-2 grid grid-cols-3 gap-4">
                  {newUsers?.map((user, index) => (
                    <li
                      key={index}
                      className="flex px-2 py-6 bg-white/50 border-solid border border-gray-200 rounded-md shadow-md"
                      style={{
                        maxWidth: "20rem",
                        flex: "0 0 calc(33.33% - 1rem)",
                      }}
                    >
                      <div className="flex gap-2 items-center">
                        <h3 className="text-6xl font-semibold mx-2">
                          {user.turno}
                        </h3>
                        <div className="flex flex-col">
                          <span
                            className="text-xl font-light overflow-hidden"
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
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        <div>
          <div className="px-2 absolute top-0 right-0 h-screen w-[30%] flex justify-center items-center">
            <video
              ref={videoRef}
              src={videos[currentVideoIndex].src}
              onEnded={handleVideoEnd}
              autoPlay
              controls={true}
              style={{
                maxWidth: "100%",
                maxHeight: "90%",
                width: "auto",
                height: "auto",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
