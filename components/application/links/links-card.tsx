import { updateUserInfo } from "@/utils/state/actions/userActions";
import { createClient } from "@/utils/supabase/components";
import { Input, Switch } from "@nextui-org/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export interface HeaderCardProps {
  id: string;
  header: string;  // maps to title in DB
  active: boolean;
  link: boolean;   // maps to isLink in DB
  position: number;
  metadata?: string;  // Optional metadata for links
}
export type SetHeaderCardProps = React.Dispatch<
  React.SetStateAction<HeaderCardProps[]>
>;

export const HeaderCard: React.FC<{
  state: HeaderCardProps;
  setState: (updatedState: HeaderCardProps) => void;
  onDelete: () => void;
}> = ({ state, setState, onDelete }) => {
  const [isReadOnly, setIsReadOnly] = useState<boolean>(true);
  const [metadata, setMetadata] = useState<string>("");
  const dispatch = useDispatch();
  const supabase = createClient();

  useEffect(() => {
    if (state.link && state.header) {
      fetchMetadata(state.header);
    }
  }, [state.header, state.link]);

  const fetchMetadata = async (url: string) => {
    try {
      const response = await axios.get(
        `/api/metadata?url=${encodeURIComponent(validateUrl(url))}`
      );
      if (response.data.title) {
        setMetadata(response.data.title);
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
      setMetadata("");
    }
  };

  const validateUrl = (url: string) => {
    const pattern = /^(https?:\/\/)/i;
    return pattern.test(url) ? url : `http://${url}`;
  };

  const updateHeaderContent = async (id: string, header: string) => {
    const { error } = await supabase
      .from("headers")
      .update({ 
        title: header,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);
  
    if (error) {
      console.error("Error updating header content", error);
      return false;
    }
    return true;
  };
  
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newHeader = event.target.value;
    const success = await updateHeaderContent(state.id, newHeader);
    
    if (success) {
      setState({
        ...state,
        header: newHeader,
      });
      dispatch(updateUserInfo({ header: [state] }));
    }
  };

  // We need to add the active column to the database first
  // Here's the SQL to add it:
  /*
  ALTER TABLE headers
  ADD COLUMN active boolean DEFAULT false;
  */
  
  const updateHeaderActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("headers")
      .update({ 
        active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);
  
    if (error) {
      console.error("Error updating header active", error);
    } else {
      console.log("header active successfully updated");
    }
  };

  const handleActive = () => {
    updateHeaderActive(state.id, !state.active);
    setState({
      ...state,
      active: !state.active,
    });
  };

  const handleDelete = () => {
    onDelete();
  };
  return (
    <div className="md:max-w-xl md:p-6 box-content h-20 border-1 flex justify-between items-center rounded-3xl">
      <div id="drag-icon">
        <i className="ri-draggable"></i>
      </div>
      <div className="flex-1 mx-4">
        {state.link && metadata && (
          <Input
            value={metadata}
            className="text-default-500"
            classNames={{
              inputWrapper: [
                "bg-transparent hover:!bg-transparent focus-within:!bg-transparent",
                "shadow-none",
              ],
              innerWrapper: "bg-transparent",
              input: "max-w-full",
            }}
            isReadOnly
          />
        )}
        <Input
          placeholder={
            state.link ? "Enter URL" : "Enter header text"
          }
          value={state.header}
          className="text-default-500"
          classNames={{
            inputWrapper: [
              "bg-transparent hover:!bg-transparent focus-within:!bg-transparent",
              "shadow-none",
            ],
            innerWrapper: "bg-transparent",
            input: "max-w-full",
          }}
          onChange={handleChange}
          endContent={isReadOnly ? <i className="ri-edit-2-line"></i> : ""}
        />
      </div>
      <div className="flex flex-col justify-center gap-5 items-center">
        <Switch isSelected={state.active} size="sm" onClick={handleActive} />
        <i className="ri-delete-bin-line text-xl" onClick={handleDelete}></i>
      </div>
    </div>
  );
};
