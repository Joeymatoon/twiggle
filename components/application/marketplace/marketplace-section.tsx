import { Button, Card, CardBody, CardFooter, CardHeader, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Textarea, Select, SelectItem, CheckboxGroup, Checkbox } from "@nextui-org/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/components";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  is_active?: boolean;
}

const defaultCategories = [
  "Templates",
  "Icons",
  "Widgets",
  "Illustrations",
  "Mockups",
  "Backgrounds"
];

const MarketplaceItemModal: React.FC<{
  item: MarketplaceItem;
  isOpen: boolean;
  onClose: () => void;
}> = ({ item, isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-default-400 uppercase tracking-wider">
                {item.category}
              </span>
              <h2 className="text-2xl font-bold">{item.title}</h2>
            </ModalHeader>
            <ModalBody>
              <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-default-600 text-lg">{item.description}</p>
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Features</h3>
                <ul className="list-disc list-inside space-y-2 text-default-600">
                  <li>High-quality design assets</li>
                  <li>Fully customizable components</li>
                  <li>Responsive layouts</li>
                  <li>Regular updates and support</li>
                </ul>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-end items-center">
              <div className="flex gap-2">
                <Button color="default" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="secondary" onPress={onClose}>
                  Download
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

// Admin Add/Edit Item Modal
const AdminItemModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MarketplaceItem) => void;
  currentItem?: MarketplaceItem;
  isLoading: boolean;
}> = ({ isOpen, onClose, onSave, currentItem, isLoading }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Reset form when modal opens with different data
  useEffect(() => {
    if (currentItem) {
      setTitle(currentItem.title);
      setDescription(currentItem.description);
      setCategory(currentItem.category);
      setImageUrl(currentItem.image_url);
    } else {
      setTitle("");
      setDescription("");
      setCategory("");
      setImageUrl("");
    }
    setErrors({});
  }, [currentItem, isOpen]);
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!category.trim()) newErrors.category = "Category is required";
    if (!imageUrl.trim()) newErrors.imageUrl = "Image URL is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const item: MarketplaceItem = {
      id: currentItem?.id || uuidv4(),
      title,
      description,
      category,
      image_url: imageUrl,
      is_active: currentItem?.is_active !== undefined ? currentItem.is_active : true
    };
    
    onSave(item);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">
                {currentItem ? "Edit Item" : "Add New Item"}
              </h2>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <Input
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  isInvalid={!!errors.title}
                  errorMessage={errors.title}
                />
                
                <Textarea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  isInvalid={!!errors.description}
                  errorMessage={errors.description}
                />
                
                <Select
                  label="Category"
                  selectedKeys={category ? [category] : []}
                  onChange={(e) => setCategory(e.target.value)}
                  isInvalid={!!errors.category}
                  errorMessage={errors.category}
                >
                  {defaultCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </Select>
                
                <Input
                  label="Image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  isInvalid={!!errors.imageUrl}
                  errorMessage={errors.imageUrl}
                />
                
                {imageUrl && (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt="Item preview"
                      fill
                      className="object-cover"
                      onError={() => setErrors({...errors, imageUrl: "Invalid image URL"})}
                    />
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-end gap-2">
              <Button color="default" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="secondary" onPress={handleSubmit} isLoading={isLoading}>
                {currentItem ? "Update" : "Add Item"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

interface MarketplaceProps {
  userID?: string;
}

export const MarketplaceSection: React.FC<MarketplaceProps> = ({ userID }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<MarketplaceItem | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    image_url: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const supabase = createClient();
  
  // Fetch marketplace items and check if user is admin
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is admin
        if (userID) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("is_admin")
            .eq("id", userID)
            .single();
            
          if (!userError && userData) {
            setIsAdmin(userData.is_admin || false);
          }
        }
        
        // Fetch marketplace items
        const { data, error } = await supabase
          .from("marketplace_items")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) {
          console.error("Error fetching marketplace data:", error);
          toast.error("Failed to load marketplace items");
        } else if (data && data.length > 0) {
          setItems(data);
          
          // Extract all categories
          const uniqueCategories = Array.from(
            new Set(data.map((item) => item.category))
          );
          setCategories(["All", ...uniqueCategories]);
        } else {
          // No items found in database
          setItems([]);
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
        toast.error("Failed to load marketplace");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [supabase, userID]);
  
  // Filtering logic
  const filteredItems = items.filter((item) => {
    // Category filter
    const inCategory =
      selectedCategories.includes("All") || selectedCategories.includes(item.category);
    // Search filter
    const inSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return inCategory && inSearch;
  });
  
  const handleViewDetails = (item: MarketplaceItem) => {
    setSelectedItem(item);
    onOpen();
  };
  
  const handleEditItem = (item: MarketplaceItem) => {
    setCurrentEditItem(item);
    setIsAddModalOpen(true);
  };
  
  const handleAddNewItem = () => {
    setCurrentEditItem(undefined);
    setIsAddModalOpen(true);
  };
  
  const handleDeleteItem = async (id: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this item?");
      if (!confirmed) return;
      
      setIsSaving(true);
      const { error } = await supabase
        .from("marketplace_items")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      // Update local state
      setItems(items.filter(item => item.id !== id));
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveItem = async (item: MarketplaceItem) => {
    try {
      setIsSaving(true);
      
      // Check if it's an update or new item
      const isUpdate = items.some(i => i.id === item.id);
      
      const { error } = await supabase
        .from("marketplace_items")
        .upsert({
          ...item,
          updated_at: new Date().toISOString(),
          created_at: isUpdate ? undefined : new Date().toISOString(),
          created_by: isUpdate ? undefined : userID
        });
        
      if (error) throw error;
      
      // Update local state
      if (isUpdate) {
        setItems(items.map(i => i.id === item.id ? item : i));
        toast.success("Item updated successfully");
      } else {
        setItems([item, ...items]);
        toast.success("Item added successfully");
      }
      
      // Close the modal
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Failed to save item");
    } finally {
      setIsSaving(false);
    }
  };

  // Add Item Modal handlers
  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);
  const handleNewItemChange = (field: string, value: string) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };
  const handleAddNewItemSubmit = async () => {
    setIsAdding(true);
    try {
      const { error, data } = await supabase
        .from('marketplace_items')
        .insert([
          {
            title: newItem.title,
            description: newItem.description,
            category: newItem.category,
            subcategory: newItem.subcategory,
            image_url: newItem.image_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'active',
            user_id: userID || null,
          },
        ])
        .select();
      if (error) throw error;
      // Add to UI immediately
      setItems((prev) => [
        {
          id: data[0].id,
          title: newItem.title,
          description: newItem.description,
          category: newItem.category,
          subcategory: newItem.subcategory,
          image_url: newItem.image_url,
        },
        ...prev,
      ]);
      setNewItem({ title: '', description: '', category: '', subcategory: '', image_url: '' });
      setIsAddModalOpen(false);
    } catch (err) {
      toast.error('Failed to add item');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col w-full p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center justify-end">
          <Input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-72"
            startContent={<i className="ri-search-line text-default-400"></i>}
          />
          <CheckboxGroup
            label="Categories"
            orientation="horizontal"
            value={selectedCategories}
            onValueChange={(vals) =>
              vals.length === 0 ? setSelectedCategories(["All"]) : setSelectedCategories(vals.filter((v) => v !== "All"))
            }
            className="flex flex-wrap gap-2"
          >
            <Checkbox value="All">All</Checkbox>
            {categories.filter((cat) => cat !== "All").map((cat) => (
              <Checkbox key={cat} value={cat} className="capitalize">
                {cat}
              </Checkbox>
            ))}
          </CheckboxGroup>
          <Button 
            color="secondary" 
            startContent={<i className="ri-add-line"></i>}
            onPress={handleOpenAddModal}
            className="self-end"
          >
            Add Item
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-2 border-secondary rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <Card key={item.id} className="w-full shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="flex flex-col items-start gap-2 p-4 pb-0">
                  <span className="text-xs font-semibold text-default-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h2 className="text-lg font-bold text-default-900">{item.title}</h2>
                </CardHeader>
                <CardBody className="p-4 pt-2">
                  <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-default-600 text-sm mb-2 min-h-[48px]">{item.description}</p>
                </CardBody>
                <CardFooter className="flex justify-end items-center p-4 pt-0">
                  <div className="flex gap-2">
                    {isAdmin && (
                      <>
                        <Button color="default" size="sm" isIconOnly onPress={() => handleEditItem(item)}>
                          <i className="ri-edit-line"></i>
                        </Button>
                        <Button color="danger" size="sm" isIconOnly onPress={() => handleDeleteItem(item.id)}>
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                      </>
                    )}
                    <Button color="secondary" radius="full" size="sm" onPress={() => handleViewDetails(item)}>
                      View Details
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex justify-center items-center h-64">
              <p className="text-default-500 text-lg">No items found in this category</p>
            </div>
          )}
        </div>
      )}
      
      {selectedItem && (
        <MarketplaceItemModal
          item={selectedItem}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
      
      {isAdmin && (
        <AdminItemModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onSave={handleSaveItem}
          currentItem={currentEditItem}
          isLoading={isSaving}
        />
      )}

      {/* Add Item Modal */}
      <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add Marketplace Item</ModalHeader>
              <ModalBody>
                <Input
                  label="Title"
                  value={newItem.title}
                  onChange={(e) => handleNewItemChange('title', e.target.value)}
                  required
                />
                <Textarea
                  label="Description"
                  value={newItem.description}
                  onChange={(e) => handleNewItemChange('description', e.target.value)}
                  required
                />
                <Input
                  label="Category"
                  value={newItem.category}
                  onChange={(e) => handleNewItemChange('category', e.target.value)}
                  required
                />
                <Input
                  label="Subcategory"
                  value={newItem.subcategory}
                  onChange={(e) => handleNewItemChange('subcategory', e.target.value)}
                />
                <Input
                  label="Image URL"
                  value={newItem.image_url}
                  onChange={(e) => handleNewItemChange('image_url', e.target.value)}
                  required
                />
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="secondary" onPress={handleAddNewItemSubmit} isLoading={isAdding}>
                  Add Item
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}; 