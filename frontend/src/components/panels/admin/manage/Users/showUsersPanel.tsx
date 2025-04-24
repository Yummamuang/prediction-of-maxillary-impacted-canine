import { useEffect, useState } from "react";
import axiosInstance from "../../../../../config/axiosConfig";
import axios from "axios";

const ShowUsersPanel = () => {
  // Define User type
  interface User {
    id: number;
    email: string;
    username: string;
    role: string;
  }

  // Define Users
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    axiosInstance.get('/user/all')
      .then((response) => {
        if (response.data.status === 'success') {
          setUsers(response.data.users);
        } else {
          setError("Invalid response from server");
        }
      })
      .catch((error) => {
        if (axios.isAxiosError(error)) {
          if (error.code === "ECONNABORTED" || !error.response) {
            // Connection timeout or server unreachable
            setError("Cannot connect to server.");
          } else {
            // Server responded with an error
            setError(
              error.response?.data?.message || "An error occurred during login",
            );
          }
        } else {
          // Non-axios error
          setError("An unexpected error occurred. Please try again.");
        }
      })
  }, []) // Removed users from dependency array to prevent infinite loop

  return (
    <div className="px-8 mt-18">
      <div className="poppins heading-text text-2xl font-medium mb-2 md:mb-3">All Users</div>
      <div className="poppins md:text-sm text-gray-500 mb-4 lg:mb-8">
        Manage all users.
      </div>
      <div className="bg-white grid grid-cols-[minmax(0,_75px)_minmax(0,_1fr)_minmax(0,_1fr)_minmax(0,_1fr)_minmax(50px,_100px)] mt-4 px-4 py-2 rounded-md border-2 border-gray-200">
        <div className="poppins text-center font-medium border-r-2 border-gray-100">
          Id
        </div>
        <div className="poppins text-center font-medium border-r-2 border-gray-100">
          Email
        </div>
        <div className="poppins text-center font-medium border-r-2 border-gray-100">
          Username
        </div>
        <div className="poppins text-center font-medium border-r-2 border-gray-100">
          Role
        </div>
        <div className="poppins text-center font-medium">
          Action
        </div>
      </div>
      {
        users.length > 1 ? (
          users.map((user) => (
            <div key={user.id} className="bg-white grid grid-cols-[minmax(0,_75px)_minmax(0,_1fr)_minmax(0,_1fr)_minmax(0,_1fr)_minmax(50px,_100px)] mt-4 px-4 py-4 rounded-md border-2 border-gray-200 hover:bg-gray-50">
              <div className="poppins text-center text-gray-600 border-r-2 border-gray-100">
                {user.id}
              </div>
              <div className="poppins text-center text-gray-600 border-r-2 border-gray-100">
                {user.email}
              </div>
              <div className="poppins text-center text-gray-600 border-r-2 border-gray-100">
                {user.username}
              </div>
              <div className={`poppins text-center text-gray-600 border-r-2 border-gray-100 ${user.role === 'admin' ? "text-red-500" : "text-blue"}`}>
                {user.role}
              </div>
              <div className="poppins text-center">
                <span className="block w-1/4 mx-auto cursor-pointer hover-text-blue">
                  <i className="fa-solid fa-ellipsis-vertical fa-lg"></i>
                </span>
              </div>
            </div>
          ))
        ) : (
          <div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        )
      }
    </div>
  )
}

export default ShowUsersPanel;
