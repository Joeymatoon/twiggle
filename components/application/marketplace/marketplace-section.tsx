import { Button, Card, CardBody, CardFooter, CardHeader, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { useState } from "react";
import Image from "next/image";

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
}

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

const categories = [
  "All",
  ...Array.from(new Set(staticItems.map((item) => item.category))),
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

export const MarketplaceSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const filteredItems =
    selectedCategory === "All"
      ? staticItems
      : staticItems.filter((item) => item.category === selectedCategory);

  const handleViewDetails = (item: MarketplaceItem) => {
    setSelectedItem(item);
    onOpen();
  };

  return (
    <div className="flex flex-col w-full p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Marketplace</h1>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item) => (
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
              <Button color="secondary" radius="full" size="sm" onPress={() => handleViewDetails(item)}>
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {selectedItem && (
        <MarketplaceItemModal
          item={selectedItem}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </div>
  );
}; 