import { Card, CardBody, CardFooter, Button } from "@nextui-org/react";
import { templates, TemplateType } from "@/config/templates";
import Image from "next/image";

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange,
}) => {
  return (
    <div className="w-full p-4">
      <h2 className="text-xl font-bold mb-6">Choose a Template</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-h-[70vh] overflow-y-auto pb-4">
        {Object.values(templates).map((template) => (
          <Card
            key={template.id}
            isPressable
            onPress={() => onTemplateChange(template.id)}
            className={`transition-all duration-300 flex flex-col h-full justify-between ${
              selectedTemplate === template.id
                ? "ring-2 ring-secondary scale-105"
                : "hover:scale-105"
            }`}
          >
            <CardBody className="p-0 rounded-t-2xl overflow-hidden min-h-[160px] bg-default-100 flex items-center justify-center">
              <Image
                src={template.previewImage}
                alt={template.name}
                width={320}
                height={160}
                className="object-cover w-full h-40"
                priority={template.id === selectedTemplate}
              />
            </CardBody>
            <CardFooter className="flex flex-col items-start gap-2 p-4">
              <h3 className="font-bold text-base mb-1">{template.name}</h3>
              <p className="text-sm text-default-500 mb-2 min-h-[40px]">{template.description}</p>
              <Button
                size="sm"
                color={selectedTemplate === template.id ? "secondary" : "default"}
                variant={selectedTemplate === template.id ? "solid" : "bordered"}
                className="w-full mt-auto"
                onPress={() => onTemplateChange(template.id)}
              >
                {selectedTemplate === template.id ? "Selected" : "Select"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}; 