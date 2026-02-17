import { useState } from "react";
import { useAppConfig, AppConfig } from "../../hooks/useAppConfig";
import { Button } from "../../components/ui/Button";
import { Plus, X, Save, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const AdminSettings = () => {
  const { config, updateConfig, loading: configLoading } = useAppConfig();
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Local state for editing form
  const [dormInput, setDormInput] = useState("");
  const [impactInput, setImpactInput] = useState("");
  const [operationalInput, setOperationalInput] = useState("");

  const handleAddItem = async (
    field: keyof AppConfig,
    value: string,
    setter: (val: string) => void,
  ) => {
    if (!value.trim()) return;
    if (config[field].includes(value.trim())) {
      toast.error("Item already exists");
      return;
    }

    try {
      setSaving(true);
      const newArray = [...config[field], value.trim()];
      await updateConfig({ [field]: newArray });
      setter("");
      toast.success("Added item");
    } catch (error) {
      console.error("Failed to add item:", error);
      toast.error("Failed to add item");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveItem = async (field: keyof AppConfig, item: string) => {
    if (!window.confirm(`Remove "${item}"?`)) return;

    try {
      setSaving(true);
      const newArray = config[field].filter((i) => i !== item);
      await updateConfig({ [field]: newArray });
      toast.success("Removed item");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item");
    } finally {
      setSaving(false);
    }
  };

  if (configLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const renderListEditor = (
    title: string,
    field: keyof AppConfig,
    inputValue: string,
    setInputValue: (v: string) => void,
  ) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Add new ${title.toLowerCase().slice(0, -1)}...`}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddItem(field, inputValue, setInputValue);
              }
            }}
          />
          <Button
            size="sm"
            onClick={() => handleAddItem(field, inputValue, setInputValue)}
            disabled={!inputValue.trim() || saving}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* List */}
        <div className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-2">
          {config[field].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm text-gray-700">{item}</span>
              <button
                onClick={() => handleRemoveItem(field, item)}
                className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-200 transition-all"
                disabled={saving}
                aria-label={`Remove ${item}`}
                title="Remove Item"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/dashboard")}
              className="-ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                System Configuration
              </h1>
              <p className="text-sm text-gray-500">
                Manage survey options and dynamic lists
              </p>
            </div>
          </div>
        </div>

        {/* Editors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderListEditor(
            "Impact Areas",
            "impactAreas",
            impactInput,
            setImpactInput,
          )}
          {renderListEditor(
            "Operational Areas",
            "operationalAreas",
            operationalInput,
            setOperationalInput,
          )}
          {renderListEditor(
            "Dorm Blocks",
            "dormBlocks",
            dormInput,
            setDormInput,
          )}
        </div>
      </div>
    </div>
  );
};
