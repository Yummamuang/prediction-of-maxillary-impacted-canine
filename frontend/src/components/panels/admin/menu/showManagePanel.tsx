// Import Components
import AddUserPanel from "../manage/Users/addUserPanel";
import ShowUsersPanel from "../manage/Users/showUsersPanel";

interface ShowManagePanelProps {
  selectedPanel: string;
}

const ShowManagePanel = ({ selectedPanel }: ShowManagePanelProps) => {
  const renderPanel = () => {
    switch (selectedPanel) {
      case "users-list":
        return <ShowUsersPanel />;
      case "users-create":
        return <AddUserPanel />;
      // Add more cases as needed
      // case "roles":
      //   return <RolesPanel />;
      // case "settings":
      //   return <SettingsPanel />;
      default:
        return null;
    }
  };

  return (
    <div>
      {renderPanel()}
    </div>
  )
}

export default ShowManagePanel;
