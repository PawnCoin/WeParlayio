import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Eye, 
  Code, 
  Save, 
  RefreshCw, 
  Zap, 
  Target,
  Download,
  Upload
} from "lucide-react";

// Sample Button Component for demo
const SampleButton = ({ 
  text = "Click Me", 
  variant = "default",
  size = "medium",
  color = "#3b82f6",
  disabled = false 
}) => {
  const sizeClasses = {
    small: "px-2 py-1 text-sm",
    medium: "px-4 py-2",
    large: "px-6 py-3 text-lg"
  };

  return (
    <button
      disabled={disabled}
      className={`rounded font-medium transition-colors ${sizeClasses[size]} ${
        disabled 
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : variant === "outline"
          ? "border-2 bg-transparent hover:bg-gray-100"
          : "text-white hover:opacity-90"
      }`}
      style={{
        backgroundColor: disabled ? undefined : (variant === "outline" ? "transparent" : color),
        borderColor: variant === "outline" ? color : "transparent",
        color: variant === "outline" ? color : (disabled ? undefined : "white")
      }}
    >
      {text}
    </button>
  );
};

// Sample Card Component for demo
const SampleCard = ({
  title = "Card Title",
  content = "This is sample card content",
  backgroundColor = "#ffffff",
  borderColor = "#e5e7eb",
  padding = "medium"
}) => {
  const paddingClasses = {
    small: "p-3",
    medium: "p-6",
    large: "p-8"
  };

  return (
    <div
      className={`rounded-lg border ${paddingClasses[padding]} shadow-sm`}
      style={{ backgroundColor, borderColor }}
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{content}</p>
    </div>
  );
};

// Available components configuration
const AVAILABLE_COMPONENTS = [
  {
    id: "button",
    name: "Button",
    component: SampleButton,
    defaultProps: {
      text: "Click Me",
      variant: "default",
      size: "medium",
      color: "#3b82f6",
      disabled: false
    },
    propTypes: {
      text: { type: "string" },
      variant: { type: "select", options: ["default", "outline"] },
      size: { type: "select", options: ["small", "medium", "large"] },
      color: { type: "color" },
      disabled: { type: "boolean" }
    }
  },
  {
    id: "card",
    name: "Card",
    component: SampleCard,
    defaultProps: {
      title: "Card Title",
      content: "This is sample card content",
      backgroundColor: "#ffffff",
      borderColor: "#e5e7eb",
      padding: "medium"
    },
    propTypes: {
      title: { type: "string" },
      content: { type: "string" },
      backgroundColor: { type: "color" },
      borderColor: { type: "color" },
      padding: { type: "select", options: ["small", "medium", "large"] }
    }
  }
];

