import { Button, Card, CardBody, CardFooter, CardHeader, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, useDisclosure } from "@nextui-org/react";
import { createClient } from "@/utils/supabase/components";
import { useState, useEffect } from "react";
import Image from "next/image";

interface MarketplaceItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  image_url: string;
  status: string;
  created_at: string;
}

interface MarketplaceSectionProps {
  userID: string;
}

export const MarketplaceSection: React.FC<MarketplaceSectionProps> = ({ userID }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const supabase = createClient();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    image: null as File | null,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("marketplace_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    try {
      let imageUrl = "";
      
      // Upload image if provided
      if (newItem.image) {
        const fileExt = newItem.image.name.split('.').pop();
        const fileName = `${userID}/${Date.now()}.${fileExt}`;
        
        // First check if the bucket exists
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        if (bucketError) throw bucketError;

        const bucketExists = buckets.some(bucket => bucket.name === 'marketplace');
        if (!bucketExists) {
          throw new Error('Marketplace bucket not found. Please create it in your Supabase dashboard.');
        }

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("marketplace")
          .upload(fileName, newItem.image, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("marketplace")
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Create marketplace item
      const { error: insertError } = await supabase
        .from("marketplace_items")
        .insert([
          {
            user_id: userID,
            title: newItem.title,
            description: newItem.description,
            price: parseFloat(newItem.price),
            category: newItem.category,
            subcategory: newItem.subcategory,
            image_url: imageUrl,
            status: "active",
          },
        ]);

      if (insertError) throw insertError;

      // Reset form and refresh items
      setNewItem({
        title: "",
        description: "",
        price: "",
        category: "",
        subcategory: "",
        image: null,
      });
      onOpenChange();
      fetchItems();
    } catch (error: any) {
      console.error("Error creating item:", error);
      // Show error message to user
      alert(error.message || "Failed to create item. Please try again.");
    }
  };

  return (
    <div className="flex flex-col w-full p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <Button color="secondary" onPress={onOpen}>
          List an Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="w-full">
            <CardHeader className="flex gap-3">
              <div className="flex flex-col">
                <p className="text-lg font-bold">{item.title}</p>
                <p className="text-small text-default-500">${item.price}</p>
              </div>
            </CardHeader>
            <CardBody>
              {item.image_url && (
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
              <p>{item.description}</p>
            </CardBody>
            <CardFooter>
              <div className="flex justify-between w-full">
                <span className="text-sm text-default-500">{item.category}</span>
                <Button size="sm" color="secondary">
                  Contact Seller
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">List New Item</ModalHeader>
              <ModalBody>
                <Input
                  label="Title"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
                <Textarea
                  label="Description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
                <Input
                  label="Price"
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                />
                <Input
                  label="Category"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                />
                <Input
                  label="Subcategory"
                  value={newItem.subcategory}
                  onChange={(e) => setNewItem({ ...newItem, subcategory: e.target.value })}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.files?.[0] || null })}
                  className="mt-2"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="secondary" onPress={handleCreateItem}>
                  List Item
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}; 