import { Button, Card, CardBody, CardFooter, CardHeader, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Textarea, Select, SelectItem } from "@nextui-org/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/components";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
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
            <ModalFooter className="flex justify-between items-center">
              <span className="text-2xl font-bold text-secondary">${item.price}</span>
              <div className="flex gap-2">
                <Button color="default" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="secondary" onPress={onClose}>
                  Purchase
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
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Reset form when modal opens with different data
  useEffect(() => {
    if (currentItem) {
      setTitle(currentItem.title);
      setDescription(currentItem.description);
      setPrice(currentItem.price.toString());
      setCategory(currentItem.category);
      setImageUrl(currentItem.image_url);
    } else {
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("");
      setImageUrl("");
    }
    setErrors({});
  }, [currentItem, isOpen]);
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    
    if (!price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = "Price must be a valid number";
    }
    
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
      price: Number(price),
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
                
                <Input
                  label="Price ($)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  isInvalid={!!errors.price}
                  errorMessage={errors.price}
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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [items, setItems] = useState<MarketplaceItem[]>(staticItems);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<MarketplaceItem | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  
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
          // Fallback to static data if table doesn't exist yet
          console.error("Error fetching marketplace data:", error);
        } else if (data && data.length > 0) {
          setItems(data);
          
          // Extract all categories
          const uniqueCategories = Array.from(
            new Set(data.map((item) => item.category))
          );
          setCategories(["All", ...uniqueCategories]);
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [supabase, userID]);
  
  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);
      
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

  return (
    <div className="flex flex-col w-full p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Button 
              color="secondary" 
              startContent={<i className="ri-add-line"></i>}
              onPress={handleAddNewItem}
            >
              Add New Item
            </Button>
          )}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                color={selectedCategory === cat ? "secondary" : "default"}
                variant={selectedCategory === cat ? "solid" : "bordered"}
                onPress={() => setSelectedCategory(cat)}
                className="capitalize"
              >
                {cat}
              </Button>
            ))}
          </div>
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
                <CardFooter className="flex justify-between items-center p-4 pt-0">
                  <span className="text-lg font-bold text-secondary">${item.price}</span>
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
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveItem}
          currentItem={currentEditItem}
          isLoading={isSaving}
        />
      )}
    </div>
  );
};

// Static items used as fallback
const staticItems: MarketplaceItem[] = [
  {
    id: "1",
    title: "Modern Portfolio Template",
    description: "A sleek, responsive portfolio template for developers and designers.",
    price: 19,
    category: "Templates",
    image_url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "2",
    title: "Minimal Icon Pack",
    description: "A set of 100+ minimal icons for web and mobile projects.",
    price: 9,
    category: "Icons",
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "3",
    title: "Analytics Widget",
    description: "A plug-and-play analytics widget for your dashboard.",
    price: 29,
    category: "Widgets",
    image_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "4",
    title: "E-commerce UI Kit",
    description: "A complete UI kit for building modern e-commerce apps.",
    price: 39,
    category: "Templates",
    image_url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "5",
    title: "Colorful Illustration Pack",
    description: "Hand-drawn illustrations to make your site pop.",
    price: 15,
    category: "Illustrations",
    image_url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "6",
    title: "Finance Dashboard Widget",
    description: "A ready-to-use finance dashboard widget.",
    price: 25,
    category: "Widgets",
    image_url: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "7",
    title: "Personal Blog Template",
    description: "A clean and modern template for personal blogs and writers.",
    price: 17,
    category: "Templates",
    image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "8",
    title: "Abstract Illustration Set",
    description: "A collection of abstract illustrations for creative projects.",
    price: 12,
    category: "Illustrations",
    image_url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "9",
    title: "Weather Widget",
    description: "A beautiful weather widget for dashboards and apps.",
    price: 14,
    category: "Widgets",
    image_url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "10",
    title: "Line Icon Pack",
    description: "A stylish pack of line icons for modern interfaces.",
    price: 8,
    category: "Icons",
    image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "11",
    title: "Business Mockup Kit",
    description: "Professional mockups for business presentations and portfolios.",
    price: 22,
    category: "Mockups",
    image_url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "12",
    title: "Creative Backgrounds",
    description: "A set of vibrant backgrounds for websites and apps.",
    price: 10,
    category: "Backgrounds",
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "13",
    title: "Resume Template",
    description: "A modern resume template to help you stand out.",
    price: 11,
    category: "Templates",
    image_url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "14",
    title: "Social Media Icon Set",
    description: "Essential icons for all major social media platforms.",
    price: 7,
    category: "Icons",
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  },
]; 