export default function VisualComponentEditor() {
  const { toast } = useToast();
  const [selectedComponent, setSelectedComponent] = useState(AVAILABLE_COMPONENTS[0]);
  const [componentProps, setComponentProps] = useState({});
  const [previewMode, setPreviewMode] = useState("preview");
  const [savedConfigs, setSavedConfigs] = useState({});

  useEffect(() => {
    if (selectedComponent) {
      setComponentProps(selectedComponent.defaultProps);
    }
  }, [selectedComponent]);

  const handlePropChange = (propName, value) => {
    setComponentProps(prev => ({
      ...prev,
      [propName]: value
    }));
  };

  const renderPropEditor = (propName, propConfig, currentValue) => {
    const { type, options, min, max, step } = propConfig;

    switch (type) {
      case "string":
        return (
          <Input
            value={currentValue || ""}
            onChange={(e) => handlePropChange(propName, e.target.value)}
            placeholder={`Enter ${propName}`}
          />
        );

      case "boolean":
        return (
          <Switch
            checked={currentValue || false}
            onCheckedChange={(checked) => handlePropChange(propName, checked)}
          />
        );

      case "number":
        return (
          <div className="space-y-2">
            <Input
              type="number"
              value={currentValue || 0}
              onChange={(e) => handlePropChange(propName, Number(e.target.value))}
              min={min}
              max={max}
              step={step}
            />
            {min !== undefined && max !== undefined && (
              <Slider
                value={[currentValue || 0]}
                onValueChange={([value]) => handlePropChange(propName, value)}
                min={min}
                max={max}
                step={step}
              />
            )}
          </div>
        );

      case "color":
        return (
          <div className="flex items-center space-x-2">
            <Input
              type="color"
              value={currentValue || "#000000"}
              onChange={(e) => handlePropChange(propName, e.target.value)}
              className="w-12 h-8 p-1 border rounded"
            />
            <Input
              value={currentValue || ""}
              onChange={(e) => handlePropChange(propName, e.target.value)}
              placeholder="#000000"
            />
          </div>
        );

      case "select":
        return (
          <Select
            value={currentValue || options[0]}
            onValueChange={(value) => handlePropChange(propName, value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            value={currentValue || ""}
            onChange={(e) => handlePropChange(propName, e.target.value)}
          />
        );
    }
  };

  const generateCode = () => {
    const propsString = Object.entries(componentProps)
      .map(([key, value]) => {
        if (typeof value === "string") {
          return `${key}="${value}"`;
        } else if (typeof value === "boolean") {
          return value ? key : "";
        } else {
          return `${key}={${JSON.stringify(value)}}`;
        }
      })
      .filter(Boolean)
      .join(" ");

    return `<${selectedComponent.name} ${propsString} />`;
  };

  const saveConfiguration = () => {
    const configName = `${selectedComponent.name}_${Date.now()}`;
    setSavedConfigs(prev => ({
      ...prev,
      [configName]: {
        component: selectedComponent,
        props: componentProps
      }
    }));

    toast({
      title: "Configuration Saved",
      description: `Saved as ${configName}`,
    });
  };

  const resetToDefaults = () => {
    setComponentProps(selectedComponent.defaultProps);
    toast({
      title: "Reset to Defaults",
      description: "Component props have been reset to default values",
    });
  };

  if (!selectedComponent) {
    return <div>Loading...</div>;
  }

  const ComponentToRender = selectedComponent.component;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Visual Component Editor</h1>
          <p className="text-slate-300 mt-2">Edit React component props visually</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500">
            <Zap className="w-3 h-3 mr-1" />
            Admin Tool
          </Badge>
          <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500">
            <Target className="w-3 h-3 mr-1" />
            Live Preview
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Component Selector */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Select Component
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select 
              value={selectedComponent.id} 
              onValueChange={(value) => {
                const component = AVAILABLE_COMPONENTS.find(c => c.id === value);
                setSelectedComponent(component || null);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_COMPONENTS.map((component) => (
                  <SelectItem key={component.id} value={component.id}>
                    {component.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Separator />

            {/* Component Props Editor */}
            <div className="space-y-4">
              <h4 className="font-medium text-white">Component Properties</h4>
              {Object.entries(selectedComponent.propTypes).map(([propName, propConfig]) => (
                <div key={propName} className="space-y-2">
                  <Label className="text-slate-300 capitalize">{propName}</Label>
                  {renderPropEditor(propName, propConfig, componentProps[propName])}
                </div>
              ))}
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              <Button onClick={saveConfiguration} className="w-full" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Config
              </Button>
              <Button onClick={resetToDefaults} variant="outline" className="w-full" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Area */}
        <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
              </CardTitle>
              <Tabs value={previewMode} onValueChange={setPreviewMode}>
                <TabsList>
                  <TabsTrigger value="preview" className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="code" className="flex items-center gap-1">
                    <Code className="w-4 h-4" />
                    Code
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {previewMode === "preview" ? (
              <div className="min-h-[400px] bg-slate-900 rounded-lg p-8 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <ComponentToRender {...componentProps} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Generated Code</h4>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generateCode());
                      toast({
                        title: "Code Copied",
                        description: "Component code copied to clipboard",
                      });
                    }}
                  >
                    Copy Code
                  </Button>
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                  <pre className="text-green-400 text-sm overflow-x-auto">
                    <code>{generateCode()}</code>
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Saved Configurations */}
      {Object.keys(savedConfigs).length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Saved Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(savedConfigs).map(([configName, config]) => (
                <Card key={configName} className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <h5 className="font-medium text-white mb-2">{configName}</h5>
                    <p className="text-slate-300 text-sm mb-3">
                      {config.component.name} Component
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedComponent(config.component);
                          setComponentProps(config.props);
                        }}
                      >
                        Load Config
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}