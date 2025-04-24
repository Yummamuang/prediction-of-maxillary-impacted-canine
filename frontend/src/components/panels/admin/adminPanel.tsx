import { useEffect, useState } from "react";

// Import Context
import { useLoading } from "../../contexts/loadingContext";

// Import image
import logo from "/logo.svg";

// Import Components
import MenuPanel from "./menu/toggleMenuPanel";
import SelectManagePanel from "./menu/selectManagePanel";
import ShowManagePanel from "./menu/showManagePanel";

const AdminPanel = () => {
  const { setLoading } = useLoading();
  // Set default panel
  const [selectedPanel, setSelectedPanel] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 200);
  }, [setLoading]);

  return (
    <div>
      {/* Grid container */}
      <div className="grid grid-cols-[200px_minmax(0,_1fr)] md:grid-cols-[300px_minmax(0,_1fr)]">
        {/* Left container */}
        <div className="bg-white h-lvh">
          <div className="col-span-1 w-12 md:w-16 mx-auto mt-2 md:mt-4">
            <img src={logo} className="drop-shadow-md" />
          </div>
          <SelectManagePanel
            selectedPanel={selectedPanel}
            setSelectedPanel={setSelectedPanel}
          />
        </div>
        {/* Right container */}
        <div className="p-4">
          <MenuPanel />
          <ShowManagePanel selectedPanel={selectedPanel} />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
