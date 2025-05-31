
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, 
  Code, 
  Palette, 
  Settings, 
  Save, 
  RefreshCw, 
  Copy,
  Download,
  Upload,
  Zap,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import components to edit
import { BetButton } from "@/components/betting/BetButton";
import TeamLogo from "@/components/betting/TeamLogo";
import { MoneylineButton } from "@/components/betting/MoneylineButton";
import Logo from "@/components/WeParlay/Logo";

interface ComponentConfig {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  defaultProps: Record<string, any>;
  propTypes: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'range';
    options?: string[] | number[];
    min?: number;
    max?: number;
    step?: number;
  }>;
}

const AVAILABLE_COMPONENTS: ComponentConfig[] = [
  {
    id: 'logo',
    name: 'WeParlay Logo',
    component: Logo,
    defaultProps: {
      size: 'md',
      withTagline: true,
      className: ''
    },
    propTypes: {
      size: { type: 'select', options: ['sm', 'md', 'lg', 'xl'] },
      withTagline: { type: 'boolean' },
      className: { type: 'string' }
    }
  },
  {
    id: 'betButton',
    name: 'Bet Button',
    component: BetButton,
    defaultProps: {
      text: 'Place Bet',
      variant: 'default',
      size: 'default',
      disabled: false,
      loading: false
    },
    propTypes: {
      text: { type: 'string' },
      variant: { type: 'select', options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] },
      size: { type: 'select', options: ['default', 'sm', 'lg', 'icon'] },
      disabled: { type: 'boolean' },
      loading: { type: 'boolean' }
    }
  },
  {
    id: 'moneylineButton',
    name: 'Moneyline Button',
    component: MoneylineButton,
    defaultProps: {
      team: 'Lakers',
      odds: -110,
      isSelected: false,
      size: 'default'
    },
    propTypes: {
      team: { type: 'string' },
      odds: { type: 'number' },
      isSelected: { type: 'boolean' },
      size: { type: 'select', options: ['sm', 'default', 'lg'] }
    }
  },
  {
    id: 'teamLogo',
    name: 'Team Logo',
    component: TeamLogo,
    defaultProps: {
      team: 'Lakers',
      size: 40,
      className: ''
    },
    propTypes: {
      team: { type: 'select', options: ['Lakers', 'Warriors', 'Celtics', 'Heat', 'Nuggets', 'Suns'] },
      size: { type: 'range', min: 20, max: 100, step: 5 },
      className: { type: 'string' }
    }
  }
];

export default function VisualComponentEditor() {
  const { toast } = useToast();
  const [selectedComponent, setSelectedComponent] = useState<ComponentConfig | null>(AVAILABLE_COMPONENTS[0]);
  const [componentProps, setComponentProps] = useState<Record<string, any>>({});
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview');
  const [savedConfigs, setSavedConfigs] = useState<Record<string, any>>({});

  useEffect(() => {
    if (selectedComponent) {
      setComponentProps(selectedComponent.defaultProps);
    }
  }, [selectedComponent]);

  const handlePropChange = (propName: string, value: any) => {
    setComponentProps(prev => ({
      ...prev,
      [propName]: value
    }));
  };

  const renderPropEditor = (propName: string, propConfig: any, currentValue: any) => {
    const { type, options, min, max, step } = propConfig;

    switch (type) {
      case 'string':
        return (
          <Input
            value={currentValue || ''}
            onChange={(e) => handlePropChange(propName, e.target.value)}
            placeholder={`Enter ${propName}`}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={currentValue || 0}
            onChange={(e) => handlePropChange(propName, parseInt(e.target.value))}
          />
        );
      
      case 'boolean':
        return (
          <Switch
            checked={currentValue || false}
            onCheckedChange={(checked) => handlePropChange(propName, checked)}
          />
        );
      
      case 'select':
        return (
          <Select value={currentValue} onValueChange={(value) => handlePropChange(propName, value)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${propName}`} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'range':
        return (
          <div className="space-y-2">
            <Slider
              value={[currentValue || min || 0]}
              onValueChange={([value]) => handlePropChange(propName, value)}
              min={min}
              max={max}
              step={step}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground text-center">
              {currentValue} ({min} - {max})
            </div>
          </div>
        );
      
      case 'color':
        return (
          <Input
            type="color"
            value={currentValue || '#000000'}
            onChange={(e) => handlePropChange(propName, e.target.value)}
          />
        );
      
      default:
        return (
          <Input
            value={currentValue || ''}
            onChange={(e) => handlePropChange(propName, e.target.value)}
          />
        );
    }
  };

  const generateComponentCode = () => {
    if (!selectedComponent) return '';
    
    const propsString = Object.entries(componentProps)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? key : `${key}={false}`;
        } else {
          return `${key}={${JSON.stringify(value)}}`;
        }
      })
      .join('\n  ');

    return `<${selectedComponent.name.replace(/\s+/g, '')}
  ${propsString}
/>`;
  };

  const saveConfiguration = () => {
    if (!selectedComponent) return;
    
    const configName = `${selectedComponent.name}_${Date.now()}`;
    setSavedConfigs(prev => ({
      ...prev,
      [configName]: {
        component: selectedComponent.id,
        props: componentProps,
        savedAt: new Date().toISOString()
      }
    }));
    
    toast({
      title: "Configuration Saved",
      description: `${selectedComponent.name} configuration saved as ${configName}`,
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateComponentCode());
    toast({
      title: "Code Copied",
      description: "Component code copied to clipboard",
    });
  };

  const resetToDefaults = () => {
    if (selectedComponent) {
      setComponentProps(selectedComponent.defaultProps);
      toast({
        title: "Reset Complete",
        description: "Component props reset to defaults",
      });
    }
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
              <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as 'preview' | 'code')}>
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
            {previewMode === 'preview' ? (
              <div className="min-h-[400px] bg-slate-900 rounded-lg p-8 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <ComponentToRender {...componentProps} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Generated Code</h4>
                  <Button onClick={copyToClipboard} size="sm" variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                </div>
                <Textarea
                  value={generateComponentCode()}
                  readOnly
                  className="min-h-[350px] font-mono text-sm bg-slate-900 border-slate-600"
                />
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
            <CardDescription className="text-slate-400">
              Previously saved component configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(savedConfigs).map(([name, config]) => (
                <Card key={name} className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h5 className="font-medium text-white">{name}</h5>
                      <p className="text-sm text-slate-400">
                        Component: {AVAILABLE_COMPONENTS.find(c => c.id === config.component)?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Saved: {new Date(config.savedAt).toLocaleDateString()}
                      </p>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          const component = AVAILABLE_COMPONENTS.find(c => c.id === config.component);
                          if (component) {
                            setSelectedComponent(component);
                            setComponentProps(config.props);
                          }
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
