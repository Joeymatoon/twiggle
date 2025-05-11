import { Button, Divider, useDisclosure, Card, CardBody, CardHeader } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { HeaderCard, HeaderCardProps } from "./links-card";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "react-beautiful-dnd";
import { v4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { addUserHeader, addUserLink } from "@/utils/state/actions/userActions";
import { RootState } from "@/utils/state/reducers/reducers";
import { createClient } from "@/utils/supabase/components";
import { PreviewMobile } from "../preview/mobile";
import { ProfileDataProps } from "@/pages/admin";

interface LinksProps {
  userID: string;
  content: HeaderCardProps[];
  setContentState: React.Dispatch<React.SetStateAction<HeaderCardProps[]>>;
  profileData: ProfileDataProps;
}

export const LinksSection: React.FC<LinksProps> = ({
  userID,
  content,
  setContentState,
  profileData,
}) => {
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const user = useSelector((state: RootState) => state.user);
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHeaderData = async () => {
      if (!userID) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("headers")
          .select("*")
          .eq("user_id", userID)
          .order("position", { ascending: true });

        if (error) throw error;

        const formattedHeaders = data.map(header => ({
          id: header.id,
          header: header.title || "",
          active: header.active || false,
          link: header.is_link || false,
          position: header.position || 0
        }));

        setContentState(formattedHeaders);
        dispatch(addUserHeader(formattedHeaders));
      } catch (error) {
        console.error("Error fetching headers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeaderData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('header_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'headers',
          filter: `user_id=eq.${userID}`,
        },
        async () => {
          // Refetch data when changes occur
          const { data, error } = await supabase
            .from("headers")
            .select("*")
            .eq("user_id", userID)
            .order("position", { ascending: true });

          if (!error && data) {
            const formattedHeaders = data.map(header => ({
              id: header.id,
              header: header.title || "",
              active: header.active || false,
              link: header.is_link || false,
              position: header.position || 0
            }));

            setContentState(formattedHeaders);
            dispatch(addUserHeader(formattedHeaders));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userID, dispatch, setContentState]);

  const uploadHeader = async (id: string, index: number, isLink: boolean) => {
    try {
      const { error } = await supabase.from("headers").insert({
        id: id,
        user_id: userID,
        title: "",
        position: index,
        is_link: isLink,
        active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
      if (error) {
        console.error("Error uploading header:", error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error in uploadHeader:", error);
      return false;
    }
  };
  
  const handleAddHeader = async () => {
    try {
      const id = v4();
      const newIndex = content.length;
      const success = await uploadHeader(id, newIndex, false);
      
      if (success) {
        const newHeader: HeaderCardProps = {
          header: "",
          id: id,
          active: false,
          link: false,
          position: newIndex
        };
        setContentState(prev => [...prev, newHeader]);
        dispatch(addUserHeader([...content, newHeader]));
      }
    } catch (error) {
      console.error("Error in handleAddHeader:", error);
    }
  };
  
  const handleAddLink = async () => {
    try {
      const id = v4();
      const newIndex = content.length;
      const success = await uploadHeader(id, newIndex, true);
      
      if (success) {
        const newLink: HeaderCardProps = {
          header: "",
          id: id,
          active: false,
          link: true,
          position: newIndex
        };
        setContentState(prev => [...prev, newLink]);
        dispatch(addUserLink([...content, newLink]));
      }
    } catch (error) {
      console.error("Error in handleAddLink:", error);
    }
  };

  const deleteHeader = async (id: string) => {
    try {
      const { error } = await supabase
        .from("headers")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting header:", error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error in deleteHeader:", error);
      return false;
    }
  };

  const handleSort = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(content);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions for all items
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index
    }));
    
    setContentState(updatedItems);
    sendPositionsToBackend(updatedItems);
  };
  
  const sendPositionsToBackend = async (items: HeaderCardProps[]) => {
    try {
      const updates = items.map(item => ({
        id: item.id,
        position: item.position,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from("headers")
        .upsert(updates);

      if (error) throw error;
      
      dispatch(addUserHeader(items));
    } catch (error) {
      console.error("Error updating positions:", error);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteHeader(id);
    if (success) {
      const updatedContent = content.filter(item => item.id !== id);
      setContentState(updatedContent);
      dispatch(addUserHeader(updatedContent));
    }
  };

  const handleHeaderCardStateChange = (updatedState: HeaderCardProps) => {
    setContentState(prev =>
      prev.map(item =>
        item.id === updatedState.id ? { ...item, ...updatedState } : item
      )
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardBody className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin h-12 w-12 border-4 border-secondary rounded-full border-t-transparent"></div>
            <p className="text-default-500">Loading your links...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex gap-8 w-full md:w-2/3 box-content px-4 h-[93vh] justify-center">
      <div className="flex flex-col w-full box-content px-4 justify-start items-center mt-20">
        <Card className="w-full md:max-w-xl mb-8">
          <CardBody className="p-6">
            <div className="flex flex-col gap-4">
              <Button
                startContent={<i className="ri-add-fill !text-xl"></i>}
                color="secondary"
                radius="full"
                size="lg"
                fullWidth
                className="px-4 py-6"
                onPress={handleAddLink}
              >
                Add Link
              </Button>
              <Button
                startContent={<i className="ri-ai-generate !text-xl"></i>}
                size="sm"
                radius="full"
                variant="bordered"
                onPress={handleAddHeader}
                className="w-full"
              >
                Add Header
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="w-full md:max-w-xl">
          <CardHeader className="px-6 py-4">
            <h2 className="text-xl font-semibold">Your Links</h2>
          </CardHeader>
          <CardBody className="p-6">
            <DragDropContext onDragEnd={handleSort}>
              <div className="overflow-y-auto max-h-[48vh] flex flex-col gap-4">
                <Droppable droppableId="droppable">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex flex-col gap-4"
                    >
                      {content.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <HeaderCard
                                key={`header-${item.id}`}
                                state={item}
                                setState={handleHeaderCardStateChange}
                                onDelete={() => handleDelete(item.id)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </DragDropContext>
          </CardBody>
        </Card>
      </div>

      <div className="hidden md:inline">
        <Divider orientation="vertical" />
      </div>

      <div className="fixed bottom-12 md:hidden">
        <Button
          radius="full"
          color="secondary"
          className="p-6"
          variant="shadow"
          startContent={<i className="ri-eye-line"></i>}
          onPress={onOpen}
        >
          <span className="font-bold">Preview</span>
        </Button>
        <PreviewMobile
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          content={content}
          profileData={profileData}
          userID={userID}
        />
      </div>
    </div>
  );
};
