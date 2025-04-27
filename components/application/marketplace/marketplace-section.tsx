import { Button, Card, CardBody, CardFooter, CardHeader } from "@nextui-org/react";
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
];

const categories = [
  "All",
  ...Array.from(new Set(staticItems.map((item) => item.category))),
];

export const MarketplaceSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems =
    selectedCategory === "All"
      ? staticItems
      : staticItems.filter((item) => item.category === selectedCategory);

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
              <Button color="secondary" radius="full" size="sm">
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}; 