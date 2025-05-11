import { updateUserInfo } from "@/utils/state/actions/userActions";
import { createClient } from "@/utils/supabase/components";
import { Input, Switch, Card, CardBody } from "@nextui-org/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export interface HeaderCardProps {
  id: string;
  header: string;  // maps to title in DB
  active: boolean;
  link: boolean;   // maps to is_link in DB
  position: number;
  metadata?: string;  // Optional metadata for links
}

export type SetHeaderCardProps = React.Dispatch<React.SetStateAction<HeaderCardProps[]>>;

export const HeaderCard: React.FC<{
  state: HeaderCardProps;
  setState: (updatedState: HeaderCardProps) => void;
  onDelete: () => void;
}> = ({ state, setState, onDelete }) => {
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const supabase = createClient();

  useEffect(() => {
    if (state.link && state.header) {
      fetchMetadata(state.header);
    }
  }, [state.header, state.link]);

  const fetchMetadata = async (url: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/metadata?url=${encodeURIComponent(validateUrl(url))}`
      );
      if (response.data.title) {
        setMetadata(response.data.title);
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
      setMetadata("");
    } finally {
      setIsLoading(false);
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
      return false;
    }
    return true;
  };

  const handleActive = async () => {
    const success = await updateHeaderActive(state.id, !state.active);
    if (success) {
      setState({
        ...state,
        active: !state.active,
      });
    }
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardBody className="p-4">
        <div className="flex items-center gap-4">
          <div id="drag-icon" className="text-default-400 cursor-move">
            <i className="ri-drag-move-line text-xl"></i>
          </div>
          
          <div className="flex-1">
            {state.link && metadata && !isLoading && (
              <div className="mb-2 text-sm text-default-500 truncate flex items-center gap-2">
                <i className="ri-link text-default-400"></i>
                {metadata}
              </div>
            )}
            {isLoading && (
              <div className="mb-2 flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-secondary rounded-full border-t-transparent"></div>
                <span className="text-sm text-default-500">Loading metadata...</span>
              </div>
            )}
            <Input
              placeholder={state.link ? "Enter URL" : "Enter header text"}
              value={state.header}
              variant="bordered"
              classNames={{
                inputWrapper: [
                  "bg-transparent hover:!bg-transparent focus-within:!bg-transparent",
                  "shadow-none",
                ],
                innerWrapper: "bg-transparent",
                input: "text-lg",
              }}
              startContent={
                state.link ? (
                  <i className="ri-link text-default-400"></i>
                ) : (
                  <i className="ri-text text-default-400"></i>
                )
              }
              onChange={handleChange}
              onFocus={() => setIsReadOnly(false)}
              onBlur={() => setIsReadOnly(true)}
            />
          </div>

          <div className="flex items-center gap-4">
            <Switch 
              isSelected={state.active} 
              size="sm"
              color="secondary"
              onChange={handleActive}
              aria-label={state.active ? "Deactivate" : "Activate"}
            />
            <button
              onClick={onDelete}
              className="text-danger hover:text-danger-400 transition-colors p-2 rounded-full hover:bg-danger-50"
              aria-label="Delete"
            >
              <i className="ri-delete-bin-line text-xl"></i>
            </button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
